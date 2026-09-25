/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import { Form, InputNumber, Input, Button, Table, Select, DatePicker, message, Spin, Alert } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGetRowMaterialsQuery } from '../../../redux/features/rowMaterials/rowMaterials.api';
import { useGetProductsQuery } from '../../../redux/features/product/product.api';
import { useGetPackingMaterialsQuery } from '../../../redux/features/packingMaterials/packingMaterials.api';
import { useGetProductionIngredientsQuery } from '../../../redux/features/productionIngredient/productionIngredient.api';
import { useCreateProductionMutation } from '../../../redux/features/production/production.api';
import { getResponse } from '../../../utils/getResponse';
import { generateInvoiceNumber } from '../../../utils/generateRandomNumber';

interface RawMaterialFromAPI {
  id: number;
  name: string;
  unit?: { id: number; name: string };
  unitId?: number;
  rate?: number;
  unitPrice?: number;
  ingredienteRate?: number;
  ingredienteQty?: number;
}

interface RawMaterialItem {
  si: number;
  rawMaterialId: number | null;
  name: string;
  qty: number | null;
  unit: string;
  unitId: number | null;
  rate: number | null;
  total: number;
}

interface PackingMaterialItem {
  si: number;
  packingMaterialId: number | null;
  name: string;
  qty: number | null;
  unit: string;
  unitId: number | null;
  unitPrice: number | null;
  perUnitQty: number | null;
  perUnitCost: number | null;
  total: number;
}

