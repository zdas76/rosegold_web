/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Modal,
  Tooltip,
  InputNumber,
} from 'antd';
import {
  EyeOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  InboxOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  useGetRequestAllQuery,
  useApproveRawRequestMutation,
} from '../../../redux/features/internalTranscation/internalTranscation.api';
import { useGetRowMaterialsQuery } from '../../../redux/features/rowMaterials/rowMaterials.api';
import { useGetPackingMaterialsQuery } from '../../../redux/features/packingMaterials/packingMaterials.api';
import { VoucherType } from '../../../types/types';
import { showSuccessAlert, showErrorAlert } from '../../../utils/sweetAlert';
import { getResponse } from '../../../utils/getResponse';

const RawRequestAccept: React.FC = () => {
  const navigate = useNavigate();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Quick Accept Modal states
  const [acceptModalOpen, setAcceptModalOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [approvedQuantities, setApprovedQuantities] = useState<Record<string | number, number>>({});

  // RTK Query: fetch REQUEST vouchers from /internal-transaction/request?voucherType=REQUEST
  const {
    data: internalTxRes,
    isLoading: isTxLoading,
    isFetching: isTxFetching,
    refetch,
  } = useGetRequestAllQuery(VoucherType.REQUEST);

  // Approve mutation
  const [approveRawRequest, { isLoading: isApproving }] = useApproveRawRequestMutation();

  // Master lookup data
  const { data: rawMaterialsData } = useGetRowMaterialsQuery({});
  const { data: packingMaterialsData } = useGetPackingMaterialsQuery({});

  const rawMaterialsMap = useMemo(() => {
    const map = new Map<number, string>();
    if (Array.isArray(rawMaterialsData?.data)) {
      rawMaterialsData.data.forEach((r: any) => map.set(r.id, r.name));
    }
    return map;
  }, [rawMaterialsData]);

  const packingMaterialsMap = useMemo(() => {
    const map = new Map<number, string>();
    if (Array.isArray(packingMaterialsData?.data)) {
      packingMaterialsData.data.forEach((p: any) => map.set(p.id, p.name));
    }
    return map;
  }, [packingMaterialsData]);

  // Raw vouchers array from backend
  const allVouchers: any[] = useMemo(() => {
    return Array.isArray(internalTxRes?.data) ? internalTxRes.data : [];
  }, [internalTxRes]);

  // Filtered vouchers list based on search and status
  const filteredVouchers = useMemo(() => {
    return allVouchers.filter((item: any) => {
      const voucherNo =
        item?.voucherNo ||
        item?.requestNo ||
        item?.requisitionNo ||
        item?.transactionInfo?.voucherNo ||
        (item?.id ? `REQ-${item.id}` : '');
      const status = (item?.status || 'PENDING').toUpperCase();

      // Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'PENDING' && status !== 'PENDING') return false;
        if (statusFilter === 'APPROVED' && status !== 'APPROVED' && status !== 'CONFIRMED' && status !== 'ACTIVE') return false;
        if (statusFilter === 'REJECTED' && status !== 'REJECTED') return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesNo = voucherNo.toLowerCase().includes(query);
        const matchesItems = (item?.requestInventories || item?.items || item?.rawMaterials || item?.packingMaterials || []).some(
          (inv: any) => {
            const rawId = inv?.rawId ?? inv?.raWMaterial?.id;
            const pmId = inv?.packingMaterialId ?? inv?.packingMaterial?.id;
            const name =
              inv?.raWMaterial?.name ||
              inv?.packingMaterial?.name ||
              inv?.name ||
              (rawId ? rawMaterialsMap.get(rawId) : '') ||
              (pmId ? packingMaterialsMap.get(pmId) : '') ||
              '';
            return name.toLowerCase().includes(query);
          }
        );
        return matchesNo || matchesItems;
      }

      return true;
    });
  }, [allVouchers, searchTerm, statusFilter, rawMaterialsMap, packingMaterialsMap]);

  // Statistics counts
  const stats = useMemo(() => {
    const total = allVouchers.length;
    let pending = 0;
    let approved = 0;
    let totalQty = 0;

    allVouchers.forEach((v: any) => {
      const s = (v?.status || 'PENDING').toUpperCase();
      if (s === 'APPROVED' || s === 'CONFIRMED' || s === 'ACTIVE') {
        approved += 1;
      } else if (s === 'PENDING') {
        pending += 1;
      }

      const items = v?.requestInventories || v?.items || v?.rawMaterials || v?.packingMaterials || [];
      items.forEach((it: any) => {
        const q = Number(it?.approvalQty ?? it?.requestQty ?? it?.quantity ?? 0);
        totalQty += q;
      });
    });

    return { total, pending, approved, totalQty };
  }, [allVouchers]);

  // Open Quick Accept Modal
  const handleOpenAcceptModal = (record: any) => {
    setSelectedRecord(record);
    const items = record?.requestInventories || record?.items || record?.rawMaterials || record?.packingMaterials || [];
    const initialApproved: Record<string | number, number> = {};
    items.forEach((it: any) => {
      const reqQty = Number(it?.requestQty ?? it?.quantity ?? 0);
      const appQty = it?.approvalQty != null ? Number(it.approvalQty) : reqQty;
      const rawId = it?.rawId ?? it?.raWMaterial?.id;
      const pmId = it?.packingMaterialId ?? it?.packingMaterial?.id;
      const isPM = Boolean(it?.packingMaterial || it?.packingMaterialId);
      const key = it?.id || (isPM ? `pm_${pmId}` : `raw_${rawId}`);
      initialApproved[key] = appQty;
    });
    setApprovedQuantities(initialApproved);
    setAcceptModalOpen(true);
  };

  // Submit Quick Accept
  const handleConfirmAccept = async () => {
    if (!selectedRecord) return;

    const items = selectedRecord?.requestInventories || selectedRecord?.items || selectedRecord?.rawMaterials || selectedRecord?.packingMaterials || [];
    const targetId = selectedRecord?.id || selectedRecord?.transactionId;
    const voucherNo =
      selectedRecord?.voucherNo ||
      selectedRecord?.requestNo ||
      selectedRecord?.requisitionNo ||
      selectedRecord?.transactionInfo?.voucherNo ||
      (targetId ? `REQ-${targetId}` : '-');

    const rawMaterialsList = items
      .filter((it: any) => it.rawId != null || it.raWMaterial != null || (!it.packingMaterial && !it.packingMaterialId))
      .map((it: any) => {
        const rawId = it?.rawId ?? it?.raWMaterial?.id ?? it?.id;
        const key = it?.id || `raw_${rawId}`;
        const reqQty = Number(it?.requestQty ?? it?.quantity ?? 0);
        const approvedQty = approvedQuantities[key] !== undefined ? approvedQuantities[key] : reqQty;

        return {
          id: rawId,
          rawMaterialId: rawId,
          requestInvetoryId: it?.id,
          requestInventoryId: it?.id,
          inventoryId: it?.id,
          name: it?.raWMaterial?.name || rawMaterialsMap.get(rawId) || `Raw Material #${rawId}`,
          unitId: it?.raWMaterial?.unitId ?? it?.unitId ?? null,
          requestQty: Number(reqQty),
          quantity: Number(reqQty),
          approvedQty: Number(approvedQty),
          remarks: it?.remarks || '',
        };
      });

    const packingMaterialsList = items
      .filter((it: any) => it.packingMaterialId != null || it.packingMaterial != null)
      .map((it: any) => {
        const pmId = it?.packingMaterialId ?? it?.packingMaterial?.id ?? it?.id;
        const key = it?.id || `pm_${pmId}`;
        const reqQty = Number(it?.requestQty ?? it?.quantity ?? 0);
        const approvedQty = approvedQuantities[key] !== undefined ? approvedQuantities[key] : reqQty;

        return {
          id: pmId,
          packingMaterialId: pmId,
          requestInvetoryId: it?.id,
          requestInventoryId: it?.id,
          inventoryId: it?.id,
          name: it?.packingMaterial?.name || packingMaterialsMap.get(pmId) || `Packing Material #${pmId}`,
          unitId: it?.packingMaterial?.unitId ?? it?.unitId ?? null,
          requestQty: Number(reqQty),
          quantity: Number(reqQty),
          approvedQty: Number(approvedQty),
          remarks: it?.remarks || '',
        };
      });

    const totalApproved =
      rawMaterialsList.reduce((sum: number, r: any) => sum + r.approvedQty, 0) +
      packingMaterialsList.reduce((sum: number, p: any) => sum + p.approvedQty, 0);

    const payload = {
      transactionId: targetId,
      id: targetId,
      requisitionNo: voucherNo,
      voucherNo,
      date: selectedRecord?.date ? dayjs(selectedRecord.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      fromDepartment: selectedRecord?.fromDepartment || 'PRODUCTION',
      toDepartment: selectedRecord?.toDepartment || 'PURCHASE',
      status: 'APPROVED',
      totalQuantity: totalApproved,
      rawMaterials: rawMaterialsList,
      packingMaterials: packingMaterialsList,
    };

    console.log('Accept Raw Request Payload (/internal-transaction/raw-approve):', payload);

    try {
      const res: any = await approveRawRequest(payload);
      const response = getResponse(res);
      if (response?.success || res?.data?.success) {
        await showSuccessAlert(
          `Raw Material Request ${voucherNo} accepted and approved successfully!`,
          'Request Accepted'
        );
        setAcceptModalOpen(false);
        refetch();
      } else {
        await showSuccessAlert(
          response?.message || 'Raw request accepted successfully!',
          'Accepted'
        );
        setAcceptModalOpen(false);
        refetch();
      }
    } catch (err: any) {
      console.error('Failed to accept request:', err);
      showErrorAlert(
        err?.data?.message || err?.message || 'Failed to accept request. Please try again.',
        'Accept Failed'
      );
    }
  };

  const getStatusTag = (status: string) => {
    const s = (status || 'PENDING').toUpperCase();
    if (s === 'APPROVED' || s === 'CONFIRMED' || s === 'ACTIVE') {
      return (
        <Tag color="green" className="text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase">
          Approved
        </Tag>
      );
    }
    if (s === 'REJECTED') {
      return (
        <Tag color="red" className="text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase">
          Rejected
        </Tag>
      );
    }
    return (
      <Tag color="gold" className="text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase">
        Pending
      </Tag>
    );
  };

  const columns = [
    {
      title: 'SI',
      key: 'si',
      width: 55,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (
        <span className="font-mono text-xs font-semibold text-slate-500">{index + 1}</span>
      ),
    },
    {
      title: 'Request No',
      key: 'voucherNo',
      render: (_: any, record: any) => {
        const no =
          record?.voucherNo ||
          record?.requestNo ||
          record?.requisitionNo ||
          record?.transactionInfo?.voucherNo ||
          (record?.id ? `REQ-${record.id}` : '-');
        return (
          <div className="flex flex-col">
            <span className="font-mono font-bold text-xs text-slate-800 hover:text-[#C58D2F] transition-colors">
              {no}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">ID: #{record?.id}</span>
          </div>
        );
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: any, record: any) => {
        const d = date || record?.createdAt || record?.transactionInfo?.date;
        return (
          <span className="text-xs text-slate-600 font-medium">
            {d ? dayjs(d).format('DD-MMM-YYYY') : '-'}
          </span>
        );
      },
    },
    {
      title: 'Route',
      key: 'route',
      width: 220,
      render: (_: any, record: any) => {
        const from = record?.fromDepartment || 'PRODUCTION';
        const to = record?.toDepartment || 'PURCHASE';
        return (
          <div className="flex items-center gap-1.5 text-[11px]">
            <Tag color="blue" className="text-[10px] m-0 px-1.5 font-semibold">
              {from}
            </Tag>
            <ArrowRightOutlined className="text-slate-400 text-[10px]" />
            <Tag color="gold" className="text-[10px] m-0 px-1.5 font-semibold">
              {to}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Items',
      key: 'itemsCount',
      width: 140,
      render: (_: any, record: any) => {
        const items = record?.requestInventories || record?.items || record?.rawMaterials || record?.packingMaterials || [];
        const count = items.length;
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700 text-xs">{count} item(s)</span>
          </div>
        );
      },
    },
    {
      title: 'Total Qty',
      key: 'totalQty',
      align: 'right' as const,
      width: 120,
      render: (_: any, record: any) => {
        const items = record?.requestInventories || record?.items || record?.rawMaterials || record?.packingMaterials || [];
        const sum = items.reduce(
          (acc: number, it: any) => acc + Number(it?.approvalQty ?? it?.requestQty ?? it?.quantity ?? 0),
          0
        );
        return (
          <span className="font-mono font-bold text-xs text-[#C58D2F]">
            {sum.toLocaleString()}
          </span>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center' as const,
      width: 110,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center' as const,
      width: 180,
      render: (_: any, record: any) => {
        const s = (record?.status || 'PENDING').toUpperCase();
        const isApproved = s === 'APPROVED' || s === 'CONFIRMED' || s === 'ACTIVE';

        return (
          <div className="flex items-center justify-center gap-1.5" onClick={e => e.stopPropagation()}>
            <Tooltip title="View raw request details">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/dashboard/raw-request-accept/${record.id}`)}
                className="text-xs font-semibold rounded-lg h-7"
              >
                Details
              </Button>
            </Tooltip>
            {!isApproved && (
              <Tooltip title="Accept & approve requisition">
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleOpenAcceptModal(record)}
                  className="bg-emerald-600 hover:bg-emerald-500 border-none text-white text-xs font-semibold rounded-lg h-7 shadow-xs"
                >
                  Accept
                </Button>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1400px] mx-auto text-xs">
      {/* Top Banner Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-[#C58D2F] flex items-center justify-center font-bold text-xl">
            <ShoppingOutlined />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 m-0 tracking-tight">
              Raw Request Accept
            </h1>
            <p className="text-xs text-slate-400 m-0 mt-0.5">
              Review and accept raw material requests from Production into Purchase Department
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isTxFetching}
            className="rounded-lg h-9 text-xs font-semibold"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-medium">Total Requests</span>
            <InboxOutlined className="text-slate-400 text-base" />
          </div>
          <span className="font-mono font-bold text-xl text-slate-800 mt-2 block">
            {stats.total}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-amber-700 text-xs font-semibold">Pending Requests</span>
            <ClockCircleOutlined className="text-amber-600 text-base" />
          </div>
          <span className="font-mono font-bold text-xl text-amber-700 mt-2 block">
            {stats.pending}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-2xs bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-emerald-700 text-xs font-semibold">Approved Requests</span>
            <CheckCircleOutlined className="text-emerald-600 text-base" />
          </div>
          <span className="font-mono font-bold text-xl text-emerald-700 mt-2 block">
            {stats.approved}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-medium">Total Requested Qty</span>
            <ShoppingOutlined className="text-[#C58D2F] text-base" />
          </div>
          <span className="font-mono font-bold text-xl text-[#C58D2F] mt-2 block">
            {stats.totalQty.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)] space-y-4">
        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              prefix={<SearchOutlined className="text-slate-400 mr-1" />}
              placeholder="Search by Request No or Material Name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              allowClear
              className="rounded-lg h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <Select
              value={statusFilter}
              onChange={val => setStatusFilter(val)}
              className="w-36 text-xs"
              options={[
                { value: 'ALL', label: 'All Requests' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'REJECTED', label: 'Rejected' },
              ]}
            />
          </div>
        </div>

        {/* Requisitions Table */}
        <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
          <Table
            dataSource={filteredVouchers}
            columns={columns}
            rowKey={record => record.id || `req_${Math.random()}`}
            loading={isTxLoading}
            size="small"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: total => `Total ${total} request(s)`,
            }}
            onRow={record => ({
              onClick: () => navigate(`/dashboard/raw-request-accept/${record.id}`),
              className: 'cursor-pointer hover:bg-slate-50/70 transition-colors',
            })}
          />
        </div>
      </div>

      {/* Quick Accept Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <CheckCircleOutlined className="text-emerald-600" />
            <span>Accept Raw Material Request: {selectedRecord?.voucherNo || selectedRecord?.requestNo || `REQ-${selectedRecord?.id}`}</span>
          </div>
        }
        open={acceptModalOpen}
        onCancel={() => setAcceptModalOpen(false)}
        onOk={handleConfirmAccept}
        confirmLoading={isApproving}
        okText="Confirm & Accept"
        okButtonProps={{ className: 'bg-emerald-600 hover:bg-emerald-500 font-semibold' }}
        width={700}
        destroyOnClose
      >
        <div className="py-3 space-y-4 text-xs">
          <p className="text-slate-600 m-0">
            You are about to accept and approve this raw material request from Production into Purchase Department.
          </p>

          <div className="border border-slate-200/80 rounded-xl overflow-hidden">
            <Table
              dataSource={selectedRecord?.requestInventories || selectedRecord?.items || selectedRecord?.rawMaterials || selectedRecord?.packingMaterials || []}
              pagination={false}
              size="small"
              rowKey={(it: any, i) => it?.id || `modal_item_${i}`}
              columns={[
                {
                  title: 'Material Name',
                  key: 'name',
                  render: (_: any, it: any) => {
                    const rawId = it?.rawId ?? it?.raWMaterial?.id;
                    const pmId = it?.packingMaterialId ?? it?.packingMaterial?.id;
                    return (
                      <span className="font-semibold text-slate-800">
                        {it?.raWMaterial?.name || it?.packingMaterial?.name || it?.name || (rawId ? rawMaterialsMap.get(rawId) : '') || (pmId ? packingMaterialsMap.get(pmId) : '') || `Item #${it?.id}`}
                      </span>
                    );
                  },
                },
                {
                  title: 'Requested Qty',
                  key: 'reqQty',
                  width: 130,
                  align: 'right' as const,
                  render: (_: any, it: any) => (
                    <span className="font-mono font-bold text-slate-700">
                      {Number(it?.requestQty ?? it?.quantity ?? 0).toLocaleString()}
                    </span>
                  ),
                },
                {
                  title: 'Approved Qty',
                  key: 'approvedQty',
                  width: 150,
                  align: 'right' as const,
                  render: (_: any, it: any) => {
                    const rawId = it?.rawId ?? it?.raWMaterial?.id;
                    const pmId = it?.packingMaterialId ?? it?.packingMaterial?.id;
                    const isPM = Boolean(it?.packingMaterial || it?.packingMaterialId);
                    const key = it?.id || (isPM ? `pm_${pmId}` : `raw_${rawId}`);
                    const val = approvedQuantities[key] ?? Number(it?.requestQty ?? it?.quantity ?? 0);

                    return (
                      <InputNumber
                        min={0}
                        step={1}
                        value={val}
                        onChange={v => setApprovedQuantities(prev => ({ ...prev, [key]: Number(v) || 0 }))}
                        className="w-28 text-right font-mono font-bold text-xs rounded-lg"
                      />
                    );
                  },
                },
              ]}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RawRequestAccept;
