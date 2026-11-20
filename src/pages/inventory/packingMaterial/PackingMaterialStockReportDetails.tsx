/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Descriptions, Table, Tag, Button, Spin, Empty, DatePicker } from 'antd';
import { ArrowLeftOutlined, FallOutlined, RiseOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import {
  useGetPackingMaterialByIdQuery,
  useGetPackingMaterialStockReportByIdQuery,
} from '../../../redux/features/packingMaterials/packingMaterials.api';
import { useGetUnitsQuery } from '../../../redux/features/unit/unit.api';

interface LedgerItem {
  id: number;
  date: string;
  department?: string;
  unitPrice?: number;
  quantityAdd: number;
  quantityLess: number;
  debitAmount: number;
  creditAmount: number;
  quantityBalance?: number;
  amountBalance?: number;
  isOpening?: boolean;
  status?: string;
}

export const PackingMaterialStockReportDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const {
    data: reportResponse,
    isLoading: isReportLoading,
    isFetching: isReportFetching,
  } = useGetPackingMaterialStockReportByIdQuery(
    { id: id!, startDate, endDate },
    { skip: !id }
  );

  const { data: singlePmResponse, isLoading: isPmLoading } = useGetPackingMaterialByIdQuery(
    Number(id),
    { skip: !id }
  );

  const { data: unitsData } = useGetUnitsQuery({});

  const unitsMap = useMemo(() => {
    const map = new Map<number, string>();
    const list = Array.isArray(unitsData?.data) ? unitsData.data : [];
    list.forEach((u: any) => {
      if (u?.id) map.set(Number(u.id), u.name);
    });
    return map;
  }, [unitsData]);

  const pm = useMemo(() => {
    return (
      reportResponse?.data?.packingMaterials ||
      reportResponse?.data?.packingMaterial ||
      reportResponse?.data?.pm ||
      singlePmResponse?.data ||
      null
    );
  }, [reportResponse, singlePmResponse]);

  const unitName = useMemo(() => {
    return pm?.unit?.name || unitsMap.get(Number(pm?.unitId)) || 'Pcs';
  }, [pm, unitsMap]);

  const rawReports = useMemo(() => {
    const list =
      reportResponse?.data?.report ||
      reportResponse?.data?.reports ||
      reportResponse?.data?.transactions ||
      [];
    return Array.isArray(list) ? list : [];
  }, [reportResponse]);

  const processedReports = useMemo(() => {
    const openingQty = Number(pm?.quantity ?? 0);
    const openingAmount = Number(pm?.openingAmount ?? 0);

    let runningQty = openingQty;
    let runningAmount = openingAmount;

    return rawReports.map((item: any, idx: number) => {
      const qAdd = Number(item.quantityAdd ?? 0);
      const qLess = Number(item.quantityLess ?? 0);
      const debit = Number(item.debitAmount ?? 0);
      const credit = Number(item.creditAmount ?? 0);

      runningQty += qAdd - qLess;
      runningAmount += debit - credit;

      return {
        ...item,
        key: item.id || idx + 1,
        date: item.date || item.createdAt,
        department: item.department,
        unitPrice: item.unitPrice,
        quantityAdd: qAdd,
        quantityLess: qLess,
        debitAmount: debit,
        creditAmount: credit,
        quantityBalance: runningQty,
        amountBalance: runningAmount,
      };
    });
  }, [rawReports, pm]);

  const totals = useMemo(() => {
    return rawReports.reduce(
      (acc, item: any) => {
        acc.quantityAdd += Number(item.quantityAdd ?? 0);
        acc.quantityLess += Number(item.quantityLess ?? 0);
        acc.debitAmount += Number(item.debitAmount ?? 0);
        acc.creditAmount += Number(item.creditAmount ?? 0);
        return acc;
      },
      {
        quantityAdd: 0,
        quantityLess: 0,
        debitAmount: 0,
        creditAmount: 0,
      }
    );
  }, [rawReports]);

  const finalQtyBalance = useMemo(() => {
    if (processedReports.length > 0) {
      return processedReports[processedReports.length - 1].quantityBalance;
    }
    return Number(pm?.quantity ?? 0);
  }, [processedReports, pm]);

  const finalAmountBalance = useMemo(() => {
    if (processedReports.length > 0) {
      return processedReports[processedReports.length - 1].amountBalance;
    }
    return Number(pm?.openingAmount ?? 0);
  }, [processedReports, pm]);

  const columns: ColumnsType<LedgerItem> = [
    {
      title: 'SL',
      key: 'sl',
      width: 50,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 110,
      render: (date) => (
        <span className="font-semibold text-gray-700">
          {date ? dayjs(date).format('DD MMM YYYY') : '-'}
        </span>
      ),
    },
    // {
    //   title: 'Department',
    //   dataIndex: 'department',
    //   key: 'department',
    //   width: 110,
    //   align: 'center',
    //   render: (dept: string) =>
    //     dept ? (
    //       <Tag color="geekblue" className="text-xs font-semibold m-0">
    //         {dept}
    //       </Tag>
    //     ) : (
    //       <span className="text-gray-400">-</span>
    //     ),
    // },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      width: 100,
      render: (price: number) => (
        <span className="font-mono text-gray-700">
          ৳ {Number(price || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Stock In (+)',
      dataIndex: 'quantityAdd',
      key: 'quantityAdd',
      align: 'right',
      width: 105,
      render: (qty: number) => (
        <span className={qty > 0 ? 'text-emerald-600 font-semibold font-mono' : 'text-gray-400 font-mono'}>
          {qty > 0 && <RiseOutlined className="mr-1" />}
          {Number(qty || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Stock Out (-)',
      dataIndex: 'quantityLess',
      key: 'quantityLess',
      align: 'right',
      width: 105,
      render: (qty: number) => (
        <span className={qty > 0 ? 'text-rose-600 font-semibold font-mono' : 'text-gray-400 font-mono'}>
          {qty > 0 && <FallOutlined className="mr-1" />}
          {Number(qty || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'QTY Balance',
      dataIndex: 'quantityBalance',
      key: 'quantityBalance',
      align: 'right',
      width: 130,
      render: (qty: number) => (
        <span className="font-bold text-gray-900 font-mono">
          {Number(qty || 0).toLocaleString()} {unitName}
        </span>
      ),
    },
    {
      title: 'Debit Amount',
      dataIndex: 'debitAmount',
      key: 'debitAmount',
      align: 'right',
      width: 120,
      render: (amount: number) => (
        <span className="text-emerald-700 font-semibold font-mono">
          ৳ {Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Credit Amount',
      dataIndex: 'creditAmount',
      key: 'creditAmount',
      align: 'right',
      width: 120,
      render: (amount: number) => (
        <span className="text-rose-700 font-semibold font-mono">
          ৳ {Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Balance (BDT)',
      dataIndex: 'amountBalance',
      key: 'amountBalance',
      align: 'right',
      width: 130,
      render: (amount: number) => (
        <span className={`font-semibold font-mono ${amount >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
          ৳ {Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
  ];

  if ((isReportLoading || isPmLoading) && !pm) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Spin size="large" />
      </div>
    );
  }

  if (!pm) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] space-y-3">
        <Empty description="Packing Material not found" />
        <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header Section */}
      <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2.5 shadow-sm border border-gray-100">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="rounded-full shadow-xs hover:shadow-sm transition-shadow"
        />
        <h1 className="text-lg font-bold text-gray-800 m-0">
          Packing Material Ledger Details
        </h1>
      </div>

      {/* Material Summary Card */}
      <Card className="shadow-xs rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row items-start justify-between gap-3 mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 m-0">
              {pm.name}
              <Tag
                color={pm.status === 'ACTIVE' ? 'success' : 'default'}
                className="text-xs px-2.5 py-0.5 rounded-full"
              >
                {pm.status || 'ACTIVE'}
              </Tag>
            </h2>
            <p className="text-gray-500 mt-1 mb-0 text-xs">
              {pm.description || 'No description provided'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left md:text-right bg-blue-50/90 border border-blue-100 px-3.5 py-1.5 rounded-xl shadow-xs">
              <p className="text-[11px] text-blue-600 font-semibold uppercase tracking-wider m-0">
                Current Stock
              </p>
              <p className="text-xl font-extrabold text-blue-800 m-0 font-mono">
                {finalQtyBalance?.toLocaleString()}{' '}
                <span className="text-xs font-medium text-blue-600">{unitName}</span>
              </p>
            </div>

            <div className="text-left md:text-right bg-emerald-50/90 border border-emerald-100 px-3.5 py-1.5 rounded-xl shadow-xs">
              <p className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wider m-0">
                Current Balance
              </p>
              <p className="text-xl font-extrabold text-emerald-800 m-0 font-mono">
                ৳ {Number(finalAmountBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <Descriptions
          column={{ xs: 2, sm: 3, md: 6 }}
          size="small"
          layout="vertical"
          className="border-t border-gray-100 pt-2.5 mt-2"
        >
          <Descriptions.Item label={<span className="text-gray-400 text-xs">Unit</span>}>
            <span className="text-sm font-semibold text-gray-700">{unitName}</span>
          </Descriptions.Item>
          <Descriptions.Item label={<span className="text-gray-400 text-xs">Unit Price</span>}>
            <span className="text-sm font-bold text-gray-800 font-mono">
              ৳ {Number(pm.unitPrice || 0).toLocaleString()}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={<span className="text-gray-400 text-xs">Opening Quantity</span>}>
            <span className="text-sm font-semibold text-gray-700 font-mono">
              {Number(pm.quantity || 0).toLocaleString()} {unitName}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={<span className="text-gray-400 text-xs">Opening Amount</span>}>
            <span className="text-sm font-semibold text-gray-700 font-mono">
              ৳ {Number(pm.openingAmount || 0).toLocaleString()}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={<span className="text-gray-400 text-xs">Alert Quantity</span>}>
            <span className="text-sm font-semibold text-amber-700 font-mono">
              {Number(pm.alertQuantity || 0).toLocaleString()} {unitName}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={<span className="text-gray-400 text-xs">Opening Date</span>}>
            <span className="text-sm text-gray-700 font-medium">
              {pm.openingDate ? dayjs(pm.openingDate).format('DD MMM YYYY') : '-'}
            </span>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Transaction History Card */}
      <Card
        title={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1">
            <span className="text-base font-bold text-gray-800">Transaction History</span>
            <div className="flex items-center gap-2">
              <DatePicker
                placeholder="Start Date"
                size="small"
                onChange={(e) => setStartDate(e?.format('YYYY-MM-DD') || '')}
              />
              <DatePicker
                placeholder="End Date"
                size="small"
                onChange={(e) => setEndDate(e?.format('YYYY-MM-DD') || '')}
              />
              {(startDate || endDate) && (
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        }
        className="shadow-xs rounded-xl border border-gray-100"
        styles={{ header: { borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' } }}
      >
        <Table
          columns={columns}
          dataSource={processedReports}
          rowKey="key"
          loading={isReportFetching}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transactions`,
          }}
          scroll={{ x: 1050 }}
          bordered={false}
          size="middle"
          rowClassName="hover:bg-gray-50/80 transition-colors"
          locale={{ emptyText: 'No transactions found for this material' }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-amber-50/50 font-bold text-xs">
                <Table.Summary.Cell index={0} colSpan={4} className="text-center font-bold">
                  Total ({processedReports.length} records)
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} className="text-right font-bold text-emerald-600 font-mono">
                  {totals.quantityAdd.toLocaleString()}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} className="text-right font-bold text-rose-600 font-mono">
                  {totals.quantityLess.toLocaleString()}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} className="text-right font-bold text-slate-900 font-mono">
                  {finalQtyBalance?.toLocaleString()} {unitName}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} className="text-right font-bold text-slate-800 font-mono">
                  ৳ {totals.debitAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} className="text-right font-bold text-slate-800 font-mono">
                  ৳ {totals.creditAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} className={`text-right font-bold font-mono ${finalAmountBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  ৳ {finalAmountBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </div>
  );
};

export default PackingMaterialStockReportDetails;
