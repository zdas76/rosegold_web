/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { Table, Tag, Button, Input, Space, Tooltip } from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGetProductionsQuery } from '../../../../redux/features/production/production.api';
import { useGetProductsQuery } from '../../../../redux/features/product/product.api';
import { useGetRowMaterialsQuery } from '../../../../redux/features/rowMaterials/rowMaterials.api';
import { Link } from 'react-router';

interface SavedProductionListProps {
  onNextStep: (production: any) => void;
  onNewProduction: () => void;
}

export const SavedProductionList: React.FC<SavedProductionListProps> = ({
  onNewProduction,
}) => {
  const [searchText, setSearchText] = useState('');
  const { data: productionsData, isLoading, isFetching, refetch } = useGetProductionsQuery({});
  const { data: productsData } = useGetProductsQuery({});
  const { data: rawMaterialsData } = useGetRowMaterialsQuery({});

  useMemo(() => {
    const map = new Map<number, string>();
    productsData?.data?.forEach((p: any) => {
      map.set(p.id, p.name);
    });
    return map;
  }, [productsData]);

  useMemo(() => {
    const map = new Map<number, any>();
    rawMaterialsData?.data?.forEach((rm: any) => {
      map.set(rm.id, rm);
    });
    return map;
  }, [rawMaterialsData]);

  const processedList = useMemo(() => {
    const rawList: any[] = Array.isArray(productionsData?.data) ? productionsData.data : [];

    return rawList.map((item: any, idx: number) => {
      const products = item?.productioniteminfo?.products;
      const productName = products?.name;
      const productId = products?.id;
      const status = item?.productioniteminfo?.status;
      const batchNo = item?.productioniteminfo?.batchNo;
      // Extract raw materials from inventory
      const rawInvs = item.inventory || [];
      const rawCount = rawInvs.length;
      const rawCostTotal = rawInvs.reduce((sum: number, rm: any) => {
        const qty = rm.quantityLess ?? rm.quantity ?? rm.quantityAdd ?? 0;
        const rate = rm.unitPrice ?? 0;
        const amt =
          rm.creditAmount != null && Number(rm.creditAmount) > 0
            ? Number(rm.creditAmount)
            : qty * rate;
        return sum + Number(amt || 0);
      }, 0);

      return {
        ...item,
        key: item.id || idx + 1,
        si: idx + 1,
        productName,
        productId,
        batchNo: batchNo,
        status: status,
        rawInvs,
        rawCount,
        rawCostTotal,
      };
    });
  }, [productionsData]);

  const filteredList = useMemo(() => {
    if (!searchText.trim()) return processedList;
    const term = searchText.toLowerCase();
    return processedList.filter((item: any) => {
      const matchBatch = item.batchNo?.toString().toLowerCase().includes(term);
      const matchVoucher = item.voucherNo?.toString().toLowerCase().includes(term);
      const matchProduct = item.productName?.toLowerCase().includes(term);
      return matchBatch || matchVoucher || matchProduct;
    });
  }, [processedList, searchText]);

  const columns = [
    {
      title: 'SI',
      dataIndex: 'si',
      key: 'si',
      width: 45,
      align: 'center' as const,
      render: (si: number) => <span className="text-slate-400 font-medium text-xs">{si}</span>,
    },
    {
      title: 'Voucher No',
      dataIndex: 'voucherNo',
      key: 'voucherNo',
      width: 140,
      render: (text: string, record: any) => (
        <span className="font-semibold text-slate-800 font-mono whitespace-nowrap text-xs">
          {text || `PROD-#${record.id}`}
        </span>
      ),
    },
    {
      title: 'Batch No',
      dataIndex: 'batchNo',
      key: 'batchNo',
      width: 100,
      align: 'center' as const,
      render: (batchNo: string) => (
        <span className="font-medium text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded text-xs whitespace-nowrap border border-slate-200/50">
          {batchNo || '-'}
        </span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 110,
      align: 'center' as const,
      render: (dateStr: string) => (
        <span className="text-slate-500 text-xs whitespace-nowrap font-medium">
          {dateStr ? dayjs(dateStr).format('DD-MMM-YYYY') : '-'}
        </span>
      ),
    },
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      render: (_: any, record: any) => (
        <span className="font-semibold text-slate-800 text-xs leading-snug block" title={record?.productName}>
          {record?.productName || '-'}
        </span>
      ),
    },
    {
      title: 'Raw Materials',
      dataIndex: 'rawMaterials',
      key: 'rawMaterials',
      width: 110,
      align: 'center' as const,
      render: (_: any, record: any) => {
        const items = record.rawInvs || [];
        const rawItem = items?.filter((m: any) => !m?.product);

        const tooltipContent = (
          <div className="max-h-48 overflow-y-auto text-xs space-y-1">
            {rawItem?.map((m: any, i: number) => {
              const rawName = m.raWMaterial?.name;
              const qty = m.quantityLess ?? m.quantity;
              const unit = m.raWMaterial?.unit?.name;
              return (
                <div key={i} className="flex justify-between gap-3">
                  <span className="font-semibold">{rawName}</span>
                  <span className="font-semibold">{qty} {unit}</span>
                </div>
              );
            })}
          </div>
        );

        return (
          <Tooltip title={tooltipContent} placement="topLeft">
            <span className="inline-flex items-center gap-1 cursor-pointer whitespace-nowrap">
              <Tag color="blue" className="font-medium text-xs m-0 rounded border-slate-200">
                {rawItem?.length} Item{rawItem?.length === 1 ? '' : 's'}
              </Tag>
              <InfoCircleOutlined className="text-slate-400 text-xs" />
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Total Cost',
      dataIndex: 'rawCostTotal',
      key: 'rawCostTotal',
      width: 120,
      align: 'right' as const,
      render: (cost: number) => (
        <span className="font-bold text-[#C58D2F] font-mono whitespace-nowrap text-xs">
          {Number(cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ৳
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 115,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Tag
          className="rounded font-medium text-[11px]"
          color={
            record?.status === 'COMPLETE'
              ? 'success'
              : record?.status === 'IN_PROGRESS'
                ? 'processing'
                : record?.status === 'PENDING' || record?.status === 'PENDDING'
                  ? 'warning'
                  : record?.status === 'PROCESSING'
                    ? 'warning'
                    : 'default'
          }
        >
          {record?.status || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 105,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Link
          to={`/dashboard/production-step-two/${record.id}`}
          className="inline-flex items-center gap-1 font-semibold text-xs text-[#C58D2F] hover:text-[#a57325] transition-colors"
        >
          Next Step →
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top action & filter bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 rounded-lg bg-slate-50/60 border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-3 flex-1 max-w-md w-full">
          <Input
            placeholder="Search by Voucher, Batch, or Product..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="w-full rounded-lg"
          />
          <Tooltip title="Refresh list">
            <Button
              icon={<ReloadOutlined className="text-slate-500" />}
              onClick={() => refetch()}
              loading={isFetching}
              className="rounded-lg border-slate-200 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]"
            />
          </Tooltip>
        </div>

        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onNewProduction}
            className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white font-semibold rounded-lg px-5 h-9 text-xs shadow-[0_3px_12px_rgba(197,141,47,0.3)] hover:shadow-[0_4px_16px_rgba(197,141,47,0.45)] transition-all"
          >
            Create New Production
          </Button>
        </Space>
      </div>

      {/* Table displaying saved productions */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-[0_2px_12px_-3px_rgba(15,23,42,0.05)]">
        <Table
          dataSource={filteredList}
          columns={columns}
          rowKey="id"
          loading={isLoading || isFetching}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Total ${total} saved productions`,
          }}
          size="small"
        />
      </div>
    </div>
  );
};
