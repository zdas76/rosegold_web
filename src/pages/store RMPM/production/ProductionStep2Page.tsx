/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import { Form, InputNumber, Select, message, Button, Table, Tag, Collapse } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router';
import dayjs from 'dayjs';
import { useGetRowMaterialsQuery } from '../../../redux/features/rowMaterials/rowMaterials.api';
import { useGetProductsQuery } from '../../../redux/features/product/product.api';
import { useGetPackingMaterialsQuery } from '../../../redux/features/packingMaterials/packingMaterials.api';
import { useGetProductionExpItemsQuery } from '../../../redux/features/productionExpItem/productionExpItem.api';
import { useGetProductionIngredientsQuery } from '../../../redux/features/productionIngredient/productionIngredient.api';
import {
  useCreateProductionMutation,
  useGetProductionsQuery,
  type Production,
} from '../../../redux/features/production/production.api';
import { getResponse } from '../../../utils/getResponse';
import type { RawMaterialItem, PackingMaterialItem, ProductionExpenseItem } from './ProductionCreationForm';
import CombinedProductsSection from './production step2/CombinedProductsSection';
import FinalizationSummary from './production step2/FinalizationSummary';

const roundToThree = (val: number | null | undefined): number | null => {
  if (val == null || isNaN(Number(val))) return null;
  return Math.round((Number(val) + Number.EPSILON) * 1000) / 1000;
};

