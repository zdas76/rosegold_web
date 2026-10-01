/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import { Form, Input, Button, Table, Select, DatePicker, message, Spin, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowRightOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router';
import dayjs from 'dayjs';
import { useGetRowMaterialsQuery } from '../../../redux/features/rowMaterials/rowMaterials.api';
import { useGetProductsQuery } from '../../../redux/features/product/product.api';
import { useGetProductionIngredientsQuery } from '../../../redux/features/productionIngredient/productionIngredient.api';
import {
  useCreateProductionMutation,
  type Production,
} from '../../../redux/features/production/production.api';
import { getResponse } from '../../../utils/getResponse';

export interface RawMaterialItem {
  id?: number;
  si: number;
  rawMaterialId: number | null;
  name: string;
  unit: string;
  unitId?: number | null;
  qty: number | null;
  rate: number | null;
  total: number;
}

export interface PackingMaterialItem {
  id?: number;
  si: number;
  packingMaterialId: number | null;
  name: string;
  unit: string;
  unitId?: number | null;
  qty: number | null;
  unitPrice: number | null;
  perUnitQty: number | null;
  perUnitCost: number | null;
  total: number;
}

export interface ProductionExpenseItem {
  id?: number;
  si: number;
  expenseItemId: number | null;
  name: string;
  qty: number | null;
  rate: number | null;
  total: number;
}

interface RawMaterialFromAPI {
  id: number;
  name: string;
  unit?: { id: number; name: string };
  unitId?: number;
  ingredienteRate?: number;
  unitPrice?: number;
  rate?: number;
}

const ProductionCreationForm: React.FC<{ formTitle?: string }> = ({
  formTitle = 'Production Creation Form',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  const [existingProductionId, setExistingProductionId] = useState<number | null>(null);
  const [rawMaterials, setRawMaterials] = useState<RawMaterialItem[]>([
    { si: 1, rawMaterialId: null, name: '', unit: 'Kg', unitId: null, qty: null, rate: null, total: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Queries
  const { data: productsData, isLoading: isProductsLoading } = useGetProductsQuery({});
  const { data: allRawMaterialsData } = useGetRowMaterialsQuery({});
  const selectedProductId = Form.useWatch('productId', form);

  const { data: ingredientsData, isLoading: isIngredientsLoading, isFetching: isIngredientsFetching } =
    useGetProductionIngredientsQuery(
      selectedProductId ? { productId: selectedProductId } : undefined,
      { skip: !selectedProductId }
    );

  const [createProduction] = useCreateProductionMutation();

  // Product & Raw Material dropdown options
  const productOptions = useMemo(() => {
    return productsData?.data?.map((item: { id: number; name: string }) => ({
      value: item.id,
      label: item.name,
    })) || [];
  }, [productsData]);

  const materialOptions = useMemo(() => {
    return allRawMaterialsData?.data?.map((item: RawMaterialFromAPI) => ({
      value: item.id,
      label: item.name,
      unit: item.unit?.name || 'Kg',
      unitId: item.unitId,
      rate: item.ingredienteRate || item.unitPrice || item.rate || 0,
    })) || [];
  }, [allRawMaterialsData]);

  const selectedRawMaterialIds = useMemo(() => {
    return new Set(rawMaterials.map(item => item.rawMaterialId).filter(Boolean));
  }, [rawMaterials]);

  const totalQty = useMemo(() => {
    return Number(rawMaterials.reduce((sum, item) => sum + (Number(item.qty) || 0), 0).toFixed(2));
  }, [rawMaterials]);

  const grandTotal = useMemo(() => {
    return Number(rawMaterials.reduce((sum, item) => sum + (Number(item.total) || 0), 0).toFixed(2));
  }, [rawMaterials]);

  // Load existing production if passed via location.state
  useEffect(() => {
    if (location.state?.production) {
      const prod = location.state.production;
      setExistingProductionId(prod.id);
      form.setFieldsValue({
        productId: prod.productinfo?.productId || prod.inventory?.find((inv: any) => inv.productId)?.productId,
        batchNo: prod.batchNo,
        date: prod.date ? dayjs(prod.date) : dayjs(),
      });
      const rawInvs = prod.inventory?.filter((inv: any) => inv.rawId || inv.raWMaterial) || [];
      if (rawInvs.length > 0) {
        setRawMaterials(
          rawInvs.map((rm: any, idx: number) => {
            const rawId = rm.rawId || rm.raWMaterial?.id;
            const qty = rm.quantityLess ?? rm.quantity ?? 0;
            const rate = rm.unitPrice ?? 0;
            return {
              id: rm.id,
              si: idx + 1,
              rawMaterialId: rawId,
              name: rm.raWMaterial?.name || '',
              unit: rm.raWMaterial?.unit?.name || 'Kg',
              qty: qty > 0 ? qty : null,
              rate: rate > 0 ? rate : null,
              total: Number((qty * rate).toFixed(2)),
            };
          })
        );
      }
    }
  }, [location.state, form]);

  // Auto-populate raw materials recipe when product is selected
  useEffect(() => {
    if (existingProductionId || !selectedProductId) return;

    const rawList = Array.isArray(ingredientsData?.data)
      ? ingredientsData.data
      : Array.isArray((ingredientsData as any)?.data?.data)
      ? (ingredientsData as any).data.data
      : [];

    const matched = rawList.find((r: any) => Number(r.productId) === Number(selectedProductId)) || rawList[0];
    const materials = matched?.ingredientRawMaterial || matched?.ingredientRawMaterials || matched?.rawMaterials || [];

    if (materials.length > 0) {
      const initialItems: RawMaterialItem[] = materials.map((m: any, index: number) => {
        const rawId = m.rawId ?? m.rawMaterials?.id ?? m.id ?? m.rawMaterialId;
        const found = allRawMaterialsData?.data?.find((rm: any) => Number(rm.id) === Number(rawId));
        const name = m.rawMaterials?.name ?? found?.name ?? m.name ?? '';
        const unit = m.rawMaterials?.unit?.name ?? found?.unit?.name ?? m.unit?.name ?? 'Kg';
        const unitId = m.rawMaterials?.unitId ?? found?.unitId ?? m.unitId ?? null;
        const rate = m.rawMaterials?.unitPrice ?? m.ingredienteRate ?? m.unitPrice ?? found?.ingredienteRate ?? found?.unitPrice ?? found?.rate ?? null;
        const qty = m.ingredienteQty ?? m.quantity ?? null;
        const total = qty != null && rate != null ? Number((qty * rate).toFixed(2)) : 0;

        return {
          si: index + 1,
          rawMaterialId: rawId,
          name,
          unit,
          unitId,
          qty,
          rate,
          total,
        };
      });
      setRawMaterials(initialItems);
    } else {
      setRawMaterials([
        { si: 1, rawMaterialId: null, name: '', unit: 'Kg', unitId: null, qty: null, rate: null, total: 0 },
      ]);
    }
  }, [selectedProductId, ingredientsData, allRawMaterialsData, existingProductionId]);

  // Handlers for table rows
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

    const selected = allRawMaterialsData?.data?.find((m: RawMaterialFromAPI) => m.id === value);
    if (selected) {
      setRawMaterials(prev =>
        prev.map(item => {
          if (item.si === si) {
            const newRate = selected.ingredienteRate ?? selected.unitPrice ?? selected.rate ?? null;
            const newQty = item.qty ?? 0;
            const newTotal = newRate != null ? Number((newQty * newRate).toFixed(2)) : 0;
            return {
              ...item,
              rawMaterialId: selected.id,
              name: selected.name,
              unit: selected.unit?.name || 'Kg',
              unitId: selected.unitId ?? null,
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
          const rate = item.rate || 0;
          const total = value != null ? Number((value * rate).toFixed(2)) : 0;
          return { ...item, qty: value, total };
        }
        return item;
      })
    );
  };

  const handleRateChange = (si: number, value: number | null) => {
    setRawMaterials(prev =>
      prev.map(item => {
        if (item.si === si) {
          const qty = item.qty || 0;
          const total = value != null ? Number((qty * value).toFixed(2)) : 0;
          return { ...item, rate: value, total };
        }
        return item;
      })
    );
  };

  const handleAddRow = () => {
    setRawMaterials(prev => [
      ...prev,
      { si: prev.length + 1, rawMaterialId: null, name: '', qty: null, unit: 'Kg', unitId: null, rate: null, total: 0 },
    ]);
  };

  const handleRemoveRow = (si: number) => {
    setRawMaterials(prev => {
      if (prev.length <= 1) {
        message.warning('At least one raw material row is required');
        return prev;
      }
      return prev.filter(item => item.si !== si).map((item, idx) => ({ ...item, si: idx + 1 }));
    });
  };

  // Submit Step 1 and Navigate to Step 2
  const handleSaveAndProceed = async () => {
    setAttemptedSubmit(true);

    try {
      const values = await form.validateFields();
      const validMaterials = rawMaterials.filter(item => item.rawMaterialId);

      if (validMaterials.length === 0) {
        message.error('Please select at least one valid Raw Material');
        return;
      }

      const invalidQty = validMaterials.some(item => !item.qty || Number(item.qty) <= 0);
      if (invalidQty) {
        message.error('Please enter a valid Quantity (greater than 0) for all raw materials');
        return;
      }

      const invalidRate = validMaterials.some(item => item.rate === null || Number(item.rate) < 0);
      if (invalidRate) {
        message.error('Please enter a valid Rate for all raw materials');
        return;
      }

      setIsSubmitting(true);

      const payload: Production & { id?: number } = {
        ...(existingProductionId ? { id: existingProductionId } : {}),
        date: values.date ? dayjs(values.date).toISOString() : dayjs().toISOString(),
        batchNo: values.batchNo,
        productinfo: {
          productId: Number(values.productId),
          quantity: 0,
          unitPrice: 0,
        },
        rawMaterials: validMaterials.map(item => ({
          ...(item.id ? { id: item.id } : {}),
          rawId: Number(item.rawMaterialId!),
          quantity: Number(item.qty) || 0,
          unitPrice: Number(item.rate) || 0,
        })),
      };

      const res = await createProduction(payload);
      const result = getResponse(res);

      if (result?.success) {
        message.success('Step 1 (Raw Materials) saved successfully! Proceeding to Step 2.');
        const savedProduction = result.data;
        navigate('/dashboard/production-step-2', {
          state: { production: savedProduction },
        });
      }
    } catch (error: any) {
      if (error?.errorFields) {
        message.error('Please fill in all required fields (Product, Batch No, Date)');
      } else {
        message.error('An error occurred while saving Step 1');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Raw Materials Columns
  const columns = [
    { title: 'SI', dataIndex: 'si', key: 'si', width: 55, align: 'center' as const },
    {
      title: 'Material Name',
      dataIndex: 'name',
      key: 'name',
      width: 260,
      render: (_: any, record: RawMaterialItem) => (
        <Select
          status={attemptedSubmit && !record.rawMaterialId ? 'error' : undefined}
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
      width: 80,
      align: 'center' as const,
      render: (unit: string) => <span className="text-gray-600 font-medium">{unit || 'Kg'}</span>,
    },
    {
      title: 'Quantity',
      dataIndex: 'qty',
      key: 'qty',
      width: 140,
      render: (_: any, record: RawMaterialItem) => (
        <InputNumber
          status={attemptedSubmit && (!record.qty || Number(record.qty) <= 0) ? 'error' : undefined}
          min={0}
          step={0.01}
          value={record.qty}
          onChange={v => handleQtyChange(record.si, v)}
          controls={false}
          style={{ width: '100%' }}
          precision={2}
          placeholder="0.00"
        />
      ),
    },
    {
      title: 'Unit Rate (BDT)',
      dataIndex: 'rate',
      key: 'rate',
      width: 140,
      render: (_: any, record: RawMaterialItem) => (
        <InputNumber
          status={attemptedSubmit && (record.rate == null || Number(record.rate) < 0) ? 'error' : undefined}
          min={0}
          step={0.01}
          value={record.rate}
          onChange={v => handleRateChange(record.si, v)}
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
      render: (total: number) => (
        <span className="font-bold text-gray-800">{Number(total || 0).toFixed(2)} ৳</span>
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

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800 m-0">{formTitle}</h2>
          <span className="text-xs text-gray-500">
            Step 1: Enter production info and raw materials, then proceed to Step 2 for packaging and expenses.
          </span>
        </div>

        <Button
          icon={<UnorderedListOutlined />}
          onClick={() => navigate('/dashboard/production-voucher')}
        >
          Production Voucher
        </Button>
      </div>

      <Form form={form} layout="vertical" initialValues={{ date: dayjs() }}>
        {/* Top 3 required fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/60 p-3 rounded-lg border border-slate-200/60">
          <Form.Item
            name="productId"
            label={<span className="font-semibold">Select Product</span>}
            rules={[{ required: true, message: 'Please select a product' }]}
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
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-base text-gray-800 m-0">Raw Materials</h3>
            <span className="text-xs text-gray-500">Add raw materials used in this batch</span>
          </div>

          {selectedProductId && (isIngredientsLoading || isIngredientsFetching) ? (
            <div className="p-8 text-center bg-slate-50/50 rounded border border-slate-200/60">
              <Spin tip="Loading product ingredients recipe..." />
            </div>
          ) : (
            <div className="border border-slate-200/60 rounded-lg overflow-hidden">
              <Table
                dataSource={rawMaterials}
                columns={columns}
                rowKey="si"
                pagination={false}
                bordered
                size="small"
                scroll={{ x: 800 }}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row className="bg-amber-50/40 border-t border-amber-200/50 font-bold">
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={handleAddRow}
                          className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white shadow-xs"
                        >
                          Add Material
                        </Button>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} className="text-center font-bold text-slate-800">
                        <span className="text-gray-500 mr-2 font-semibold">Total Qty:</span>
                        <span className="text-sm font-bold text-slate-900">{totalQty.toFixed(2)}</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} colSpan={3} className="text-right pr-4 font-bold">
                        <span className="text-gray-500 mr-2 font-semibold">Grand Total:</span>
                        <span className="text-base font-extrabold text-amber-700">{grandTotal.toFixed(2)} ৳</span>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </div>
          )}
        </div>

        {/* Bottom Action Button */}
        <div className="mt-4 flex justify-end gap-3 bg-slate-50/80 rounded-lg border py-2.5 px-4 border-slate-200/60">
          <Button
            type="primary"
            size="large"
            icon={<ArrowRightOutlined />}
            loading={isSubmitting}
            onClick={handleSaveAndProceed}
            className="px-8 bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white shadow-sm font-semibold"
          >
            {isSubmitting ? 'Saving...' : 'Save & Proceed to Step 2'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ProductionCreationForm;
