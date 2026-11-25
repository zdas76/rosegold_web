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
  InboxOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGetRowMaterialsQuery } from '../../../redux/features/rowMaterials/rowMaterials.api';
import { useGetPackingMaterialsQuery } from '../../../redux/features/packingMaterials/packingMaterials.api';
import {
  useCreateRawRequestMutation,
  useGetRequestAllQuery,
} from '../../../redux/features/internalTranscation/internalTranscation.api';
import { useGetUnitsQuery } from '../../../redux/features/unit/unit.api';
import { useLazyGetTotalQuantityAndUnitPriceQuery } from '../../../redux/features/transactions/transactons.api';
import { useLocalUser } from '../../../hook/useLocalUser';
import { showSuccessAlert, showWarningAlert } from '../../../utils/sweetAlert';
import { getResponse } from '../../../utils/getResponse';
import { VoucherType } from '../../../types/types';



export type TItemType = 'RAW' | 'PACKING_MATERIAL';

export interface TRequestItem {
  key: string;
  itemType: TItemType;
  itemId: number;
  itemName: string;
  unit: string;
  unitId?: number | null;
  quantity: number;
  availableStock?: number | null;
  remarks?: string;
}

export interface TTransactionInfo {
  date: string;
  voucherNo: string;
  voucherType: string;
  fromDepartment?: string;
  toDepartment?: string;
}

export interface TRequestVoucher {
  id?: string | number;
  voucherNo?: string;
  date?: string;
  status: 'PENDING' | 'APPROVED' | 'DISPATCHED' | 'REJECTED' | string;
  voucherType?: string;
  transactionId?: number;
  transactionInfo?: TTransactionInfo;
  requestNo?: string;
  fromDepartment?: 'PRODUCTION' | string;
  toDepartment?: 'RMPM_STORE' | string;
  rawMaterials?: any[];
  packingMaterials?: any[];
  items?: TRequestItem[];
  totalQty?: number;
  remarks?: string;
  createdAt?: string;
}

const generateRequestNo = () => {
  const dateStr = dayjs().format('YYYYMMDD');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `REQ-RAW-${dateStr}-${randomPart}`;
};

