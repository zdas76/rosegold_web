/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Table,
  Button,
  Modal,
  Form,
  DatePicker,
  Select,
  Input,
  InputNumber,
  Tag,
  Badge,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  SendOutlined,
  AppstoreOutlined,
  SwapRightOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGetProductsQuery } from '../../../redux/features/product/product.api';
import {
  useCreateProductTransferRequestMutation,
  useGetRequestAllQuery,
} from '../../../redux/features/internalTranscation/internalTranscation.api';
import { useLazyGetTotalQuantityAndUnitPriceQuery } from '../../../redux/features/transactions/transactons.api';
import { showSuccessAlert, showWarningAlert } from '../../../utils/sweetAlert';
import { getResponse } from '../../../utils/getResponse';
import { VoucherType } from '../../../types/types';

export interface TProductRequestItem {
  key: string;
  productId: number;
  productName: string;
  categoryName?: string;
  unit: string;
  unitId?: number | null;
  availableStock: number | null;
  quantity: number;
  remarks?: string;
}

const generateRequestNo = () => {
  const dateStr = dayjs().format('DDMMYYYY');
  const randomPart = String(Math.floor(1 + Math.random() * 9999)).padStart(4, '0');
  return `TRANS-${dateStr}/${randomPart}`;
};

const ProductTransfer: React.FC = () => {
  const navigate = useNavigate();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Queries for products
  const { data: productsData, isLoading: isProductsLoading } = useGetProductsQuery({});

  // Product options
  const productOptions = useMemo(() => {
    const list = Array.isArray(productsData?.data) ? productsData.data : [];
    return list.map((p: any) => {
      const catName =
        p?.subCategory?.category?.categoryName ||
        p?.category?.categoryName ||
        p?.subCategory?.subCategoryName ||
        '';
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

  // Internal Transaction API hooks for product requests
  const [createProductTransferRequest, { isLoading: isSubmitting }] =
    useCreateProductTransferRequestMutation();
  const { data: internalTxRes, isLoading: isTxLoading } =
    useGetRequestAllQuery(VoucherType.TRANSFER);

  // Live stock hook for item selector in Add Modal
  const [triggerGetTotalQuantity] = useLazyGetTotalQuantityAndUnitPriceQuery();

  // Voucher history list (fetched from backend API)
  const vouchers: any[] = useMemo(() => {
    return Array.isArray(internalTxRes?.data) ? internalTxRes.data : [];
  }, [internalTxRes]);

  // Form states inside modal
  const [modalForm] = Form.useForm();
  const [requestNo, setRequestNo] = useState<string>(generateRequestNo());
  const [requestDate, setRequestDate] = useState<dayjs.Dayjs>(dayjs());

  // Item builder states inside modal
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [itemQty, setItemQty] = useState<number | null>(null);
  const [itemRemarks, setItemRemarks] = useState<string>('');
  const [addedItems, setAddedItems] = useState<TProductRequestItem[]>([]);
  const [modalItemLiveStock, setModalItemLiveStock] = useState<number | null>(null);
  const [isModalItemStockLoading, setIsModalItemStockLoading] = useState<boolean>(false);

  // Fetch live stock for selected product in Add Modal
  useEffect(() => {
    if (!selectedProductId || !isModalOpen) {
      setModalItemLiveStock(null);
      return;
    }

    let isCurrent = true;
    setIsModalItemStockLoading(true);

    const fetchStock = async () => {
      try {
        const res = await triggerGetTotalQuantity({
          itemType: 'product',
          productId: selectedProductId,
        }).unwrap();

        if (isCurrent) {
          const qty =
            res?.data?.netQuantity != null
              ? Number(res.data.netQuantity)
              : res?.data?.totalQuantity != null
                ? Number(res.data.totalQuantity)
                : null;
          setModalItemLiveStock(qty);
          if (qty != null && qty > 0) {
            setItemQty(qty);
          } else if (qty != null) {
            setItemQty(0);
          }
        }
      } catch (err) {
        console.error('Failed to fetch modal product stock:', err);
        if (isCurrent) setModalItemLiveStock(null);
      } finally {
        if (isCurrent) setIsModalItemStockLoading(false);
      }
    };

    fetchStock();

    return () => {
      isCurrent = false;
    };
  }, [selectedProductId, isModalOpen, triggerGetTotalQuantity]);

  // Currently selected product details
  const activeProductDetails = useMemo(() => {
    if (!selectedProductId) return null;
    return productOptions.find((opt: any) => opt.value === selectedProductId) || null;
  }, [selectedProductId, productOptions]);

  // Set of already added product IDs to prevent duplicates in same request
  const alreadyAddedIds = useMemo(() => {
    return new Set(addedItems.map(item => item.productId));
  }, [addedItems]);

  // Summary calculations inside modal
  const totalModalQuantity = useMemo(() => {
    return addedItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [addedItems]);

  // Open "Add Request" modal
  const handleOpenAddModal = () => {
    setRequestNo(generateRequestNo());
    setRequestDate(dayjs());
    setSelectedProductId(null);
    setItemQty(null);
    setItemRemarks('');
    setAddedItems([]);
    setModalItemLiveStock(null);
    modalForm.resetFields();
    setIsModalOpen(true);
  };

  // Add product to temporary table inside modal
  const handleAddItemToRequest = () => {
    if (!selectedProductId || !activeProductDetails) {
      showWarningAlert('Please select a product first.', 'No Product Selected');
      return;
    }

    if (!itemQty || itemQty <= 0) {
      showWarningAlert('Please enter a valid quantity greater than 0.', 'Invalid Quantity');
      return;
    }

    const availableStock = modalItemLiveStock ?? activeProductDetails.stock ?? 0;
    if (availableStock != null && itemQty > availableStock) {
      showWarningAlert(
        `Requested quantity cannot exceed available stock (${availableStock} ${activeProductDetails.unit}). You entered ${itemQty}.`,
        'Stock Limit Exceeded'
      );
      return;
    }

    const newItem: TProductRequestItem = {
      key: `prod-${selectedProductId}-${Date.now()}`,
      productId: selectedProductId,
      productName: activeProductDetails.name,
      categoryName: activeProductDetails.categoryName,
      unit: activeProductDetails.unit,
      unitId: activeProductDetails.unitId,
      availableStock,
      quantity: itemQty,
      remarks: itemRemarks || '',
    };

    setAddedItems(prev => [...prev, newItem]);

    // Reset product selector fields
    setSelectedProductId(null);
    setItemQty(null);
    setItemRemarks('');
  };

  // Remove product from temporary table inside modal
  const handleRemoveItem = (key: string) => {
    setAddedItems(prev => prev.filter(item => item.key !== key));
  };

  // Submit the request voucher
  const handleSubmitRequest = async () => {
    if (addedItems.length === 0) {
      showWarningAlert(
        'Please add at least one product to the request list before submitting.',
        'No Products Added'
      );
      return;
    }

    const payload = {
      requisitionNo: requestNo,
      date: requestDate.format('YYYY-MM-DD'),
      fromDepartment: 'PRODUCTION',
      toDepartment: 'FG_STORE',
      totalQuantity: totalModalQuantity,
      products: addedItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        unitId: item.unitId,
        availableStock: item.availableStock,
        requestQty: Number(item.quantity),
        quantity: Number(item.quantity),
      })),
    };

    console.log('Product Transfer Request Payload Submitted:', payload);

    try {
      const res: any = await createProductTransferRequest(payload);
      const response = getResponse(res);
      if (response?.success || res?.data?.success) {
        await showSuccessAlert(
          response?.message ||
          `Product Transfer Request ${requestNo} created successfully! Total ${addedItems.length} product(s) requested from PRODUCTION to FG_STORE.`,
          'Request Submitted'
        );

        setAddedItems([]);
        setSelectedProductId(null);
        setItemQty(null);
        setItemRemarks('');
        modalForm.resetFields();
        setIsModalOpen(false);
      } else {
        showWarningAlert(
          response?.message || res?.error?.data?.message || 'Failed to submit product transfer request.',
          'Submission Failed'
        );
      }
    } catch (error: any) {
      console.error('Failed to submit product transfer request:', error);
      showWarningAlert(
        error?.data?.message || 'Failed to submit request. Please try again.',
        'Submission Failed'
      );
    }
  };

  // Columns for the temporary items table inside modal (compact fonts)
  const modalItemColumns = [
    {
      title: 'SI',
      key: 'si',
      width: 45,
      align: 'center' as const,
      render: (_: any, __: any, idx: number) => (
        <span className="font-mono text-slate-500 font-semibold text-xs">{idx + 1}</span>
      ),
    },
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      width: 280,
      render: (name: string, record: TProductRequestItem) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block">{name}</span>
          {record.categoryName && (
            <span className="text-[11px] text-slate-400 block line-clamp-1">{record.categoryName}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      width: 90,
      align: 'center' as const,
      render: (unit: string) => (
        <span className="text-slate-600 font-medium text-[11px] bg-slate-100 px-2.5 py-0.5 rounded">
          {unit}
        </span>
      ),
    },
    {
      title: 'Current Stock',
      dataIndex: 'availableStock',
      key: 'availableStock',
      width: 120,
      align: 'right' as const,
      render: (stock: number | null) => (
        <span className="font-mono font-bold text-emerald-700 text-xs">
          {stock != null ? Number(stock).toLocaleString() : '-'}
        </span>
      ),
    },
    {
      title: 'Requested Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 130,
      align: 'right' as const,
      render: (qty: number) => (
        <span className="font-mono font-bold text-slate-900 text-xs">
          {qty != null ? Number(qty).toLocaleString() : '-'}
        </span>
      ),
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      render: (remarks: string) => (
        <span className="text-slate-500 text-xs truncate block max-w-[160px]">{remarks || '-'}</span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 70,
      align: 'center' as const,
      render: (_: any, record: TProductRequestItem) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined className="text-xs" />}
          onClick={() => handleRemoveItem(record.key)}
          title="Remove item"
        />
      ),
    },
  ];

  // Columns for the main voucher list table
  const voucherColumns = [
    {
      title: 'SI',
      key: 'si',
      width: 50,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (
        <span className="font-mono text-slate-500 font-semibold text-xs">{index + 1}</span>
      ),
    },
    {
      title: 'Voucher No',
      key: 'voucherNo',
      render: (_: any, record: any) => {
        const no =
          record?.voucherNo ||
          record?.requisitionNo ||
          record?.transactionInfo?.voucherNo ||
          (record?.id ? `TRANS-${record.id}` : record?.transactionId ? `TRANS-${record.transactionId}` : '-');
        return <span className="font-mono font-bold text-slate-800 text-xs">{no}</span>;
      },
    },
    {
      title: 'Date',
      key: 'date',
      render: (_: any, record: any) => {
        const rawDate = record?.date || record?.transactionInfo?.date;
        const formatted = rawDate ? dayjs(rawDate).format('DD-MMM-YYYY') : '-';
        return <span className="text-xs text-slate-700 font-medium">{formatted}</span>;
      },
    },
    {
      title: 'Type',
      key: 'voucherType',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: any) => {
        const type = record?.voucherType || record?.transactionInfo?.voucherType || 'TRANSFER';
        return (
          <Tag color="cyan" className="font-semibold text-[11px] px-2 py-0.5 m-0 rounded">
            {type}
          </Tag>
        );
      },
    },
    {
      title: 'Route',
      key: 'route',
      width: 240,
      render: (_: any, record: any) => {
        const from =
          record?.requestInventories?.[0]?.fromDepartment ||
          record?.fromDepartment ||
          record?.fromStore ||
          record?.transactionInfo?.fromDepartment ||
          'PRODUCTION';
        const to =
          record?.requestInventories?.[0]?.toDepartment ||
          record?.toDepartment ||
          record?.toStore ||
          record?.transactionInfo?.toDepartment ||
          'FG_STORE';
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Tag color="blue" className="text-[10px] m-0 px-1.5">{from}</Tag>
            <span className="text-slate-400">→</span>
            <Tag color="green" className="text-[10px] m-0 px-1.5">{to}</Tag>
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      align: 'center' as const,
      render: (status: string) => {
        const s = status?.toUpperCase() || 'PENDING';
        const color =
          s === 'APPROVED' || s === 'CONFIRMED' || s === 'ACTIVE'
            ? 'green'
            : s === 'DISPATCHED'
              ? 'purple'
              : s === 'REJECTED'
                ? 'red'
                : 'gold';
        return (
          <Tag color={color} className="font-semibold text-[11px] uppercase m-0">
            {s}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: any) => {
        return (
          <Button
            icon={<EyeOutlined />}
            size="small"
            className="text-xs font-medium"
            onClick={() => {
              const targetId = record?.id ?? record?.transactionId;
              navigate(`/dashboard/product_transfer/${targetId}`);
            }}
          >
            View
          </Button>
        );
      },
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1400px] mx-auto text-xs">
      {/* Header */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-lg">
            <SwapRightOutlined />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 m-0 tracking-tight">
                Product Transfer
              </h2>
              <Tag color="gold" className="font-semibold text-[11px] px-2 py-0.5 rounded-full m-0">
                PRODUCTION → FG_STORE
              </Tag>
            </div>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Request and transfer finished goods and products from Production to FG Store
            </p>
          </div>
        </div>

        {/* Top Right Corner Button */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenAddModal}
          className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white font-semibold text-xs px-4 h-9 rounded-lg shadow-sm"
        >
          Add Request
        </Button>
      </div>

      {/* Main List Table */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-800 m-0 uppercase tracking-wider">
              Product Transfer Requisitions
            </h3>
            <Badge
              count={`${vouchers.length} request(s)`}
              className="font-semibold text-[11px]"
              style={{ backgroundColor: '#F3F4F6', color: '#4B5563', border: '1px solid #E5E7EB' }}
            />
          </div>
        </div>

        <Table
          dataSource={vouchers}
          columns={voucherColumns}
          rowKey={(record: any) =>
            record?.id ??
            record?.voucherNo ??
            record?.requisitionNo ??
            record?.transactionId ??
            record?.transactionInfo?.voucherNo
          }
          loading={isTxLoading}
          size="small"
          scroll={{ x: 900 }}
          locale={{
            emptyText: isTxLoading
              ? 'Loading product transfer requests...'
              : 'No product transfer requests found. Click "Add Request" to create one.',
          }}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Add Request Modal (Wide 1150px, Smaller fonts, Spacious layout) */}
      <Modal
        title={
          <div className="flex items-center justify-between pr-6 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800">
                Create Product Transfer Request
              </span>
              <Tag color="gold" className="m-0 font-semibold text-[11px]">
                PRODUCTION → FG_STORE
              </Tag>
            </div>
            <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
              {requestNo}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width="min(1150px, 96vw)"
        footer={[
          <Button key="cancel" size="middle" onClick={() => setIsModalOpen(false)} className="text-xs">
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            size="middle"
            icon={<SendOutlined />}
            onClick={handleSubmitRequest}
            loading={isSubmitting}
            disabled={addedItems.length === 0 || isSubmitting}
            className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white font-semibold text-xs px-5 shadow-xs"
          >
            Submit Request ({totalModalQuantity.toLocaleString()})
          </Button>,
        ]}
      >
        <div className="space-y-3.5 pt-2 text-xs">
          {/* Voucher Header Meta */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div>
              <span className="text-slate-500 block font-semibold text-[11px] mb-1">Request Date</span>
              <DatePicker
                value={requestDate}
                onChange={d => d && setRequestDate(d)}
                format="DD-MMM-YYYY"
                style={{ width: '100%' }}
                className="rounded-lg text-xs"
              />
            </div>
            <div>
              <span className="text-slate-500 block font-semibold text-[11px] mb-1">From Department</span>
              <Input
                value="PRODUCTION"
                disabled
                className="rounded-lg font-bold text-blue-700 bg-white text-xs"
              />
            </div>
            <div>
              <span className="text-slate-500 block font-semibold text-[11px] mb-1">To Destination</span>
              <Input
                value="FG_STORE"
                disabled
                className="rounded-lg font-bold text-emerald-700 bg-white text-xs"
              />
            </div>
          </div>

          {/* Product Selector Section */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <AppstoreOutlined className="text-amber-600" /> Select & Add Products
              </span>
              <span className="text-[11px] text-slate-400">
                Choose finished goods to request for transfer from Production to FG Store
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-2.5 items-end">
              {/* 1. Product Selector */}
              <div className="md:col-span-2">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Select Product
                </label>
                <Select
                  showSearch
                  placeholder="Choose finished good / product"
                  value={selectedProductId || undefined}
                  onChange={val => {
                    setSelectedProductId(val);
                    if (!val) {
                      setItemQty(null);
                      setModalItemLiveStock(null);
                    } else {
                      const match = productOptions.find((opt: any) => opt.value === val);
                      if (match?.stock != null && match.stock > 0) {
                        setItemQty(match.stock);
                      } else {
                        setItemQty(null);
                      }
                    }
                  }}
                  loading={isProductsLoading}
                  style={{ width: '100%' }}
                  className="rounded-lg text-xs"
                  options={productOptions.map((opt: any) => ({
                    ...opt,
                    disabled: alreadyAddedIds.has(opt.value),
                  }))}
                  filterOption={(input, option) =>
                    Boolean(option?.label?.toString().toLowerCase().includes(input.toLowerCase()))
                  }
                  allowClear
                />
              </div>

              {/* 2. Available Stock */}
              <div className="md:col-span-1">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Available Stock
                </label>
                <div className="h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-evenly text-xs">
                  {isModalItemStockLoading ? (
                    <div className="w-full flex justify-center">
                      <Spin size="small" />
                    </div>
                  ) : (
                    <>
                      <span className="font-mono font-bold text-emerald-700">
                        {selectedProductId
                          ? (modalItemLiveStock != null
                            ? modalItemLiveStock.toLocaleString()
                            : (activeProductDetails?.stock != null ? activeProductDetails.stock.toLocaleString() : '0'))
                          : '-'}
                      </span>
                      <hr className='border h-full border-gray-100' />
                      <span className="text-[10px] text-slate-500 font-medium">
                        {activeProductDetails?.unit || ''}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* 3. Quantity */}
              <div className="w-full">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Qty ({activeProductDetails?.unit || 'Pcs'})
                </label>
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  step={1}
                  value={itemQty}
                  onChange={val => setItemQty(val)}
                  placeholder="0"
                  controls={false}
                  disabled={!selectedProductId}
                  className="w-full text-right font-semibold rounded-lg text-xs"
                />
              </div>

              {/* 5. Add Button */}
              <div className="">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddItemToRequest}
                  disabled={!selectedProductId || !itemQty || itemQty <= 0}
                  className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white font-semibold text-xs w-full rounded-lg h-8 flex items-center justify-center shadow-xs"
                  title="Add to request list"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Active Product Info Indicator */}
            {activeProductDetails && (
              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                <span>
                  Selected: <strong className="text-slate-700">{activeProductDetails.name}</strong>
                </span>
                {activeProductDetails.categoryName && (
                  <span>
                    • Category: <strong className="text-slate-700">{activeProductDetails.categoryName}</strong>
                  </span>
                )}
                <span>
                  • Unit: <strong className="text-slate-700">{activeProductDetails.unit}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Temporary Items Table in Modal */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-700">
                Added Products List ({addedItems.length})
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Total Qty: <strong className="text-[#C58D2F] font-mono">{totalModalQuantity.toLocaleString()}</strong>
              </span>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-200/80 bg-white">
              <Table
                dataSource={addedItems}
                columns={modalItemColumns}
                pagination={false}
                size="small"
                scroll={{ y: 240 }}
                rowKey="key"
                locale={{ emptyText: 'No products added yet. Select a product above and click "Add".' }}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductTransfer;
