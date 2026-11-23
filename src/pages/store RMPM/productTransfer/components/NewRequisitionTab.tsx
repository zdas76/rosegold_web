/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Table,
  InputNumber,
  Badge,
  Spin,
  Tooltip,
  Space,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SendOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGetProductsQuery } from '../../../../redux/features/product/product.api';
import { useLazyGetTotalQuantityAndUnitPriceQuery } from '../../../../redux/features/transactions/transactons.api';
import { showSuccessAlert, showWarningAlert } from '../../../../utils/sweetAlert';
import { Department, departmentOptions, type ProductRequisitionItem, type RequisitionRecord } from '../types';
import { useCreateProductTransferRequestMutation, useGetRequestAllQuery } from '../../../../redux/features/internalTranscation/internalTranscation.api';
import { VoucherType } from '../../../../types/types';
import { getResponse } from '../../../../utils/getResponse';

interface NewRequisitionTabProps {
  onSuccess?: (newRecord: RequisitionRecord) => void;
}

const generateReqNo = () => {
  const dateStr = dayjs().format('YYYYMMDD');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `REQ-${dateStr}-${randomPart}`;
};

const NewRequisitionTab: React.FC<NewRequisitionTabProps> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [requisitionNo, setRequisitionNo] = useState<string>(generateReqNo());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: tranreqVoucher } = useGetRequestAllQuery(VoucherType.TRANSFER)
  console.log(tranreqVoucher, "transfer request voucher")
  const [createProductTransferRequest, { isLoading: isCreatingRequest }] =
    useCreateProductTransferRequestMutation();
  // Queries
  const { data: productsData, isLoading: isProductsLoading } = useGetProductsQuery({});
  const [triggerGetTotalQuantity] = useLazyGetTotalQuantityAndUnitPriceQuery();

  // Requisition items state
  const [items, setItems] = useState<ProductRequisitionItem[]>([
    {
      key: 'item-1',
      si: 1,
      productId: null,
      productName: '',
      unit: 'Pcs',
      availableStock: null,
      quantity: null,
      remarks: '',
    },
  ]);

  // Available product options
  const productOptions = useMemo(() => {
    const list = Array.isArray(productsData?.data) ? productsData.data : [];
    return list.map((p: any) => {
      const catName = p?.subCategory?.category?.categoryName || p?.category?.categoryName || p?.subCategory?.subCategoryName || '';
      return {
        value: p.id,
        label: `${p.name}${catName ? ` (${catName})` : ''}`,
        name: p.name,
        unit: p?.unit?.name || 'Pcs',
        unitId: p?.unitId ?? p?.unit?.id ?? null,
        categoryName: catName,
        stock: p?.quantity != null ? Number(p.quantity) : 0,
      };
    });
  }, [productsData]);

  // Set of selected product IDs
  const selectedProductIds = useMemo(() => {
    return new Set(items.map(i => i.productId).filter((id): id is number => id != null));
  }, [items]);

  // Summary calculations
  const totalQuantity = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [items]);

  const validItemsCount = useMemo(() => {
    return items.filter(item => item.productId && Number(item.quantity) > 0).length;
  }, [items]);

  // Add row
  const handleAddRow = () => {
    const newRow: ProductRequisitionItem = {
      key: `item-${Date.now()}`,
      si: items.length + 1,
      productId: null,
      productName: '',
      unit: 'Pcs',
      availableStock: null,
      quantity: null,
      remarks: '',
    };
    setItems(prev => [...prev, newRow]);
  };

  // Remove row
  const handleRemoveRow = (key: string) => {
    if (items.length === 1) {
      setItems([
        {
          key: `item-${Date.now()}`,
          si: 1,
          productId: null,
          productName: '',
          unit: 'Pcs',
          availableStock: null,
          quantity: null,
          remarks: '',
        },
      ]);
      return;
    }
    setItems(prev =>
      prev
        .filter(item => item.key !== key)
        .map((item, idx) => ({ ...item, si: idx + 1 }))
    );
  };

  // Product change: fetch real-time available stock
  const handleProductChange = async (key: string, productId: number | null) => {
    const chosen = productOptions.find((opt: any) => opt.value === productId);

    if (!chosen || !productId) {
      setItems(prev =>
        prev.map(item =>
          item.key === key
            ? {
              ...item,
              productId: null,
              productName: '',
              unit: 'Pcs',
              availableStock: null,
              quantity: null,
              isLoadingStock: false,
            }
            : item
        )
      );
      return;
    }

    setItems(prev =>
      prev.map(item =>
        item.key === key
          ? {
            ...item,
            productId,
            productName: chosen.name,
            unit: chosen.unit || 'Pcs',
            unitId: chosen.unitId,
            categoryName: chosen.categoryName,
            availableStock: chosen.stock ?? null,
            isLoadingStock: true,
            quantity: null,
          }
          : item
      )
    );

    try {
      const res = await triggerGetTotalQuantity({
        itemType: 'product',
        productId,
      }).unwrap();

      const liveNetQty = res?.data?.netQuantity != null ? Number(res.data.netQuantity) : (chosen.stock ?? 0);

      setItems(prev =>
        prev.map(item =>
          item.key === key
            ? {
              ...item,
              availableStock: liveNetQty,
              isLoadingStock: false,
            }
            : item
        )
      );
    } catch (err) {
      console.error('Failed to fetch product total stock:', err);
      setItems(prev =>
        prev.map(item =>
          item.key === key
            ? {
              ...item,
              isLoadingStock: false,
            }
            : item
        )
      );
    }
  };

  // Quantity change with stock limit validation
  const handleQuantityChange = (key: string, newQty: number | null) => {
    setItems(prev =>
      prev.map(item => {
        if (item.key === key) {
          if (item.availableStock != null && newQty != null && newQty > item.availableStock) {
            showWarningAlert(
              `Requested quantity cannot exceed available stock (${item.availableStock} ${item.unit}). You entered ${newQty}.`,
              'Stock Limit Exceeded'
            );
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleRemarksChange = (key: string, text: string) => {
    setItems(prev =>
      prev.map(item => (item.key === key ? { ...item, remarks: text } : item))
    );
  };

  const handleResetForm = () => {
    form.resetFields();
    setRequisitionNo(generateReqNo());
    setItems([
      {
        key: `item-${Date.now()}`,
        si: 1,
        productId: null,
        productName: '',
        unit: 'Pcs',
        availableStock: null,
        quantity: null,
        remarks: '',
      },
    ]);
  };

  const handleSubmit = async () => {
    try {
      const formValues = await form.validateFields();

      const validItems = items.filter(item => item.productId != null);
      if (validItems.length === 0) {
        showWarningAlert('Please select at least one product for this requisition.', 'No Product Selected');
        return;
      }

      const hasZeroQty = validItems.some(item => !item.quantity || Number(item.quantity) <= 0);
      if (hasZeroQty) {
        showWarningAlert('Please enter a valid transfer quantity (greater than 0) for all selected products.', 'Invalid Quantity');
        return;
      }

      const hasStockExceeded = validItems.some(
        item => item.availableStock != null && Number(item.quantity) > item.availableStock
      );
      if (hasStockExceeded) {
        showWarningAlert('Some items have requested quantity exceeding available stock. Please adjust quantities.', 'Stock Exceeded');
        return;
      }

      setIsSubmitting(true);

      const requisitionPayload = {
        requisitionNo,
        date: formValues.date ? dayjs(formValues.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        fromDepartment: formValues.fromStore || Department.PRODUCTION,
        toDepartment: formValues.toStore || Department.FG_STORE,
        totalQuantity,
        remarks: formValues.remarks || '',
        products: validItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          unitId: item.unitId,
          availableStock: item.availableStock,
          requestQty: Number(item.quantity),
          quantity: Number(item.quantity),
          remarks: item.remarks || '',
        })),
      };

      console.log('Product Transfer Requisition Data Submitted:', requisitionPayload);

      const res: any = await createProductTransferRequest(requisitionPayload);
      const response = getResponse(res);

      if (response?.success || res?.data?.success) {
        const newRecord: RequisitionRecord = {
          id: res?.data?.data?.id ? String(res.data.data.id) : `rec-${Date.now()}`,
          requisitionNo,
          date: formValues.date ? dayjs(formValues.date).format('DD-MMM-YYYY') : dayjs().format('DD-MMM-YYYY'),
          fromStore: formValues.fromStore || Department.PRODUCTION,
          toStore: formValues.toStore || Department.FG_STORE,
          eInvoiceNo: formValues.eInvoiceNo || '',
          items: [...validItems],
          totalQty: totalQuantity,
          status: 'PENDING',
          remarks: formValues.remarks,
          createdAt: dayjs().format('DD-MMM-YYYY hh:mm A'),
        };

        await showSuccessAlert(
          response?.message || `Requisition ${requisitionNo} created successfully! Total ${validItems.length} product(s) requested for transfer to ${requisitionPayload.toDepartment}.`,
          'Requisition Submitted'
        );

        handleResetForm();
        onSuccess?.(newRecord);
      } else {
        showWarningAlert(
          response?.message || res?.error?.data?.message || 'Failed to submit product transfer request.',
          'Submission Failed'
        );
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      showWarningAlert(
        err?.data?.message || err?.message || 'Failed to submit requisition. Please check all fields.',
        'Error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemColumns = [
    {
      title: 'SI',
      dataIndex: 'si',
      key: 'si',
      width: 50,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (
        <span className="font-mono text-slate-500 font-semibold">{index + 1}</span>
      ),
    },
    {
      title: 'Product Name',
      dataIndex: 'productId',
      key: 'productId',
      width: 300,
      render: (_: any, record: ProductRequisitionItem) => (
        <Select
          showSearch
          placeholder="Select product"
          value={record.productId || undefined}
          style={{ width: '100%' }}
          loading={isProductsLoading}
          options={productOptions.map((opt: any) => ({
            ...opt,
            disabled: selectedProductIds.has(opt.value) && opt.value !== record.productId,
          }))}
          filterOption={(input, option) =>
            Boolean(option?.label?.toString().toLowerCase().includes(input.toLowerCase()))
          }
          onChange={val => handleProductChange(record.key, val)}
          allowClear
        />
      ),
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      align: 'center' as const,
      render: (unit: string) => (
        <span className="text-slate-600 font-medium text-xs bg-slate-100 px-2 py-1 rounded">
          {unit || 'Pcs'}
        </span>
      ),
    },
    {
      title: 'Available Stock',
      dataIndex: 'availableStock',
      key: 'availableStock',
      width: 140,
      align: 'center' as const,
      render: (_: any, record: ProductRequisitionItem) => {
        if (!record.productId) {
          return <span className="text-slate-400 text-xs">-</span>;
        }

        if (record.isLoadingStock) {
          return (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 font-medium">
              <Spin size="small" /> Fetching...
            </span>
          );
        }

        const stock = record.availableStock != null ? record.availableStock : 0;
        const hasStock = stock > 0;

        return (
          <Tooltip title={hasStock ? 'Click to fill all available stock' : 'Out of stock'}>
            <span
              onClick={() => {
                if (hasStock) {
                  handleQuantityChange(record.key, stock);
                }
              }}
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold font-mono transition-all ${hasStock
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-amber-100 hover:text-amber-900 cursor-pointer shadow-2xs'
                : 'bg-rose-50 text-rose-700 border border-rose-200 cursor-not-allowed'
                }`}
            >
              {stock.toLocaleString()} {record.unit}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Transfer Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 150,
      align: 'right' as const,
      render: (qty: number | null, record: ProductRequisitionItem) => {
        const hasExceeded =
          record.availableStock != null && qty != null && qty > record.availableStock;

        return (
          <div className="space-y-0.5">
            <InputNumber
              min={1}
              step={1}
              disabled={!record.productId}
              value={qty}
              status={hasExceeded ? 'error' : undefined}
              onChange={val => handleQuantityChange(record.key, val)}
              onFocus={e => e.target.select()}
              controls={false}
              placeholder="0"
              className="w-full text-right font-semibold"
            />
            {hasExceeded && (
              <span className="text-[10px] text-red-600 block text-right font-medium">
                Exceeds stock ({record.availableStock})
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 50,
      align: 'center' as const,
      render: (_: any, record: ProductRequisitionItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveRow(record.key)}
          size="small"
          title="Remove row"
        />
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Requisition Meta Form */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-sm font-bold text-slate-800 m-0 tracking-tight flex items-center gap-2">
            <AppstoreOutlined className="text-amber-600" /> Requisition Information
          </h3>
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={handleResetForm}
            className="text-xs rounded-lg"
          >
            Reset Form
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            date: dayjs(),
            fromStore: Department.PRODUCTION,
            toStore: Department.FG_STORE,
            requisitionNo,
            eInvoiceNo: '',
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Form.Item
              name="date"
              label={<span className="font-semibold text-xs text-slate-600">Requisition Date</span>}
              rules={[{ required: true, message: 'Please select date' }]}
            >
              <DatePicker
                format="DD-MMM-YYYY"
                style={{ width: '100%' }}
                className="rounded-lg font-medium"
              />
            </Form.Item>

            <Form.Item
              name="fromStore"
              label={<span className="font-semibold text-xs text-slate-600">From Department</span>}
              rules={[{ required: true, message: 'Please select from department' }]}
            >
              <Select
                options={departmentOptions}
                className="rounded-lg font-medium"
              />
            </Form.Item>

            <Form.Item
              name="toStore"
              label={<span className="font-semibold text-xs text-slate-600">To Destination</span>}
              rules={[{ required: true, message: 'Please select to destination' }]}
            >
              <Select
                options={departmentOptions}
                className="rounded-lg font-medium"
              />
            </Form.Item>
          </div>
        </Form>
      </div>

      {/* Products Requisition Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold text-slate-800 m-0 tracking-tight">
              Transfer Products List
            </h3>
            <Badge
              count={`${validItemsCount} item(s)`}
              className="font-semibold"
              style={{ backgroundColor: '#F3F4F6', color: '#4B5563', border: '1px solid #E5E7EB' }}
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddRow}
            className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white font-semibold text-xs rounded-lg h-8 shadow-xs"
          >
            Add Product Row
          </Button>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-200/80">
          <Table
            dataSource={items}
            columns={itemColumns}
            pagination={false}
            size="middle"
            scroll={{ x: 880 }}
            rowKey="key"
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-amber-50/50 font-bold text-xs border-t border-amber-200/60">
                  <Table.Summary.Cell index={0} colSpan={4}>
                    <div className="flex items-center gap-2 pl-2 text-slate-700">
                      <span>Total Selected Items: {validItemsCount}</span>
                    </div>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} className="text-right pr-4">
                    <span className="text-slate-500 font-semibold mr-1.5">Total Qty:</span>
                    <span className="font-mono text-base font-extrabold text-[#C58D2F]">
                      {totalQuantity.toLocaleString()}
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} colSpan={2} />
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>
      </div>

      {/* Submission Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <CheckCircleOutlined className="text-emerald-500 text-sm" />
          <span>
            Products will be dispatched upon requisition submission and approval.
          </span>
        </div>

        <Space size="middle">
          <Button
            onClick={handleResetForm}
            className="rounded-lg text-xs font-semibold px-4 h-9"
          >
            Cancel / Clear
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSubmit}
            loading={isCreatingRequest || isSubmitting}
            disabled={validItemsCount === 0 || totalQuantity <= 0}
            className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white font-semibold text-xs px-6 h-9 rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            Submit Requisition ({totalQuantity.toLocaleString()})
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default NewRequisitionTab;