const RequestRaw: React.FC = () => {
  const navigate = useNavigate();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Queries for items & units
  const { data: rawMaterialsData, isLoading: isRawLoading } = useGetRowMaterialsQuery({});
  const { data: packingMaterialsData, isLoading: isPMLoading } = useGetPackingMaterialsQuery({});
  const { data: unitsData } = useGetUnitsQuery({});

  const unitsMap = useMemo(() => {
    const map = new Map<number, string>();
    if (Array.isArray(unitsData?.data)) {
      unitsData.data.forEach((u: any) => map.set(u.id, u.name));
    }
    return map;
  }, [unitsData]);

  // Raw Materials options
  const rawMaterialOptions = useMemo(() => {
    const list = Array.isArray(rawMaterialsData?.data) ? rawMaterialsData.data : [];
    return list.map((item: any) => ({
      value: item.id,
      label: item.name,
      name: item.name,
      unit: item.unit?.name || item.unitName || 'Kg',
      unitId: item.unitId ?? item.unit?.id ?? null,
      stock: item.quantity != null ? Number(item.quantity) : 0,
    }));
  }, [rawMaterialsData]);

  // Packing Materials options
  const packingMaterialOptions = useMemo(() => {
    const list = Array.isArray(packingMaterialsData?.data) ? packingMaterialsData.data : [];
    return list.map((item: any) => ({
      value: item.id,
      label: item.name,
      name: item.name,
      unit: item.unit?.name || item.unitName || 'Pcs',
      unitId: item.unitId ?? item.unit?.id ?? null,
      stock: item.quantity != null ? Number(item.quantity) : 0,
    }));
  }, [packingMaterialsData]);

  // Internal Transaction API hooks
  const [createInternalTransaction, { isLoading: isSubmitting }] =
    useCreateRawRequestMutation();
  const { data: internalTxRes, isLoading: isTxLoading } =
    useGetRequestAllQuery(VoucherType.REQUEST);

  // Live stock hook for item selector in Add Modal
  const [triggerGetTotalQuantity] = useLazyGetTotalQuantityAndUnitPriceQuery();
  const { department } = useLocalUser();

  // Voucher history list (fetched from backend API)
  const vouchers: TRequestVoucher[] = useMemo(() => {
    return Array.isArray(internalTxRes?.data) ? internalTxRes.data : [];
  }, [internalTxRes]);

  // Form states inside modal
  const [modalForm] = Form.useForm();
  const [requestNo, setRequestNo] = useState<string>(generateRequestNo());
  const [requestDate, setRequestDate] = useState<dayjs.Dayjs>(dayjs());
  const [generalRemarks, setGeneralRemarks] = useState<string>('');

  // Item builder states inside modal
  const [selectedItemType, setSelectedItemType] = useState<TItemType>('RAW');
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [itemQty, setItemQty] = useState<number | null>(null);
  const [itemRemarks, setItemRemarks] = useState<string>('');
  const [addedItems, setAddedItems] = useState<TRequestItem[]>([]);
  const [modalItemLiveStock, setModalItemLiveStock] = useState<number | null>(null);
  const [isModalItemStockLoading, setIsModalItemStockLoading] = useState<boolean>(false);

  // Fetch live stock for selected item in Add Modal
  useEffect(() => {
    if (!selectedItemId || !isModalOpen) {
      setModalItemLiveStock(null);
      return;
    }

    let isCurrent = true;
    setIsModalItemStockLoading(true);

    const fetchStock = async () => {
      try {
        const res = await triggerGetTotalQuantity(
          selectedItemType === 'RAW'
            ? { itemType: 'raw', rawId: String(selectedItemId), department }
            : { itemType: 'pmmaterial', packingMaterialId: Number(selectedItemId), department }
        ).unwrap();

        if (isCurrent) {
          const qty =
            res?.data?.netQuantity != null
              ? Number(res.data.netQuantity)
              : res?.data?.totalQuantity != null
                ? Number(res.data.totalQuantity)
                : null;
          setModalItemLiveStock(qty);
        }
      } catch (err) {
        console.error('Failed to fetch modal item stock:', err);
        if (isCurrent) setModalItemLiveStock(null);
      } finally {
        if (isCurrent) setIsModalItemStockLoading(false);
      }
    };

    fetchStock();

    return () => {
      isCurrent = false;
    };
  }, [selectedItemId, selectedItemType, isModalOpen, triggerGetTotalQuantity]);

  // Currently selected item details
  const activeItemDetails = useMemo(() => {
    if (!selectedItemId) return null;
    if (selectedItemType === 'RAW') {
      return rawMaterialOptions.find((opt: any) => opt.value === selectedItemId) || null;
    }
    return packingMaterialOptions.find((opt: any) => opt.value === selectedItemId) || null;
  }, [selectedItemId, selectedItemType, rawMaterialOptions, packingMaterialOptions]);

  // Set of already added item IDs for the selected type to prevent duplicate in same request
  const alreadyAddedIds = useMemo(() => {
    return new Set(
      addedItems
        .filter(item => item.itemType === selectedItemType)
        .map(item => item.itemId)
    );
  }, [addedItems, selectedItemType]);

  // Summary calculations inside modal
  const totalModalQuantity = useMemo(() => {
    return addedItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [addedItems]);

  // Open "Add Request" modal
  const handleOpenAddModal = () => {
    setRequestNo(generateRequestNo());
    setRequestDate(dayjs());
    setGeneralRemarks('');
    setSelectedItemType('RAW');
    setSelectedItemId(null);
    setItemQty(null);
    setItemRemarks('');
    setAddedItems([]);
    setModalItemLiveStock(null);
    modalForm.resetFields();
    setIsModalOpen(true);
  };

  // Add item to temporary table inside modal
  const handleAddItemToRequest = () => {
    if (!selectedItemId || !activeItemDetails) {
      showWarningAlert('Please select an item first.', 'No Item Selected');
      return;
    }

    if (!itemQty || itemQty <= 0) {
      showWarningAlert('Please enter a valid quantity greater than 0.', 'Invalid Quantity');
      return;
    }

    const newItem: TRequestItem = {
      key: `${selectedItemType}-${selectedItemId}-${Date.now()}`,
      itemType: selectedItemType,
      itemId: selectedItemId,
      itemName: activeItemDetails.name,
      unit: activeItemDetails.unit,
      unitId: activeItemDetails.unitId,
      quantity: itemQty,
      availableStock: modalItemLiveStock ?? activeItemDetails.stock,
      remarks: itemRemarks || '',
    };

    setAddedItems(prev => [...prev, newItem]);

    // Reset item selector fields
    setSelectedItemId(null);
    setItemQty(null);
    setItemRemarks('');
  };

  // Remove item from temporary table inside modal
  const handleRemoveItem = (key: string) => {
    setAddedItems(prev => prev.filter(item => item.key !== key));
  };

  // Submit the request voucher
  const handleSubmitRequest = async () => {
    if (addedItems.length === 0) {
      showWarningAlert(
        'Please add at least one raw material or packing material to the request list before submitting.',
        'No Items Added'
      );
      return;
    }

    const rawMaterialsList = addedItems
      .filter(item => item.itemType === 'RAW')
      .map(item => ({
        rawMaterialId: item.itemId,
        id: item.itemId,
        name: item.itemName,
        unitId: item.unitId,
        quantity: item.quantity,
        remarks: item.remarks || '',
      }));

    const packingMaterialsList = addedItems
      .filter(item => item.itemType === 'PACKING_MATERIAL')
      .map(item => ({
        packingMaterialId: item.itemId,
        id: item.itemId,
        name: item.itemName,
        unitId: item.unitId,
        quantity: item.quantity,
        remarks: item.remarks || '',
      }));

    const payload = {
      requestNo,
      date: requestDate.format('YYYY-MM-DD'),
      fromDepartment: 'PRODUCTION',
      toDepartment: 'RMPM_STORE',
      remarks: generalRemarks,
      totalQuantity: totalModalQuantity,
      rawMaterials: rawMaterialsList,
      packingMaterials: packingMaterialsList,
    };

    console.log('Request Raw Material Payload Submitted:', payload);

    try {
      const res: any = await createInternalTransaction(payload);
      const response = getResponse(res);
      if (response?.success || res?.data?.success) {
        await showSuccessAlert(
          `Material Request ${requestNo} created successfully! Total ${addedItems.length} item(s) requested from PRODUCTION to RMPM_STORE.`,
          'Request Submitted'
        );

        // Reset item selector & added list, close modal
        setAddedItems([]);
        setSelectedItemId(null);
        setItemQty(null);
        setItemRemarks('');
        setGeneralRemarks('');
        modalForm.resetFields();
        setIsModalOpen(false);
      }
    } catch (error: any) {
      console.error('Failed to submit internal transaction:', error);
      showWarningAlert(
        error?.data?.message || 'Failed to submit request. Please try again.',
        'Submission Failed'
      );
    }
    setSelectedItemId(null);
    setItemQty(null);
    setItemRemarks('');
    setIsModalOpen(false);
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
      title: 'Type',
      dataIndex: 'itemType',
      key: 'itemType',
      width: 120,
      render: (type: TItemType) => (
        <Tag color={type === 'RAW' ? 'blue' : 'orange'} className="font-semibold text-[11px] px-2 py-0.5 m-0 rounded">
          {type === 'RAW' ? 'Raw Material' : 'Packing Material'}
        </Tag>
      ),
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
      width: 280,
      render: (name: string) => <span className="font-semibold text-slate-800 text-xs">{name}</span>,
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
      align: 'center' as const,
      render: (unit: string) => (
        <span className="text-slate-600 font-medium text-[11px] bg-slate-100 px-2.5 py-0.5 rounded">
          {unit}
        </span>
      ),
    },
    {
      title: 'Requested Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 140,
      align: 'center' as const,
      render: (qty: number, record: TRequestItem) => {
        const val = qty != null ? qty : record?.quantity;
        return (
          <span className="font-mono font-bold text-slate-900 text-xs">
            {val != null ? Number(val).toLocaleString() : '-'}
          </span>
        );
      },
    },
    {
      title: '',
      key: 'spacer',
      render: () => null,
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: TRequestItem) => (
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
          record?.transactionInfo?.voucherNo ||
          record?.requestNo ||
          (record?.id ? `REQ-${record.id}` : record?.transactionId ? `REQ-${record.transactionId}` : '-');
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
        const type = record?.voucherType || record?.transactionInfo?.voucherType || 'REQUEST';
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
      width: 220,
      render: (_: any, record: any) => {
        const from =
          record?.fromDepartment || record?.transactionInfo?.fromDepartment || 'PRODUCTION';
        const to =
          record?.toDepartment || record?.transactionInfo?.toDepartment || 'RMPM_STORE';
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Tag color="blue" className="text-[10px] m-0 px-1.5">{from}</Tag>
            <span className="text-slate-400">→</span>
            <Tag color="gold" className="text-[10px] m-0 px-1.5">{to}</Tag>
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
        const color =
          status === 'APPROVED' || status === 'CONFIRMED' || status === 'ACTIVE'
            ? 'green'
            : status === 'DISPATCHED'
              ? 'purple'
              : status === 'REJECTED'
                ? 'red'
                : 'gold';
        return (
          <Tag color={color} className="font-semibold text-[11px] uppercase m-0">
            {status || 'PENDING'}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 75,
      align: 'center' as const,
      render: (_: any, record: any) => {
        const targetId = record?.transactionId ?? record?.id;
        return (
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => navigate(`/dashboard/request-raw/${targetId}`)}
            className="text-xs font-medium"
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
            <InboxOutlined />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 m-0 tracking-tight">
                Request Raw
              </h2>
              <Tag color="gold" className="font-semibold text-[11px] px-2 py-0.5 rounded-full m-0">
                PRODUCTION → RMPM_STORE
              </Tag>
            </div>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Request raw materials and packaging materials from Production Store to RMPM Store
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
              Requested Material Vouchers
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
          rowKey={(record: any) => record?.id ?? record?.voucherNo ?? record?.transactionId ?? record?.transactionInfo?.voucherNo}
          loading={isTxLoading}
          size="small"
          scroll={{ x: 900 }}
          locale={{
            emptyText: isTxLoading
              ? 'Loading material requests...'
              : 'No material requests found. Click "Add Request" to create one.',
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
                Create Raw & Packing Material Request
              </span>
              <Tag color="gold" className="m-0 font-semibold text-[11px]">
                PRODUCTION → RMPM_STORE
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
              <span className="text-slate-500 block font-semibold text-[11px] mb-1">To Department</span>
              <Input
                value="RMPM_STORE"
                disabled
                className="rounded-lg font-bold text-amber-700 bg-white text-xs"
              />
            </div>
          </div>

          {/* Item Selector Section */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <AppstoreOutlined className="text-amber-600" /> Select & Add Materials
              </span>
              <span className="text-[11px] text-slate-400">
                You can add multiple raw materials and packing materials to this request
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 items-end">
              {/* 1. Item Type */}
              <div className="">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Item Type
                </label>
                <Select
                  value={selectedItemType}
                  onChange={type => {
                    setSelectedItemType(type);
                    setSelectedItemId(null);
                  }}
                  style={{ width: '100%' }}
                  className="rounded-lg text-xs font-medium"
                  options={[
                    { value: 'RAW', label: 'Raw Material' },
                    { value: 'PACKING_MATERIAL', label: 'Packing Material' },
                  ]}
                />
              </div>

              {/* 2. Item Selector */}
              <div className="">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Select {selectedItemType === 'RAW' ? 'Raw Material' : 'Packing Material'}
                </label>
                <Select
                  showSearch
                  placeholder={`Choose ${selectedItemType === 'RAW' ? 'raw material' : 'packing material'}`}
                  value={selectedItemId || undefined}
                  onChange={val => setSelectedItemId(val)}
                  loading={selectedItemType === 'RAW' ? isRawLoading : isPMLoading}
                  style={{ width: '100%' }}
                  className="rounded-lg text-xs"
                  options={(selectedItemType === 'RAW' ? rawMaterialOptions : packingMaterialOptions).map(
                    (opt: any) => ({
                      ...opt,
                      disabled: alreadyAddedIds.has(opt.value),
                    })
                  )}
                  filterOption={(input, option) =>
                    Boolean(option?.label?.toString().toLowerCase().includes(input.toLowerCase()))
                  }
                  allowClear
                />
              </div>

              {/* 3. Quantity */}
              <div className="">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Qty ({activeItemDetails?.unit || 'Units'})
                </label>
                <InputNumber
                  min={1}
                  step={1}
                  value={itemQty}
                  onChange={val => setItemQty(val)}
                  placeholder="0"
                  controls={false}
                  disabled={!selectedItemId}
                  className="w-full text-right font-semibold rounded-lg text-xs"
                />
              </div>

              {/* 5. Add Button */}
              <div className="md:col-span-1">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddItemToRequest}
                  disabled={!selectedItemId || !itemQty || itemQty <= 0}
                  className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white font-semibold text-xs w-full rounded-lg h-8 flex items-center justify-center shadow-xs"
                  title="Add to request list"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Active Item Stock Indicator */}
            {activeItemDetails && (
              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                <span>Selected: <strong className="text-slate-700">{activeItemDetails.name}</strong></span>
                <span>• Unit: <strong className="text-slate-700">{activeItemDetails.unit}</strong></span>
                <span>
                  • Current Stock:{' '}
                  {isModalItemStockLoading ? (
                    <Spin size="small" className="ml-1" />
                  ) : (
                    <strong className="text-emerald-700 font-mono">
                      {modalItemLiveStock != null
                        ? modalItemLiveStock.toLocaleString()
                        : (activeItemDetails.stock != null ? activeItemDetails.stock.toLocaleString() : '-')}
                    </strong>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Temporary Items Table in Modal */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-700">
                Added Items List ({addedItems.length})
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
                locale={{ emptyText: 'No items added yet. Select an item above and click "Add".' }}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RequestRaw;
