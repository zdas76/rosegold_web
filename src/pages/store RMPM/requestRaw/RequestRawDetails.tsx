/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Table,
  Button,
  Tag,
  InputNumber,
  Badge,
  Spin,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InboxOutlined,
  FileTextOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  SaveOutlined,
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
  useUpdateRawRequestMutation,
} from '../../../redux/features/internalTranscation/internalTranscation.api';
import { showSuccessAlert, showWarningAlert } from '../../../utils/sweetAlert';
import { getResponse } from '../../../utils/getResponse';
import { VoucherType } from '../../../types/types';

const RequestRawDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Load single transaction details by ID
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

  // Options & Unit Lookups
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

  // Normalize items list from detailData
  const detailItemsList = useMemo(() => {
    if (!detailData) return [];
    if (Array.isArray(detailData)) return detailData;
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
    if (detailData.raWMaterial || detailData.packingMaterial || detailData.requestQty != null) {
      return [detailData];
    }
    return [];
  }, [detailData]);

  // Basic voucher details
  const detailVoucherNo =
    detailData?.voucherNo || txInfo?.voucherNo || (id ? `REQ-${id}` : '-');
  const detailDate = detailData?.date || txInfo?.date || detailData?.requestInventories?.[0]?.date;
  const detailFormattedDate = detailDate ? dayjs(detailDate).format('DD-MMM-YYYY') : '-';
  const detailStatus = (
    detailData?.status ||
    txInfo?.status ||
    detailData?.requestInventories?.[0]?.status ||
    'PENDING'
  ).toUpperCase();

  const isConfirmed =
    detailStatus === 'CONFIRMED' ||
    detailStatus === 'APPROVED' ||
    detailStatus === 'ACTIVE';

  const fromDept =
    detailData?.fromDepartment ||
    detailData?.requestInventories?.[0]?.fromDepartment ||
    txInfo?.fromDepartment ||
    'PRODUCTION';
  const toDept =
    detailData?.toDepartment ||
    detailData?.department ||
    detailData?.requestInventories?.[0]?.toDepartment ||
    detailData?.requestInventories?.[0]?.department ||
    txInfo?.toDepartment ||
    'RMPM_STORE';

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
  const { department } = useLocalUser();
  const [liveStocks, setLiveStocks] = useState<Record<string, number | null>>({});
  const [isStocksLoading, setIsStocksLoading] = useState<boolean>(false);

  // Editable request quantities
  const [requestQuantities, setRequestQuantities] = useState<Record<string | number, number>>({});
  const [updateRawRequest, { isLoading: isUpdating }] = useUpdateRawRequestMutation();

  // Initialize requestQuantities with current requestQty
  useEffect(() => {
    if (!detailItemsList || detailItemsList.length === 0) return;
    setRequestQuantities(prev => {
      const nextState: Record<string | number, number> = { ...prev };
      detailItemsList.forEach((item: any) => {
        const rawId = item.rawId ?? item.raWMaterial?.id;
        const pmId = item.packingMaterialId ?? item.packingMaterial?.id;
        const isPM = Boolean(item.packingMaterial || item.packingMaterialId);
        const itemKey = item.id || (isPM ? `pm_${pmId}` : `raw_${rawId}`);

        if (nextState[itemKey] === undefined) {
          const defaultQty =
            item.requestQty != null
              ? Number(item.requestQty)
              : item.quantity != null
                ? Number(item.quantity)
                : 0;
          nextState[itemKey] = defaultQty;
        }
      });
      return nextState;
    });
  }, [detailItemsList]);

  // Fetch live stock for all items
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

  // Total requested sums based on editable input
  const totalRequestedQty = useMemo(() => {
    return detailItemsList.reduce((sum: number, it: any) => {
      const rawId = it.rawId ?? it.raWMaterial?.id;
      const pmId = it.packingMaterialId ?? it.packingMaterial?.id;
      const isPM = Boolean(it.packingMaterial || it.packingMaterialId);
      const itemKey = it.id || (isPM ? `pm_${pmId}` : `raw_${rawId}`);

      const q =
        requestQuantities[itemKey] !== undefined
          ? requestQuantities[itemKey]
          : (it.requestQty != null
            ? Number(it.requestQty)
            : Number(it.quantity) || 0);
      return sum + (isNaN(q) ? 0 : q);
    }, 0);
  }, [detailItemsList, requestQuantities]);

  // Check if any items have requested quantity > availableStock
  const stockDeficitItems = useMemo(() => {
    if (isConfirmed || !detailItemsList || detailItemsList.length === 0) return [];
    return detailItemsList.filter((item: any) => {
      const rawId = item.rawId ?? item.raWMaterial?.id;
      const pmId = item.packingMaterialId ?? item.packingMaterial?.id;
      const isPM = Boolean(item.packingMaterial || item.packingMaterialId);
      const stockKey = rawId ? `raw_${rawId}` : pmId ? `pm_${pmId}` : null;
      const liveStock = stockKey ? liveStocks[stockKey] : undefined;

      const rawMatch = rawId
        ? rawMaterialOptions.find((rm: any) => String(rm.value) === String(rawId))
        : null;
      const pmMatch = pmId
        ? packingMaterialOptions.find((pm: any) => String(pm.value) === String(pmId))
        : null;

      const fallbackStock =
        item.raWMaterial?.quantity != null
          ? Number(item.raWMaterial.quantity)
          : item.packingMaterial?.quantity != null
            ? Number(item.packingMaterial.quantity)
            : (rawMatch?.stock ?? pmMatch?.stock ?? null);

      const availableStock = liveStock !== undefined && liveStock !== null ? liveStock : fallbackStock;

      const itemKey = item.id || (isPM ? `pm_${pmId}` : `raw_${rawId}`);
      const currentVal =
        requestQuantities[itemKey] !== undefined
          ? requestQuantities[itemKey]
          : (item.requestQty != null
            ? Number(item.requestQty)
            : Number(item.quantity) || 0);

      return availableStock != null && currentVal > availableStock;
    });
  }, [detailItemsList, liveStocks, rawMaterialOptions, packingMaterialOptions, requestQuantities, isConfirmed]);

  // Handle Update Submission to PATCH /internal-transaction/raw-request/:requestId
  const handleUpdateRequest = async () => {
    if (stockDeficitItems.length > 0) {
      showWarningAlert(
        'Some materials have requested quantity greater than current available stock. Please reduce the quantity before updating.',
        'Insufficient Stock'
      );
      return;
    }

    const updatePromises = detailItemsList.map(async (item: any) => {
      const rawId = item.rawId ?? item.raWMaterial?.id ?? item.id;
      const pmId = item.packingMaterialId ?? item.packingMaterial?.id ?? item.id;
      const isPM = Boolean(item.packingMaterial || item.packingMaterialId);
      const itemKey = item.id || (isPM ? `pm_${pmId}` : `raw_${rawId}`);

      const qty =
        requestQuantities[itemKey] !== undefined
          ? requestQuantities[itemKey]
          : (item.requestQty != null
            ? Number(item.requestQty)
            : Number(item.quantity) || 0);

      // requestId is the requestInventory item id
      const requestInventoryItemId = item.id ?? item.requestInventoryId ?? item.requestInvetoryId ?? id;

      const body: any = isPM
        ? {
            packingMaterials: [
              {
                packingMaterialId: pmId,
                requestQty: Number(qty),
              },
            ],
            requestQty: Number(qty),
          }
        : {
            rawMaterials: [
              {
                rawMaterialId: rawId,
                rawId: rawId,
                requestQty: Number(qty),
              },
            ],
            requestQty: Number(qty),
          };

      console.log(`Update Raw Request Payload (/internal-transaction/raw-request/${requestInventoryItemId}):`, body);

      return updateRawRequest({
        requestId: requestInventoryItemId,
        data: body,
      });
    });

    try {
      const results: any[] = await Promise.all(updatePromises);
      const firstRes = results[0];
      const response = getResponse(firstRes);
      console.log('Update raw request response:', response);
      if (response?.success || firstRes?.data?.success) {
        await showSuccessAlert(
          `Material Request ${detailVoucherNo} updated successfully!`,
          'Request Updated'
        );
        refetch();
      } else {
        await showSuccessAlert(
          response?.message || 'Updated successfully!',
          'Success'
        );
        refetch();
      }
    } catch (err: any) {
      console.error('Failed to update request:', err);
      showWarningAlert(
        err?.data?.message || err?.message || 'Failed to update request. Please try again.',
        'Update Failed'
      );
    }
  };

  if (isDetailsLoading || isDetailsFetching) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Spin size="large" />
        <span className="text-xs text-slate-500 font-medium">
          Loading material request details...
        </span>
      </div>
    );
  }

  if (!detailData) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto space-y-4 text-xs">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/dashboard/request-raw')}
          className="text-xs"
        >
          Back to Request List
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
            onClick={() => navigate('/dashboard/request-raw')}
            className="rounded-lg h-9 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Back
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-lg">
              <InboxOutlined />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold text-slate-800 m-0 tracking-tight">
                  Request Voucher: {detailVoucherNo}
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
                <Tag color="blue" className="text-[10px] m-0 px-1.5 font-semibold">{fromDept}</Tag>
                <span className="text-slate-400">→</span>
                <Tag color="gold" className="text-[10px] m-0 px-1.5 font-semibold">{toDept}</Tag>
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
          {!isConfirmed && (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleUpdateRequest}
              loading={isUpdating}
              disabled={stockDeficitItems.length > 0}
              className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white text-xs font-semibold px-4 h-9 rounded-lg shadow-sm"
            >
              Update Request
            </Button>
          )}
        </div>
      </div>

      {/* Meta Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-slate-400 block font-semibold text-[11px] mb-1 flex items-center gap-1">
            <FileTextOutlined /> Voucher No
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
      {isConfirmed && (
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
              This material request voucher has been approved and finalized by the Purchase Department. The details below are now read-only.
            </span>
          }
          className="border-emerald-200 bg-emerald-50/80 rounded-xl shadow-2xs"
        />
      )}

      {/* Stock Deficit Warning Alert */}
      {!isConfirmed && stockDeficitItems.length > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<WarningOutlined className="text-amber-600 text-base" />}
          message={
            <span className="font-bold text-xs text-amber-800">
              Insufficient Stock Warning
            </span>
          }
          description={
            <span className="text-[11px] text-amber-700">
              {stockDeficitItems.length} item(s) have requested quantity greater than current available stock. Please reduce the quantity before updating.
            </span>
          }
          className="border-amber-200 bg-amber-50/80 rounded-xl shadow-2xs"
        />
      )}

      {/* Requested Materials Table */}
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
            {isConfirmed
              ? 'This request has been approved. The details below are read-only.'
              : 'Modify requested quantity as needed, then click "Update Request".'}
          </span>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-200/80">
          <Table
            dataSource={detailItemsList}
            pagination={false}
            rowKey={(item: any, i) => item.id || `req_item_${i}`}
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
                title: 'Item Name',
                key: 'itemName',
                render: (_: any, item: any) => {
                  const rawMatch = item.rawId
                    ? rawMaterialOptions.find((rm: any) => String(rm.value) === String(item.rawId))
                    : null;
                  const pmMatch = item.packingMaterialId
                    ? packingMaterialOptions.find((pm: any) => String(pm.value) === String(item.packingMaterialId))
                    : null;

                  const name =
                    item.raWMaterial?.name ||
                    item.packingMaterial?.name ||
                    rawMatch?.name ||
                    pmMatch?.name ||
                    item.itemName ||
                    (item.rawId ? `Raw Material #${item.rawId}` : item.packingMaterialId ? `Packing Material #${item.packingMaterialId}` : `Item #${item.id}`);
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
                  const rawMatch = item.rawId
                    ? rawMaterialOptions.find((rm: any) => String(rm.value) === String(item.rawId))
                    : null;
                  const pmMatch = item.packingMaterialId
                    ? packingMaterialOptions.find((pm: any) => String(pm.value) === String(item.packingMaterialId))
                    : null;

                  const unitName =
                    item.raWMaterial?.unit?.name ||
                    item.packingMaterial?.unit?.name ||
                    (item.raWMaterial?.unitId && unitsMap.get(item.raWMaterial.unitId)) ||
                    (item.packingMaterial?.unitId && unitsMap.get(item.packingMaterial.unitId)) ||
                    rawMatch?.unit ||
                    pmMatch?.unit ||
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

                  const rawMatch = rawId
                    ? rawMaterialOptions.find((rm: any) => String(rm.value) === String(rawId))
                    : null;
                  const pmMatch = pmId
                    ? packingMaterialOptions.find((pm: any) => String(pm.value) === String(pmId))
                    : null;

                  const fallbackStock =
                    item.raWMaterial?.quantity != null
                      ? Number(item.raWMaterial.quantity)
                      : item.packingMaterial?.quantity != null
                        ? Number(item.packingMaterial.quantity)
                        : (rawMatch?.stock ?? pmMatch?.stock ?? null);

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
                width: 170,
                align: 'right' as const,
                render: (_: any, item: any) => {
                  const rawId = item.rawId ?? item.raWMaterial?.id;
                  const pmId = item.packingMaterialId ?? item.packingMaterial?.id;
                  const isPM = Boolean(item.packingMaterial || item.packingMaterialId);
                  const stockKey = rawId ? `raw_${rawId}` : pmId ? `pm_${pmId}` : null;
                  const liveStock = stockKey ? liveStocks[stockKey] : undefined;

                  const rawMatch = rawId
                    ? rawMaterialOptions.find((rm: any) => String(rm.value) === String(rawId))
                    : null;
                  const pmMatch = pmId
                    ? packingMaterialOptions.find((pm: any) => String(pm.value) === String(pmId))
                    : null;

                  const fallbackStock =
                    item.raWMaterial?.quantity != null
                      ? Number(item.raWMaterial.quantity)
                      : item.packingMaterial?.quantity != null
                        ? Number(item.packingMaterial.quantity)
                        : (rawMatch?.stock ?? pmMatch?.stock ?? null);

                  const availableStock = liveStock !== undefined && liveStock !== null ? liveStock : fallbackStock;

                  const itemKey = item.id || (isPM ? `pm_${pmId}` : `raw_${rawId}`);
                  const currentVal =
                    requestQuantities[itemKey] !== undefined
                      ? requestQuantities[itemKey]
                      : (item.requestQty != null
                        ? Number(item.requestQty)
                        : Number(item.quantity) || 0);

                  const isOverStock = availableStock != null && currentVal > availableStock;

                  if (isConfirmed) {
                    return (
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {currentVal.toLocaleString()}
                      </span>
                    );
                  }

                  return (
                    <div className="flex flex-col items-end">
                      <InputNumber
                        min={0}
                        step={1}
                        controls={false}
                        value={currentVal}
                        onChange={(val) => {
                          const numVal = Math.max(0, Number(val) || 0);
                          setRequestQuantities(prev => ({
                            ...prev,
                            [itemKey]: numVal,
                          }));
                        }}
                        className={`w-28 text-right font-mono text-xs rounded-lg ${isOverStock
                          ? 'border-red-500 focus:border-red-500 text-red-600'
                          : 'border-slate-300 focus:border-amber-500 text-slate-800'
                          }`}
                      />
                      {isOverStock && (
                        <span className="text-[10px] text-red-500 font-medium mt-0.5">
                          Exceeds stock ({availableStock})
                        </span>
                      )}
                    </div>
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
                    Total
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

      {/* Bottom Update Action Bar */}
      {!isConfirmed && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold">Note:</span>
            <span>You can modify requested quantities above and click "Update Request" to update this requisition.</span>
          </div>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleUpdateRequest}
            loading={isUpdating}
            disabled={stockDeficitItems.length > 0}
            className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white text-xs font-semibold px-5 h-9 rounded-lg shadow-sm"
          >
            Update Request
          </Button>
        </div>
      )}
    </div>
  );
};

export default RequestRawDetails;
