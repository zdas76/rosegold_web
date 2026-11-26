/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Table,
  Button,
  Tag,
  Badge,
  Spin,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  InboxOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGetRowMaterialsQuery } from '../../../redux/features/rowMaterials/rowMaterials.api';
import { useGetPackingMaterialsQuery } from '../../../redux/features/packingMaterials/packingMaterials.api';
import { useGetUnitsQuery } from '../../../redux/features/unit/unit.api';
import { useLazyGetTotalQuantityAndUnitPriceQuery } from '../../../redux/features/transactions/transactons.api';
import { useLocalUser } from '../../../hook/useLocalUser';
import {
  useGetRequestByIdQuery,
  useApproveRawRequestMutation,
} from '../../../redux/features/internalTranscation/internalTranscation.api';
import { VoucherType } from '../../../types/types';
import { showSuccessAlert, showErrorAlert } from '../../../utils/sweetAlert';
import { getResponse } from '../../../utils/getResponse';

const RawRequestAcceptDetails: React.FC = () => {
  const { department } = useLocalUser();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Load single raw request details by ID
  const {
    data: detailsResponse,
    isLoading: isDetailsLoading,
    isFetching: isDetailsFetching,
    refetch,
  } = useGetRequestByIdQuery(
    { id: Number(id!), voucherType: VoucherType.REQUEST },
    { skip: !id }
  );

  const detailData = detailsResponse?.data;
  const txInfo = detailData?.transactionInfo;

  // Master options and units lookup
  const { data: rawMaterialsData } = useGetRowMaterialsQuery({});
  const { data: packingMaterialsData } = useGetPackingMaterialsQuery({});
  const { data: unitsData } = useGetUnitsQuery({});

  const unitsMap = useMemo(() => {
    const map = new Map<number, string>();
    if (Array.isArray(unitsData?.data)) {
      unitsData.data.forEach((u: any) => map.set(u.id, u.name));
    }
    return map;
  }, [unitsData]);

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

  // Normalize items list from detailData
  const detailItemsList: any[] = useMemo(() => {
    if (!detailData) return [];
    if (Array.isArray(detailData.requestInventories)) return detailData.requestInventories;
    if (Array.isArray(detailData.items)) return detailData.items;
    if (Array.isArray(detailData.rawMaterials) || Array.isArray(detailData.packingMaterials)) {
      const raws = (detailData.rawMaterials || []).map((rm: any) => ({
        ...rm,
        itemType: 'RAW',
        raWMaterial: rm.rawMaterial || rm.raWMaterial || rm,
      }));
      const pms = (detailData.packingMaterials || []).map((pm: any) => ({
        ...pm,
        itemType: 'PACKING_MATERIAL',
        packingMaterial: pm.packingMaterial || pm,
      }));
      return [...raws, ...pms];
    }
    if (Array.isArray(detailData)) return detailData;
    return [];
  }, [detailData]);

  // Basic voucher details
  const detailVoucherNo =
    detailData?.voucherNo ||
    detailData?.requestNo ||
    txInfo?.voucherNo ||
    detailData?.requisitionNo ||
    (id ? `REQ-${id}` : '-');

  const detailDate =
    detailData?.date ||
    txInfo?.date ||
    detailItemsList[0]?.date ||
    detailData?.createdAt;
  const detailFormattedDate = detailDate ? dayjs(detailDate).format('DD-MMM-YYYY') : '-';

  const fromDept =
    detailData?.fromDepartment ||
    detailItemsList[0]?.fromDepartment ||
    txInfo?.fromDepartment ||
    'PRODUCTION';

  const toDept =
    detailData?.toDepartment ||
    detailItemsList[0]?.toDepartment ||
    txInfo?.toDepartment ||
    'PURCHASE';

  const detailStatus = (
    detailData?.status ||
    txInfo?.status ||
    detailItemsList[0]?.status ||
    'PENDING'
  ).toUpperCase();

  const isConfirmed =
    detailStatus === 'CONFIRMED' ||
    detailStatus === 'APPROVED' ||
    detailStatus === 'ACTIVE';

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
      case 'APPROVED':
      case 'ACTIVE':
        return 'green';
      case 'DISPATCHED':
        return 'purple';
      case 'REJECTED':
        return 'red';
      default:
        return 'gold';
    }
  };

  // Live stock state and lazy query from /inventory/inventorytotal
  const [triggerGetTotalQuantity] = useLazyGetTotalQuantityAndUnitPriceQuery();
  const [liveStocks, setLiveStocks] = useState<Record<string, number | null>>({});
  const [isStocksLoading, setIsStocksLoading] = useState<boolean>(false);

  // Approve mutation
  const [approveRawRequest, { isLoading: isApproving }] = useApproveRawRequestMutation();

  // Fetch live stocks
  useEffect(() => {
    if (!detailItemsList || detailItemsList.length === 0) return;

    let isMounted = true;
    setIsStocksLoading(true);

    const fetchAllStocks = async () => {
      const stockResults: Record<string, number | null> = {};

      const promises = detailItemsList.map(async (item: any) => {
        const rawId = item.rawId ?? item.raWMaterial?.id;
        const pmId = item.packingMaterialId ?? item.packingMaterial?.id;

        if (rawId) {
          const key = `raw_${rawId}`;
          try {
            const res = await triggerGetTotalQuantity({
              itemType: 'raw',
              rawId: String(rawId),
              department,
            }).unwrap();
            const netQty =
              res?.data?.netQuantity != null
                ? Number(res.data.netQuantity)
                : res?.data?.totalQuantity != null
                  ? Number(res.data.totalQuantity)
                  : null;
            stockResults[key] = netQty;
          } catch (err) {
            console.error(`Failed to fetch stock for rawId ${rawId}:`, err);
            stockResults[key] = null;
          }
        } else if (pmId) {
          const key = `pm_${pmId}`;
          try {
            const res = await triggerGetTotalQuantity({
              itemType: 'pmmaterial',
              packingMaterialId: Number(pmId),
              department,
            }).unwrap();
            const netQty =
              res?.data?.netQuantity != null
                ? Number(res.data.netQuantity)
                : res?.data?.totalQuantity != null
                  ? Number(res.data.totalQuantity)
                  : null;
            stockResults[key] = netQty;
          } catch (err) {
            console.error(`Failed to fetch stock for pmId ${pmId}:`, err);
            stockResults[key] = null;
          }
        }
      });

      await Promise.all(promises);

      if (isMounted) {
        setLiveStocks(prev => ({ ...prev, ...stockResults }));
        setIsStocksLoading(false);
      }
    };

    fetchAllStocks();

    return () => {
      isMounted = false;
    };
  }, [detailItemsList, triggerGetTotalQuantity]);

  // Total requested sums
  const totalRequestedQty = useMemo(() => {
    return detailItemsList.reduce((sum: number, it: any) => {
      const q = it.requestQty != null ? Number(it.requestQty) : Number(it.quantity) || 0;
      return sum + (isNaN(q) ? 0 : q);
    }, 0);
  }, [detailItemsList]);

  // Handle Accept / Approve Request in Purchase Department
  const handleAcceptRequest = async () => {
    const targetId = detailData?.id || detailData?.transactionId || Number(id);

    const rawMaterialsList = detailItemsList
      .filter((it: any) => it.rawId != null || it.raWMaterial != null || (!it.packingMaterial && !it.packingMaterialId))
      .map((it: any) => {
        const rawId = it?.rawId ?? it?.raWMaterial?.id ?? it?.id;
        const reqQty = Number(it?.requestQty ?? it?.quantity ?? 0);

        return {
          id: rawId,
          rawMaterialId: rawId,
          requestInvetoryId: it?.id,
          requestInventoryId: it?.id,
          inventoryId: it?.id,
          name: it?.raWMaterial?.name || rawMaterialsMap.get(rawId) || `Raw Material #${rawId}`,
          unitId: it?.raWMaterial?.unitId ?? it?.unitId ?? null,
          requestQty: reqQty,
          quantity: reqQty,
          approvedQty: reqQty,
          remarks: it?.remarks || '',
        };
      });

    const packingMaterialsList = detailItemsList
      .filter((it: any) => it.packingMaterialId != null || it.packingMaterial != null)
      .map((it: any) => {
        const pmId = it?.packingMaterialId ?? it?.packingMaterial?.id ?? it?.id;
        const reqQty = Number(it?.requestQty ?? it?.quantity ?? 0);

        return {
          id: pmId,
          packingMaterialId: pmId,
          requestInvetoryId: it?.id,
          requestInventoryId: it?.id,
          inventoryId: it?.id,
          name: it?.packingMaterial?.name || packingMaterialsMap.get(pmId) || `Packing Material #${pmId}`,
          unitId: it?.packingMaterial?.unitId ?? it?.unitId ?? null,
          requestQty: reqQty,
          quantity: reqQty,
          approvedQty: reqQty,
          remarks: it?.remarks || '',
        };
      });

    const totalApproved =
      rawMaterialsList.reduce((sum: number, r: any) => sum + r.approvedQty, 0) +
      packingMaterialsList.reduce((sum: number, p: any) => sum + p.approvedQty, 0);

    const payload = {
      transactionId: targetId,
      id: targetId,
      requisitionNo: detailVoucherNo,
      voucherNo: detailVoucherNo,
      date: detailDate ? dayjs(detailDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      fromDepartment: fromDept,
      toDepartment: toDept,
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
          `Raw Material Request ${detailVoucherNo} accepted and approved successfully!`,
          'Request Accepted'
        );
        refetch();
      } else {
        await showSuccessAlert(
          response?.message || 'Raw request accepted successfully!',
          'Accepted'
        );
        refetch();
      }
    } catch (err: any) {
      console.error('Failed to accept request:', err);
      showErrorAlert(
        err?.data?.message || err?.message || 'Failed to accept raw material request. Please try again.',
        'Accept Failed'
      );
    }
  };

  if (isDetailsLoading || isDetailsFetching) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Spin size="large" />
        <span className="text-xs text-slate-500 font-medium">
          Loading raw request details...
        </span>
      </div>
    );
  }

  if (!detailData) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto space-y-4 text-xs">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/dashboard/raw-request-accept')}
          className="text-xs"
        >
          Back to Raw Request List
        </Button>
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center text-slate-500">
          No details found for request #{id}.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1400px] mx-auto text-xs">
      {/* Top Navigation & Action Header */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/dashboard/raw-request-accept')}
            className="rounded-lg h-9 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Back
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#C58D2F] flex items-center justify-center font-bold text-lg">
              <InboxOutlined />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold text-slate-800 m-0 tracking-tight">
                  Raw Request: {detailVoucherNo}
                </h2>
                <Tag
                  color={getStatusColor(detailStatus)}
                  className="text-[11px] uppercase m-0 font-semibold px-2 py-0.5 rounded-full"
                >
                  {detailStatus}
                </Tag>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>Route:</span>
                <Tag color="blue" className="text-[10px] m-0 px-1.5 font-semibold">
                  {fromDept}
                </Tag>
                <span className="text-slate-400">→</span>
                <Tag color="gold" className="text-[10px] m-0 px-1.5 font-semibold">
                  {toDept}
                </Tag>
              </div>
            </div>
          </div>
        </div>

        {/* Right Header Buttons */}
        <div className="flex items-center gap-2">
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isDetailsFetching}
            className="rounded-lg h-9 text-xs font-semibold"
          >
            Refresh
          </Button>

          {!isConfirmed ? (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleAcceptRequest}
              loading={isApproving}
              className="bg-emerald-600 hover:bg-emerald-500 border-none text-white text-xs font-semibold px-4 h-9 rounded-lg shadow-sm"
            >
              Accept Request
            </Button>
          ) : (
            <Tag color="green" className="text-xs font-semibold px-3 py-1 rounded-lg uppercase">
              Approved & Accepted
            </Tag>
          )}
        </div>
      </div>

      {/* Meta Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-slate-400 block font-semibold text-[11px] mb-1 flex items-center gap-1">
            <FileTextOutlined /> Request No
          </span>
          <span className="font-mono font-bold text-slate-800 text-xs block truncate">
            {detailVoucherNo}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-slate-400 block font-semibold text-[11px] mb-1 flex items-center gap-1">
            <CalendarOutlined /> Request Date
          </span>
          <span className="font-semibold text-slate-700 text-xs block">
            {detailFormattedDate}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-slate-400 block font-semibold text-[11px] mb-1 flex items-center gap-1">
            <AppstoreOutlined /> Total Items
          </span>
          <span className="font-mono font-bold text-slate-800 text-xs block">
            {detailItemsList.length} item(s)
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-slate-400 block font-semibold text-[11px] mb-1">
            Requested Total Qty
          </span>
          <span className="font-mono font-bold text-[#C58D2F] text-xs block">
            {totalRequestedQty.toLocaleString()}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-slate-400 block font-semibold text-[11px] mb-1">
            Request ID
          </span>
          <span className="font-mono font-bold text-slate-800 text-xs block">
            #{detailData?.id || detailData?.transactionId || txInfo?.id || id}
          </span>
        </div>
      </div>

      {/* Confirmed / Approved Info Banner */}
      {isConfirmed ? (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleOutlined className="text-emerald-600 text-base" />}
          message={
            <span className="font-bold text-xs text-emerald-800">
              Request {detailStatus === 'CONFIRMED' ? 'Confirmed' : 'Approved'}
            </span>
          }
          description={
            <span className="text-[11px] text-emerald-700">
              This raw material request voucher has been approved and accepted into Purchase Department.
            </span>
          }
          className="border-emerald-200 bg-emerald-50/80 rounded-xl shadow-2xs"
        />
      ) : (
        <Alert
          type="info"
          showIcon
          icon={<InfoCircleOutlined className="text-blue-600 text-base" />}
          message={
            <span className="font-bold text-xs text-blue-800">
              Pending Acceptance
            </span>
          }
          description={
            <span className="text-[11px] text-blue-700">
              Review the requested raw materials below from Production. Click "Accept Request" to approve.
            </span>
          }
          className="border-blue-200 bg-blue-50/80 rounded-xl shadow-2xs"
        />
      )}

      {/* Materials Table Container */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)] space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-800 m-0 uppercase tracking-wider">
              Requested Materials List
            </h3>
            <Badge
              count={`${detailItemsList.length} item(s)`}
              className="font-semibold text-[11px]"
              style={{ backgroundColor: '#F3F4F6', color: '#4B5563', border: '1px solid #E5E7EB' }}
            />
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Read-only raw request view
          </span>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-200/80">
          <Table
            dataSource={detailItemsList}
            pagination={false}
            rowKey={(item: any, i) => item.id || `item_${i}`}
            columns={[
              {
                title: 'SI',
                key: 'si',
                width: 50,
                align: 'center' as const,
                render: (_: any, __: any, i: number) => (
                  <span className="font-mono text-slate-500 font-semibold text-xs">{i + 1}</span>
                ),
              },
              {
                title: 'Item Type',
                key: 'itemType',
                width: 140,
                render: (_: any, item: any) => {
                  const isPM = Boolean(item.packingMaterial || item.packingMaterialId);
                  const isRaw = Boolean(item.raWMaterial || item.rawId);
                  return (
                    <Tag
                      color={isPM ? 'orange' : isRaw ? 'blue' : 'cyan'}
                      className="font-semibold text-[11px] m-0"
                    >
                      {isPM ? 'Packing Material' : isRaw ? 'Raw Material' : 'Material'}
                    </Tag>
                  );
                },
              },
              {
                title: 'Material Name',
                key: 'name',
                render: (_: any, item: any) => {
                  const rawId = item.rawId ?? item.raWMaterial?.id;
                  const pmId = item.packingMaterialId ?? item.packingMaterial?.id;
                  const name =
                    item.raWMaterial?.name ||
                    item.packingMaterial?.name ||
                    (rawId ? rawMaterialsMap.get(rawId) : '') ||
                    (pmId ? packingMaterialsMap.get(pmId) : '') ||
                    item.name ||
                    `Item #${item.id}`;
                  const desc = item.raWMaterial?.description || item.packingMaterial?.description;
                  return (
                    <div>
                      <span className="font-semibold text-slate-800 text-xs block">{name}</span>
                      {desc && (
                        <span className="text-[11px] text-slate-400 block line-clamp-1">{desc}</span>
                      )}
                    </div>
                  );
                },
              },
              {
                title: 'Unit',
                key: 'unit',
                width: 90,
                align: 'center' as const,
                render: (_: any, item: any) => {
                  const unitName =
                    item.raWMaterial?.unit?.name ||
                    item.packingMaterial?.unit?.name ||
                    (item.raWMaterial?.unitId && unitsMap.get(item.raWMaterial.unitId)) ||
                    (item.packingMaterial?.unitId && unitsMap.get(item.packingMaterial.unitId)) ||
                    item.unit ||
                    'Pcs';
                  return (
                    <span className="text-slate-600 font-medium text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                      {unitName}
                    </span>
                  );
                },
              },
              {
                title: 'Current Stock',
                key: 'stock',
                width: 130,
                align: 'right' as const,
                render: (_: any, item: any) => {
                  const rawId = item.rawId ?? item.raWMaterial?.id;
                  const pmId = item.packingMaterialId ?? item.packingMaterial?.id;
                  const stockKey = rawId ? `raw_${rawId}` : pmId ? `pm_${pmId}` : null;
                  const liveStock = stockKey ? liveStocks[stockKey] : undefined;

                  if (isStocksLoading && liveStock === undefined) {
                    return <Spin size="small" />;
                  }

                  if (liveStock !== undefined && liveStock !== null) {
                    return (
                      <span className="font-mono font-bold text-emerald-700 text-xs">
                        {liveStock.toLocaleString()}
                      </span>
                    );
                  }

                  const fallbackStock =
                    item.raWMaterial?.quantity != null
                      ? Number(item.raWMaterial.quantity)
                      : item.packingMaterial?.quantity != null
                        ? Number(item.packingMaterial.quantity)
                        : null;

                  return (
                    <span className="font-mono text-xs text-slate-600">
                      {fallbackStock != null ? fallbackStock.toLocaleString() : '-'}
                    </span>
                  );
                },
              },
              {
                title: 'Requested Qty',
                key: 'requestQty',
                width: 140,
                align: 'right' as const,
                render: (_: any, item: any) => {
                  const qty =
                    item.requestQty != null
                      ? Number(item.requestQty)
                      : item.quantity != null
                        ? Number(item.quantity)
                        : null;
                  return (
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {qty != null ? qty.toLocaleString() : '-'}
                    </span>
                  );
                },
              },
              {
                title: 'Status',
                key: 'status',
                width: 110,
                align: 'center' as const,
                render: (_: any, item: any) => {
                  const status = (item.status || detailStatus).toUpperCase();
                  return (
                    <Tag
                      color={getStatusColor(status)}
                      className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                    >
                      {status}
                    </Tag>
                  );
                },
              },
            ]}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-slate-50/80 font-bold text-xs">
                  <Table.Summary.Cell index={0} colSpan={4} className="text-slate-700">
                    Total Requested
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} className="text-right text-slate-600">
                    -
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} className="text-right font-mono text-[#C58D2F]">
                    {totalRequestedQty.toLocaleString()}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} className="text-center">
                    -
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>
      </div>

      {/* Bottom Accept Action Bar */}
      {!isConfirmed && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold">Action Required:</span>
            <span>Review materials requested by Production and click "Accept Request" to approve this request.</span>
          </div>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleAcceptRequest}
            loading={isApproving}
            className="bg-emerald-600 hover:bg-emerald-500 border-none text-white text-xs font-semibold px-5 h-9 rounded-lg shadow-sm"
          >
            Accept Request
          </Button>
        </div>
      )}
    </div>
  );
};

export default RawRequestAcceptDetails;
