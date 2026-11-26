/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { Table, Tag, DatePicker, Input, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router';
import { SearchOutlined, WarningOutlined, ReloadOutlined } from '@ant-design/icons';
import { useGetPackingMaterialStockReportQuery } from '../../../redux/features/packingMaterials/packingMaterials.api';
import { useGetUnitsQuery } from '../../../redux/features/unit/unit.api';
import type { TPackingMaterialStockReport } from '../../../types/types';

export const PackingMaterialStockReport: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  const { data: stockData, isLoading, isFetching } = useGetPackingMaterialStockReportQuery({
    startDate,
    endDate,
  });
  const { data: unitsData } = useGetUnitsQuery({});

  const unitsMap = useMemo(() => {
    const map = new Map<number, string>();
    const list = Array.isArray(unitsData?.data) ? unitsData.data : [];
    list.forEach((u: any) => {
      if (u?.id) map.set(Number(u.id), u.name);
    });
    return map;
  }, [unitsData]);

  const processedData = useMemo(() => {
    const list: TPackingMaterialStockReport[] = Array.isArray(stockData?.data) ? stockData.data : [];

    const items = list.map((item, idx) => {
      const pm = item.pm || ({} as any);
      const openingQty = Number(pm.quantity ?? 0);
      const addQty = Number(item.total?._sum?.quantityAdd ?? 0);
      const lessQty = Number(item.total?._sum?.quantityLess ?? 0);
      const qtyBalance = openingQty + addQty - lessQty;

      const debitAmount = Number(item.total?._sum?.debitAmount ?? 0);
      const creditAmount = Number(item.total?._sum?.creditAmount ?? 0);
      const balanceAmount = debitAmount - creditAmount;

      const alertQty = pm.alertQuantity != null ? Number(pm.alertQuantity) : null;
      const isLowStock = alertQty !== null && qtyBalance <= alertQty;
      const unitName = pm.unit?.name || unitsMap.get(Number(pm.unitId)) || 'Pcs';

      return {
        key: pm.id || idx + 1,
        id: pm.id,
        name: pm.name || '',
        description: pm.description,
        unitName,
        openingQty,
        addQty,
        lessQty,
        qtyBalance,
        alertQty,
        isLowStock,
        debitAmount,
        creditAmount,
        balanceAmount,
      };
    });

    const filtered = items.filter(item => {
      if (!searchText.trim()) return true;
      const q = searchText.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.unitName.toLowerCase().includes(q)
      );
    });

    // Sort: low stock items first
    filtered.sort((a, b) => {
      if (a.isLowStock && !b.isLowStock) return -1;
      if (!a.isLowStock && b.isLowStock) return 1;
      if (a.isLowStock && b.isLowStock) return a.qtyBalance - b.qtyBalance;
      return 0;
    });

    return filtered.map((item, index) => ({
      ...item,
      sl: index + 1,
    }));
  }, [stockData, unitsMap, searchText]);

  const lowStockCount = useMemo(() => {
    return processedData.filter(item => item.isLowStock).length;
  }, [processedData]);

  const totals = useMemo(() => {
    return processedData.reduce(
      (acc, item) => {
        acc.openingQty += item.openingQty;
        acc.addQty += item.addQty;
        acc.lessQty += item.lessQty;
        acc.qtyBalance += item.qtyBalance;
        acc.debitAmount += item.debitAmount;
        acc.creditAmount += item.creditAmount;
        acc.balanceAmount += item.balanceAmount;
        return acc;
      },
      {
        openingQty: 0,
        addQty: 0,
        lessQty: 0,
        qtyBalance: 0,
        debitAmount: 0,
        creditAmount: 0,
        balanceAmount: 0,
      }
    );
  }, [processedData]);

  const columns: ColumnsType<any> = [
    {
      title: 'SL',
      dataIndex: 'sl',
      key: 'sl',
      width: 55,
      align: 'center',
    },
    {
      title: 'Packing Material',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="py-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-gray-800 leading-tight">{text}</span>
            {record.isLowStock && (
              <Tag color="error" className="m-0 text-[10px] font-bold uppercase px-1 py-0 leading-none">
                Low Stock
              </Tag>
            )}
          </div>
          {record.description && (
            <p className="text-[11px] text-gray-400 line-clamp-1 leading-tight m-0 mt-0.5">
              {record.description}
            </p>
          )}
        </div>
      ),
    },
    {
      title: 'Unit',
      dataIndex: 'unitName',
      key: 'unitName',
      width: 75,
      align: 'center',
      render: (unit: string) => (
        <span className="text-gray-600 font-medium text-xs">{unit}</span>
      ),
    },
    {
      title: 'Opening Qty',
      dataIndex: 'openingQty',
      key: 'openingQty',
      align: 'right',
      width: 105,
      render: (val: number) => (
        <span className="font-medium text-gray-700">
          {Number(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Qty In',
      dataIndex: 'addQty',
      key: 'addQty',
      align: 'right',
      width: 95,
      render: (val: number) => (
        <span className="font-medium text-emerald-600">
          {Number(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Qty Out',
      dataIndex: 'lessQty',
      key: 'lessQty',
      align: 'right',
      width: 95,
      render: (val: number) => (
        <span className="font-medium text-rose-600">
          {Number(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Qty Balance',
      dataIndex: 'qtyBalance',
      key: 'qtyBalance',
      align: 'right',
      width: 125,
      render: (val: number, record: any) => {
        if (record.isLowStock) {
          return (
            <div className="flex items-center justify-end gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="font-extrabold text-red-600 text-sm font-mono">
                {Number(val || 0).toLocaleString()}
              </span>
            </div>
          );
        }
        return (
          <span className="font-bold text-gray-800 font-mono">
            {Number(val || 0).toLocaleString()}
          </span>
        );
      },
    },
    {
      title: 'Debit (BDT)',
      dataIndex: 'debitAmount',
      key: 'debitAmount',
      align: 'right',
      width: 120,
      render: (val: number) => (
        <span className="font-medium text-slate-800 font-mono">
          ৳ {Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Credit (BDT)',
      dataIndex: 'creditAmount',
      key: 'creditAmount',
      align: 'right',
      width: 120,
      render: (val: number) => (
        <span className="font-medium text-slate-800 font-mono">
          ৳ {Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Balance (BDT)',
      dataIndex: 'balanceAmount',
      key: 'balanceAmount',
      align: 'right',
      width: 125,
      render: (val: number) => (
        <span className={`font-semibold font-mono ${val >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
          ৳ {Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      width: 90,
      render: (_, record) => (
        <Link
          to={`/dashboard/packing_material_stock_report/${record.id}`}
          className="text-gold-600 hover:underline font-bold text-xs"
        >
          Details
        </Link>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
      {/* Blinking Animation for Low Stock Rows & Compact Styling */}
      <style>{`
        @keyframes redBlinkBg {
          0%, 100% {
            background-color: rgba(254, 226, 226, 0.95);
          }
          50% {
            background-color: rgba(254, 202, 202, 0.4);
          }
        }
        .row-low-stock {
          animation: redBlinkBg 1.5s infinite ease-in-out !important;
        }
        .row-low-stock td {
          background-color: inherit !important;
        }
        .compact-packing-table .ant-table-tbody > tr > td {
          padding: 6px 10px !important;
          font-size: 12.5px !important;
          line-height: 1.3 !important;
        }
        .compact-packing-table .ant-table-thead > tr > th {
          padding: 8px 10px !important;
          font-size: 12.5px !important;
        }
      `}</style>

      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 m-0">
            Packing Material Stock Report
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 m-0">
            Real-time stock balance & movement tracking for packaging materials
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Input
            placeholder="Search material..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 180 }}
          />

          <DatePicker
            placeholder="Start Date"
            onChange={(e) => setStartDate(e?.format('YYYY-MM-DD') || '')}
          />
          <DatePicker
            placeholder="End Date"
            onChange={(e) => setEndDate(e?.format('YYYY-MM-DD') || '')}
          />

          {(searchText || startDate || endDate) && (
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchText('');
                setStartDate('');
                setEndDate('');
              }}
              title="Reset Filters"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-md text-xs font-semibold animate-pulse">
          <WarningOutlined className="text-red-600" />
          <span>
            Low Stock Warning: <strong>{lowStockCount}</strong> packing material
            {lowStockCount > 1 ? 's' : ''} at or below Alert Quantity
          </span>
        </div>
      )}

      {/* Table */}
      <Table
        size="small"
        loading={isLoading || isFetching}
        columns={columns}
        dataSource={processedData}
        rowKey="key"
        rowClassName={(record) => (record.isLowStock ? 'row-low-stock' : '')}
        pagination={{ pageSize: 15, showTotal: (total) => `Total ${total} items` }}
        scroll={{ x: 1050 }}
        className="compact-packing-table rounded-lg overflow-hidden border border-gray-100"
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row className="bg-amber-50/50 font-bold text-xs">
              <Table.Summary.Cell index={0} colSpan={3} className="text-center font-bold">
                Total ({processedData.length} items)
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} className="text-right font-bold text-gray-700">
                {totals.openingQty.toLocaleString()}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} className="text-right font-bold text-emerald-600">
                {totals.addQty.toLocaleString()}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3} className="text-right font-bold text-rose-600">
                {totals.lessQty.toLocaleString()}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4} className="text-right font-bold text-slate-900 font-mono">
                {totals.qtyBalance.toLocaleString()}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5} className="text-right font-bold text-slate-800 font-mono">
                ৳ {totals.debitAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} className="text-right font-bold text-slate-800 font-mono">
                ৳ {totals.creditAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7} className={`text-right font-bold font-mono ${totals.balanceAmount >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                ৳ {totals.balanceAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={8} className="text-center font-bold text-gray-400">
                -
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </div>
  );
};

export default PackingMaterialStockReport;
