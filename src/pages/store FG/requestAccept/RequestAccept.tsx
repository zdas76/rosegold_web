/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Badge,
  Modal,
  Tooltip,
  InputNumber,
  Spin,
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
  useApproveProductRequestMutation,
} from '../../../redux/features/internalTranscation/internalTranscation.api';
import { useGetProductsQuery } from '../../../redux/features/product/product.api';
import { VoucherType } from '../../../types/types';
import { showSuccessAlert, showWarningAlert, showErrorAlert } from '../../../utils/sweetAlert';
import { getResponse } from '../../../utils/getResponse';

const RequestAccept: React.FC = () => {
  const navigate = useNavigate();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Quick Accept Modal states
  const [acceptModalOpen, setAcceptModalOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [approvedQuantities, setApprovedQuantities] = useState<Record<string | number, number>>({});

  // RTK Query: fetch TRANSFER requests from /internal-transaction/request?voucherType=TRANSFER
  const {
    data: internalTxRes,
    isLoading: isTxLoading,
    isFetching: isTxFetching,
    refetch,
  } = useGetRequestAllQuery(VoucherType.TRANSFER);

  // Approve mutation
  const [approveProductRequest, { isLoading: isApproving }] = useApproveProductRequestMutation();

  // Master products for fallback labels
  const { data: productsData } = useGetProductsQuery({});
  const productsMap = useMemo(() => {
    const map = new Map<number, string>();
    if (Array.isArray(productsData?.data)) {
      productsData.data.forEach((p: any) => map.set(p.id, p.name));
    }
    return map;
  }, [productsData]);

  // Raw vouchers array from backend
  const allVouchers: any[] = useMemo(() => {
    return Array.isArray(internalTxRes?.data) ? internalTxRes.data : [];
  }, [internalTxRes]);

  // Filtered vouchers list based on search and status
  const filteredVouchers = useMemo(() => {
    return allVouchers.filter((item: any) => {
      const voucherNo =
        item?.voucherNo ||
        item?.requisitionNo ||
        item?.transactionInfo?.voucherNo ||
        (item?.id ? `TRANS-${item.id}` : '');
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
        const matchesItems = (item?.requestInventories || item?.items || item?.products || []).some(
          (inv: any) => {
            const pName =
              inv?.product?.name ||
              inv?.productName ||
              (inv?.productId ? productsMap.get(inv.productId) : '') ||
              '';
            return pName.toLowerCase().includes(query);
          }
        );
        return matchesNo || matchesItems;
      }

      return true;
    });
  }, [allVouchers, searchTerm, statusFilter, productsMap]);

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

      const items = v?.requestInventories || v?.items || v?.products || [];
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
    const items = record?.requestInventories || record?.items || record?.products || [];
    const initialApproved: Record<string | number, number> = {};
    items.forEach((it: any) => {
      const reqQty = Number(it?.requestQty ?? it?.quantity ?? 0);
      const appQty = it?.approvalQty != null ? Number(it.approvalQty) : reqQty;
      const key = it?.id || it?.productId;
      initialApproved[key] = appQty;
    });
    setApprovedQuantities(initialApproved);
    setAcceptModalOpen(true);
  };

  // Submit Quick Accept
  const handleConfirmAccept = async () => {
    if (!selectedRecord) return;

    const items = selectedRecord?.requestInventories || selectedRecord?.items || selectedRecord?.products || [];
    const targetId = selectedRecord?.id || selectedRecord?.transactionId;
    const voucherNo =
      selectedRecord?.voucherNo ||
      selectedRecord?.requisitionNo ||
      selectedRecord?.transactionInfo?.voucherNo ||
      (targetId ? `TRANS-${targetId}` : '-');

    const mappedProducts = items.map((it: any) => {
      const pId = it?.productId || it?.product?.id || it?.id;
      const pName = it?.product?.name || it?.productName || productsMap.get(pId) || `Product #${pId}`;
      const key = it?.id || it?.productId;
      const reqQty = Number(it?.requestQty ?? it?.quantity ?? 0);
      const approvedQty = approvedQuantities[key] !== undefined ? approvedQuantities[key] : reqQty;

      return {
        id: pId,
        productId: pId,
        requestInvetoryId: it?.id,
        requestInventoryId: it?.id,
        inventoryId: it?.id,
        productName: pName,
        unitId: it?.product?.unitId ?? it?.unitId ?? null,
        requestQty: Number(reqQty),
        quantity: Number(reqQty),
        approvedQty: Number(approvedQty),
        remarks: it?.remarks || '',
      };
    });

    const totalApproved = mappedProducts.reduce((sum: number, p: any) => sum + p.approvedQty, 0);

    const payload = {
      transactionId: targetId,
      id: targetId,
      requisitionNo: voucherNo,
      voucherNo,
      date: selectedRecord?.date ? dayjs(selectedRecord.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      fromDepartment: selectedRecord?.fromDepartment || 'PRODUCTION',
      toDepartment: selectedRecord?.toDepartment || 'FG_STORE',
      status: 'APPROVED',
      totalQuantity: totalApproved,
      products: mappedProducts,
    };

    try {
      const res: any = await approveProductRequest(payload);
      const response = getResponse(res);
      if (response?.success || res?.data?.success) {
        await showSuccessAlert(
          `Product Transfer Request ${voucherNo} accepted and approved successfully!`,
          'Request Accepted'
        );
        setAcceptModalOpen(false);
        refetch();
      } else {
        await showSuccessAlert(
          response?.message || 'Transfer request accepted successfully!',
          'Accepted'
        );
        setAcceptModalOpen(false);
        refetch();
      }
    } catch (err: any) {
      console.error('Failed to accept request:', err);
      showErrorAlert(
        err?.data?.message || 'Failed to accept product transfer request. Please try again.',
        'Acceptance Failed'
      );
    }
  };

  // Main table columns
  const columns = [
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
      width: 170,
      render: (_: any, record: any) => {
        const no =
          record?.voucherNo ||
          record?.requisitionNo ||
          record?.transactionInfo?.voucherNo ||
          (record?.id ? `TRANS-${record.id}` : record?.transactionId ? `TRANS-${record.transactionId}` : '-');
        return (
          <div>
            <span className="font-mono font-bold text-slate-800 text-xs block">{no}</span>
            <span className="text-[10px] text-slate-400 font-mono">ID: {record?.id || record?.transactionId || '-'}</span>
          </div>
        );
      },
    },
    {
      title: 'Date',
      key: 'date',
      width: 110,
      render: (_: any, record: any) => {
        const rawDate = record?.date || record?.transactionInfo?.date || record?.createdAt;
        const formatted = rawDate ? dayjs(rawDate).format('DD-MMM-YYYY') : '-';
        return <span className="text-xs text-slate-700 font-medium">{formatted}</span>;
      },
    },
    {
      title: 'Route',
      key: 'route',
      width: 220,
      render: (_: any, record: any) => {
        const from =
          record?.requestInventories?.[0]?.fromDepartment ||
          record?.fromDepartment ||
          record?.fromStore ||
          'PRODUCTION';
        const to =
          record?.requestInventories?.[0]?.toDepartment ||
          record?.toDepartment ||
          record?.toStore ||
          'FG_STORE';
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Tag color="blue" className="text-[10px] m-0 px-2 py-0.5 rounded font-mono">
              {from}
            </Tag>
            <ArrowRightOutlined className="text-slate-400 text-[10px]" />
            <Tag color="green" className="text-[10px] m-0 px-2 py-0.5 rounded font-mono">
              {to}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Transferred Products',
      key: 'products',
      render: (_: any, record: any) => {
        const items = record?.requestInventories || record?.items || record?.products || [];
        if (!items || items.length === 0) {
          return <span className="text-slate-400 italic text-xs">No products listed</span>;
        }

        const previewItems = items.slice(0, 2);
        const remaining = items.length - 2;

        return (
          <div className="space-y-1">
            {previewItems.map((it: any, idx: number) => {
              const pId = it?.productId || it?.product?.id;
              const name = it?.product?.name || it?.productName || productsMap.get(pId) || `Item #${pId || idx + 1}`;
              const qty = Number(it?.approvalQty ?? it?.requestQty ?? it?.quantity ?? 0);
              const unit = it?.product?.unit?.name || it?.unit || 'Pcs';
              return (
                <div key={idx} className="flex items-center gap-1.5 text-xs">
                  <span className="font-medium text-slate-800 line-clamp-1 max-w-[200px]">{name}</span>
                  <span className="text-slate-400 text-[11px] font-mono">× {qty} {unit}</span>
                </div>
              );
            })}
            {remaining > 0 && (
              <Tooltip
                title={items
                  .slice(2)
                  .map((it: any) => {
                    const name = it?.product?.name || it?.productName || `Item #${it?.productId}`;
                    const qty = it?.approvalQty ?? it?.requestQty ?? it?.quantity;
                    return `${name} (${qty})`;
                  })
                  .join(', ')}
              >
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 cursor-pointer">
                  +{remaining} more product(s)
                </span>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: 'Total Qty',
      key: 'totalQty',
      width: 110,
      align: 'right' as const,
      render: (_: any, record: any) => {
        const items = record?.requestInventories || record?.items || record?.products || [];
        const sum = items.reduce(
          (acc: number, it: any) => acc + Number(it?.approvalQty ?? it?.requestQty ?? it?.quantity ?? 0),
          0
        );
        return (
          <span className="font-mono font-bold text-slate-900 text-xs">
            {sum > 0 ? sum.toLocaleString() : (record?.totalQuantity != null ? Number(record.totalQuantity).toLocaleString() : '-')}
          </span>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center' as const,
      render: (status: string) => {
        const s = status?.toUpperCase() || 'PENDING';
        const isApproved = s === 'APPROVED' || s === 'CONFIRMED' || s === 'ACTIVE';
        const isRejected = s === 'REJECTED';

        if (isApproved) {
          return (
            <Tag color="green" icon={<CheckCircleOutlined />} className="font-semibold text-[11px] uppercase m-0 px-2 py-0.5 rounded">
              Accepted
            </Tag>
          );
        }
        if (isRejected) {
          return (
            <Tag color="red" className="font-semibold text-[11px] uppercase m-0 px-2 py-0.5 rounded">
              Rejected
            </Tag>
          );
        }
        return (
          <Tag color="gold" icon={<ClockCircleOutlined />} className="font-semibold text-[11px] uppercase m-0 px-2 py-0.5 rounded">
            Pending
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      align: 'center' as const,
      render: (_: any, record: any) => {
        const targetId = record?.id ?? record?.transactionId;
        const s = (record?.status || 'PENDING').toUpperCase();
        const isPending = s === 'PENDING';

        return (
          <div className="flex items-center justify-center gap-1.5">
            <Button
              icon={<EyeOutlined />}
              size="small"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
              onClick={() => navigate(`/dashboard/product_transfer/${targetId}`)}
              title="View full details and audit logs"
            >
              Details
            </Button>
            {isPending && (
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                className="bg-emerald-600 hover:bg-emerald-500 border-none text-white text-xs font-semibold rounded-lg shadow-xs"
                onClick={() => handleOpenAcceptModal(record)}
                title="Quick Accept this requisition"
              >
                Accept
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1400px] mx-auto text-xs">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xl shadow-xs">
            <InboxOutlined />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-slate-800 m-0 tracking-tight">
                Request Accept (Finished Goods)
              </h1>
              <Tag color="cyan" className="font-semibold text-[11px] px-2 py-0.5 rounded-full m-0 font-mono">
                TRANSFER
              </Tag>
              <Tag color="gold" className="font-semibold text-[11px] px-2 py-0.5 rounded-full m-0 font-mono">
                PRODUCTION → FG_STORE
              </Tag>
            </div>
            <p className="text-xs text-slate-400 m-0 mt-0.5">
              Review, accept, and confirm incoming finished product transfer requisitions into Finished Goods inventory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={<ReloadOutlined spin={isTxFetching} />}
            onClick={() => refetch()}
            className="rounded-lg h-9 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Metric / Stat Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.03)]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Requisitions
          </span>
          <span className="text-xl font-extrabold text-slate-800 font-mono block">
            {stats.total.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">All incoming transfer requests</span>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/70 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Pending Acceptance
            </span>
            {stats.pending > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <span className="text-xl font-extrabold text-amber-700 font-mono block">
            {stats.pending.toLocaleString()}
          </span>
          <span className="text-[10px] text-amber-600/80 block mt-1">Awaiting store confirmation</span>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/70 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.03)]">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
            Accepted / Approved
          </span>
          <span className="text-xl font-extrabold text-emerald-700 font-mono block">
            {stats.approved.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600/80 block mt-1">Received into FG inventory</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.03)]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Transfer Volume
          </span>
          <span className="text-xl font-extrabold text-slate-800 font-mono block">
            {stats.totalQty.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Cumulative units transferred</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Input
            placeholder="Search voucher no, product name..."
            prefix={<SearchOutlined className="text-slate-400 text-xs" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            className="w-full sm:w-72 rounded-lg text-xs"
          />

          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-full sm:w-40 rounded-lg text-xs"
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'PENDING', label: 'Pending Only' },
              { value: 'APPROVED', label: 'Accepted Only' },
              { value: 'REJECTED', label: 'Rejected Only' },
            ]}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium w-full sm:w-auto justify-end">
          <span>Showing {filteredVouchers.length} of {allVouchers.length} request(s)</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-800 m-0 uppercase tracking-wider">
              Transfer Requisitions (PRODUCTION → FG_STORE)
            </h2>
            <Badge
              count={`${filteredVouchers.length} item(s)`}
              className="font-semibold text-[11px]"
              style={{ backgroundColor: '#F3F4F6', color: '#4B5563', border: '1px solid #E5E7EB' }}
            />
          </div>
        </div>

        <Table
          dataSource={filteredVouchers}
          columns={columns}
          rowKey={(record: any) =>
            record?.id ??
            record?.transactionId ??
            record?.voucherNo ??
            record?.requisitionNo ??
            Math.random()
          }
          loading={isTxLoading}
          size="small"
          scroll={{ x: 950 }}
          locale={{
            emptyText: isTxLoading
              ? 'Loading transfer requisitions...'
              : 'No transfer requisitions found matching the selected criteria.',
          }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </div>

      {/* Quick Accept Modal */}
      <Modal
        title={
          <div className="flex items-center justify-between pr-6 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800">Accept Transfer Request</span>
              <Tag color="gold" className="m-0 font-semibold text-[11px] font-mono">
                {selectedRecord?.voucherNo || selectedRecord?.requisitionNo || `TRANS-${selectedRecord?.id || ''}`}
              </Tag>
            </div>
            <Tag color="cyan" className="m-0 font-semibold text-[11px] font-mono">
              PRODUCTION → FG_STORE
            </Tag>
          </div>
        }
        open={acceptModalOpen}
        onCancel={() => setAcceptModalOpen(false)}
        width={750}
        footer={[
          <Button
            key="cancel"
            onClick={() => setAcceptModalOpen(false)}
            className="rounded-lg text-xs"
          >
            Cancel
          </Button>,
          <Button
            key="details"
            onClick={() => {
              const targetId = selectedRecord?.id || selectedRecord?.transactionId;
              setAcceptModalOpen(false);
              navigate(`/dashboard/product_transfer/${targetId}`);
            }}
            className="rounded-lg text-xs font-semibold"
          >
            Open Full Inspection
          </Button>,
          <Button
            key="accept"
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={isApproving}
            onClick={handleConfirmAccept}
            className="bg-emerald-600 hover:bg-emerald-500 border-none text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            Accept & Receive Requisition
          </Button>,
        ]}
      >
        <div className="py-2 space-y-4 text-xs">
          {/* Quick info bar */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 grid grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Requisition Date</span>
              <span className="font-medium text-slate-800 text-xs">
                {selectedRecord?.date ? dayjs(selectedRecord.date).format('DD-MMM-YYYY') : '-'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Source Department</span>
              <span className="font-medium text-slate-800 text-xs">
                {selectedRecord?.fromDepartment || 'PRODUCTION'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Destination</span>
              <span className="font-medium text-emerald-700 text-xs font-bold">
                {selectedRecord?.toDepartment || 'FG_STORE'}
              </span>
            </div>
          </div>

          {/* Table of items to accept */}
          <div>
            <h4 className="font-bold text-slate-800 text-xs uppercase mb-2">
              Products to be Received
            </h4>
            <div className="border border-slate-200/80 rounded-xl overflow-hidden">
              <Table
                dataSource={
                  selectedRecord?.requestInventories ||
                  selectedRecord?.items ||
                  selectedRecord?.products ||
                  []
                }
                rowKey={(it: any) => it?.id || it?.productId || Math.random()}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'SI',
                    key: 'si',
                    width: 45,
                    align: 'center' as const,
                    render: (_: any, __: any, idx: number) => (
                      <span className="font-mono text-slate-500 font-semibold">{idx + 1}</span>
                    ),
                  },
                  {
                    title: 'Product Name',
                    key: 'name',
                    render: (_: any, it: any) => {
                      const pId = it?.productId || it?.product?.id;
                      const name = it?.product?.name || it?.productName || productsMap.get(pId) || `Product #${pId}`;
                      return (
                        <div className="flex items-center gap-1.5">
                          <ShoppingOutlined className="text-amber-600 text-xs" />
                          <span className="font-semibold text-slate-800">{name}</span>
                        </div>
                      );
                    },
                  },
                  {
                    title: 'Requested Qty',
                    key: 'requestQty',
                    width: 120,
                    align: 'right' as const,
                    render: (_: any, it: any) => {
                      const req = Number(it?.requestQty ?? it?.quantity ?? 0);
                      const unit = it?.product?.unit?.name || it?.unit || 'Pcs';
                      return (
                        <span className="font-mono font-bold text-slate-800">
                          {req.toLocaleString()} {unit}
                        </span>
                      );
                    },
                  },
                  {
                    title: 'Approved / Received Qty',
                    key: 'approvedQty',
                    width: 160,
                    align: 'right' as const,
                    render: (_: any, it: any) => {
                      const key = it?.id || it?.productId;
                      const req = Number(it?.requestQty ?? it?.quantity ?? 0);
                      const currentVal = approvedQuantities[key] !== undefined ? approvedQuantities[key] : req;

                      return (
                        <InputNumber
                          min={0}
                          value={currentVal}
                          onChange={(val) => {
                            setApprovedQuantities((prev) => ({
                              ...prev,
                              [key]: Number(val) || 0,
                            }));
                          }}
                          className="w-28 text-right font-mono font-bold text-xs"
                        />
                      );
                    },
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RequestAccept;
