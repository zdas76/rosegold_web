/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Form, message, Button, Tag, DatePicker } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router';
import dayjs from 'dayjs';
import { useGetRowMaterialsQuery } from '../../../redux/features/rowMaterials/rowMaterials.api';
import { useGetProductsQuery } from '../../../redux/features/product/product.api';
import { useGetPackingMaterialsQuery } from '../../../redux/features/packingMaterials/packingMaterials.api';
import { useGetProductionExpItemsQuery } from '../../../redux/features/productionExpItem/productionExpItem.api';
import { useGetProductionIngredientsQuery } from '../../../redux/features/productionIngredient/productionIngredient.api';
import {
  useCreateProductionMutation,
  useGetProductionByIdQuery,
} from '../../../redux/features/production/production.api';
import {
  setProductionStep1,
  setProductionStep2,
  resetProductionState,
} from '../../../redux/features/production/productionSlice';
import { getResponse } from '../../../utils/getResponse';
import { showErrorAlert } from '../../../utils/sweetAlert';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import type { RawMaterialItem, PackingMaterialItem, ProductionExpenseItem } from './ProductionCreationForm';
import CombinedProductsSection, { CombinedProductItem } from './production step2/CombinedProductsSection';
import FinalizationSummary from './production step2/FinalizationSummary';
import ProductionExpensesSection from './production step2/ProductionExpensesSection';
import PackingMaterialsSection from './production step2/PackingMaterialsSection';
import RawMaterialsSection from './production step2/RawMaterialsSection';
import { useLazyGetLastVoucherQtyQuery } from '../../../redux/features/inventory/InventoryApi';

const roundToThree = (value: number | null | undefined): number | null => {
  if (value == null || isNaN(Number(value))) return null;
  return Math.round((Number(value) + Number.EPSILON) * 1000) / 1000;
};

