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
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import type { RawMaterialItem, PackingMaterialItem, ProductionExpenseItem } from './ProductionCreationForm';
import CombinedProductsSection, { CombinedProductItem } from './production step2/CombinedProductsSection';
import FinalizationSummary from './production step2/FinalizationSummary';
import ProductionExpensesSection from './production step2/ProductionExpensesSection';
import PackingMaterialsSection from './production step2/PackingMaterialsSection';
import RawMaterialsSection from './production step2/RawMaterialsSection';

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

  // Extract selected product from API inventory
  const productInventoryItem = useMemo(() => {
    const inventoryList = productionResponse?.data?.inventory || [];
    return inventoryList.find((item: any) => Boolean(item.product?.id || item.productId)) || null;
  }, [productionResponse]);

  const selectedProduct = productInventoryItem?.product;
  const currentProductId = selectedProduct?.id || productInventoryItem?.productId;

  // Sync API response to local state and Redux
  useEffect(() => {
    if (productionResponse?.data) {
      setProductionData(productionResponse.data);

      const inventoryList = productionResponse.data.inventory || [];
      const productItem = inventoryList.find((item: any) => Boolean(item.product?.id || item.productId));
      const productId = productItem?.product?.id || productItem?.productId;

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
  const productName =
    selectedProduct?.name ||
    (currentProductId ? productsData?.data?.find((prod: any) => prod.id === Number(currentProductId))?.name : null) ||
    'Product';
  // Recipe query
  const { data: ingredientsData } = useGetProductionIngredientsQuery(
    currentProductId ? { productId: currentProductId } : undefined,
    { skip: !currentProductId }
  );
  console.log(ingredientsData?.data, "ingredientsData")

  const [createProduction] = useCreateProductionMutation();
  // Populate form and lists when production data arrives
  useEffect(() => {
    if (!productionData && !productionState.productinfo?.productId) return;
    const sourceData = productionData ? 'api' : 'redux';
    const initialProductQty = productInventoryItem?.quantityAdd ?? productInventoryItem?.quantity ?? undefined;
    form.setFieldsValue({
      productId: Number(currentProductId) || undefined,
      batchNo: productionData?.batchNo || '',
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
    const existingPackingInventories =
      (currentProd?.pminventories && currentProd.pminventories.length > 0)
        ? currentProd.pminventories
        : (currentProd?.pmInventories && currentProd.pmInventories.length > 0)
          ? currentProd.pmInventories
          : (currentProd?.packingMaterials && currentProd.packingMaterials.length > 0)
            ? currentProd.packingMaterials
            : [];

    if (existingPackingInventories.length > 0) {
      const parsedPacking: PackingMaterialItem[] = existingPackingInventories.map(
        (packingItem: any, index: number) => {
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
          const total = Number(
            packingItem.amount ??
            packingItem.debitAmount ??
            packingItem.creditAmount ??
            (quantity > 0 && unitPrice > 0 ? quantity * unitPrice : 0)
          );
          const perUnitQty = packingItem.perUnitQty != null ? roundToThree(packingItem.perUnitQty) : null;
          const perUnitCost = packingItem.perUnitCost != null ? roundToThree(packingItem.perUnitCost) : null;

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
            total: Number(total.toFixed(2)),
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
        const finishedProductQty = Number(initialProductQty) || 0;
        const initialPacking: PackingMaterialItem[] = recipePackingMaterials.map(
          (recipeItem: any, index: number) => {
            const packingMaterialId = recipeItem.packingMaterialId ?? recipeItem.packingMaterial?.id ?? recipeItem.id;
            const matchingPacking = allPackingList.find((p: any) => Number(p.id) === Number(packingMaterialId));
            const name = recipeItem.packingMaterial?.name ?? matchingPacking?.name ?? recipeItem.name ?? '';
            const unit = recipeItem.packingMaterial?.unit?.name ?? matchingPacking?.unit?.name ?? recipeItem.unit?.name ?? 'Pcs';
            const unitId = recipeItem.packingMaterial?.unitId ?? matchingPacking?.unitId ?? recipeItem.unit?.id ?? null;
            const unitPrice = recipeItem.packingMaterial?.unitPrice ?? recipeItem.unitPrice ?? recipeItem.rate ?? matchingPacking?.unitPrice ?? matchingPacking?.rate ?? 0;
            const perUnitQty = recipeItem.ingredienteQty ?? recipeItem.quantity ?? recipeItem.perUnitQty ?? null;
            const totalQty =
              perUnitQty != null && finishedProductQty > 0
                ? Number((perUnitQty * finishedProductQty).toFixed(2))
                : (recipeItem.Qty ?? recipeItem.quantity ?? null);
            const total = totalQty != null ? Number((totalQty * unitPrice).toFixed(2)) : 0;
            const calculatedPerUnitQty =
              finishedProductQty > 0 && totalQty != null
                ? roundToThree(totalQty / finishedProductQty)
                : perUnitQty != null
                  ? roundToThree(perUnitQty)
                  : null;
            const calculatedCost =
              finishedProductQty > 0 && total > 0
                ? roundToThree(total / finishedProductQty)
                : calculatedPerUnitQty != null
                  ? roundToThree(calculatedPerUnitQty * unitPrice)
                  : null;

            return {
              si: index + 1,
              packingMaterialId,
              name,
              unit,
              unitId,
              qty: totalQty,
              unitPrice,
              perUnitQty: calculatedPerUnitQty,
              perUnitCost: calculatedCost,
              total,
            };
          }
        );
        setPackingMaterials(initialPacking);
      } else {
        setPackingMaterials([]);
      }
    }

    // 3. Production Expenses
    const existingExpenseInventories =
      (currentProd?.productionExpensesInventory && currentProd.productionExpensesInventory.length > 0)
        ? currentProd.productionExpensesInventory
        : (currentProd?.productionExpenses && currentProd.productionExpenses.length > 0)
          ? currentProd.productionExpenses
          : [];

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
          const total = Number(expenseItem.amount ?? (duration * rate));

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
      const recipeExpenses = matchedRecipe?.ingredientExpneseItems || matchedRecipe?.expenseItems || [];

      if (recipeExpenses.length > 0) {
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
            Qty: Number(item.qty) || 0,
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
    return Number(packingMaterials.reduce((sum, item) => sum + (Number(item.total) || 0), 0).toFixed(2));
  }, [packingMaterials]);

  const totalExpenseQty = useMemo(() => {
    return Number(productionExpenses.reduce((sum, item) => sum + (Number(item.qty) || 0), 0).toFixed(2));
  }, [productionExpenses]);

  const totalExpenseTk = useMemo(() => {
    return Number(productionExpenses.reduce((sum, item) => sum + (Number(item.total) || 0), 0).toFixed(2));
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
          const qty = item.qty != null ? Number(item.qty) : null;
          const price = item.unitPrice != null ? Number(item.unitPrice) : 0;
          const total = qty != null ? Number((qty * price).toFixed(2)) : 0;
          const perUnitQty =
            qty != null ? roundToThree(qty / prodQty) : item.perUnitQty != null ? roundToThree(item.perUnitQty) : null;
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

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  // Save Raw Materials, Expenses & Packing Materials before Finalization
  const handleSaveMaterialsAndExpenses = async () => {
    if (!productionData?.id && !productionState.productinfo?.productId) {
      message.error('No production record found to update or save');
      return;
    }

    // Check Production Expenses
    if (productionExpenses.length > 0) {
      const hasUnselectedExpense = productionExpenses.some(item => !item.expenseItemId);
      if (hasUnselectedExpense) {
        message.error('Please select an Expense Item for all expense rows or remove unused rows');
        return;
      }

      const hasInvalidExpenseQty = productionExpenses.some(
        item => item.qty === null || item.qty === undefined || Number(item.qty) <= 0
      );
      if (hasInvalidExpenseQty) {
        message.error('Please enter a valid Qty/Duration (greater than 0) for all expense items');
        return;
      }

      const hasInvalidExpenseRate = productionExpenses.some(
        item => item.rate === null || item.rate === undefined || Number(item.rate) < 0
      );
      if (hasInvalidExpenseRate) {
        message.error('Please enter a valid Rate for all expense items');
        return;
      }
    }

    // Check Packing Materials
    if (packingMaterials.length > 0) {
      const hasUnselectedPacking = packingMaterials.some(item => !item.packingMaterialId);
      if (hasUnselectedPacking) {
        message.error('Please select a Packing Material for all packing rows or remove unused rows');
        return;
      }

      const hasInvalidPackingQty = packingMaterials.some(
        item => item.qty === null || item.qty === undefined || Number(item.qty) <= 0
      );
      if (hasInvalidPackingQty) {
        message.error('Please enter a valid Total Qty (greater than 0) for all packing materials');
        return;
      }

      const hasInvalidPackingPrice = packingMaterials.some(
        item => item.unitPrice === null || item.unitPrice === undefined || Number(item.unitPrice) < 0
      );
      if (hasInvalidPackingPrice) {
        message.error('Please enter a valid Unit Price for all packing materials');
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
      message.error('An error occurred while saving materials and expenses');
    } finally {
      setIsSavingIntermediate(false);
    }
  };

  // Submit Step 2 (Final Save)
  const handleSubmit = async () => {
    console.log(productionState, "handleSubmit")
    if (!productionData?.id && !productionState.productinfo?.productId) {
      message.error('No production record found to update or save');
      return;
    }

    try {
      const values = await form.validateFields();

      const finishedQty = Number(values.productQuantity);
      if (!finishedQty || finishedQty <= 0) {
        message.error('Please enter a valid Finished Product Quantity (greater than 0)');
        return;
      }


      // Check Production Expenses
      if (productionExpenses.length > 0) {
        const hasUnselectedExpense = productionExpenses.some(item => !item.expenseItemId);
        if (hasUnselectedExpense) {
          message.error('Please select an Expense Item for all expense rows or remove unused rows');
          return;
        }

        const hasInvalidExpenseQty = productionExpenses.some(
          item => item.qty === null || item.qty === undefined || Number(item.qty) <= 0
        );
        if (hasInvalidExpenseQty) {
          message.error('Please enter a valid Qty/Duration (greater than 0) for all expense items');
          return;
        }

        const hasInvalidExpenseRate = productionExpenses.some(
          item => item.rate === null || item.rate === undefined || Number(item.rate) < 0
        );
        if (hasInvalidExpenseRate) {
          message.error('Please enter a valid Rate for all expense items');
          return;
        }
      }

      // Check Packing Materials
      if (packingMaterials.length > 0) {
        const hasUnselectedPacking = packingMaterials.some(item => !item.packingMaterialId);
        if (hasUnselectedPacking) {
          message.error('Please select a Packing Material for all packing rows or remove unused rows');
          return;
        }

        const hasInvalidPackingQty = packingMaterials.some(
          item => item.qty === null || item.qty === undefined || Number(item.qty) <= 0
        );
        if (hasInvalidPackingQty) {
          message.error('Please enter a valid Total Qty (greater than 0) for all packing materials');
          return;
        }

        const hasInvalidPackingPrice = packingMaterials.some(
          item => item.unitPrice === null || item.unitPrice === undefined || Number(item.unitPrice) < 0
        );
        if (hasInvalidPackingPrice) {
          message.error('Please enter a valid Unit Price for all packing materials');
          return;
        }
      }

      // Check Combined Products
      if (combinedProducts.length > 0) {
        const hasUnselectedCombined = combinedProducts.some(item => !item.productId);
        if (hasUnselectedCombined) {
          message.error('Please select a Product for all combined product rows or remove unused rows');
          return;
        }

        const hasInvalidCombinedQty = combinedProducts.some(
          item => !item.totalQty || Number(item.totalQty) <= 0
        );
        if (hasInvalidCombinedQty) {
          message.error('Please enter valid Qty per Pack and No. of Cartons for all combined products');
          return;
        }

        const totalCombined = combinedProducts.reduce((sum, item) => sum + (Number(item.totalQty) || 0), 0);
        const prodQty = Number(values.productQuantity) || 0;
        if (prodQty > 0 && totalCombined > prodQty) {
          message.error(`Total combined quantity (${totalCombined}) cannot exceed Finished Product Quantity (${prodQty})`);
          return;
        }
      }

      const selectedDate = values.date || form.getFieldValue('date');
      const payload: any = {
        date: selectedDate ? dayjs(selectedDate).toISOString() : dayjs().toISOString(),
        productinfo: {
          productId: Number(currentProductId || form.getFieldValue('productId')),
          quantityAdd: Number(values.productQuantity) || 0,
          unitPrice: unitCost || 0,
        },
        rawMaterials: [],
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
        products: combinedProducts
          .filter(cp => cp.productId)
          .map(cp => ({
            productId: Number(cp.productId),
            quantityAdd: Number(cp.totalQty) || 0,
            unitPrice: unitCost || 0,
          })),
      };

      const res = await createProduction({ ...payload, status: "COMPLETE" });
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

  const currentStatus = productionData?.status || productionResponse?.data?.status || 'PENDDING';
  const isPending = currentStatus === 'PENDDING' || currentStatus === 'PENDING';
  const isInProgress = currentStatus === 'IN_PROGRESS';

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800 m-0">Production Step 2 (Packaging & Expenses)</h2>
          <span className="text-xs text-gray-500">
            Configure finished quantity, packing materials, and expenses for batch {productionData?.batchNo || '-'}
          </span>
        </div>

        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard/production-voucher')}>
          Back to Production Voucher
        </Button>
      </div>

      <Form form={form} layout="vertical" initialValues={{ date: dayjs() }} className="space-y-4">
        {/* Step 1 Summary Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-2 py-1 rounded border border-amber-200/50 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full items-center">
            <div>
              <span className="text-xs text-amber-600/80 block uppercase font-bold tracking-wider mb-1">Product</span>
              <span className="font-bold text-gray-800 text-base">{productName}</span>
            </div>
            <div>
              <span className="text-xs text-amber-600/80 block uppercase font-bold tracking-wider mb-1">Batch No</span>
              <span className="font-semibold text-gray-800">{productionData?.batchNo || '-'}</span>
            </div>
            <div>
              <span className="text-xs text-amber-600/80 block uppercase font-bold tracking-wider mb-1">Date</span>
              <Form.Item
                name="date"
                rules={[{ required: true, message: 'Please select date' }]}
                className="mb-0"
              >
                <DatePicker
                  format="DD-MMM-YYYY"
                  style={{ width: '100%' }}
                  className="rounded-lg shadow-2xs font-semibold text-gray-800 bg-white"
                />
              </Form.Item>
            </div>
            <div>
              <span className="text-xs text-amber-600/80 block uppercase font-bold tracking-wider mb-1">
                Raw Material Cost
              </span>
              <span className="font-bold text-amber-700 text-base">
                {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ৳
              </span>
            </div>
            <div className="flex justify-end items-center gap-2">
              <Tag
                color={isInProgress ? 'success' : isPending ? 'blue' : 'purple'}
                className="font-bold text-xs py-1 px-3 rounded-full border-none shadow-sm m-0"
              >
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
          hideEditButton={isInProgress}
        />

        {/* Production Expenses Section */}
        <ProductionExpensesSection
          productionExpenses={productionExpenses}
          setProductionExpenses={setProductionExpenses}
          expenseOptions={expenseOptions}
          totalExpenseQty={totalExpenseQty}
          totalExpenseTk={totalExpenseTk}
          disabled={isInProgress}
        />

        {/* Packing Materials Section */}
        <PackingMaterialsSection
          packingMaterials={packingMaterials}
          setPackingMaterials={setPackingMaterials}
          packingMaterialOptions={packingMaterialOptions}
          totalPackingQty={totalPackingQty}
          totalPackingTk={totalPackingTk}
          productQuantity={productQuantity}
          disabled={isInProgress}
        />

        {/* Save Materials & Expenses Button */}
        <div className="flex justify-end mt-4 mb-6 border-b border-gray-100 pb-6">
          <Button
            type="primary"
            onClick={handleSaveMaterialsAndExpenses}
            loading={isSavingIntermediate}
            disabled={isInProgress}
            size="large"
            className="px-8 rounded-lg bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white font-bold shadow-sm disabled:opacity-50"
          >
            {isInProgress ? 'Saved (In Progress)' : isSavingIntermediate ? 'Saving...' : 'Save & Proceed'}
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
          disabled={isPending}
        />
      </Form>

      {/* Combined Products Section */}
      <CombinedProductsSection
        combinedProducts={combinedProducts}
        setCombinedProducts={setCombinedProducts}
        productsData={productsData}
        productQuantity={productQuantity}
        disabled={isPending}
      />

      <div className="mt-6 flex flex-wrap items-center justify-end gap-4 pt-4 border-t border-gray-100">
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={isPending}
          size="large"
          icon={<CheckCircleOutlined />}
          className="px-10 rounded-lg bg-gradient-to-r from-[#C58D2F] to-[#b07d28] hover:from-[#b07d28] hover:to-[#96691e] border-none text-white shadow-md font-bold text-base disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Complete & Save'}
        </Button>
      </div>
    </div>
  );
};

export default ProductionStep2Page;
