/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { Table, Tag, Button, Input, Space, Tooltip } from 'antd';
import {
  ArrowRightOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGetProductionsQuery } from '../../../../redux/features/production/production.api';
import { useGetProductsQuery } from '../../../../redux/features/product/product.api';
import { useGetRowMaterialsQuery } from '../../../../redux/features/rowMaterials/rowMaterials.api';

interface SavedProductionListProps {
  onNextStep: (production: any) => void;
  onNewProduction: () => void;
}

export const SavedProductionList: React.FC<SavedProductionListProps> = ({
  onNextStep,
  onNewProduction,
}) => {
  const [searchText, setSearchText] = useState('');
  const { data: productionsData, isLoading, isFetching, refetch } = useGetProductionsQuery({});
  const { data: productsData } = useGetProductsQuery({});
  const { data: rawMaterialsData } = useGetRowMaterialsQuery({});

  const productMap = useMemo(() => {
    const map = new Map<number, string>();
    productsData?.data?.forEach((p: any) => {
      map.set(p.id, p.name);
    });
    return map;
  }, [productsData]);

  const rawMaterialMap = useMemo(() => {
    const map = new Map<number, any>();
    rawMaterialsData?.data?.forEach((rm: any) => {
      map.set(rm.id, rm);
    });
    return map;
  }, [rawMaterialsData]);

  const processedList = useMemo(() => {
    const rawList: any[] = Array.isArray(productionsData?.data)
      ? productionsData.data
      : Array.isArray((productionsData as any)?.data?.data)
        ? (productionsData as any).data.data
        : [];

    return rawList.map((item: any, idx: number) => {
      // Find finished product in inventory
      const prodInv = item.inventory?.find((inv: any) => inv.productId || inv.product);
      const productId = prodInv?.productId || prodInv?.product?.id;
      const productName =
        prodInv?.product?.name ||
        (productId ? productMap.get(productId) : null) ||
        'Unspecified Product';

      const finishedQty = prodInv?.quantityAdd ?? prodInv?.quantity ?? null;

      // Extract raw materials from inventory
      const rawInvs = item.inventory?.filter((inv: any) => inv.rawId || inv.raWMaterial) || [];
      const rawCount = rawInvs.length;

      const rawCostTotal = rawInvs.reduce((sum: number, rm: any) => {
        const qty = rm.quantityLess ?? rm.quantity ?? rm.quantityAdd ?? 0;
        const rate = rm.unitPrice ?? 0;
        const amt = rm.creditAmount ?? (qty * rate);
        return sum + Number(amt || 0);
      }, 0);

      return {
        ...item,
        key: item.id || idx + 1,
        si: idx + 1,
        productName,
        productId,
        finishedQty,
        rawInvs,
        rawCount,
        rawCostTotal,
      };
    });
  }, [productionsData, productMap]);

  // Filter based on search text
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
    },
    {
      title: 'Voucher No',
      dataIndex: 'voucherNo',
      key: 'voucherNo',
      width: 140,
      render: (text: string, record: any) => (
        <span className="font-semibold text-blue-700 whitespace-nowrap text-xs sm:text-sm">
          {text || `PROD-#${record.id}`}
        </span>
      ),
    },
    {
      title: 'Batch No',
      dataIndex: 'batchNo',
      key: 'batchNo',
      width: 95,
      align: 'center' as const,
      render: (batch: string) => (
        <span className="font-medium text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
          {batch || '-'}
        </span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 105,
      align: 'center' as const,
      render: (dateStr: string) => (
        <span className="text-gray-600 text-xs sm:text-sm whitespace-nowrap">
          {dateStr ? dayjs(dateStr).format('DD-MMM-YYYY') : '-'}
        </span>
      ),
    },
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string) => (
        <span className="font-semibold text-gray-900 text-xs sm:text-sm leading-snug block" title={name}>
          {name}
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
        const tooltipContent = (
          <div className="max-h-48 overflow-y-auto text-xs space-y-1">
            {items.map((m: any, i: number) => {
              const rawName = m.raWMaterial?.name || rawMaterialMap.get(m.rawId)?.name || `Item #${m.rawId}`;
              const qty = m.quantityLess ?? m.quantity ?? 0;
              const unit = m.raWMaterial?.unit?.name || rawMaterialMap.get(m.rawId)?.unit?.name || 'Kg';
              return (
                <div key={i} className="flex justify-between gap-3">
                  <span>{rawName}:</span>
                  <span className="font-semibold">{qty} {unit}</span>
                </div>
              );
            })}
          </div>
        );

        return (
          <Tooltip title={tooltipContent} placement="topLeft">
            <span className="inline-flex items-center gap-1 cursor-pointer whitespace-nowrap">
              <Tag color="geekblue" className="font-medium text-xs m-0">
                {record.rawCount} Item{record.rawCount === 1 ? '' : 's'}
              </Tag>
              <InfoCircleOutlined className="text-gray-400 text-xs" />
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Cost',
      dataIndex: 'rawCostTotal',
      key: 'rawCostTotal',
      width: 120,
      align: 'right' as const,
      render: (cost: number) => (
        <span className="font-bold text-amber-700 whitespace-nowrap text-xs sm:text-sm">
          {Number(cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ৳
        </span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 115,
      align: 'center' as const,
      render: (_: any, record: any) => <Tag>{record.status}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 105,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Button
          type="primary"
          size="small"
          icon={<ArrowRightOutlined />}
          onClick={() => onNextStep(record)}
          className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white shadow-xs font-semibold px-2.5 text-xs flex items-center justify-center gap-1 mx-auto"
        >
          Next Step
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top action & filter bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/80 p-3 rounded-lg border border-slate-200/60">
        <div className="flex items-center gap-3 flex-1 max-w-md w-full">
          <Input
            placeholder="Search by Voucher, Batch, or Product..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="w-full"
          />
          <Tooltip title="Refresh list">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isFetching}
            />
          </Tooltip>
        </div>

        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onNewProduction}
            className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white shadow-xs font-semibold"
          >
            Create New Production
          </Button>
        </Space>
      </div>

      {/* Table displaying saved productions */}
      <div className="border border-slate-200/60 rounded-lg overflow-hidden bg-white shadow-xs">
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
          size="middle"
        />
      </div>
    </div>
  );
};
