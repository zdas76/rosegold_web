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
  PrinterOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGetProductsQuery } from '../../../redux/features/product/product.api';
import { useGetUnitsQuery } from '../../../redux/features/unit/unit.api';
import { useLazyGetTotalQuantityAndUnitPriceQuery } from '../../../redux/features/transactions/transactons.api';
import { useLocalUser } from '../../../hook/useLocalUser';
import {
  useGetRequestByIdQuery,
  useApproveProductRequestMutation,
} from '../../../redux/features/internalTranscation/internalTranscation.api';
import { VoucherType } from '../../../types/types';
import { showSuccessAlert, showErrorAlert } from '../../../utils/sweetAlert';
import { getResponse } from '../../../utils/getResponse';

const RequestAcceptDetails: React.FC = () => {
  const { department } = useLocalUser();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Load single product transfer request details by ID
  const {
    data: detailsResponse,
    isLoading: isDetailsLoading,
    isFetching: isDetailsFetching,
    refetch,
  } = useGetRequestByIdQuery(
    { id: id!, voucherType: VoucherType.TRANSFER },
    { skip: !id, pollingInterval: 10000, skipPollingIfUnfocused: true }
  );

  const detailData = detailsResponse?.data;
  const txInfo = detailData?.transactionInfo;

  // Master product list and units lookup
  const { data: productsData } = useGetProductsQuery({});
  const { data: unitsData } = useGetUnitsQuery({});

  const unitsMap = useMemo(() => {
    const map = new Map<number, string>();
    if (Array.isArray(unitsData?.data)) {
      unitsData.data.forEach((u: any) => map.set(u.id, u.name));
    }
    return map;
  }, [unitsData]);

  const productsMap = useMemo(() => {
    const map = new Map<number, any>();
    if (Array.isArray(productsData?.data)) {
      productsData.data.forEach((p: any) => map.set(p.id, p));
    }
    return map;
  }, [productsData]);

  // Normalize requestInventories items list from detailData
  const detailItemsList: any[] = useMemo(() => {
    if (!detailData) return [];
    if (Array.isArray(detailData.requestInventories)) return detailData.requestInventories;
    if (Array.isArray(detailData.items)) return detailData.items;
    if (Array.isArray(detailData.products)) return detailData.products;
    if (Array.isArray(detailData)) return detailData;
    return [];
  }, [detailData]);

  // Basic voucher details
  const detailVoucherNo =
    detailData?.voucherNo ||
    txInfo?.voucherNo ||
    detailData?.requisitionNo ||
    (id ? `TRANS-${id}` : '-');

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
    'FG_STORE';

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

  // Live stock state and lazy query for FG current stock
  const [triggerGetTotalQuantity] = useLazyGetTotalQuantityAndUnitPriceQuery();
  const [liveStocks, setLiveStocks] = useState<Record<number, number | null>>({});
  const [isStocksLoading, setIsStocksLoading] = useState<boolean>(false);

  // Approve / Accept mutation
  const [approveProductRequest, { isLoading: isAccepting }] = useApproveProductRequestMutation();

  // Fetch live stock for all products in this requisition
  useEffect(() => {
    if (!detailItemsList || detailItemsList.length === 0) return;

    let isMounted = true;
    setIsStocksLoading(true);

    const fetchAllStocks = async () => {
      const stockResults: Record<number, number | null> = {};

      const promises = detailItemsList.map(async (item: any) => {
        const pId = item.productId ?? item.product?.id;
        if (pId) {
          try {
            const res = await triggerGetTotalQuantity({
              itemType: 'product',
              productId: Number(pId),
              department,
            }).unwrap();
            const netQty =
              res?.data?.netQuantity != null
                ? Number(res.data.netQuantity)
                : res?.data?.totalQuantity != null
                  ? Number(res.data.totalQuantity)
                  : null;
            stockResults[pId] = netQty;
          } catch (err) {
            console.error(`Failed to fetch stock for productId ${pId}:`, err);
            stockResults[pId] = null;
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

  // Total requested sums (read-only)
  const totalRequestedQty = useMemo(() => {
    return detailItemsList.reduce((sum: number, it: any) => {
      const q =
        it.requestQty != null
          ? Number(it.requestQty)
          : it.quantity != null
            ? Number(it.quantity)
            : 0;
      return sum + (isNaN(q) ? 0 : q);
    }, 0);
  }, [detailItemsList]);

  // Total approved sums (if approved)
  const totalApprovedQty = useMemo(() => {
    return detailItemsList.reduce((sum: number, it: any) => {
      const val =
        it.approvalQty != null
          ? Number(it.approvalQty)
          : it.approvedQty != null
            ? Number(it.approvedQty)
            : it.requestQty != null
              ? Number(it.requestQty)
              : Number(it.quantity) || 0;
      return sum + Number(val);
    }, 0);
  }, [detailItemsList]);

  // Handle Accept / Receive into FG Store
  const handleAcceptRequest = async () => {
    const targetId = detailData?.id || detailData?.transactionId || Number(id);

    const mappedProducts = detailItemsList.map((it: any) => {
      const pId = it?.productId ?? it?.product?.id;
      const masterProduct = pId ? productsMap.get(pId) : null;
      const prod = it?.product || masterProduct;
      const pName =
        prod?.name ||
        it?.productName ||
        (pId ? `Product #${pId}` : `Item #${it?.id}`);
      const reqQty = Number(it?.requestQty ?? it?.quantity ?? 0);

      return {
        id: pId,
        productId: pId,
        requestInvetoryId: it?.id,
        requestInventoryId: it?.id,
        inventoryId: it?.id,
        productName: pName,
        unitId: it?.product?.unitId ?? it?.unitId ?? null,
        requestQty: reqQty,
        quantity: reqQty,
        approvedQty: reqQty,
        remarks: it?.remarks || '',
      };
    });

    const totalApproved = mappedProducts.reduce((sum: number, p: any) => sum + p.approvedQty, 0);

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
      products: mappedProducts,
    };

    console.log('FG Accept Transfer Payload (/internal-transaction/prodcut-approve):', payload);

    try {
      const res: any = await approveProductRequest(payload);
      const response = getResponse(res);
      if (response?.success || res?.data?.success) {
        await showSuccessAlert(
          `Product Transfer Request ${detailVoucherNo} accepted successfully into FG Store!`,
          'Request Accepted'
        );
        refetch();
      } else {
        await showSuccessAlert(
          response?.message || 'Transfer request accepted successfully!',
          'Accepted'
        );
        refetch();
      }
    } catch (err: any) {
      console.error('Failed to accept transfer request:', err);
      showErrorAlert(
        err?.data?.message || err?.message || 'Failed to accept transfer request. Please try again.',
        'Accept Failed'
      );
    }
  };

  if (isDetailsLoading || isDetailsFetching) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Spin size="large" />
        <span className="text-xs text-slate-500 font-medium">
          Loading FG transfer details...
        </span>
      </div>
    );
  }

  if (!detailData) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto space-y-4 text-xs">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/dashboard/store_fg_request_accept')}
          className="text-xs"
        >
          Back to Request Accept
        </Button>
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center text-slate-500">
          No details found for FG transfer request #{id}.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1400px] mx-auto text-xs">
      {/* Top Header */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/dashboard/store_fg_request_accept')}
            className="rounded-lg h-9 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Back
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-700 flex items-center justify-center font-bold text-lg">
              <InboxOutlined />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold text-slate-800 m-0 tracking-tight">
                  FG Product Transfer Details: {detailVoucherNo}
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
                <Tag color="green" className="text-[10px] m-0 px-1.5 font-semibold">
                  {toDept} (FG Store)
                </Tag>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            className="rounded-lg h-9 text-xs font-medium text-slate-600 hover:text-slate-800"
          >
            Refresh
          </Button>
          <Button
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
            className="rounded-lg h-9 text-xs font-medium text-slate-600 hover:text-slate-800 no-print"
          >
            Print
          </Button>
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
            <AppstoreOutlined /> Total Products
          </span>
          <span className="font-mono font-bold text-slate-800 text-xs block">
            {detailItemsList.length} product(s)
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-slate-400 block font-semibold text-[11px] mb-1">
            {isConfirmed ? 'Accepted Quantity' : 'Requested Quantity'}
          </span>
          <span className="font-mono font-bold text-emerald-700 text-xs block">
            {(isConfirmed ? totalApprovedQty : totalRequestedQty).toLocaleString()}
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
              Transfer Request {detailStatus === 'CONFIRMED' ? 'Confirmed' : 'Accepted'}
            </span>
          }
          description={
            <span className="text-[11px] text-emerald-700">
              This transfer request has already been accepted and transferred into Finished Goods (FG) store inventory. Quantities are finalized in read-only mode.
            </span>
          }
          className="border-emerald-200 bg-emerald-50/80 rounded-xl shadow-2xs"
        />
      )}

      {/* Pending Info Banner */}
      {!isConfirmed && (
        <Alert
          type="info"
          showIcon
          icon={<InfoCircleOutlined className="text-blue-600 text-base" />}
          message={
            <span className="font-bold text-xs text-blue-900">
              Transfer Request Pending FG Acceptance
            </span>
          }
          description={
            <span className="text-[11px] text-blue-800">
              This product transfer was sent from Production and is awaiting acceptance by FG Store. Review the requested products below and click &ldquo;Accept Transfer&rdquo; to complete receipt into Finished Goods Store.
            </span>
          }
          className="border-blue-200 bg-blue-50/70 rounded-xl shadow-2xs"
        />
      )}

      {/* Transfer Items Table (Read-Only) */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)] space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-800 m-0 uppercase tracking-wider">
              Transfer Product Items
            </h3>
            <Badge
              count={`${detailItemsList.length} item(s)`}
              className="font-semibold text-[11px]"
              style={{ backgroundColor: '#F3F4F6', color: '#4B5563', border: '1px solid #E5E7EB' }}
            />
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Read-only itemized list of products transferred from Production
          </span>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-200/80">
          <Table
            dataSource={detailItemsList}
            rowKey={(item: any) => item.id || `prod_${item.productId}`}
            pagination={false}
            size="small"
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
                title: 'Product Name',
                key: 'productName',
                render: (_: any, item: any) => {
                  const pId = item.productId ?? item.product?.id;
                  const masterProduct = pId ? productsMap.get(pId) : null;
                  const prod = item.product || masterProduct;

                  const name =
                    prod?.name ||
                    item.productName ||
                    item.name ||
                    (pId ? `Product #${pId}` : `Item #${item.id}`);

                  const catName =
                    prod?.subCategory?.category?.categoryName ||
                    prod?.category?.categoryName ||
                    prod?.subCategory?.subCategoryName ||
                    '';

                  return (
                    <div>
                      <span className="font-semibold text-slate-800 text-xs block">{name}</span>
                      {catName && (
                        <span className="text-[11px] text-slate-400 block line-clamp-1">{catName}</span>
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
                  const pId = item.productId ?? item.product?.id;
                  const masterProduct = pId ? productsMap.get(pId) : null;
                  const prod = item.product || masterProduct;

                  const unitName =
                    prod?.unit?.name ||
                    (prod?.unitId && unitsMap.get(prod.unitId)) ||
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
                title: 'Current FG Stock',
                key: 'stock',
                width: 140,
                align: 'right' as const,
                render: (_: any, item: any) => {
                  const pId = item.productId ?? item.product?.id;
                  const liveStock = pId ? liveStocks[pId] : undefined;

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

                  const masterProduct = pId ? productsMap.get(pId) : null;
                  const fallbackStock =
                    item.product?.quantity != null
                      ? Number(item.product.quantity)
                      : masterProduct?.quantity != null
                        ? Number(masterProduct.quantity)
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
                width: 150,
                align: 'right' as const,
                render: (_: any, item: any) => {
                  const qty =
                    item.requestQty != null
                      ? Number(item.requestQty)
                      : item.quantity != null
                        ? Number(item.quantity)
                        : 0;
                  return (
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {qty.toLocaleString()}
                    </span>
                  );
                },
              },
              ...(isConfirmed
                ? [
                    {
                      title: 'Accepted Qty',
                      key: 'acceptedQty',
                      width: 150,
                      align: 'right' as const,
                      render: (_: any, item: any) => {
                        const val =
                          item.approvalQty != null
                            ? Number(item.approvalQty)
                            : item.approvedQty != null
                              ? Number(item.approvedQty)
                              : item.requestQty != null
                                ? Number(item.requestQty)
                                : Number(item.quantity) || 0;
                        return (
                          <span className="font-mono font-bold text-emerald-700 text-xs">
                            {Number(val).toLocaleString()}
                          </span>
                        );
                      },
                    },
                  ]
                : []),
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
                      className="font-semibold text-[11px] uppercase m-0"
                    >
                      {status}
                    </Tag>
                  );
                },
              },
              {
                title: 'Created At',
                key: 'createdAt',
                width: 140,
                render: (_: any, item: any) => {
                  const cAt = item.createdAt || detailData?.createdAt;
                  return (
                    <span className="text-slate-500 text-xs">
                      {cAt ? dayjs(cAt).format('DD-MMM-YYYY HH:mm') : '-'}
                    </span>
                  );
                },
              },
            ]}
          />
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.04)] flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <span className="text-slate-600 text-xs font-medium">
            Total Requested Quantity:{' '}
            <strong className="font-mono text-slate-900 text-sm ml-1">
              {totalRequestedQty.toLocaleString()}
            </strong>
          </span>
          {isConfirmed && (
            <span className="text-slate-600 text-xs font-medium">
              Total Accepted Quantity:{' '}
              <strong className="font-mono text-emerald-700 text-sm ml-1">
                {totalApprovedQty.toLocaleString()}
              </strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isConfirmed ? (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleAcceptRequest}
              loading={isAccepting}
              className="bg-emerald-600 hover:bg-emerald-500 border-none text-white text-xs font-semibold px-6 h-10 rounded-lg shadow-sm"
            >
              Accept Transfer (গ্রহণ করুন)
            </Button>
          ) : (
            <Tag color="green" icon={<CheckCircleOutlined />} className="px-3 py-1 font-semibold text-xs rounded-lg m-0">
              Accepted into FG Store
            </Tag>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestAcceptDetails;