const ProductionCreationForm: React.FC<{ formTitle?: string }> = ({ formTitle = "Production Creation Form" }) => {
  const [form] = Form.useForm();
  const [rawMaterials, setRawMaterials] = useState<RawMaterialItem[]>([]);
  const [packingMaterials, setPackingMaterials] = useState<PackingMaterialItem[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalQty = useMemo(() => {
    return Number(rawMaterials.reduce((sum, item) => sum + (Number(item.qty) || 0), 0).toFixed(2));
  }, [rawMaterials]);

  const totalPackingQty = useMemo(() => {
    return Number(packingMaterials.reduce((sum, item) => sum + (Number(item.qty) || 0), 0).toFixed(2));
  }, [packingMaterials]);

  const totalPackingTk = useMemo(() => {
    return Number(packingMaterials.reduce((sum, item) => sum + (Number(item.total) || 0), 0).toFixed(2));
  }, [packingMaterials]);

  // Track already selected material IDs to prevent duplicate selection
  const selectedRawMaterialIds = useMemo(() => {
    return new Set(rawMaterials.map(item => item.rawMaterialId).filter(Boolean));
  }, [rawMaterials]);

  const selectedPackingMaterialIds = useMemo(() => {
    return new Set(packingMaterials.map(item => item.packingMaterialId).filter(Boolean));
  }, [packingMaterials]);

  // Watch selected product
  const selectedProductId = Form.useWatch('productId', form);

  // Queries
  const { data: productsData, isLoading: isProductsLoading } = useGetProductsQuery({});
  const { data: allRawMaterialsData } = useGetRowMaterialsQuery({});
  const { data: allPackingMaterialsData, isLoading: isPackingMaterialsLoading } = useGetPackingMaterialsQuery({});
  const { data: ingredientsData, isLoading: isIngredientsLoading, isFetching: isIngredientsFetching } =
    useGetProductionIngredientsQuery(
      selectedProductId ? { productId: selectedProductId } : undefined,
      { skip: !selectedProductId }
    );

  const [createProduction] = useCreateProductionMutation();

  // Options for products
  const productOptions = useMemo(() => {
    return productsData?.data?.map((item: { id: number; name: string }) => ({
      value: item.id,
      label: item.name,
    })) || [];
  }, [productsData]);

  // Options for all raw materials dropdown
  const materialOptions = useMemo(() => {
    return allRawMaterialsData?.data?.map((item: RawMaterialFromAPI) => ({
      value: item.id,
      label: item.name,
      unit: item.unit?.name || 'Kg',
      unitId: item.unitId,
      rate: item.ingredienteRate || item.unitPrice || item.rate || 0,
    })) || [];
  }, [allRawMaterialsData]);

  // Options for all packing materials dropdown
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

  // When selected product changes or ingredientsData loads, populate default raw materials & packing materials
  useEffect(() => {
    if (!selectedProductId) {
      setRawMaterials([]);
      setPackingMaterials([]);
      return;
    }

    if (!ingredientsData) return;

    // Helper to safely extract list of recipe records
    const rawList: any[] = Array.isArray(ingredientsData?.data)
      ? ingredientsData.data
      : Array.isArray((ingredientsData as any)?.data?.data)
        ? (ingredientsData as any).data.data
        : Array.isArray(ingredientsData)
          ? (ingredientsData as any)
          : ingredientsData?.data && typeof ingredientsData.data === 'object' && ingredientsData.data.rawMaterials
            ? [ingredientsData.data]
            : ingredientsData?.rawMaterials
              ? [ingredientsData]
              : [];

    const matchedRecipe =
      rawList.find((r: any) => Number(r.productId) === Number(selectedProductId)) ||
      rawList[0];

    const materials: any[] = matchedRecipe?.rawMaterials || [];
    const packing: any[] = matchedRecipe?.packingMaterials || [];

    if (materials.length > 0) {
      const initialItems: RawMaterialItem[] = materials.map((m: any, index: number) => {
        const rawId = m.id ?? m.rawMaterialId;
        const name = m.name;
        const unit = m.unit?.name || 'Kg';
        const unitId = m.unitId ?? null;
        // User requested: "ekhane qty = ingredienteQty, rate"
        const qty = m.ingredienteQty !== undefined && m.ingredienteQty !== null ? Number(m.ingredienteQty) : null;
        const rate =
          m.ingredienteRate !== undefined && m.ingredienteRate !== null
            ? Number(m.ingredienteRate)
            : m.unitPrice !== undefined && m.unitPrice !== null
              ? Number(m.unitPrice)
              : null;
        const total = qty != null && rate != null ? Number((qty * rate).toFixed(2)) : 0;

        return {
          si: index + 1,
          rawMaterialId: rawId,
          name,
          qty,
          unit,
          unitId,
          rate,
          total,
        };
      });

      setRawMaterials(initialItems);
    } else {
      // If product has no defined ingredient list, start with one empty row
      setRawMaterials([
        {
          si: 1,
          rawMaterialId: null,
          name: '',
          qty: null,
          unit: 'Kg',
          unitId: null,
          rate: null,
          total: 0,
        },
      ]);
    }

    // Auto-populate packing materials from recipe if available
    if (packing.length > 0) {
      const currentProdQty = Number(form.getFieldValue('productQuantity')) || 0;
      const initialPacking: PackingMaterialItem[] = packing.map((pm: any, index: number) => {
        const pmId = pm.id ?? pm.packingMaterialId;
        const pmPrice = pm.unitPrice ?? pm.rate ?? 0;
        const pmPerUnitQty = pm.ingredienteQty !== undefined && pm.ingredienteQty !== null
          ? Number(pm.ingredienteQty)
          : pm.quantity !== undefined && pm.quantity !== null
            ? Number(pm.quantity)
            : null;
        const calculatedQty = pmPerUnitQty != null && currentProdQty > 0
          ? Number((pmPerUnitQty * currentProdQty).toFixed(2))
          : null;
        const calculatedCost = pmPerUnitQty != null ? Number((pmPerUnitQty * pmPrice).toFixed(2)) : 0;
        const total = calculatedQty != null ? Number((calculatedQty * pmPrice).toFixed(2)) : 0;

        return {
          si: index + 1,
          packingMaterialId: pmId,
          name: pm.name || '',
          unit: pm.unit?.name || 'Pcs',
          unitId: pm.unitId ?? pm.unit?.id ?? null,
          qty: calculatedQty,
          unitPrice: pmPrice,
          perUnitQty: pmPerUnitQty,
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
  }, [selectedProductId, ingredientsData, form]);

  // Recalculate grand total
  useEffect(() => {
    const total = rawMaterials.reduce((sum, item) => sum + (item.total || 0), 0);
    setGrandTotal(Number(total.toFixed(2)));
  }, [rawMaterials]);

  // Handle Material Select change in a row
  const handleMaterialChange = (si: number, value: number | null) => {
    if (!value) {
      setRawMaterials(prev =>
        prev.map(item =>
          item.si === si
            ? { ...item, rawMaterialId: null, name: '', unit: 'Kg', unitId: null, qty: null, rate: null, total: 0 }
            : item
        )
      );
      return;
    }

    const selectedMaterial = allRawMaterialsData?.data?.find((m: RawMaterialFromAPI) => m.id === value);
    if (selectedMaterial) {
      setRawMaterials(prev =>
        prev.map(item => {
          if (item.si === si) {
            const newRate =
              selectedMaterial.ingredienteRate ??
              selectedMaterial.unitPrice ??
              selectedMaterial.rate ??
              null;
            const newQty = item.qty ?? 0;
            const newTotal = newRate != null ? Number((newQty * newRate).toFixed(2)) : 0;
            return {
              ...item,
              rawMaterialId: selectedMaterial.id,
              name: selectedMaterial.name,
              unit: selectedMaterial.unit?.name || 'Kg',
              unitId: selectedMaterial.unitId ?? null,
              rate: newRate,
              total: newTotal,
            };
          }
          return item;
        })
      );
    }
  };

  const handleQtyChange = (si: number, value: number | null) => {
    setRawMaterials(prev =>
      prev.map(item => {
        if (item.si === si) {
          const newQty = value;
          const rate = item.rate || 0;
          const newTotal = newQty != null ? Number((newQty * rate).toFixed(2)) : 0;
          return { ...item, qty: newQty, total: newTotal };
        }
        return item;
      })
    );
  };

  const handleRateChange = (si: number, value: number | null) => {
    setRawMaterials(prev =>
      prev.map(item => {
        if (item.si === si) {
          const newRate = value;
          const qty = item.qty || 0;
          const newTotal = newRate != null ? Number((qty * newRate).toFixed(2)) : 0;
          return { ...item, rate: newRate, total: newTotal };
        }
        return item;
      })
    );
  };

  const handleAddRow = () => {
    setRawMaterials(prev => [
      ...prev,
      {
        si: prev.length + 1,
        rawMaterialId: null,
        name: '',
        qty: null,
        unit: 'Kg',
        unitId: null,
        rate: null,
        total: 0,
      },
    ]);
  };

  const handleRemoveRow = (si: number) => {
    setRawMaterials(prev => {
      if (prev.length <= 1) {
        message.warning('At least one raw material row is required');
        return prev;
      }
      const filtered = prev.filter(item => item.si !== si);
      return filtered.map((item, index) => ({ ...item, si: index + 1 }));
    });
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      e.currentTarget.select();
    }, 0);
  };

  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[\d.]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const productQuantity = Form.useWatch('productQuantity', form);
  const unitCost =
    (Number(productQuantity) || 0) > 0 ? Number((grandTotal / Number(productQuantity)).toFixed(2)) : 0;

  // Sync packing materials whenever finished product quantity changes
  useEffect(() => {
    const prodQty = Number(productQuantity) || 0;
    if (prodQty > 0) {
      setPackingMaterials(prev =>
        prev.map(item => {
          if (item.perUnitQty != null) {
            const newQty = Number((item.perUnitQty * prodQty).toFixed(2));
            const price = item.unitPrice || 0;
            const newTotal = Number((newQty * price).toFixed(2));
            return { ...item, qty: newQty, total: newTotal };
          }
          return item;
        })
      );
    }
  }, [productQuantity]);

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
      const filtered = prev.filter(item => item.si !== si);
      return filtered.map((item, index) => ({ ...item, si: index + 1 }));
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
    const price = chosen?.unitPrice ?? 0;
    const unit = chosen?.unit || 'Pcs';
    const unitId = chosen?.item?.unitId ?? chosen?.item?.unit?.id ?? null;
    const prodQty = Number(productQuantity) || 0;

    setPackingMaterials(prev =>
      prev.map(item => {
        if (item.si === si) {
          const perUnitQty = item.perUnitQty;
          let qty = item.qty;
          let perUnitCost = item.perUnitCost;

          if (perUnitQty != null) {
            perUnitCost = Number((perUnitQty * price).toFixed(2));
            if (prodQty > 0) {
              qty = Number((perUnitQty * prodQty).toFixed(2));
            }
          } else if (qty != null && prodQty > 0) {
            const calculatedPerUnitQty = Number((qty / prodQty).toFixed(4));
            perUnitCost = Number((calculatedPerUnitQty * price).toFixed(2));
          }

          const total = qty != null ? Number((qty * price).toFixed(2)) : 0;

          return {
            ...item,
            packingMaterialId: materialId,
            name: chosen?.label || '',
            unit,
            unitId,
            unitPrice: price,
            qty,
            perUnitCost,
            total,
          };
        }
        return item;
      })
    );
  };

  const handlePackingQtyChange = (si: number, value: number | null) => {
    const prodQty = Number(productQuantity) || 0;
    setPackingMaterials(prev =>
      prev.map(item => {
        if (item.si === si) {
          const newQty = value;
          const price = item.unitPrice || 0;
          const newTotal = newQty != null ? Number((newQty * price).toFixed(2)) : 0;
          let perUnitQty = item.perUnitQty;
          let perUnitCost = item.perUnitCost;

          if (newQty != null && prodQty > 0) {
            perUnitQty = Number((newQty / prodQty).toFixed(4));
            perUnitCost = Number((perUnitQty * price).toFixed(2));
          }

          return {
            ...item,
            qty: newQty,
            perUnitQty,
            perUnitCost,
            total: newTotal,
          };
        }
        return item;
      })
    );
  };

  const handlePackingUnitPriceChange = (si: number, value: number | null) => {
    setPackingMaterials(prev =>
      prev.map(item => {
        if (item.si === si) {
          const newPrice = value;
          const qty = item.qty || 0;
          const perUnitQty = item.perUnitQty || 0;
          const newTotal = newPrice != null ? Number((qty * newPrice).toFixed(2)) : 0;
          const newCost = newPrice != null ? Number((perUnitQty * newPrice).toFixed(2)) : 0;

          return {
            ...item,
            unitPrice: newPrice,
            perUnitCost: newCost,
            total: newTotal,
          };
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
          const newPerUnitQty = value;
          const price = item.unitPrice || 0;
          let qty = item.qty;
          if (newPerUnitQty != null && prodQty > 0) {
            qty = Number((newPerUnitQty * prodQty).toFixed(2));
          }
          const perUnitCost = newPerUnitQty != null ? Number((newPerUnitQty * price).toFixed(2)) : 0;
          const total = qty != null ? Number((qty * price).toFixed(2)) : 0;

          return {
            ...item,
            perUnitQty: newPerUnitQty,
            qty,
            perUnitCost,
            total,
          };
        }
        return item;
      })
    );
  };

  const handlePackingPerUnitCostChange = (si: number, value: number | null) => {
    setPackingMaterials(prev =>
      prev.map(item => {
        if (item.si === si) {
          return {
            ...item,
            perUnitCost: value,
          };
        }
        return item;
      })
    );
  };

  const handleSubmit = async (values: any) => {
    const validMaterials = rawMaterials.filter(item => item.rawMaterialId);
    if (validMaterials.length === 0) {
      message.error('Please select at least one valid raw material');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        voucherNo: values.voucherNo || generateInvoiceNumber('PRD'),
        batchNo: values.batchNo,
        date: values.date ? values.date.toISOString() : dayjs().toISOString(),
        productId: Number(values.productId),
        productQuantity: Number(values.productQuantity),
        unitCost,
        amount: grandTotal,
        rawMaterials: validMaterials.map(item => ({
          rawId: item.rawMaterialId,
          quantity: item.qty || 0,
          unitPrice: item.rate || 0,
          amount: item.total || 0,
        })),
        packingMaterials: packingMaterials
          .filter(item => item.packingMaterialId)
          .map(item => ({
            packingId: item.packingMaterialId,
            quantity: item.qty || 0,
            unitPrice: item.unitPrice || 0,
            amount: item.total || 0,
            perUnitQty: item.perUnitQty || 0,
            perUnitCost: item.perUnitCost || 0,
          })),
      };

      const res = await createProduction(payload);
      const result = getResponse(res);
      if (result?.success) {
        message.success('Production created successfully');
        form.resetFields();
        form.setFieldsValue({ date: dayjs() });
        setRawMaterials([]);
        setPackingMaterials([]);
      }
    } catch (error) {
      message.error('An error occurred while creating production');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { title: 'SI', dataIndex: 'si', key: 'si', width: 60, align: 'center' as const },
    {
      title: 'Material Name',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (_: any, record: RawMaterialItem) => (
        <Select
          placeholder="Select Material"
          value={record.rawMaterialId || undefined}
          style={{ width: '100%' }}
          onChange={v => handleMaterialChange(record.si, v as number | null)}
          options={materialOptions.map((opt: any) => ({
            ...opt,
            disabled: selectedRawMaterialIds.has(opt.value) && opt.value !== record.rawMaterialId,
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
      width: 90,
      align: 'center' as const,
      render: (unit: string) => <span className="text-gray-600 font-medium">{unit || 'Kg'}</span>,
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      key: 'qty',
      width: 130,
      render: (_: any, record: RawMaterialItem) => (
        <InputNumber
          min={0}
          step={0.01}
          value={record.qty}
          onChange={v => handleQtyChange(record.si, v)}
          onFocus={handleInputFocus}
          onKeyDown={handleNumberKeyDown}
          controls={false}
          style={{ width: '100%' }}
          precision={2}
          keyboard={false}
          placeholder="0.00"
        />
      ),
    },
    {
      title: 'Rate (BDT)',
      dataIndex: 'rate',
      key: 'rate',
      width: 130,
      render: (_: any, record: RawMaterialItem) => (
        <InputNumber
          min={0}
          step={0.01}
          value={record.rate}
          onChange={v => handleRateChange(record.si, v)}
          onFocus={handleInputFocus}
          onKeyDown={handleNumberKeyDown}
          controls={false}
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
      render: (_: any, record: RawMaterialItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveRow(record.si)}
          size="small"
        />
      ),
    },
  ];

  const packingColumns = [
    { title: 'SI', dataIndex: 'si', key: 'si', width: 60, align: 'center' as const },
    {
      title: 'Packing Material',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (_: any, record: PackingMaterialItem) => (
        <Select
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
      title: 'Qty',
      dataIndex: 'qty',
      key: 'qty',
      width: 140,
      render: (_: any, record: PackingMaterialItem) => (
        <InputNumber
          min={0}
          step={0.01}
          value={record.qty}
          onChange={v => handlePackingQtyChange(record.si, v)}
          onFocus={handleInputFocus}
          onKeyDown={handleNumberKeyDown}
          controls={false}
          addonAfter={record.unit || 'Unit'}
          style={{ width: '100%' }}
          precision={2}
          placeholder="0.00"
        />
      ),
    },
    {
      title: 'Unit Price (BDT)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 130,
      render: (_: any, record: PackingMaterialItem) => (
        <InputNumber
          min={0}
          step={0.01}
          value={record.unitPrice}
          onChange={v => handlePackingUnitPriceChange(record.si, v)}
          onFocus={handleInputFocus}
          onKeyDown={handleNumberKeyDown}
          controls={false}
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
      width: 130,
      render: (_: any, record: PackingMaterialItem) => (
        <InputNumber
          min={0}
          step={0.0001}
          value={record.perUnitQty}
          onChange={v => handlePackingPerUnitQtyChange(record.si, v)}
          onFocus={handleInputFocus}
          onKeyDown={handleNumberKeyDown}
          controls={false}
          style={{ width: '100%' }}
          precision={4}
          placeholder="0.0000"
        />
      ),
    },
    {
      title: 'Per Unit Cost (BDT)',
      dataIndex: 'perUnitCost',
      key: 'perUnitCost',
      width: 140,
      render: (_: any, record: PackingMaterialItem) => (
        <InputNumber
          min={0}
          step={0.01}
          value={record.perUnitCost}
          onChange={v => handlePackingPerUnitCostChange(record.si, v)}
          onFocus={handleInputFocus}
          onKeyDown={handleNumberKeyDown}
          controls={false}
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

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm space-y-4">
      <div className="border-b pb-3">
        <h2 className="text-xl font-bold text-gray-800 m-0">{formTitle}</h2>
      </div>

      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        initialValues={{ date: dayjs() }}
      >
        {/* Top 3 required fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border">
          <Form.Item
            name="productId"
            label={<span className="font-semibold">Select Product</span>}
            rules={[{ required: true, message: 'Please select product' }]}
          >
            <Select
              placeholder="Choose product..."
              style={{ width: '100%' }}
              options={productOptions}
              loading={isProductsLoading}
              showSearch
              filterOption={(input, option) =>
                !!option?.label?.toString().toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            name="batchNo"
            label={<span className="font-semibold">Batch No</span>}
            rules={[{ required: true, message: 'Please enter batch number' }]}
          >
            <Input placeholder="e.g. BATCH-2026-01" />
          </Form.Item>

          <Form.Item
            name="date"
            label={<span className="font-semibold">Date</span>}
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD-MMM-YYYY" />
          </Form.Item>
        </div>

        {/* Raw Materials Section */}
        <div className="mt-2">
          <h3 className="font-bold text-base mb-2 text-gray-800">Raw Materials</h3>

          {selectedProductId && (isIngredientsLoading || isIngredientsFetching) ? (
            <div className="p-8 text-center bg-gray-50 rounded border">
              <Spin tip="Loading product ingredients recipe..." />
            </div>
          ) : (
            <>
              {selectedProductId && rawMaterials.length === 0 && (
                <Alert
                  type="info"
                  showIcon
                  message="No ingredients configured for this product. You can add raw materials manually below."
                  className="mb-3"
                />
              )}
              <Table
                dataSource={rawMaterials}
                columns={columns}
                rowKey="si"
                pagination={false}
                bordered
                size="small"
                scroll={{ x: 750 }}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row className="bg-amber-50/70 font-bold">
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={handleAddRow}
                          disabled={!selectedProductId}
                        >
                          Add Raw Material
                        </Button>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} colSpan={2} className="text-center font-bold text-slate-800">
                        <span className="text-gray-600 mr-2 font-semibold">Total Qty:</span>
                        <span className="text-sm font-bold text-slate-900">
                          {totalQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} colSpan={2} className="text-right pr-4 font-bold">
                        <span className="text-gray-600 mr-2 font-semibold">Total Tk:</span>
                        <span className="text-base font-extrabold text-amber-700">
                          {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ৳
                        </span>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </>
          )}
          <div className="mt-4 flex justify-end">
            <button type="button" className="bg-blue-500 text-white px-4 py-1 rounded" onClick={() => { console.log('Form Values:', form.getFieldsValue(), { packingMaterials, rawMaterials }); }}>Save form</button>
          </div>
        </div>

        {/* Packing Materials Section */}
        <div className="mt-4">
          <h3 className="font-bold text-base mb-2 text-gray-800">Packing Materials</h3>

          <Table
            dataSource={packingMaterials}
            columns={packingColumns}
            rowKey="si"
            pagination={false}
            bordered
            size="small"
            scroll={{ x: 1050 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-amber-50/70 font-bold">
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddPackingRow}
                      disabled={!selectedProductId}
                    >
                      Add Packing Material
                    </Button>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={3} className="text-center font-bold text-slate-800">
                    <span className="text-gray-600 mr-2 font-semibold">Total Qty:</span>
                    <span className="text-sm font-bold text-slate-900">
                      {totalPackingQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} colSpan={3} className="text-right pr-4 font-bold">
                    <span className="text-gray-600 mr-2 font-semibold">Total Tk:</span>
                    <span className="text-base font-extrabold text-amber-700">
                      {totalPackingTk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ৳
                    </span>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>
        {/* Finished Product Section */}
        <div className="bg-gray-50 p-4 rounded-lg border my-4">
          <h3 className="font-bold text-base mb-3 text-gray-800">Finished Product</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="productQuantity"
              label={<span className="font-semibold">Finished Product Quantity</span>}
              rules={[{ required: true, message: 'Please enter finished quantity' }]}
            >
              <InputNumber
                min={0.01}
                step={1}
                precision={2}
                controls={false}
                placeholder="Enter quantity"
                style={{ width: '100%' }}
                onFocus={handleInputFocus}
                onKeyDown={handleNumberKeyDown}
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold">Calculated Unit Cost (BDT)</span>}
            >
              <InputNumber
                value={unitCost}
                disabled
                precision={2}
                controls={false}
                style={{ width: '100%' }}
                className="bg-gray-100 font-bold text-gray-700"
              />
            </Form.Item>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-4">
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            size="large"
            className="w-full md:w-auto px-8 bg-slate-800"
          >
            {isSubmitting ? 'Saving...' : 'Save Production'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ProductionCreationForm;