const ProductionStep2Page: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();

  const dispatch = useAppDispatch();
  const productionState = useAppSelector(state => state.production);

  const [productionData, setProductionData] = useState<any>(null);
  const [rawMaterials, setRawMaterials] = useState<RawMaterialItem[]>([]);
  const [packingMaterials, setPackingMaterials] = useState<PackingMaterialItem[]>([]);
  const [productionExpenses, setProductionExpenses] = useState<ProductionExpenseItem[]>([]);
  const [combinedProducts, setCombinedProducts] = useState<CombinedProductItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingIntermediate, setIsSavingIntermediate] = useState(false);

  // Queries

  const { data: productsData } = useGetProductsQuery({});
  const { data: allRawMaterialsData } = useGetRowMaterialsQuery({});
  const { data: allPackingMaterialsData } = useGetPackingMaterialsQuery({});
  const { data: allExpItemsData } = useGetProductionExpItemsQuery({});
  const targetId = params.id || searchParams.get('id') || location.state?.productionId;
  const { data: productionResponse, isLoading: isProductionLoading, refetch } = useGetProductionByIdQuery(
    targetId as string,
    { skip: !targetId }
  );
  const [trigerLastVoucherQty] = useLazyGetLastVoucherQtyQuery()
  const prevTargetIdRef = useRef<string | null>(null);
  // Keep URL in sync with targetId so Ctrl+S / reload preserves the ID
  useEffect(() => {
    if (targetId && !params.id) {
      navigate(`/dashboard/production-step-two/${targetId}`, { replace: true });
    }
  }, [targetId, params.id, navigate]);

  // Reset voucher state only when switching to a different targetId
  useEffect(() => {
    if (targetId && prevTargetIdRef.current && prevTargetIdRef.current !== String(targetId)) {
      setProductionData(null);
      setRawMaterials([]);
      setPackingMaterials([]);
      setProductionExpenses([]);
      form.resetFields();
      dispatch(resetProductionState());
    }
    if (targetId) {
      prevTargetIdRef.current = String(targetId);
    }
  }, [targetId, dispatch, form]);

  // Extract selected product from API inventory or productionItemInfo
  const productInventoryItem = useMemo(() => {
    const inventoryList = productionResponse?.data?.inventory || [];
    return inventoryList.find((item: any) => Boolean(item.product?.id || item.productId)) || null;
  }, [productionResponse]);

  const productionItemInfo = productionData?.productioniteminfo;
  const selectedProduct = productionItemInfo?.products;
  const currentProductId = Number(selectedProduct?.id);
  const [oldProductQty, setOldProductQty] = useState<number | null>(null);
  // Sync API response to local state and Redux
  useEffect(() => {
    if (productionResponse?.data) {
      setProductionData(productionResponse.data);
      const inventoryList = productionResponse.data.inventory || [];
      const productItem = inventoryList.find((item: any) => Boolean(item.product?.id || item.productId));
      const productId =
        productionResponse.data.productionItemInfo?.product?.id ||
        productionResponse.data.productionItemInfo?.productId;
      if (productId) {
        const rawMaterialsList = inventoryList
          .filter((item: any) => Boolean(item.rawId || item.raWMaterial))
          .map((item: any) => ({
            rawId: Number(item.rawId || item.raWMaterial?.id),
            quantity: Number(item.quantityLess ?? item.quantity ?? 0),
            unitPrice: Number(item.unitPrice ?? 0),
          }));

        dispatch(
          setProductionStep1({
            productId: Number(productId),
            date: productionResponse.data.date || dayjs().toISOString(),
            rawMaterials: rawMaterialsList,
          })
        );
      }
    }
  }, [productionResponse, dispatch]);

  // Dropdown options
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
  const productName = selectedProduct?.name || 'Product';
  const batchNo = productionItemInfo?.batchNo || '-';
  // Recipe query
  const { data: ingredientsData } = useGetProductionIngredientsQuery(
    currentProductId ? { productId: currentProductId } : undefined,
    { skip: !currentProductId }
  );

  const [createProduction] = useCreateProductionMutation();
  // Populate form and lists when production data arrives
  useEffect(() => {
    if (!productionData && !productionState.productinfo?.productId) return;
    const sourceData = productionData ? 'api' : 'redux';
    const rawProdQty =
      productInventoryItem?.quantityAdd ??
      productInventoryItem?.quantity ??
      (productionData as any)?.productQuantity ??
      productionState.productinfo?.quantityAdd;
    const initialProductQty = rawProdQty && Number(rawProdQty) > 0 ? Number(rawProdQty) : undefined;
    form.setFieldsValue({
      productId: Number(currentProductId) || undefined,
      batchNo: productionItemInfo?.batchNo || '',
      date: productionData?.date
        ? dayjs(productionData.date)
        : productionState.date
          ? dayjs(productionState.date)
          : (form.getFieldValue('date') || dayjs()),
      productQuantity: initialProductQty,
    });
    const allRawMaterialsList = Array.isArray(allRawMaterialsData?.data) ? allRawMaterialsData.data : [];
    const allPackingList = Array.isArray(allPackingMaterialsData?.data) ? allPackingMaterialsData.data : [];
    const allExpensesList = Array.isArray(allExpItemsData?.data) ? allExpItemsData.data : [];
    // 1. Raw Materials (from Step 1)
    let parsedRawMaterials: RawMaterialItem[] = [];
    if (sourceData === 'redux') {
      parsedRawMaterials = (productionState.rawMaterials || []).map((rawItem, index) => {
        const matchingRaw = allRawMaterialsList.find((material: any) => Number(material.id) === Number(rawItem.rawId));
        return {
          si: index + 1,
          rawMaterialId: Number(rawItem.rawId),
          name: matchingRaw?.name || `Item #${rawItem.rawId}`,
          unit: matchingRaw?.unit?.name || 'Kg',
          unitId: matchingRaw?.unitId || null,
          qty: rawItem.quantity,
          rate: rawItem.unitPrice,
          total: Number((rawItem.quantity * rawItem.unitPrice).toFixed(2)),
        };
      });
    } else {
      const rawInventories =
        productionData?.rawMaterials ||
        productionData?.inventory?.filter((item: any) => item.rawId !== null) ||
        [];
      parsedRawMaterials = rawInventories.map((rawItem: any, index: number) => {
        const rawId = rawItem.rawId;
        const matchingRaw = allRawMaterialsList.find((material: any) => Number(material.id) === Number(rawId));
        const quantity = rawItem.quantity ?? rawItem.quantityLess ?? 0;
        const rate = rawItem.unitPrice ?? matchingRaw?.unitPrice ?? 0;
        const total = quantity * rate;
        return {
          id: rawItem.id,
          si: index + 1,
          rawMaterialId: rawId,
          name: matchingRaw?.name || `Item #${rawId}`,
          unit: matchingRaw?.unit?.name || 'Kg',
          unitId: matchingRaw?.unitId || null,
          qty: quantity > 0 ? quantity : null,
          rate: rate > 0 ? rate : null,
          total: Number(total.toFixed(2)),
        };
      });
    }
    setRawMaterials(parsedRawMaterials);
    // 2. Packing Materials
    const currentProd = productionData || productionResponse?.data;
    const existingPackingInventories = currentProd?.pminventories || [];
    if (existingPackingInventories.length > 0) {
      const parsedPacking: PackingMaterialItem[] = existingPackingInventories.map(
        (packingItem: any, index: number) => {
          // const lastqtyRes = trigerLastVoucherQty({ pmMaterialId: packingItem })
          const packingMaterialId = packingItem.packingMaterialId ?? packingItem.packingMaterial?.id;
          const matchingPacking = allPackingList.find((p: any) => Number(p.id) === Number(packingMaterialId));
          const name = packingItem.packingMaterial?.name || matchingPacking?.name || `Packing #${packingMaterialId}`;
          const unit = packingItem.packingMaterial?.unit?.name || matchingPacking?.unit?.name || 'Pcs';
          const unitId = packingItem.packingMaterial?.unitId || matchingPacking?.unitId || null;
          const unitPrice = Number(packingItem.unitPrice ?? matchingPacking?.unitPrice ?? 0);
          const quantity = Number(
            packingItem.Qty ??
            packingItem.quantityLess ??
            packingItem.quantityAdd ??
            packingItem.quantity ??
            0
          );

          // If explicit positive amount/debit/credit exists use it, otherwise compute quantity * unitPrice
          const explicitAmount =
            (packingItem.amount != null && Number(packingItem.amount) > 0 ? Number(packingItem.amount) : null) ??
            (packingItem.debitAmount != null && Number(packingItem.debitAmount) > 0 ? Number(packingItem.debitAmount) : null) ??
            (packingItem.creditAmount != null && Number(packingItem.creditAmount) > 0 ? Number(packingItem.creditAmount) : null);

          const calculatedTotal = explicitAmount != null
            ? explicitAmount
            : (quantity > 0 && unitPrice > 0 ? quantity * unitPrice : 0);

          const prodQty = Number(initialProductQty) || 0;
          let perUnitQty = packingItem.perUnitQty != null ? roundToThree(packingItem.perUnitQty) : null;
          let perUnitCost = packingItem.perUnitCost != null ? roundToThree(packingItem.perUnitCost) : null;

          if (perUnitQty == null && prodQty > 0 && quantity > 0) {
            perUnitQty = roundToThree(quantity / prodQty);
          }
          if (perUnitCost == null && prodQty > 0 && calculatedTotal > 0) {
            perUnitCost = roundToThree(calculatedTotal / prodQty);
          } else if (perUnitCost == null && perUnitQty != null && unitPrice > 0) {
            perUnitCost = roundToThree(perUnitQty * unitPrice);
          }

          return {
            id: packingItem.id,
            si: index + 1,
            packingMaterialId: Number(packingMaterialId),
            name,
            unit,
            unitId,
            qty: quantity > 0 ? quantity : null,
            unitPrice: unitPrice > 0 ? unitPrice : null,
            perUnitQty,
            perUnitCost,
            total: Number(calculatedTotal.toFixed(2)),
          };
        }
      );
      setPackingMaterials(parsedPacking);
    } else {
      // Auto-load recipe packing materials if available
      const ingredientsList = Array.isArray(ingredientsData?.data)
        ? ingredientsData.data
        : Array.isArray((ingredientsData as any)?.data?.data)
          ? (ingredientsData as any).data.data
          : [];
      const matchedRecipe =
        ingredientsList.find((recipe: any) => Number(recipe.productId) === Number(currentProductId)) ||
        ingredientsList[0];
      const recipePackingMaterials =
        matchedRecipe?.ingredientPackingMaterial || [];

      if (recipePackingMaterials.length > 0) {
        const loadedPmMaterilas = Number(initialProductQty) || 0;
        Promise.all(
          recipePackingMaterials.map(async (recipeItem: any, index: number) => {
            const packingMaterialId = recipeItem.packingMaterial?.id ?? recipeItem.packingMaterialId ?? recipeItem.id;
            const matchingPacking = allPackingList.find((p: any) => Number(p.id) === Number(packingMaterialId));
            const name = recipeItem.packingMaterial?.name ?? matchingPacking?.name ?? recipeItem.name ?? '';
            const unit = recipeItem.packingMaterial?.unit?.name ?? matchingPacking?.unit?.name ?? recipeItem.unit?.name ?? 'Pcs';
            const unitId = recipeItem.packingMaterial?.unitId ?? matchingPacking?.unitId ?? recipeItem.unit?.id ?? null;
            const unitPrice = recipeItem.packingMaterial?.unitPrice ?? recipeItem.unitPrice ?? recipeItem.rate ?? matchingPacking?.unitPrice ?? matchingPacking?.rate ?? 0;
            const perUnitQty = recipeItem.ingredienteQty ?? recipeItem.quantity ?? recipeItem.perUnitQty ?? null;
            const totalQty =
              perUnitQty != null && loadedPmMaterilas > 0
                ? Number((perUnitQty * loadedPmMaterilas).toFixed(2))
                : (recipeItem.Qty ?? recipeItem.quantity ?? null);

            let lastUsedQty: number | null = null;
            if (packingMaterialId) {
              try {
                const lastUsedqtyRes = await trigerLastVoucherQty({ pmMaterialId: Number(packingMaterialId) });
                const fetchedQty = lastUsedqtyRes?.data?.data?.quantityLess ?? lastUsedqtyRes?.data?.quantityLess;
                if (fetchedQty != null && Number(fetchedQty) > 0) {
                  lastUsedQty = Number(fetchedQty);
                }
              } catch (err) {
                console.error('Failed to fetch last voucher qty for PM:', err);
              }
            }

            const finalQty = lastUsedQty != null ? lastUsedQty : (totalQty ?? null);
            const total = finalQty != null && unitPrice > 0 ? Number((finalQty * unitPrice).toFixed(2)) : 0;
            const calculatedPerUnitQty =
              loadedPmMaterilas > 0 && finalQty != null
                ? roundToThree(finalQty / loadedPmMaterilas)
                : perUnitQty != null
                  ? roundToThree(perUnitQty)
                  : null;
            const calculatedCost =
              loadedPmMaterilas > 0 && total > 0
                ? roundToThree(total / loadedPmMaterilas)
                : calculatedPerUnitQty != null
                  ? roundToThree(calculatedPerUnitQty * unitPrice)
                  : null;

            return {
              si: index + 1,
              packingMaterialId: Number(packingMaterialId),
              name,
              unit,
              unitId,
              qty: finalQty,
              unitPrice,
              perUnitQty: calculatedPerUnitQty,
              perUnitCost: calculatedCost,
              total,
            };
          })
        ).then((resolvedPacking: PackingMaterialItem[]) => {
          setPackingMaterials(resolvedPacking);
        });
      } else {
        setPackingMaterials([]);
      }
    }

    // 3. Production Expenses
    const existingExpenseInventories = currentProd?.productionExpensesInventory || [];


    if (existingExpenseInventories.length > 0) {
      const parsedExpenses: ProductionExpenseItem[] = existingExpenseInventories.map(
        (expenseItem: any, index: number) => {
          const expenseItemId = expenseItem.proExpencesItemId ?? expenseItem.productionExpenseItem?.id ?? expenseItem.expenseItemId;
          const matchingExpense = allExpensesList.find((e: any) => Number(e.id) === Number(expenseItemId));
          const name =
            expenseItem.productionExpenseItem?.expItemName ||
            matchingExpense?.expItemName ||
            `Expense #${expenseItemId}`;
          const rate = Number(expenseItem.unitRate ?? expenseItem.rate ?? matchingExpense?.unitRate ?? 0);
          const duration = Number(expenseItem.expDuration ?? expenseItem.quantity ?? expenseItem.qty ?? 0);
          const explicitAmount =
            expenseItem.amount != null && Number(expenseItem.amount) > 0
              ? Number(expenseItem.amount)
              : null;
          const total = explicitAmount != null
            ? explicitAmount
            : (duration > 0 && rate > 0 ? duration * rate : 0);

          return {
            id: expenseItem.id,
            si: index + 1,
            expenseItemId: Number(expenseItemId),
            name,
            qty: duration > 0 ? duration : null,
            rate: rate > 0 ? rate : null,
            total: Number(total.toFixed(2)),
          };
        }
      );
      setProductionExpenses(parsedExpenses);
    } else {
      const ingredientsList = Array.isArray(ingredientsData?.data)
        ? ingredientsData.data
        : Array.isArray((ingredientsData as any)?.data?.data)
          ? (ingredientsData as any).data.data
          : [];
      const matchedRecipe =
        ingredientsList.find((recipe: any) => Number(recipe.productId) === Number(currentProductId)) ||
        ingredientsList[0];
      const recipeExpenses = currentProd?.productioniteminfo?.status === "PROCESSING" ? matchedRecipe?.ingredientExpneseItems : [];

      if (recipeExpenses?.length > 0) {
        const initialExpenses: ProductionExpenseItem[] = recipeExpenses.map((recipeExp: any, index: number) => {
          const expenseItemId = recipeExp.productionExpenssItemId ?? recipeExp.productionExpenseItem?.id ?? recipeExp.id;
          const matchingExpense = allExpensesList.find((e: any) => Number(e.id) === Number(expenseItemId));
          const name =
            recipeExp.productionExpenseItem?.expItemName ??
            matchingExpense?.expItemName ??
            recipeExp.expItemName ??
            '';
          const rate =
            recipeExp.productionExpenseItem?.unitRate ??
            recipeExp.unitRate ??
            matchingExpense?.unitRate ??
            matchingExpense?.rate ??
            null;
          const qty = recipeExp.qty !== undefined && recipeExp.qty !== null ? Number(recipeExp.qty) : null;
          const total = qty != null && rate != null ? Number((qty * rate).toFixed(2)) : 0;

          return {
            si: index + 1,
            expenseItemId,
            name,
            qty,
            rate,
            total,
          };
        });
        setProductionExpenses(initialExpenses);
      } else {
        setProductionExpenses([]);
      }
    }

    // 4. Combined Products
    const existingCombined =
      (currentProd?.products && currentProd.products.length > 0)
        ? currentProd.products
        : (currentProd?.combinedProducts && currentProd.combinedProducts.length > 0)
          ? currentProd.combinedProducts
          : [];


    if (existingCombined.length > 0) {
      const allProdList = Array.isArray(productsData?.data) ? productsData.data : [];
      const parsedCombined: CombinedProductItem[] = existingCombined.map((cp: any, index: number) => {
        const productId = cp.productId ?? cp.product?.id;
        const matchingProd = allProdList.find((p: any) => Number(p.id) === Number(productId));
        const name = cp.productName || cp.product?.name || matchingProd?.name || `Product #${productId}`;
        const catName =
          matchingProd?.subCategory?.category?.categoryName ||
          matchingProd?.category?.categoryName ||
          cp.categoryName ||
          '';
        const qtyPerPack = cp.qtyPerPack ?? cp.quantityPerPack ?? 1;
        const totalQty = Number(cp.quantityAdd ?? cp.quantity ?? cp.totalQty ?? 0);
        const numberOfCartoon = cp.numberOfCartoon ?? cp.carton ?? (qtyPerPack > 0 ? Math.floor(totalQty / qtyPerPack) : 0);

        return {
          id: cp.id || Date.now() + index,
          si: index + 1,
          productId: Number(productId),
          productName: name,
          categoryName: catName,
          qtyPerPack,
          numberOfCartoon,
          totalQty,
        };
      });
      setCombinedProducts(parsedCombined);
    }
  }, [
    productionData,
    allRawMaterialsData,
    allPackingMaterialsData,
    allExpItemsData,
    ingredientsData,
    form,
    productInventoryItem,
    currentProductId,
    productionState.date,
    productionState.productinfo?.productId,
    productionState.rawMaterials,
    dispatch,
  ]);

  // Sync expenses and packing materials to Redux
  useEffect(() => {
    dispatch(
      setProductionStep2({
        productionExpenses: productionExpenses
          .filter(item => Boolean(item.expenseItemId))
          .map(item => ({
            proExpencesItemId: Number(item.expenseItemId),
            expDuration: Number(item.qty) || 0,
            unitRate: Number(item.rate) || 0,
            amount: Number(item.total) || 0,
          })),
        packingMaterials: packingMaterials
          .filter(item => Boolean(item.packingMaterialId))
          .map(item => ({
            packingMaterialId: Number(item.packingMaterialId),
            unitPrice: Number(item.unitPrice) || 0,
            qty: Number(item.qty) || 0,
            perUnitQty: Number(item.perUnitQty) || 0,
            perUnitCost: Number(item.perUnitCost) || 0,
          })),
      })
    );
  }, [productionExpenses, packingMaterials, dispatch]);

  // Calculations
  const grandTotal = useMemo(() => {
    return Number(rawMaterials.reduce((sum, item) => sum + (item.total || 0), 0).toFixed(2));
  }, [rawMaterials]);

  const totalPackingQty = useMemo(() => {
    return Number(packingMaterials.reduce((sum, item) => sum + (Number(item.qty) || 0), 0).toFixed(2));
  }, [packingMaterials]);

  const totalPackingTk = useMemo(() => {
    return Number(
      packingMaterials
        .reduce((sum, item) => {
          const itemTotal =
            item.total && Number(item.total) > 0
              ? Number(item.total)
              : (Number(item.qty || 0) * Number(item.unitPrice || 0));
          return sum + (itemTotal || 0);
        }, 0)
        .toFixed(2)
    );
  }, [packingMaterials]);

  const totalExpenseQty = useMemo(() => {
    return Number(productionExpenses.reduce((sum, item) => sum + (Number(item.qty) || 0), 0).toFixed(2));
  }, [productionExpenses]);

  const totalExpenseTk = useMemo(() => {
    return Number(
      productionExpenses
        .reduce((sum, item) => {
          const itemTotal =
            item.total && Number(item.total) > 0
              ? Number(item.total)
              : (Number(item.qty || 0) * Number(item.rate || 0));
          return sum + (itemTotal || 0);
        }, 0)
        .toFixed(2)
    );
  }, [productionExpenses]);

  const productQuantity = Form.useWatch('productQuantity', form);

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
          const price = item.unitPrice != null ? Number(item.unitPrice) : 0;
          const qty =
            item.qty != null
              ? Number(item.qty)
              : item.perUnitQty != null && prodQty > 0
                ? Number((item.perUnitQty * prodQty).toFixed(2))
                : null;
          const total = qty != null && price > 0 ? Number((qty * price).toFixed(2)) : (item.total || 0);
          const perUnitQty =
            qty != null ? roundToThree(qty / prodQty) : item.perUnitQty != null ? roundToThree(item.perUnitQty) : null;
          const perUnitCost =
            total > 0
              ? roundToThree(total / prodQty)
              : perUnitQty != null && price > 0
                ? roundToThree(perUnitQty * price)
                : item.perUnitCost != null
                  ? roundToThree(item.perUnitCost)
                  : null;
          return { ...item, perUnitQty, perUnitCost, total };
        })
      );
    }
  }, [productQuantity]);

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };
  // Save Raw Materials, Expenses & Packing Materials before Finalization
  const handleSaveMaterialsAndExpenses = async () => {
    if (!productionData?.id && !productionState.productinfo?.productId) {
      showErrorAlert('No production record found to update or save');
      return;
    }
    // Check Production Expenses
    if (productionExpenses.length > 0) {
      const hasUnselectedExpense = productionExpenses.some(item => !item.expenseItemId);
      if (hasUnselectedExpense) {
        showErrorAlert('Please select an Expense Item for all expense rows or remove unused rows');
        return;
      }

      const hasInvalidExpenseQty = productionExpenses.some(
        item => item.qty === null || item.qty === undefined || Number(item.qty) <= 0
      );
      if (hasInvalidExpenseQty) {
        showErrorAlert('Please enter a valid Qty/Duration (greater than 0) for all expense items');
        return;
      }

      const hasInvalidExpenseRate = productionExpenses.some(
        item => item.rate === null || item.rate === undefined || Number(item.rate) < 0
      );
      if (hasInvalidExpenseRate) {
        showErrorAlert('Please enter a valid Rate for all expense items');
        return;
      }
    }

    // Check Packing Materials
    if (packingMaterials.length > 0) {
      const hasUnselectedPacking = packingMaterials.some(item => !item.packingMaterialId);
      if (hasUnselectedPacking) {
        showErrorAlert('Please select a Packing Material for all packing rows or remove unused rows');
        return;
      }

      const hasInvalidPackingQty = packingMaterials.some(
        item => item.qty === null || item.qty === undefined || Number(item.qty) <= 0
      );
      if (hasInvalidPackingQty) {
        showErrorAlert('Please enter a valid Total Qty (greater than 0) for all packing materials');
        return;
      }

      const hasInvalidPackingPrice = packingMaterials.some(
        item => item.unitPrice === null || item.unitPrice === undefined || Number(item.unitPrice) < 0
      );
      if (hasInvalidPackingPrice) {
        showErrorAlert('Please enter a valid Unit Price for all packing materials');
        return;
      }
    }

    setIsSavingIntermediate(true);
    try {
      const selectedDate = form.getFieldValue('date');
      const payload: any = {
        date: selectedDate ? dayjs(selectedDate).toISOString() : dayjs().toISOString(),
        productinfo: {
          productId: Number(currentProductId || form.getFieldValue('productId')),
          quantityAdd: Number(form.getFieldValue('productQuantity')) || 0,
          unitPrice: unitCost || 0,
        },
        rawMaterials: [],
        packingMaterials: packingMaterials
          .filter(item => item.packingMaterialId)
          .map(item => ({
            ...(item.id ? { id: item.id } : {}),
            packingMaterialId: Number(item.packingMaterialId!),
            unitPrice: Number(item.unitPrice) || 0,
            qty: Number(item.qty) || 0,
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
      const res = await createProduction({ data: { ...payload, status: "IN_PROGRESS" }, id: productionData?.id });
      const result = getResponse(res);
      if (result?.success) {
        refetch?.();
        if (result.data) {
          setProductionData(result.data);
        } else {
          setProductionData((prev: any) => ({ ...(prev || {}), status: "IN_PROGRESS" }));
        }
        message.success('Materials and expenses saved successfully! Please continue to Finalization and Combined Products.');
      }
    } catch (error: any) {
      showErrorAlert('An error occurred while saving materials and expenses');
    } finally {
      setIsSavingIntermediate(false);
    }
  };
  // submit the finished goods after production
  const handleSubmitFinishedGoods = async () => {
    if (!productionData?.id && !productionState.productinfo?.productId) {
      showErrorAlert('No production record found to update or save');
      return;
    }
    const finishedQty = Number(form.getFieldValue('productQuantity'));
    if (!finishedQty || finishedQty <= 0) {
      showErrorAlert('Please enter a valid Finished Product Quantity (greater than 0)');
      return;
    }

    // Check Production Expenses
    if (productionExpenses.length > 0) {
      const hasUnselectedExpense = productionExpenses.some(item => !item.expenseItemId);
      if (hasUnselectedExpense) {
        showErrorAlert('Please select an Expense Item for all expense rows or remove unused rows');
        return;
      }

      const hasInvalidExpenseQty = productionExpenses.some(
        item => item.qty === null || item.qty === undefined || Number(item.qty) <= 0
      );
      if (hasInvalidExpenseQty) {
        showErrorAlert('Please enter a valid Qty/Duration (greater than 0) for all expense items');
        return;
      }

      const hasInvalidExpenseRate = productionExpenses.some(
        item => item.rate === null || item.rate === undefined || Number(item.rate) < 0
      );
      if (hasInvalidExpenseRate) {
        showErrorAlert('Please enter a valid Rate for all expense items');
        return;
      }
    }

    // Check Packing Materials
    if (packingMaterials.length > 0) {
      const hasUnselectedPacking = packingMaterials.some(item => !item.packingMaterialId);
      if (hasUnselectedPacking) {
        showErrorAlert('Please select a Packing Material for all packing rows or remove unused rows');
        return;
      }

      const hasInvalidPackingQty = packingMaterials.some(
        item => item.qty === null || item.qty === undefined || Number(item.qty) <= 0
      );
      if (hasInvalidPackingQty) {
        showErrorAlert('Please enter a valid Total Qty (greater than 0) for all packing materials');
        return;
      }

      const hasInvalidPackingPrice = packingMaterials.some(
        item => item.unitPrice === null || item.unitPrice === undefined || Number(item.unitPrice) < 0
      );
      if (hasInvalidPackingPrice) {
        showErrorAlert('Please enter a valid Unit Price for all packing materials');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const previousDate = productionData?.date || productionState.date || form.getFieldValue('date');
      const date = previousDate ? dayjs(previousDate).toISOString() : dayjs().toISOString();

      const payload: any = {
        date,
        inventoryId: productInventoryItem?.id,
        productinfo: {
          productId: Number(currentProductId || form.getFieldValue('productId')),
          quantityAdd: Number(form.getFieldValue('productQuantity')) || 0,
          unitPrice: unitCost || 0,
        },
        rawMaterials: [],
        packingMaterials: packingMaterials
          .filter(item => item.packingMaterialId)
          .map(item => ({
            ...(item.id ? { id: item.id } : {}),
            packingMaterialId: Number(item.packingMaterialId!),
            unitPrice: Number(item.unitPrice) || 0,
            qty: Number(item.qty) || 0,
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
      const res = await createProduction({
        data: { ...payload, status: "PENDING" },
        id: productionData?.id,
      });
      const result = getResponse(res);

      if (result?.success) {
        message.success('Finished goods saved successfully! Please configure Combined Products.');
        refetch?.();
        if (result.data) {
          setProductionData(result.data);
        } else {
          setProductionData((prev: any) => ({ ...(prev || {}), status: "PENDING" }));
        }
      }
    } catch (error: any) {
      showErrorAlert('An error occurred while saving finished goods');
    } finally {
      setIsSubmitting(false);
    }
  };
  // Submit Step 2 (Final Save)
  const handleSubmit = async () => {
    if (!productionData?.id && !productionState.productinfo?.productId) {
      showErrorAlert('No production record found to update or save');
      return;
    }
    try {
      const values = await form.validateFields();
      const finishedQty = Number(values.productQuantity);
      if (!finishedQty || finishedQty <= 0) {
        showErrorAlert('Please enter a valid Finished Product Quantity (greater than 0)');
        return;
      }
      // Check Combined Products
      let totalCombined = 0;
      if (combinedProducts.length > 0) {
        const hasUnselectedCombined = combinedProducts.some(item => !item.productId);
        if (hasUnselectedCombined) {
          showErrorAlert('Please select a Product for all combined product rows or remove unused rows');
          return;
        }

        const hasInvalidCombinedQty = combinedProducts.some(
          item => !item.totalQty || Number(item.totalQty) <= 0
        );
        if (hasInvalidCombinedQty) {
          showErrorAlert('Please enter valid Qty per Pack and No. of Cartons for all combined products');
          return;
        }

        totalCombined = combinedProducts.reduce((sum, item) => sum + (Number(item.totalQty) || 0), 0);
        const maxCombinedLimit = oldProductQty != null ? Number(oldProductQty) : null;
        if (maxCombinedLimit !== null && totalCombined > maxCombinedLimit) {
          showErrorAlert(`Total combined quantity (${totalCombined}) cannot exceed available product quantity (${maxCombinedLimit})`);
          return;
        }
      }
      const formattedCombinedProducts = combinedProducts
        .filter(cp => cp.productId)
        .map(cp => ({
          productId: Number(cp.productId),
          quantityAdd: Number(cp.numberOfCartoon) || 0,
          unitPrice: (Number(unitCost) * Number(cp.qtyPerPack)) || 0,
        }));

      const selectedDate = values.date || form.getFieldValue('date');
      const payload: any = {
        date: selectedDate ? dayjs(selectedDate).toISOString() : dayjs().toISOString(),
        products: [
          ...formattedCombinedProducts,
          {
            productId: Number(currentProductId || form.getFieldValue('productId')),
            quantityLess: Number(totalCombined) || 0,
            unitPrice: unitCost || 0,
          },
        ],
      };
      const res = await createProduction({
        data: payload,
        id: productionData?.id,
      });
      const result = getResponse(res);
      if (result?.success) {
        message.success('Production Step 2 completed and saved successfully');
        navigate('/dashboard/production-voucher');
      }
    } catch (error: any) {
      if (error?.errorFields) {
        showErrorAlert('Please enter finished product quantity and check required fields');
      } else {
        showErrorAlert('An error occurred while saving Step 2');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const effectiveProductionData = productionData || productionResponse?.data;

  if (targetId && isProductionLoading && !effectiveProductionData) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow-sm">
        <p className="text-gray-500 font-medium">Loading production data...</p>
      </div>
    );
  }

  if (!targetId && !effectiveProductionData && !productionState.productinfo?.productId) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-800">No Production Selected</h3>
        <p className="text-gray-500 text-sm">
          Please select a production from Production Voucher to proceed with Step 2.
        </p>
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

  const currentStatus = productionItemInfo?.status || 'PROCESSING';
  const isProcessing = currentStatus === 'PROCESSING';
  const isInProgress = currentStatus === 'IN_PROGRESS';
  const isPending = currentStatus === 'PENDING' || currentStatus === 'PENDDING';
  const isCompleted = currentStatus === 'COMPLETE';


  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)] p-6 space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-1 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-slate-800 m-0 tracking-tight">Production Step 2</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
              Stage 2: Packaging & Overhead
            </span>
          </div>
          <p className="text-xs text-slate-400 m-0 mt-0.5">
            Configure finished quantity, packing materials, and operating expenses for batch {batchNo}
          </p>
        </div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/dashboard/production-voucher')}
          className="rounded-lg border-slate-200 text-slate-600 hover:text-[#C58D2F] hover:border-[#C58D2F] text-xs h-8 font-medium shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]"
        >
          Back to Production Voucher
        </Button>
      </div>

      <Form form={form} layout="vertical" initialValues={{ date: dayjs() }} className="space-y-4">
        {/* Step 1 Summary Banner */}
        <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.03)] flex flex-wrap items-center justify-between gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full items-center">
            <div>
              <span className="text-[11px] text-slate-400 block uppercase font-semibold tracking-wider">Product</span>
              <span className="font-bold text-slate-800 text-sm block mt-0.5">{productName}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block uppercase font-semibold tracking-wider">Batch No</span>
              <span className="font-mono font-bold text-slate-700 text-xs px-2 py-0.5 rounded bg-white border border-slate-200/60 inline-block mt-0.5">{batchNo}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block uppercase font-semibold tracking-wider mb-0.5">Date</span>
              <Form.Item
                name="date"
                rules={[{ required: true, message: 'Please select date' }]}
                className="mb-0"              >
                <DatePicker
                  disabled={!isProcessing}
                  format="DD-MMM-YYYY"
                  style={{ width: '100%' }}
                  className="rounded-lg shadow-2xs font-semibold text-gray-800 bg-white"
                />
              </Form.Item>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block uppercase font-semibold tracking-wider">Raw Material Cost</span>
              <span className="font-bold font-mono text-[#C58D2F] text-sm block mt-0.5">
                {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ৳
              </span>
            </div>
            <div className="flex justify-end items-center gap-2">
              <Tag
                color={
                  isCompleted ? 'purple' : isPending ? 'blue' : isInProgress ? 'green' : 'orange'
                }
                className="font-bold text-xs py-1 px-3 rounded-full border-none shadow-sm m-0">
                {currentStatus}
              </Tag>
              <Tag color="orange" className="font-bold text-sm py-1 px-3 rounded-full border-none shadow-sm m-0">
                Production #{productionData?.id || 'New'}
              </Tag>
            </div>
          </div>
        </div>

        {/* Editable Step 1 Raw Materials Section in Collapse */}
        <RawMaterialsSection
          rawMaterials={rawMaterials}
          setRawMaterials={setRawMaterials}
          grandTotal={grandTotal}
          handleInputFocus={handleInputFocus}
          hideEditButton={!isProcessing}
          productId={Number(currentProductId)}
          inventoryId={Number(productInventoryItem?.id)}
        />

        {/* Packing Materials Section */}
        <PackingMaterialsSection
          packingMaterials={packingMaterials}
          setPackingMaterials={setPackingMaterials}
          packingMaterialOptions={packingMaterialOptions}
          totalPackingQty={totalPackingQty}
          totalPackingTk={totalPackingTk}
          productQuantity={productQuantity}
          disabled={!isProcessing}
        />
        {/* Production Expenses Section */}
        <ProductionExpensesSection
          productionExpenses={productionExpenses}
          setProductionExpenses={setProductionExpenses}
          expenseOptions={expenseOptions}
          totalExpenseQty={totalExpenseQty}
          totalExpenseTk={totalExpenseTk}
          disabled={!isProcessing}
        />



        {/* Save Materials & Expenses Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl shadow-xs mt-4">
          <span className="text-xs text-slate-500 font-medium">Save intermediate raw material recipe and packaging/expense allocations.</span>
          <Button
            type="primary"
            onClick={handleSaveMaterialsAndExpenses}
            loading={isSavingIntermediate}
            disabled={!isProcessing}
            size="large"
            className="px-8 rounded-lg bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white font-semibold text-xs h-10 shadow-[0_3px_12px_rgba(197,141,47,0.3)] hover:shadow-[0_4px_16px_rgba(197,141,47,0.45)] transition-all disabled:opacity-50"
          >
            {!isProcessing ? 'Saved (In Progress)' : isSavingIntermediate ? 'Saving...' : 'Save & Proceed'}
          </Button>
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
          disabled={!isInProgress}
          disabledText={
            isProcessing
              ? 'Disabled (Save Materials & Expenses first)'
              : isPending || isCompleted
                ? 'Saved'
                : 'Disabled'
          }
        />

        {/* Save Finalization / Complete Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl shadow-xs mt-4">
          <span className="text-xs text-slate-500 font-medium">Save finished goods yield quantity and calculate final cost per unit.</span>
          <Button
            type="primary"
            onClick={handleSubmitFinishedGoods}
            loading={isSubmitting}
            disabled={!isInProgress}
            size="large"
            icon={<CheckCircleOutlined />}
            className="px-8 rounded-lg bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white font-semibold text-xs h-10 shadow-[0_3px_12px_rgba(197,141,47,0.3)] hover:shadow-[0_4px_16px_rgba(197,141,47,0.45)] transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isPending || isCompleted ? 'Saved (Finished Goods)' : 'Save Finished Goods'}
          </Button>
        </div>
      </Form>

      {/* Combined Products Section */}
      <CombinedProductsSection
        combinedProducts={combinedProducts}
        setCombinedProducts={setCombinedProducts}
        productsData={productsData}
        productQuantity={productQuantity}
        oldProductQty={oldProductQty}
        onStockChange={setOldProductQty}
        disabled={!isPending}
        selectedProduct={selectedProduct}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200/80 rounded-xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] mt-5">
        <span className="text-xs text-slate-500 font-medium">Finalize batch and complete production voucher.</span>
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!isPending}
          size="large"
          icon={<CheckCircleOutlined />}
          className="px-10 rounded-lg bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white font-bold text-xs h-11 shadow-[0_4px_14px_rgba(197,141,47,0.35)] hover:shadow-[0_6px_20px_rgba(197,141,47,0.5)] transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : isCompleted ? 'Completed' : 'Complete & Save'}
        </Button>
      </div>
    </div>
  );
};

export default ProductionStep2Page;
