/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Table, Select, DatePicker, message, Spin, InputNumber } from 'antd';
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
import { useLazyGetTotalQuantityAndUnitPriceQuery } from '../../../redux/features/transactions/transactons.api';
import { getResponse } from '../../../utils/getResponse';
import { showErrorAlert, showWarningAlert } from '../../../utils/sweetAlert';
import { useAppDispatch } from '../../../redux/hooks';
import { setProductionStep1 } from '../../../redux/features/production/productionSlice';
import { useLazyGetLastVoucherQtyQuery } from '../../../redux/features/inventory/InventoryApi';

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
  netQuantity?: number | null;
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
  const dispatch = useAppDispatch();
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
  const [triggerGetTotalQuantity] = useLazyGetTotalQuantityAndUnitPriceQuery();
  const [trigerLastVoucherQty] = useLazyGetLastVoucherQtyQuery()
  // const [triggerLastUsedQty] =

  // Helper to fetch live rate and netQuantity from /inventory/inventorytotal?itemType=raw&rawId={rawId}
  const fetchRawMaterialInfo = async (rawId: number): Promise<{ rate: number | null; netQuantity: number | null, lastQty: number | null }> => {
    try {
      const res = await triggerGetTotalQuantity({
        itemType: 'raw',
        rawId: String(rawId),
      }).unwrap();
      const rawNetQty = res?.data?.netQuantity;
      const netQty = rawNetQty !== undefined && rawNetQty !== null ? Number(rawNetQty) : null;
      const netAmount = Number(res?.data?.netAmount) || 0;
      let rate: number | null = null;
      if (netQty !== null && netQty > 0 && netAmount > 0) {
        rate = Number((netAmount / netQty).toFixed(2));
      }
      // fetch last used qty
      const reslastQty = await trigerLastVoucherQty({ rawid: rawId }).unwrap();
      const lastUsedQty = reslastQty?.data;
      return { rate, netQuantity: netQty, lastQty: lastUsedQty?.quantityLess };
    } catch (err) {
      console.error('Failed to fetch inventory total for raw material:', err);
    }
    return { rate: null, netQuantity: null, lastQty: null };
  };

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

      // Fetch live inventory rates (netAmount / netQuantity) and netQuantity for auto-populated raw materials
      materials.forEach((m: any, idx: number) => {
        const rawId = m.rawId ?? m.rawMaterials?.id ?? m.id ?? m.rawMaterialId;
        if (rawId) {
          fetchRawMaterialInfo(Number(rawId)).then(({ rate: liveRate, netQuantity, lastQty }) => {
            setRawMaterials(prev =>
              prev.map((item, i) => {
                if (i === idx) {
                  const itemQty = item.qty ?? 0;
                  const finalRate = liveRate ?? item.rate;
                  return {
                    ...item,
                    rate: finalRate,
                    netQuantity,
                    total: itemQty > 0 && finalRate != null ? Number((itemQty * finalRate).toFixed(2)) : item.total,
                    qty: lastQty ?? 0
                  };
                }
                return item;
              })
            );
          });
        }
      });
    } else {
      setRawMaterials([
        { si: 1, rawMaterialId: null, name: '', unit: 'Kg', unitId: null, qty: null, rate: null, total: 0, netQuantity: null, },
      ]);
    }
  }, [selectedProductId, ingredientsData, allRawMaterialsData, existingProductionId, form]);

  // Handlers for table rows
  const handleMaterialChange = async (si: number, value: number | null) => {
    if (!value) {
      setRawMaterials(prev =>
        prev.map(item =>
          item.si === si
            ? { ...item, rawMaterialId: null, name: '', unit: 'Kg', unitId: null, qty: null, rate: null, total: 0, netQuantity: null }
            : item
        )
      );
      return;
    }

    const selected = allRawMaterialsData?.data?.find((m: RawMaterialFromAPI) => m.id === value);
    if (selected) {
      const fallbackRate = selected.ingredienteRate ?? selected.unitPrice ?? selected.rate ?? null;

      // Optimistically set material with fallback rate
      setRawMaterials(prev =>
        prev.map(item => {
          if (item.si === si) {
            const currentQty = item.qty ?? 0;
            const newTotal = fallbackRate != null ? Number((currentQty * fallbackRate).toFixed(2)) : 0;
            return {
              ...item,
              rawMaterialId: selected.id,
              name: selected.name,
              unit: selected.unit?.name || 'Kg',
              unitId: selected.unitId ?? null,
              rate: fallbackRate,
              total: newTotal,
              netQuantity: null,
            };
          }
          return item;
        })
      );

      // Fetch live rate and netQuantity from /inventory/inventorytotal?itemType=raw&rawId={value}
      const { rate: liveRate, netQuantity } = await fetchRawMaterialInfo(selected.id);
      setRawMaterials(prev =>
        prev.map(item => {
          if (item.si === si) {
            const currentQty = item.qty ?? 0;
            const finalRate = liveRate ?? item.rate;
            const newTotal = finalRate != null ? Number((currentQty * finalRate).toFixed(2)) : 0;
            return {
              ...item,
              rate: finalRate,
              netQuantity,
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
          const maxAllowed = item.netQuantity !== undefined && item.netQuantity !== null ? item.netQuantity : null;
          if (value !== null && maxAllowed !== null && maxAllowed <= value) {
            showWarningAlert(
              value > maxAllowed
                ? `Quantity cannot exceed available stock (${maxAllowed}). You entered ${value}.`
                : `Entered quantity (${value}) is equal to total available stock (${maxAllowed}).`,
              'Stock Limit Warning'
            );
            if (value > maxAllowed) {
              return item;
            }
          }

          const rate = item.rate || 0;
          const total = value != null ? Number((value * rate).toFixed(2)) : 0;
          return { ...item, qty: value, total };
        }
        return item;
      })
    );
  };

  const handleQtyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      const target = document.getElementById(`qty-input-${currentIndex + 1}`);
      const input = target instanceof HTMLInputElement ? target : (target?.querySelector('input') as HTMLInputElement | null);
      if (input) {
        input.focus();
        input.select();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentIndex > 0) {
        const target = document.getElementById(`qty-input-${currentIndex - 1}`);
        const input = target instanceof HTMLInputElement ? target : (target?.querySelector('input') as HTMLInputElement | null);
        if (input) {
          input.focus();
          input.select();
        }
      }
    }
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
      { si: prev.length + 1, rawMaterialId: null, name: '', qty: null, unit: 'Kg', unitId: null, rate: null, total: 0, netQuantity: null, lastQty: null },
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
        showErrorAlert('Please select at least one valid Raw Material');
        return;
      }

      const invalidQty = validMaterials.some(item => !item.qty || Number(item.qty) <= 0);
      if (invalidQty) {
        showErrorAlert('Please enter a valid Quantity (greater than 0) for all raw materials');
        return;
      }

      // Check if any quantity exceeds netQuantity
      const exceededItem = validMaterials.find(item => {
        const maxAllowed = item.netQuantity !== undefined && item.netQuantity !== null ? item.netQuantity : null;
        return maxAllowed !== null && Number(item.qty) > maxAllowed;
      });
      if (exceededItem) {
        showErrorAlert(
          `Quantity for "${exceededItem.name || 'Raw Material'}" (${exceededItem.qty}) exceeds available stock (${exceededItem.netQuantity}). It must be less than or equal to ${exceededItem.netQuantity}.`,
          'Stock Limit Exceeded'
        );
        return;
      }

      const invalidRate = validMaterials.some(item => item.rate === null || Number(item.rate) < 0);
      if (invalidRate) {
        showErrorAlert('Please enter a valid Rate for all raw materials');
        return;
      }

      setIsSubmitting(true);

      const apiPayload: Production & { id?: number } = {
        ...(existingProductionId ? { id: existingProductionId } : {}),
        date: values.date ? dayjs(values.date).toISOString() : dayjs().toISOString(),
        productinfo: {
          productId: Number(values.productId),
          quantityAdd: 0,
          unitPrice: 0,
        },
        rawMaterials: validMaterials.map(item => ({
          ...(item.id ? { id: item.id } : {}),
          rawId: Number(item.rawMaterialId!),
          quantity: Number(item.qty) || 0,
          unitPrice: Number(item.rate) || 0,
        })),
        status: "PROCESSING",
      };

      const res = await createProduction({ data: apiPayload });
      const result = getResponse(res);

      if (result?.success) {
        const reduxPayload = {
          productId: Number(values.productId),
          date: values.date ? dayjs(values.date).toISOString() : dayjs().toISOString(),
          rawMaterials: validMaterials.map(item => ({
            rawId: Number(item.rawMaterialId!),
            quantity: Number(item.qty) || 0,
            unitPrice: Number(item.rate) || 0,
          })),
        };
        dispatch(setProductionStep1(reduxPayload));

        message.success('Step 1 (Raw Materials) saved successfully! Proceeding to Step 2.');
        const savedProduction = result.data;
        navigate('/dashboard/production-step-two', {
          state: { productionId: savedProduction.id },
        });
      }
    } catch (error: any) {
      if (error?.errorFields) {
        showErrorAlert('Please fill in all required fields (Product, Date)');
      } else {
        showErrorAlert('An error occurred while saving Step 1');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Raw Materials Columns
  const columns = [
    {
      title: 'SI',
      dataIndex: 'si',
      key: 'si',
      width: 48,
      align: 'center' as const,
      render: (si: number) => <span className="text-slate-500 font-medium text-xs">{si}</span>,
    },
    {
      title: 'Raw Material Name',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      render: (_: any, record: RawMaterialItem) => (
        <Select
          status={attemptedSubmit && !record.rawMaterialId ? 'error' : undefined}
          placeholder="Select Raw Material"
          value={record.rawMaterialId || undefined}
          style={{ width: '100%' }}
          size="middle"
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
      title: 'Available Stock',
      dataIndex: 'unit',
      key: 'unit',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: RawMaterialItem) => {
        const stock = record.netQuantity != null ? record.netQuantity : '-';
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100/80 text-slate-700 font-mono">
            {stock} {record.unit || 'Kg'}
          </span>
        );
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'qty',
      key: 'qty',
      width: 130,
      render: (_: any, record: RawMaterialItem, index: number) => {
        const hasExceeded = record.netQuantity != null && record.qty != null && Number(record.qty) > record.netQuantity;
        const isFullStock = record.netQuantity != null && record.qty != null && Number(record.qty) === record.netQuantity;
        return (
          <InputNumber
            id={`qty-input-${index}`}
            status={
              attemptedSubmit && (!record.qty || Number(record.qty) <= 0)
                ? 'error'
                : hasExceeded
                  ? 'error'
                  : isFullStock
                    ? 'warning'
                    : undefined
            }
            min={0}
            max={record.netQuantity != null ? record.netQuantity : undefined}
            step={0.01}
            value={record.qty}
            onChange={v => handleQtyChange(record.si, v)}
            onKeyDown={e => handleQtyKeyDown(e, index)}
            onFocus={e => e.target.select()}
            controls={false}
            keyboard={false}
            style={{ width: '100%' }}
            size="middle"
            precision={2}
            placeholder="0.00"
          />
        );
      },
    },
    {
      title: 'Unit Rate (BDT)',
      dataIndex: 'rate',
      key: 'rate',
      width: 130,
      render: (_: any, record: RawMaterialItem) => (
        <InputNumber
          status={attemptedSubmit && (record.rate == null || Number(record.rate) < 0) ? 'error' : undefined}
          min={0}
          step={0.01}
          value={record.rate}
          onChange={v => handleRateChange(record.si, v)}
          controls={false}
          style={{ width: '100%' }}
          size="middle"
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
        <span className="font-semibold text-slate-800 text-xs font-mono">
          {Number(total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ৳
        </span>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 44,
      align: 'center' as const,
      render: (_: any, record: RawMaterialItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined className="text-slate-400 hover:text-red-500" />}
          onClick={() => handleRemoveRow(record.si)}
          size="small"
        />
      )
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)] p-6 space-y-5">
      {/* ─── Clean Header ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-1 border-b border-slate-100">
        <div>
          <h1 className="text-lg font-bold text-slate-800 m-0 tracking-tight">{formTitle}</h1>
          <p className="text-xs text-slate-400 m-0 mt-0.5">
            Step 1: Select target product and allocate required raw materials for this batch
          </p>
        </div>

        <Button
          icon={<UnorderedListOutlined />}
          onClick={() => navigate('/dashboard/production-voucher')}
          className="rounded-lg border-slate-200 text-slate-600 hover:text-[#C58D2F] hover:border-[#C58D2F] text-xs h-8 font-medium shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] hover:shadow-[0_2px_6px_0_rgba(15,23,42,0.08)] transition-all"
        >
          Production Voucher
        </Button>
      </div>

      <Form form={form} layout="vertical" initialValues={{ date: dayjs() }}>
        {/* ─── Compact Top Inputs ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.03)]">
          <Form.Item
            name="productId"
            label={<span className="text-xs font-semibold text-slate-700">Select Product</span>}
            rules={[{ required: true, message: 'Please select a product' }]}
            className="mb-0"
          >
            <Select
              placeholder="Choose product..."
              style={{ width: '100%' }}
              size="middle"
              options={productOptions}
              loading={isProductsLoading}
              showSearch
              filterOption={(input, option) =>
                !!option?.label?.toString().toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            name="date"
            label={<span className="text-xs font-semibold text-slate-700">Production Date</span>}
            rules={[{ required: true, message: 'Please select date' }]}
            className="mb-0"
          >
            <DatePicker style={{ width: '100%' }} size="middle" format="DD-MMM-YYYY" />
          </Form.Item>
        </div>

        {/* ─── Raw Materials Section ─── */}
        <div className="space-y-2.5 pt-1">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-800 m-0">Raw Materials</h2>
              <p className="text-[11px] text-slate-400 m-0">Ingredients and quantities required for this production batch</p>
            </div>
          </div>

          {selectedProductId && (isIngredientsLoading || isIngredientsFetching) ? (
            <div className="py-10 text-center bg-slate-50/50 rounded-xl border border-slate-200/60">
              <Spin tip="Loading ingredients recipe..." />
            </div>
          ) : (
            <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-[0_2px_12px_-3px_rgba(15,23,42,0.05)]">
              <Table
                dataSource={rawMaterials}
                columns={columns}
                rowKey="si"
                pagination={false}
                size="small"
                scroll={{ x: 800 }}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row className="bg-slate-50/80 border-t border-slate-200 font-medium text-xs">
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <Button
                          type="link"
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={handleAddRow}
                          className="text-[#C58D2F] font-semibold p-0 text-xs hover:text-[#a57325]">
                          Add Material Row
                        </Button>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} className="text-center font-bold text-slate-700">
                        <span className="text-slate-400 mr-1.5 font-normal">Total Qty:</span>
                        <span className="text-slate-900 font-semibold font-mono">{totalQty.toFixed(2)}</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} colSpan={3} className="text-right pr-3 font-bold">
                        <span className="text-slate-400 mr-2 font-normal">Grand Total:</span>
                        <span className="text-sm font-bold text-[#C58D2F] font-mono">
                          {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ৳
                        </span>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </div>
          )}
        </div>

        {/* ─── Bottom Actions ─── */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Proceeding will save Step 1 and open Step 2 (Packaging & Expenses).
          </span>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => navigate('/dashboard/production-voucher')}
              className="rounded-lg text-slate-600 border-slate-200 text-xs font-medium h-9 px-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] hover:shadow-[0_2px_6px_0_rgba(15,23,42,0.08)] transition-all"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="middle"
              icon={<ArrowRightOutlined />}
              loading={isSubmitting}
              onClick={handleSaveAndProceed}
              className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white font-semibold rounded-lg px-6 h-9 text-xs shadow-[0_3px_12px_rgba(197,141,47,0.3)] hover:shadow-[0_4px_16px_rgba(197,141,47,0.45)] transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Save & Proceed'}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default ProductionCreationForm;