const ProductionStep2Page: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();

  const [productionData, setProductionData] = useState<any>(location.state?.production || null);
  const [rawMaterials, setRawMaterials] = useState<RawMaterialItem[]>([]);
  const [packingMaterials, setPackingMaterials] = useState<PackingMaterialItem[]>([]);
  const [productionExpenses, setProductionExpenses] = useState<ProductionExpenseItem[]>([]);
  const [combinedProducts, setCombinedProducts] = useState<any[]>([]);
  const [combinedForm] = Form.useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Queries
  const { data: productsData } = useGetProductsQuery({});
  const { data: allRawMaterialsData } = useGetRowMaterialsQuery({});
  const { data: allPackingMaterialsData } = useGetPackingMaterialsQuery({});
  const { data: allExpItemsData } = useGetProductionExpItemsQuery({});
  const { data: allProductionsData, isLoading: isProductionsLoading } = useGetProductionsQuery({});

  const targetId = params.id || searchParams.get('id') || productionData?.id;

  // If page was loaded directly or refreshed, find production by targetId
  useEffect(() => {
    if (!productionData && targetId && allProductionsData) {
      const list = Array.isArray(allProductionsData?.data)
        ? allProductionsData.data
        : Array.isArray((allProductionsData as any)?.data?.data)
          ? (allProductionsData as any).data.data
          : [];
      const found = list.find((p: any) => String(p.id) === String(targetId));
      if (found) {
        setProductionData(found);
      }
    }
  }, [productionData, targetId, allProductionsData]);

  // Options
  const packingMaterialOptions = useMemo(() => {
    const list = Array.isArray(allPackingMaterialsData?.data) ? allPackingMaterialsData.data : [];
    return list.map((item: any) => ({
      value: item.id,
      label: item.name,
      unit: item.unit?.name || 'Pcs',
      unitPrice: item.unitPrice ?? item.rate ?? 0,
      item,
    }));
  }, [allPackingMaterialsData]);

  const expenseOptions = useMemo(() => {
    const list = Array.isArray(allExpItemsData?.data) ? allExpItemsData.data : [];
    return list.map((item: any) => ({
      value: item.id,
      label: item.expItemName,
      rate: item.unitRate ?? item.rate ?? null,
    }));
  }, [allExpItemsData]);

  const selectedPackingMaterialIds = useMemo(() => {
    return new Set(packingMaterials.map(item => item.packingMaterialId).filter(Boolean));
  }, [packingMaterials]);

  const selectedExpenseItemIds = useMemo(() => {
    return new Set(productionExpenses.map(item => item.expenseItemId).filter(Boolean));
  }, [productionExpenses]);

  // Product info from productionData
  const prodInv = useMemo(() => {
    return productionData?.inventory?.find((inv: any) => inv.productId || inv.product);
  }, [productionData]);

  const productId = prodInv?.productId || prodInv?.product?.id;
  const productName = prodInv?.product?.name || (productId ? productsData?.data?.find((p: any) => p.id === productId)?.name : null) || 'Product';

  // Recipe query
  const { data: ingredientsData } = useGetProductionIngredientsQuery(
    productId ? { productId } : undefined,
    { skip: !productId }
  );

  const [createProduction] = useCreateProductionMutation();

  // Populate form and lists when productionData arrives
  useEffect(() => {
    if (!productionData) return;

    const initialProductQty = prodInv?.quantityAdd ?? prodInv?.quantity ?? undefined;

    form.setFieldsValue({
      productId: productId || undefined,
      batchNo: productionData.batchNo || '',
      date: productionData.date ? dayjs(productionData.date) : dayjs(),
      productQuantity: initialProductQty,
    });

    // 1. Raw Materials (Locked from Step 1)
    const rawInvs = productionData.inventory?.filter((inv: any) => inv.rawId || inv.raWMaterial) || [];
    const parsedRaw: RawMaterialItem[] = rawInvs.map((rm: any, index: number) => {
      const rawId = rm.rawId || rm.raWMaterial?.id;
      const foundRm = allRawMaterialsData?.data?.find((m: any) => Number(m.id) === Number(rawId));
      const name = rm.raWMaterial?.name || foundRm?.name || rm.name || `Item #${rawId}`;
      const unit = rm.raWMaterial?.unit?.name || foundRm?.unit?.name || rm.unit?.name || 'Kg';
      const unitId = rm.raWMaterial?.unitId || foundRm?.unitId || null;
      const qty = rm.quantityLess ?? rm.quantity ?? rm.quantityAdd ?? 0;
      const rate = rm.unitPrice ?? foundRm?.unitPrice ?? 0;
      const total = rm.creditAmount ?? (qty * rate);

      return {
        id: rm.id,
        si: index + 1,
        rawMaterialId: rawId,
        name,
        unit,
        unitId,
        qty: qty > 0 ? qty : null,
        rate: rate > 0 ? rate : null,
        total: Number(Number(total || 0).toFixed(2)),
      };
    });
    setRawMaterials(parsedRaw);

    // 2. Packing Materials
    const pmInvs = productionData.pminventories || [];
    if (pmInvs.length > 0) {
      const parsedPacking: PackingMaterialItem[] = pmInvs.map((pm: any, index: number) => {
        const pmId = pm.packingMaterialId || pm.packingMaterial?.id || pm.id;
        const foundPm = allPackingMaterialsData?.data?.find((p: any) => Number(p.id) === Number(pmId));
        const name = pm.packingMaterial?.name || foundPm?.name || pm.name || `Packing #${pmId}`;
        const unit = pm.packingMaterial?.unit?.name || foundPm?.unit?.name || pm.unit?.name || 'Pcs';
        const unitId = pm.packingMaterial?.unitId || foundPm?.unitId || null;
        const prodQty = Number(initialProductQty) || 0;
        const unitPrice = pm.unitPrice ?? foundPm?.unitPrice ?? 0;
        const qty = pm.Qty ?? pm.quantity ?? pm.quantityLess ?? 0;
        const total = pm.amount ?? (qty * unitPrice);
        const perUnitQty =
          prodQty > 0 && qty > 0
            ? roundToThree(qty / prodQty)
            : (pm.perUnitQty != null ? roundToThree(pm.perUnitQty) : null);
        const perUnitCost =
          prodQty > 0 && total > 0
            ? roundToThree(total / prodQty)
            : (perUnitQty ? roundToThree(perUnitQty * unitPrice) : (pm.perUnitCost != null ? roundToThree(pm.perUnitCost) : null));

        return {
          id: pm.id,
          si: index + 1,
          packingMaterialId: pmId,
          name,
          unit,
          unitId,
          qty: qty > 0 ? qty : null,
          unitPrice: unitPrice > 0 ? unitPrice : null,
          perUnitQty,
          perUnitCost,
          total: Number(Number(total || 0).toFixed(2)),
        };
      });
      setPackingMaterials(parsedPacking);
    } else {
      // Auto-load recipe packing materials if available
      const rawList = Array.isArray(ingredientsData?.data)
        ? ingredientsData.data
        : Array.isArray((ingredientsData as any)?.data?.data)
          ? (ingredientsData as any).data.data
          : [];
      const matched = rawList.find((r: any) => Number(r.productId) === Number(productId)) || rawList[0];
      const packing = matched?.ingredientPackingMaterial || matched?.ingredientPackingMaterials || matched?.packingMaterials || [];

      if (packing.length > 0) {
        const prodQty = Number(initialProductQty) || 0;
        const initialPacking: PackingMaterialItem[] = packing.map((pm: any, index: number) => {
          const pmId = pm.packingMaterialId ?? pm.packingMaterial?.id ?? pm.id;
          const packingList = Array.isArray(allPackingMaterialsData?.data) ? allPackingMaterialsData.data : [];
          const foundPacking = packingList.find((p: any) => Number(p.id) === Number(pmId));
          const name = pm.packingMaterial?.name ?? foundPacking?.name ?? pm.name ?? '';
          const unit = pm.packingMaterial?.unit?.name ?? foundPacking?.unit?.name ?? pm.unit?.name ?? 'Pcs';
          const unitId = pm.packingMaterial?.unitId ?? foundPacking?.unitId ?? pm.unit?.id ?? null;
          const pmPrice = pm.packingMaterial?.unitPrice ?? pm.unitPrice ?? pm.rate ?? foundPacking?.unitPrice ?? foundPacking?.rate ?? 0;
          const pmPerUnitQty = pm.ingredienteQty ?? pm.quantity ?? pm.perUnitQty ?? null;
          const calculatedQty = pmPerUnitQty != null && prodQty > 0 ? Number((pmPerUnitQty * prodQty).toFixed(2)) : (pm.Qty ?? pm.quantity ?? null);
          const total = calculatedQty != null ? Number((calculatedQty * pmPrice).toFixed(2)) : 0;
          const calculatedPerUnitQty =
            prodQty > 0 && calculatedQty != null
              ? roundToThree(calculatedQty / prodQty)
              : (pmPerUnitQty != null ? roundToThree(pmPerUnitQty) : null);
          const calculatedCost =
            prodQty > 0 && total > 0
              ? roundToThree(total / prodQty)
              : (calculatedPerUnitQty != null ? roundToThree(calculatedPerUnitQty * pmPrice) : null);

          return {
            si: index + 1,
            packingMaterialId: pmId,
            name,
            unit,
            unitId,
            qty: calculatedQty,
            unitPrice: pmPrice,
            perUnitQty: calculatedPerUnitQty,
            perUnitCost: calculatedCost,
            total,
          };
        });
        setPackingMaterials(initialPacking);
      } else {
        setPackingMaterials([
          {
            si: 1,
            packingMaterialId: null,
            name: '',
            unit: 'Pcs',
            unitId: null,
            qty: null,
            unitPrice: null,
            perUnitQty: null,
            perUnitCost: null,
            total: 0,
          },
        ]);
      }
    }

    // 3. Production Expenses
    const expInvs = productionData.productionExpensesInventory || [];
    if (expInvs.length > 0) {
      const parsedExpenses: ProductionExpenseItem[] = expInvs.map((exp: any, index: number) => {
        const expId = exp.proExpencesItemId || exp.expenseItemId || exp.productionExpenseItem?.id;
        const foundExp = allExpItemsData?.data?.find((e: any) => Number(e.id) === Number(expId));
        const name = exp.productionExpenseItem?.expItemName || foundExp?.expItemName || exp.expItemName || `Expense #${expId}`;
        const rate = exp.unitRate ?? foundExp?.unitRate ?? 0;
        const qty = exp.expDuration ?? exp.qty ?? 0;
        const total = exp.amount ?? (qty * rate);

        return {
          id: exp.id,
          si: index + 1,
          expenseItemId: expId,
          name,
          qty: qty > 0 ? qty : null,
          rate: rate > 0 ? rate : null,
          total: Number(Number(total || 0).toFixed(2)),
        };
      });
      setProductionExpenses(parsedExpenses);
    } else {
      const rawList = Array.isArray(ingredientsData?.data)
        ? ingredientsData.data
        : Array.isArray((ingredientsData as any)?.data?.data)
          ? (ingredientsData as any).data.data
          : [];
      const matched = rawList.find((r: any) => Number(r.productId) === Number(productId)) || rawList[0];
      const expItems = matched?.ingredientExpneseItems || matched?.expenseItems || [];

      if (expItems.length > 0) {
        const expList = Array.isArray(allExpItemsData?.data) ? allExpItemsData.data : [];
        const initialExpenses: ProductionExpenseItem[] = expItems.map((exp: any, index: number) => {
          const expId = exp.productionExpenssItemId ?? exp.productionExpenseItem?.id ?? exp.id;
          const foundExp = expList.find((e: any) => Number(e.id) === Number(expId));
          const name = exp.productionExpenseItem?.expItemName ?? foundExp?.expItemName ?? exp.expItemName ?? '';
          const rate = exp.productionExpenseItem?.unitRate ?? exp.unitRate ?? foundExp?.unitRate ?? foundExp?.rate ?? null;
          const qty = exp.qty !== undefined && exp.qty !== null ? Number(exp.qty) : null;
          const total = qty != null && rate != null ? Number((qty * rate).toFixed(2)) : 0;

          return {
            si: index + 1,
            expenseItemId: expId,
            name,
            qty,
            rate,
            total,
          };
        });
        setProductionExpenses(initialExpenses);
      } else {
        setProductionExpenses([
          {
            si: 1,
            expenseItemId: null,
            name: '',
            qty: null,
            rate: null,
            total: 0,
          },
        ]);
      }
    }
  }, [productionData, allRawMaterialsData, allPackingMaterialsData, allExpItemsData, ingredientsData, form, prodInv, productId]);

  // Calculations
  const grandTotal = useMemo(() => {
    return Number(rawMaterials.reduce((sum, item) => sum + (item.total || 0), 0).toFixed(2));
  }, [rawMaterials]);

  const totalPackingQty = useMemo(() => {
    return Number(packingMaterials.reduce((sum, item) => sum + (Number(item.qty) || 0), 0).toFixed(2));
  }, [packingMaterials]);

  const totalPackingTk = useMemo(() => {
    return Number(packingMaterials.reduce((sum, item) => sum + (Number(item.total) || 0), 0).toFixed(2));
  }, [packingMaterials]);

  const totalExpenseQty = useMemo(() => {
    return Number(productionExpenses.reduce((sum, item) => sum + (Number(item.qty) || 0), 0).toFixed(2));
  }, [productionExpenses]);

  const totalExpenseTk = useMemo(() => {
    return Number(productionExpenses.reduce((sum, item) => sum + (Number(item.total) || 0), 0).toFixed(2));
  }, [productionExpenses]);

  const productQuantity = Form.useWatch('productQuantity', form);
  const combinedQtyPerPack = Form.useWatch('qtyPerPack', combinedForm);
  const combinedNumberOfCartoon = Form.useWatch('numberOfCartoon', combinedForm);
  const currentCombinedTotalQty = (combinedQtyPerPack || 0) * (combinedNumberOfCartoon || 0);

  const totalProductionCost = useMemo(() => {
    return Number((grandTotal + totalPackingTk + totalExpenseTk).toFixed(2));
  }, [grandTotal, totalPackingTk, totalExpenseTk]);

  const rawMaterialUnitCost = useMemo(() => {
    const prodQty = Number(productQuantity) || 0;
    return prodQty > 0 ? roundToThree(grandTotal / prodQty) ?? 0 : 0;
  }, [grandTotal, productQuantity]);

  const expenseStageUnitCost = useMemo(() => {
    const prodQty = Number(productQuantity) || 0;
    return prodQty > 0 ? roundToThree((grandTotal + totalExpenseTk) / prodQty) ?? 0 : 0;
  }, [grandTotal, totalExpenseTk, productQuantity]);

  const packingStageUnitCost = useMemo(() => {
    const prodQty = Number(productQuantity) || 0;
    return prodQty > 0 ? roundToThree((grandTotal + totalExpenseTk + totalPackingTk) / prodQty) ?? 0 : 0;
  }, [grandTotal, totalExpenseTk, totalPackingTk, productQuantity]);

  const unitCost = packingStageUnitCost;

  // Sync packing materials whenever product quantity changes
  useEffect(() => {
    const prodQty = Number(productQuantity) || 0;
    if (prodQty > 0) {
      setPackingMaterials(prev =>
        prev.map(item => {
          const qty = item.qty != null ? Number(item.qty) : null;
          const price = item.unitPrice != null ? Number(item.unitPrice) : 0;
          const total = qty != null ? Number((qty * price).toFixed(2)) : 0;
          const perUnitQty = qty != null ? roundToThree(qty / prodQty) : (item.perUnitQty != null ? roundToThree(item.perUnitQty) : null);
          const perUnitCost =
            total > 0
              ? roundToThree(total / prodQty)
              : perUnitQty != null && price > 0
                ? roundToThree(perUnitQty * price)
                : null;
          return { ...item, perUnitQty, perUnitCost, total };
        })
      );
    }
  }, [productQuantity]);

  // Handlers for Packing Materials
  const handleAddPackingRow = () => {
    setPackingMaterials(prev => [
      ...prev,
      {
        si: prev.length + 1,
        packingMaterialId: null,
        name: '',
        unit: 'Pcs',
        unitId: null,
        qty: null,
        unitPrice: null,
        perUnitQty: null,
        perUnitCost: null,
        total: 0,
      },
    ]);
  };

  const handleRemovePackingRow = (si: number) => {
    setPackingMaterials(prev => {
      if (prev.length <= 1) {
        message.warning('At least one packing material row is required');
        return prev;
      }
      return prev.filter(item => item.si !== si).map((item, idx) => ({ ...item, si: idx + 1 }));
    });
  };

  const handlePackingMaterialChange = (si: number, materialId: number | null) => {
    if (!materialId) {
      setPackingMaterials(prev =>
        prev.map(item =>
          item.si === si
            ? {
              ...item,
              packingMaterialId: null,
              name: '',
              unit: 'Pcs',
              unitId: null,
              qty: null,
              unitPrice: null,
              perUnitQty: null,
              perUnitCost: null,
              total: 0,
            }
            : item
        )
      );
      return;
    }

    const chosen = packingMaterialOptions.find((opt: any) => opt.value === materialId);
    if (chosen) {
      const prodQty = Number(productQuantity) || 0;
      setPackingMaterials(prev =>
        prev.map(item => {
          if (item.si === si) {
            const unitPrice = chosen.unitPrice || 0;
            const qty = item.qty;
            const total = qty != null ? Number((qty * unitPrice).toFixed(2)) : 0;
            let perUnitQty = item.perUnitQty;
            let perUnitCost = null;

            if (qty != null && prodQty > 0) {
              perUnitQty = roundToThree(qty / prodQty);
              perUnitCost = roundToThree(total / prodQty);
            } else if (perUnitQty != null) {
              if (prodQty > 0) {
                const newQty = Number((perUnitQty * prodQty).toFixed(2));
                const newTotal = Number((newQty * unitPrice).toFixed(2));
                return {
                  ...item,
                  packingMaterialId: chosen.value,
                  name: chosen.label,
                  unit: chosen.unit || item.unit,
                  unitPrice,
                  qty: newQty,
                  perUnitQty,
                  perUnitCost: roundToThree(newTotal / prodQty),
                  total: newTotal,
                };
              }
              perUnitCost = roundToThree(perUnitQty * unitPrice);
            }

            return {
              ...item,
              packingMaterialId: chosen.value,
              name: chosen.label,
              unit: chosen.unit || item.unit,
              unitPrice,
              qty,
              perUnitQty,
              perUnitCost,
              total,
            };
          }
          return item;
        })
      );
    }
  };

  const handlePackingQtyChange = (si: number, value: number | null) => {
    const prodQty = Number(productQuantity) || 0;
    setPackingMaterials(prev =>
      prev.map(item => {
        if (item.si === si) {
          const qty = value;
          const price = item.unitPrice || 0;
          const total = qty != null ? Number((qty * price).toFixed(2)) : 0;
          let perUnitQty = null;
          let perUnitCost = null;
          if (qty != null && prodQty > 0) {
            perUnitQty = roundToThree(qty / prodQty);
            perUnitCost = roundToThree(total / prodQty);
          }
          return { ...item, qty, perUnitQty, perUnitCost, total };
        }
        return item;
      })
    );
  };

  const handlePackingPriceChange = (si: number, value: number | null) => {
    const prodQty = Number(productQuantity) || 0;
    setPackingMaterials(prev =>
      prev.map(item => {
        if (item.si === si) {
          const newPrice = value;
          const qty = item.qty;
          const total = qty != null && newPrice != null ? Number((qty * newPrice).toFixed(2)) : 0;
          let perUnitCost = null;
          if (total > 0 && prodQty > 0) {
            perUnitCost = roundToThree(total / prodQty);
          } else if (item.perUnitQty != null && newPrice != null) {
            perUnitCost = roundToThree(item.perUnitQty * newPrice);
          }
          return { ...item, unitPrice: newPrice, perUnitCost, total };
        }
        return item;
      })
    );
  };

  const handlePackingPerUnitQtyChange = (si: number, value: number | null) => {
    const prodQty = Number(productQuantity) || 0;
    setPackingMaterials(prev =>
      prev.map(item => {
        if (item.si === si) {
          const newPerUnitQty = value != null ? roundToThree(value) : null;
          const price = item.unitPrice || 0;
          let qty = item.qty;
          if (newPerUnitQty != null && prodQty > 0) {
            qty = Number((newPerUnitQty * prodQty).toFixed(2));
          }
          const total = qty != null ? Number((qty * price).toFixed(2)) : 0;
          const perUnitCost =
            total > 0 && prodQty > 0
              ? roundToThree(total / prodQty)
              : newPerUnitQty != null
                ? roundToThree(newPerUnitQty * price)
                : null;
          return { ...item, perUnitQty: newPerUnitQty, qty, perUnitCost, total };
        }
        return item;
      })
    );
  };

  const handlePackingPerUnitCostChange = (si: number, value: number | null) => {
    setPackingMaterials(prev =>
      prev.map(item => (item.si === si ? { ...item, perUnitCost: value != null ? roundToThree(value) : null } : item))
    );
  };

  // Handlers for Production Expenses
  const handleAddExpenseRow = () => {
    setProductionExpenses(prev => [
      ...prev,
      {
        si: prev.length + 1,
        expenseItemId: null,
        name: '',
        qty: null,
        rate: null,
        total: 0,
      },
    ]);
  };

  const handleRemoveExpenseRow = (si: number) => {
    setProductionExpenses(prev => {
      if (prev.length <= 1) {
        message.warning('At least one production expense row is required');
        return prev;
      }
      return prev.filter(item => item.si !== si).map((item, idx) => ({ ...item, si: idx + 1 }));
    });
  };

  const handleExpenseItemChange = (si: number, expenseId: number | null) => {
    if (!expenseId) {
      setProductionExpenses(prev =>
        prev.map(item =>
          item.si === si
            ? { ...item, expenseItemId: null, name: '', qty: null, rate: null, total: 0 }
            : item
        )
      );
      return;
    }

    const chosen = expenseOptions.find((opt: any) => opt.value === expenseId);
    if (chosen) {
      setProductionExpenses(prev =>
        prev.map(item => {
          if (item.si === si) {
            const newRate = chosen.rate ?? item.rate ?? null;
            const qty = item.qty || 0;
            const newTotal = newRate != null && qty != null ? Number((qty * newRate).toFixed(2)) : 0;
            return {
              ...item,
              expenseItemId: chosen.value,
              name: chosen.label,
              rate: newRate,
              total: newTotal,
            };
          }
          return item;
        })
      );
    }
  };

  const handleExpenseQtyChange = (si: number, value: number | null) => {
    setProductionExpenses(prev =>
      prev.map(item => {
        if (item.si === si) {
          const newQty = value;
          const rate = item.rate || 0;
          const newTotal = newQty != null && rate != null ? Number((newQty * rate).toFixed(2)) : 0;
          return { ...item, qty: newQty, total: newTotal };
        }
        return item;
      })
    );
  };

  const handleExpenseRateChange = (si: number, value: number | null) => {
    setProductionExpenses(prev =>
      prev.map(item => {
        if (item.si === si) {
          const newRate = value;
          const qty = item.qty || 0;
          const newTotal = newRate != null && qty != null ? Number((qty * newRate).toFixed(2)) : 0;
          return { ...item, rate: newRate, total: newTotal };
        }
        return item;
      })
    );
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  // Submit Step 2
  const handleSubmit = async () => {
    if (!productionData?.id) {
      message.error('No production record found to update');
      return;
    }

    setAttemptedSubmit(true);

    try {
      const values = await form.validateFields();

      const finishedQty = Number(values.productQuantity);
      if (!finishedQty || finishedQty <= 0) {
        message.error('Please enter a valid Finished Product Quantity (greater than 0)');
        return;
      }

      // Check Production Expenses
      if (productionExpenses.length > 0) {
        const hasUnselectedExp = productionExpenses.some(item => !item.expenseItemId);
        if (hasUnselectedExp) {
          message.error('Please select an Expense Item for all expense rows or remove unused rows');
          return;
        }

        const hasInvalidExpQty = productionExpenses.some(
          item => item.qty === null || item.qty === undefined || Number(item.qty) <= 0
        );
        if (hasInvalidExpQty) {
          message.error('Please enter a valid Qty/Duration (greater than 0) for all expense items');
          return;
        }

        const hasInvalidExpRate = productionExpenses.some(
          item => item.rate === null || item.rate === undefined || Number(item.rate) < 0
        );
        if (hasInvalidExpRate) {
          message.error('Please enter a valid Rate for all expense items');
          return;
        }
      }

      // Check Packing Materials
      if (packingMaterials.length > 0) {
        const hasUnselectedPm = packingMaterials.some(item => !item.packingMaterialId);
        if (hasUnselectedPm) {
          message.error('Please select a Packing Material for all packing rows or remove unused rows');
          return;
        }

        const hasInvalidPmQty = packingMaterials.some(
          item => item.qty === null || item.qty === undefined || Number(item.qty) <= 0
        );
        if (hasInvalidPmQty) {
          message.error('Please enter a valid Total Qty (greater than 0) for all packing materials');
          return;
        }

        const hasInvalidPmPrice = packingMaterials.some(
          item => item.unitPrice === null || item.unitPrice === undefined || Number(item.unitPrice) < 0
        );
        if (hasInvalidPmPrice) {
          message.error('Please enter a valid Unit Price for all packing materials');
          return;
        }
      }

      setIsSubmitting(true);

      const validMaterials = rawMaterials.filter(item => item.rawMaterialId);

      const payload: Production & { id?: number } = {
        ...(productionData?.id ? { id: Number(productionData.id) } : {}),
        date: values.date ? dayjs(values.date).toISOString() : dayjs().toISOString(),
        batchNo: values.batchNo,
        productinfo: {
          productId: Number(values.productId || productId),
          quantity: Number(values.productQuantity) || 0,
          unitPrice: unitCost || 0,
        },
        rawMaterials: validMaterials.map(item => ({
          ...(item.id ? { id: item.id } : {}),
          rawId: Number(item.rawMaterialId!),
          quantity: Number(item.qty) || 0,
          unitPrice: Number(item.rate) || 0,
        })),
        packingMaterials: packingMaterials
          .filter(item => item.packingMaterialId)
          .map(item => ({
            ...(item.id ? { id: item.id } : {}),
            packingMaterialId: Number(item.packingMaterialId!),
            unitPrice: Number(item.unitPrice) || 0,
            Qty: Number(item.qty) || 0,
            perUnitQty: Number(item.perUnitQty) || 0,
            perUnitCost: Number(item.perUnitCost) || 0,
          })),
        productionExpenses: productionExpenses
          .filter(item => item.expenseItemId)
          .map(item => ({
            ...(item.id ? { id: item.id } : {}),
            proExpencesItemId: Number(item.expenseItemId!),
            unitRate: Number(item.rate) || 0,
            expDuration: Number(item.qty) || 0,
            amount: Number(item.total) || 0,
          })),
      };

      const res = await createProduction(payload);
      const result = getResponse(res);

      if (result?.success) {
        message.success('Production Step 2 completed and saved successfully');
        navigate('/dashboard/production-voucher');
      }
    } catch (error: any) {
      if (error?.errorFields) {
        message.error('Please enter finished product quantity and check required fields');
      } else {
        message.error('An error occurred while saving Step 2');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Columns for Read-only Raw Materials Table
  const rawMaterialColumns = [
    { title: 'SI', dataIndex: 'si', key: 'si', width: 60, align: 'center' as const },
    {
      title: 'Material Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-semibold text-gray-800">{name}</span>,
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      width: 90,
      align: 'center' as const,
      render: (unit: string) => <span className="text-gray-600">{unit || 'Kg'}</span>,
    },
    {
      title: 'Quantity',
      dataIndex: 'qty',
      key: 'qty',
      width: 120,
      align: 'right' as const,
      render: (qty: number) => <span className="font-medium">{Number(qty || 0).toFixed(2)}</span>,
    },
    {
      title: 'Unit Rate (BDT)',
      dataIndex: 'rate',
      key: 'rate',
      width: 130,
      align: 'right' as const,
      render: (rate: number) => <span>{Number(rate || 0).toFixed(2)} ৳</span>,
    },
    {
      title: 'Total (BDT)',
      dataIndex: 'total',
      key: 'total',
      width: 140,
      align: 'right' as const,
      render: (total: number) => (
        <span className="font-bold text-amber-700">{Number(total || 0).toFixed(2)} ৳</span>
      ),
    },
  ];

  // Columns for Packing Materials
  const packingColumns = [
    { title: 'SI', dataIndex: 'si', key: 'si', width: 60, align: 'center' as const },
    {
      title: 'Packing Material',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (_: any, record: PackingMaterialItem) => (
        <Select
          status={attemptedSubmit && !record.packingMaterialId ? 'error' : undefined}
          placeholder="Select Packing Material"
          value={record.packingMaterialId || undefined}
          style={{ width: '100%' }}
          onChange={v => handlePackingMaterialChange(record.si, v as number | null)}
          options={packingMaterialOptions.map((opt: any) => ({
            ...opt,
            disabled: selectedPackingMaterialIds.has(opt.value) && opt.value !== record.packingMaterialId,
          }))}
          showSearch
          filterOption={(input, option) =>
            !!option?.label?.toString().toLowerCase().includes(input.toLowerCase())
          }
        />
      ),
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      align: 'center' as const,
      render: (unit: string) => <span className="text-gray-600 font-medium">{unit || 'Pcs'}</span>,
    },
    {
      title: 'Unit Price (BDT)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 140,
      render: (_: any, record: PackingMaterialItem) => (
        <InputNumber
          status={attemptedSubmit && (record.unitPrice == null || Number(record.unitPrice) < 0) ? 'error' : undefined}
          min={0}
          step={0.01}
          value={record.unitPrice}
          onChange={v => handlePackingPriceChange(record.si, v)}
          onFocus={handleInputFocus}
          controls={false}
          keyboard={false}
          style={{ width: '100%' }}
          precision={2}
          placeholder="0.00"
        />
      ),
    },
    {
      title: 'Total Qty',
      dataIndex: 'qty',
      key: 'qty',
      width: 130,
      render: (_: any, record: PackingMaterialItem) => (
        <InputNumber
          status={attemptedSubmit && (!record.qty || Number(record.qty) <= 0) ? 'error' : undefined}
          min={0}
          step={0.01}
          value={record.qty}
          onChange={v => handlePackingQtyChange(record.si, v)}
          onFocus={handleInputFocus}
          controls={false}
          keyboard={false}
          style={{ width: '100%' }}
          precision={2}
          placeholder="0.00"
        />
      ),
    },
    {
      title: 'Per Unit Qty',
      dataIndex: 'perUnitQty',
      key: 'perUnitQty',
      width: 120,
      render: (_: any, record: PackingMaterialItem) => (
        <InputNumber
          disabled
          value={record.perUnitQty}
          controls={false}
          style={{ width: '100%' }}
          precision={3}
          placeholder="0.000"
          className="bg-slate-100/90 font-bold text-slate-800 border-slate-200 cursor-not-allowed"
        />
      ),
    },
    {
      title: 'Per Unit Cost (BDT)',
      dataIndex: 'perUnitCost',
      key: 'perUnitCost',
      width: 130,
      render: (_: any, record: PackingMaterialItem) => (
        <InputNumber
          disabled
          value={record.perUnitCost}
          controls={false}
          style={{ width: '100%' }}
          precision={3}
          placeholder="0.000"
          className="bg-slate-100/90 font-bold text-slate-800 border-slate-200 cursor-not-allowed"
        />
      ),
    },
    {
      title: 'Total (BDT)',
      dataIndex: 'total',
      key: 'total',
      width: 130,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold text-gray-800">{Number(value || 0).toFixed(2)}</span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 60,
      align: 'center' as const,
      render: (_: any, record: PackingMaterialItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemovePackingRow(record.si)}
          size="small"
        />
      ),
    },
  ];

  // Columns for Production Expenses
  const expenseColumns = [
    { title: 'SI', dataIndex: 'si', key: 'si', width: 60, align: 'center' as const },
    {
      title: 'Expense Item Name',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (_: any, record: ProductionExpenseItem) => (
        <Select
          status={attemptedSubmit && !record.expenseItemId ? 'error' : undefined}
          placeholder="Select Expense Item"
          value={record.expenseItemId || undefined}
          style={{ width: '100%' }}
          onChange={v => handleExpenseItemChange(record.si, v as number | null)}
          options={expenseOptions.map((opt: any) => ({
            ...opt,
            disabled: selectedExpenseItemIds.has(opt.value) && opt.value !== record.expenseItemId,
          }))}
          showSearch
          filterOption={(input, option) =>
            !!option?.label?.toString().toLowerCase().includes(input.toLowerCase())
          }
        />
      ),
    },
    {
      title: 'Qty/Duration',
      dataIndex: 'qty',
      key: 'qty',
      width: 140,
      render: (_: any, record: ProductionExpenseItem) => (
        <InputNumber
          status={attemptedSubmit && (!record.qty || Number(record.qty) <= 0) ? 'error' : undefined}
          min={0}
          step={0.01}
          value={record.qty}
          onChange={v => handleExpenseQtyChange(record.si, v)}
          onFocus={handleInputFocus}
          controls={false}
          keyboard={false}
          style={{ width: '100%' }}
          precision={2}
          placeholder="0.00"
        />
      ),
    },
    {
      title: 'Rate (BDT)',
      dataIndex: 'rate',
      key: 'rate',
      width: 140,
      render: (_: any, record: ProductionExpenseItem) => (
        <InputNumber
          status={attemptedSubmit && (record.rate == null || Number(record.rate) < 0) ? 'error' : undefined}
          min={0}
          step={0.01}
          value={record.rate}
          onChange={v => handleExpenseRateChange(record.si, v)}
          onFocus={handleInputFocus}
          controls={false}
          keyboard={false}
          style={{ width: '100%' }}
          precision={2}
          placeholder="0.00"
        />
      ),
    },
    {
      title: 'Total (BDT)',
      dataIndex: 'total',
      key: 'total',
      width: 140,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold text-gray-800">{Number(value || 0).toFixed(2)}</span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 60,
      align: 'center' as const,
      render: (_: any, record: ProductionExpenseItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveExpenseRow(record.si)}
          size="small"
        />
      ),
    },
  ];

  if (!productionData && isProductionsLoading) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow-sm">
        <p className="text-gray-500 font-medium">Loading production data...</p>
      </div>
    );
  }

  if (!productionData && !isProductionsLoading) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-800">No Production Selected</h3>
        <p className="text-gray-500 text-sm">Please select a production from Production Voucher to proceed with Step 2.</p>
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/dashboard/production-voucher')}
          className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white shadow-xs font-semibold"
        >
          Go to Production Voucher
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800 m-0">Production Step 2 (Packaging & Expenses)</h2>
          <span className="text-xs text-gray-500">
            Configure finished quantity, packing materials, and expenses for batch {productionData.batchNo || '-'}
          </span>
        </div>

        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/dashboard/production-voucher')}
        >
          Back to Production Voucher
        </Button>
      </div>

      <Form form={form} layout="vertical" className="space-y-4">
        {/* Step 1 Summary Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200/50 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full items-center">
            <div>
              <span className="text-xs text-amber-600/80 block uppercase font-bold tracking-wider mb-1">Product</span>
              <span className="font-bold text-gray-800 text-base">{productName}</span>
            </div>
            <div>
              <span className="text-xs text-amber-600/80 block uppercase font-bold tracking-wider mb-1">Batch No</span>
              <span className="font-semibold text-gray-800">{productionData.batchNo || '-'}</span>
            </div>
            <div>
              <span className="text-xs text-amber-600/80 block uppercase font-bold tracking-wider mb-1">Date</span>
              <span className="font-semibold text-gray-800">
                {productionData.date ? dayjs(productionData.date).format('DD MMM, YYYY') : '-'}
              </span>
            </div>
            <div>
              <span className="text-xs text-amber-600/80 block uppercase font-bold tracking-wider mb-1">Raw Material Cost</span>
              <span className="font-bold text-amber-700 text-base">
                {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ৳
              </span>
            </div>
            <div className="flex justify-end">
              <Tag color="orange" className="font-bold text-sm py-1 px-3 rounded-full border-none shadow-sm m-0">
                Production #{productionData.id}
              </Tag>
            </div>
          </div>
        </div>

        {/* Read-Only Step 1 Raw Materials Section in Collapse */}
        <Collapse
          ghost
          className="bg-slate-50/60 rounded-lg border border-slate-200/60"
          items={[
            {
              key: '1',
              label: (
                <span className="font-semibold text-gray-700 flex items-center gap-2">
                  <EyeOutlined />
                  View Raw Materials Breakdown ({rawMaterials.length} Items, Locked from Step 1)
                </span>
              ),
              children: (
                <Table
                  dataSource={rawMaterials}
                  columns={rawMaterialColumns}
                  rowKey="si"
                  pagination={false}
                  bordered
                  size="small"
                  scroll={{ x: 700 }}
                  summary={() => (
                    <Table.Summary fixed>
                      <Table.Summary.Row className="bg-amber-50/40 font-bold">
                        <Table.Summary.Cell index={0} colSpan={3} className="font-bold text-slate-800">
                          Total Raw Materials
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} className="text-right font-bold text-slate-900">
                          {rawMaterials
                            .reduce((sum, item) => sum + (Number(item.qty) || 0), 0)
                            .toFixed(2)}
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2} />
                        <Table.Summary.Cell index={3} className="text-right font-extrabold text-amber-700">
                          {grandTotal.toFixed(2)} ৳
                        </Table.Summary.Cell>
                      </Table.Summary.Row>

                    </Table.Summary>
                  )}
                />
              ),
            },
          ]}
        />

        {/* Production Expenses Section */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-800 m-0">Production Expenses</h3>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddExpenseRow}
              className="text-blue-600 border-blue-200 hover:border-blue-400 hover:text-blue-700 font-medium rounded-lg"
            >
              Add Expense
            </Button>
          </div>
          <div className="rounded-lg overflow-hidden border border-gray-200/60">
            <Table
              className="expense-materials-table"
              dataSource={productionExpenses}
              columns={expenseColumns}
              rowKey="si"
              pagination={false}
              bordered
              size="small"
              scroll={{ x: 750 }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row className="bg-amber-50/40 border-t border-amber-200/50 font-bold">
                    <Table.Summary.Cell index={0} colSpan={2} />
                    <Table.Summary.Cell index={1} className="text-center font-bold text-slate-800">
                      <span className="text-gray-500 mr-2 font-semibold">Total Qty/Duration:</span>
                      <span className="text-sm font-bold text-slate-900">
                        {totalExpenseQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} colSpan={2} className="text-right pr-4 font-bold">
                      <span className="text-gray-500 mr-2 font-semibold">Total Tk:</span>
                      <span className="text-base font-extrabold text-amber-700">
                        {totalExpenseTk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ৳
                      </span>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>

                </Table.Summary>
              )}
            />
          </div>

        </div>

        {/* Packing Materials Section */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-800 m-0">Packing Materials</h3>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddPackingRow}
              className="text-emerald-600 border-emerald-200 hover:border-emerald-400 hover:text-emerald-700 font-medium rounded-lg"
            >
              Add Material
            </Button>
          </div>
          <div className="rounded-lg overflow-hidden border border-gray-200/60">
            <Table
              className="packing-materials-table"
              dataSource={packingMaterials}
              columns={packingColumns}
              rowKey="si"
              pagination={false}
              bordered
              size="small"
              scroll={{ x: 950 }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row className="bg-amber-50/40 border-t border-amber-200/50 font-bold">
                    <Table.Summary.Cell index={0} colSpan={3} />
                    <Table.Summary.Cell index={1} colSpan={3} className="text-center font-bold text-slate-800">
                      <span className="text-gray-500 mr-2 font-semibold">Total Qty:</span>
                      <span className="text-sm font-bold text-slate-900">
                        {totalPackingQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} colSpan={2} className="text-right pr-4 font-bold">
                      <span className="text-gray-500 mr-2 font-semibold">Total Tk:</span>
                      <span className="text-base font-extrabold text-amber-700">
                        {totalPackingTk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ৳
                      </span>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>

                </Table.Summary>
              )}
            />
          </div>
        </div>

      {/* Finished Product Quantity & Unit Cost Summary */}
      <FinalizationSummary
        handleInputFocus={handleInputFocus}
        unitCost={unitCost}
        grandTotal={grandTotal}
        rawMaterialUnitCost={rawMaterialUnitCost}
        totalExpenseTk={totalExpenseTk}
        expenseStageUnitCost={expenseStageUnitCost}
        totalPackingTk={totalPackingTk}
        packingStageUnitCost={packingStageUnitCost}
        totalProductionCost={totalProductionCost}
      />
      </Form>

      {/* Combined Products Section */}
      <CombinedProductsSection 
        combinedForm={combinedForm}
        combinedProducts={combinedProducts}
        setCombinedProducts={setCombinedProducts}
        productsData={productsData}
        productQuantity={productQuantity}
        currentCombinedTotalQty={currentCombinedTotalQty}
      />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <Button
            onClick={() => navigate('/dashboard/production-voucher')}
            icon={<ArrowLeftOutlined />}
            size="large"
            className="rounded-lg font-medium hover:bg-gray-50 border-gray-200"
          >
            Back to Voucher
          </Button>

          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            size="large"
            icon={<CheckCircleOutlined />}
            className="px-10 rounded-lg bg-gradient-to-r from-[#C58D2F] to-[#b07d28] hover:from-[#b07d28] hover:to-[#96691e] border-none text-white shadow-md font-bold text-base"
          >
            {isSubmitting ? 'Saving...' : 'Complete & Save'}
          </Button>
        </div>
    </div>
  );
};

export default ProductionStep2Page;
