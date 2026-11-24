/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Card,
  Descriptions,
  Table,
  Tag,
  Button,
  Spin,
  Empty,
  DatePicker,
  Select,
  Tooltip,
  Row,
  Col,
} from 'antd';
import {
  ArrowLeftOutlined,
  FallOutlined,
  RiseOutlined,
  ReloadOutlined,
  PrinterOutlined,
  SwapOutlined,
  WarningOutlined,
} from '@ant-design/icons';
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
  packingMaterialId?: number;
  transactionId?: number | string | null;
  department?: string;
  unitPrice?: number | string;
  integratedUnitPrice?: number | string;
  perUnitQty?: number | string;
  perUnitCost?: number | string;
  quantityAdd: number;
  quantityLess: number;
  debitAmount: number;
  creditAmount: number;
  integratedDebitAmount?: number;
  integratedCreditAmount?: number;
  quantityBalance?: number;
  amountBalance?: number;
  isOpening?: boolean;
  status?: string;
  chronoIndex?: number;
}

export const PackingMaterialStockReportDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Filters & State
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const {
    data: reportResponse,
    isLoading: isReportLoading,
    isFetching: isReportFetching,
    refetch,
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

  // Base opening values
  const baseOpeningQty = useMemo(() => Number(pm?.quantity ?? 0), [pm]);
  const baseOpeningAmount = useMemo(() => Number(pm?.openingAmount ?? 0), [pm]);

  // Step 1: Calculate chronological running balance (oldest to newest)
  const chronologicalReports = useMemo(() => {
    // Sort ascending by date and id for accurate running totals
    const sortedAsc = [...rawReports].sort((a: any, b: any) => {
      const timeA = new Date(a.date || a.createdAt).getTime();
      const timeB = new Date(b.date || b.createdAt).getTime();
      if (timeA !== timeB) return timeA - timeB;
      return Number(a.id) - Number(b.id);
    });

    // Start from 0 since opening stock is already recorded in pMInventory transactions
    let runningQty = 0;
    let runningAmount = 0;

    return sortedAsc.map((item: any, idx: number) => {
      const qAdd = Number(item.quantityAdd ?? 0);
      const qLess = Number(item.quantityLess ?? 0);
      const debit = Number(item.debitAmount ?? 0);
      const credit = Number(item.creditAmount ?? 0);
      const intDebit = Number(item.integratedDebitAmount ?? 0);
      const intCredit = Number(item.integratedCreditAmount ?? 0);
      const uPrice = Number(item.unitPrice ?? 0);
      const intUPrice = Number(item.integratedUnitPrice ?? 0);

      runningQty += qAdd - qLess;
      runningAmount += debit - credit;

      return {
        ...item,
        key: item.id || `ledger-${idx + 1}`,
        chronoIndex: idx + 1,
        date: item.date || item.createdAt,
        department: item.department,
        transactionId: item.transactionId,
        unitPrice: uPrice,
        integratedUnitPrice: intUPrice,
        perUnitQty: item.perUnitQty,
        perUnitCost: item.perUnitCost,
        quantityAdd: qAdd,
        quantityLess: qLess,
        debitAmount: debit,
        creditAmount: credit,
        integratedDebitAmount: intDebit,
        integratedCreditAmount: intCredit,
        quantityBalance: runningQty,
        amountBalance: runningAmount,
        isOpening: Boolean(item.isOpening),
      };
    });
  }, [rawReports, baseOpeningQty, baseOpeningAmount]);

  // Overall Ledger Totals (all records before UI department/type filtering)
  const overallTotals = useMemo(() => {
    const totals = rawReports.reduce(
      (acc, item: any) => {
        acc.quantityAdd += Number(item.quantityAdd ?? 0);
        acc.quantityLess += Number(item.quantityLess ?? 0);
        acc.debitAmount += Number(item.debitAmount ?? 0);
        acc.integratedDebitAmount += Number(item.integratedDebitAmount ?? 0);
        acc.creditAmount += Number(item.creditAmount ?? 0);
        acc.integratedCreditAmount += Number(item.integratedCreditAmount ?? 0);
        return acc;
      },
      {
        quantityAdd: 0,
        quantityLess: 0,
        debitAmount: 0,
        integratedDebitAmount: 0,
        creditAmount: 0,
        integratedCreditAmount: 0,
      }
    );

    const closingQty = totals.quantityAdd - totals.quantityLess;
    const closingAmount = totals.debitAmount - totals.creditAmount;
    const avgCostPerUnit =
      totals.quantityAdd > 0 ? totals.debitAmount / totals.quantityAdd : Number(pm?.unitPrice || 0);

    return {
      ...totals,
      closingQty,
      closingAmount,
      avgCostPerUnit,
    };
  }, [rawReports, baseOpeningQty, baseOpeningAmount, pm]);

  // Step 2: Apply department, type, and sort filters
  const displayedReports = useMemo(() => {
    let filtered = chronologicalReports.filter((item) => {
      // Department filter
      if (selectedDept !== 'ALL') {
        if (item.department !== selectedDept) return false;
      }

      // Type filter
      if (selectedType === 'IN' && item.quantityAdd <= 0) return false;
      if (selectedType === 'OUT' && item.quantityLess <= 0) return false;
      if (selectedType === 'OPENING' && !item.isOpening) return false;

      return true;
    });

    // Apply sort order
    if (sortOrder === 'desc') {
      filtered = [...filtered].reverse();
    }

    return filtered;
  }, [chronologicalReports, selectedDept, selectedType, sortOrder]);

  // Subtotal for currently displayed/filtered records
  const filteredSubtotals = useMemo(() => {
    return displayedReports.reduce(
      (acc, item) => {
        acc.quantityAdd += item.quantityAdd;
        acc.quantityLess += item.quantityLess;
        acc.debitAmount += item.debitAmount;
        acc.integratedDebitAmount += Number(item.integratedDebitAmount ?? 0);
        acc.creditAmount += item.creditAmount;
        acc.integratedCreditAmount += Number(item.integratedCreditAmount ?? 0);
        return acc;
      },
      {
        quantityAdd: 0,
        quantityLess: 0,
        debitAmount: 0,
        integratedDebitAmount: 0,
        creditAmount: 0,
        integratedCreditAmount: 0,
      }
    );
  }, [displayedReports]);

  // Stock alert threshold status
  const alertThreshold = pm?.alertQuantity != null ? Number(pm.alertQuantity) : null;
  const isLowStock = alertThreshold !== null && overallTotals.closingQty <= alertThreshold;

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedDept('ALL');
    setSelectedType('ALL');
    setSortOrder('desc');
  };

  const columns: ColumnsType<LedgerItem> = [
    {
      title: 'SL',
      key: 'sl',
      width: 50,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Date & Time',
      dataIndex: 'date',
      key: 'date',
      width: 130,
      render: (date) => (
        <div className="leading-tight">
          <span className="font-semibold text-gray-800 text-xs">
            {date ? dayjs(date).format('DD MMM YYYY') : '-'}
          </span>
          <div className="text-[11px] text-gray-400">
            {date ? dayjs(date).format('hh:mm A') : ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      width: 100,
      render: (price: number) => (
        <span className="font-mono font-medium text-gray-800 text-xs">
          ৳ {Number(price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Ad. Unit Price',
      dataIndex: 'integratedUnitPrice',
      key: 'integratedUnitPrice',
      align: 'right',
      width: 110,
      render: (price: number) => (
        <span className="font-mono font-semibold text-purple-700 text-xs">
          ৳ {Number(price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Stock In (+)',
      dataIndex: 'quantityAdd',
      key: 'quantityAdd',
      align: 'right',
      width: 100,
      render: (qty: number) => (
        <span
          className={
            qty > 0
              ? 'text-emerald-600 font-bold font-mono text-xs'
              : 'text-gray-300 font-mono text-xs'
          }
        >
          {qty > 0 ? (
            <>
              <RiseOutlined className="mr-0.5 text-[10px]" />
              +{Number(qty).toLocaleString()}
            </>
          ) : (
            '0'
          )}
        </span>
      ),
    },
    {
      title: 'Stock Out (-)',
      dataIndex: 'quantityLess',
      key: 'quantityLess',
      align: 'right',
      width: 100,
      render: (qty: number, record) => {
        const hasPerUnitInfo =
          Number(record.perUnitQty || 0) > 0 || Number(record.perUnitCost || 0) > 0;

        return (
          <div className="text-right">
            <span
              className={
                qty > 0
                  ? 'text-rose-600 font-bold font-mono text-xs'
                  : 'text-gray-300 font-mono text-xs'
              }
            >
              {qty > 0 ? (
                <>
                  <FallOutlined className="mr-0.5 text-[10px]" />
                  -{Number(qty).toLocaleString()}
                </>
              ) : (
                '0'
              )}
            </span>
            {qty > 0 && hasPerUnitInfo && (
              <Tooltip
                title={`Consumed @ ${record.perUnitQty} qty/unit, Cost: ৳ ${record.perUnitCost}/unit`}
              >
                <div className="text-[10px] text-gray-400 cursor-help">
                  {record.perUnitQty} /u
                </div>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: 'QTY Balance',
      dataIndex: 'quantityBalance',
      key: 'quantityBalance',
      align: 'right',
      width: 120,
      render: (qty: number) => (
        <span className="font-extrabold text-gray-900 font-mono text-xs">
          {Number(qty || 0).toLocaleString()}{' '}
          <span className="text-[10px] text-gray-500 font-normal">{unitName}</span>
        </span>
      ),
    },
    {
      title: 'Debit',
      dataIndex: 'debitAmount',
      key: 'debitAmount',
      align: 'right',
      width: 110,
      render: (amount: number) => (
        <span
          className={
            amount > 0
              ? 'text-emerald-700 font-semibold font-mono text-xs'
              : 'text-gray-300 font-mono text-xs'
          }
        >
          {amount > 0
            ? `৳ ${Number(amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : '৳ 0.00'}
        </span>
      ),
    },
    {
      title: 'Credit',
      dataIndex: 'creditAmount',
      key: 'creditAmount',
      align: 'right',
      width: 105,
      render: (amount: number) => (
        <span
          className={
            amount > 0
              ? 'text-rose-700 font-semibold font-mono text-xs'
              : 'text-gray-300 font-mono text-xs'
          }
        >
          {amount > 0
            ? `৳ ${Number(amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : '৳ 0.00'}
        </span>
      ),
    },
    {
      title: 'Ad. Debit',
      dataIndex: 'integratedDebitAmount',
      key: 'integratedDebitAmount',
      align: 'right',
      width: 115,
      render: (amount: number) => (
        <span
          className={
            amount > 0
              ? 'text-purple-700 font-semibold font-mono text-xs'
              : 'text-gray-300 font-mono text-xs'
          }
        >
          {amount > 0
            ? `৳ ${Number(amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : '৳ 0.00'}
        </span>
      ),
    },
    {
      title: 'Ad. Credit',
      dataIndex: 'integratedCreditAmount',
      key: 'integratedCreditAmount',
      align: 'right',
      width: 105,
      render: (amount: number) => (
        <span
          className={
            amount > 0
              ? 'text-purple-700 font-semibold font-mono text-xs'
              : 'text-gray-300 font-mono text-xs'
          }
        >
          {amount > 0
            ? `৳ ${Number(amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : '৳ 0.00'}
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
        <span
          className={`font-bold font-mono text-xs ${
            amount >= 0 ? 'text-emerald-700' : 'text-rose-600'
          }`}
        >
          ৳{' '}
          {Number(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
  ];

  if ((isReportLoading || isPmLoading) && !pm) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Spin size="large" tip="Loading ledger report..." />
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
    <div className="space-y-3 pb-8">
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-full-width {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .ant-card {
            border: 1px solid #ccc !important;
            box-shadow: none !important;
          }
          body {
            background-color: #fff !important;
          }
        }
      `}</style>

      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl px-4 py-3 shadow-xs border border-gray-100 no-print">
        <div className="flex items-center space-x-3">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="rounded-full shadow-xs hover:shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-800 m-0">
                Packing Material Stock Ledger Details
              </h1>
              <Tag
                color={pm.status === 'ACTIVE' ? 'success' : 'default'}
                className="text-xs px-2 py-0.5 rounded-full"
              >
                {pm.status || 'ACTIVE'}
              </Tag>
              {isLowStock && (
                <Tag color="error" icon={<WarningOutlined />} className="text-xs">
                  Low Stock Alert
                </Tag>
              )}
            </div>
            <p className="text-xs text-gray-500 m-0">
              Complete inventory valuation, movement history, and audit ledger
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={<ReloadOutlined spin={isReportFetching} />}
            onClick={() => refetch()}
            size="middle"
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Print / Export PDF
          </Button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block text-center py-2 border-b border-gray-300 mb-2">
        <h2 className="text-xl font-bold m-0 text-gray-900">Packing Material Stock Ledger Report</h2>
        <p className="text-sm text-gray-600 m-0">
          Item: <strong>{pm.name}</strong> | Printed on: {dayjs().format('DD MMM YYYY, hh:mm A')}
        </p>
      </div>

      {/* Metric Cards Row */}
      <Row gutter={[12, 12]} className="no-print">
        {/* Card 1: Opening Balance */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl border border-gray-100 shadow-xs hover:shadow-sm transition-shadow h-full bg-linear-to-br from-amber-50/60 to-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider mb-1">
                  Opening Balance
                </p>
                <p className="text-xl font-black text-amber-900 m-0 font-mono">
                  {baseOpeningQty.toLocaleString()}{' '}
                  <span className="text-xs font-medium text-amber-700">{unitName}</span>
                </p>
                <p className="text-xs text-amber-800 font-mono mt-1 mb-0 font-semibold">
                  ৳ {baseOpeningAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-amber-100 text-amber-800 p-2 rounded-lg text-xs font-semibold">
                Initial
              </div>
            </div>
            <div className="text-[11px] text-gray-500 mt-2 border-t border-amber-100/80 pt-1.5">
              Dated: {pm.openingDate ? dayjs(pm.openingDate).format('DD MMM YYYY') : 'Initial Setup'}
            </div>
          </Card>
        </Col>

        {/* Card 2: Total Received (In) */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl border border-gray-100 shadow-xs hover:shadow-sm transition-shadow h-full bg-linear-to-br from-emerald-50/60 to-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider mb-1">
                  Total Received (In)
                </p>
                <p className="text-xl font-black text-emerald-900 m-0 font-mono flex items-baseline gap-1">
                  <RiseOutlined className="text-emerald-600 text-base" />+
                  {overallTotals.quantityAdd.toLocaleString()}{' '}
                  <span className="text-xs font-medium text-emerald-700">{unitName}</span>
                </p>
                <p className="text-xs text-emerald-800 font-mono mt-1 mb-0 font-semibold">
                  Debit: ৳ {overallTotals.debitAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <Tag color="success" className="m-0 text-xs px-2 py-0.5">
                Stock In
              </Tag>
            </div>
            <div className="text-[11px] text-gray-500 mt-2 border-t border-emerald-100/80 pt-1.5 flex items-center justify-between">
              <span>Avg Cost: ৳ {overallTotals.avgCostPerUnit.toFixed(2)}</span>
              {overallTotals.integratedDebitAmount > 0 && (
                <span className="text-purple-600 font-semibold font-mono">
                  Ad. Debit: ৳ {overallTotals.integratedDebitAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </Card>
        </Col>

        {/* Card 3: Total Issued (Out) */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl border border-gray-100 shadow-xs hover:shadow-sm transition-shadow h-full bg-linear-to-br from-rose-50/60 to-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-rose-700 font-semibold uppercase tracking-wider mb-1">
                  Total Issued (Out)
                </p>
                <p className="text-xl font-black text-rose-900 m-0 font-mono flex items-baseline gap-1">
                  <FallOutlined className="text-rose-600 text-base" />-
                  {overallTotals.quantityLess.toLocaleString()}{' '}
                  <span className="text-xs font-medium text-rose-700">{unitName}</span>
                </p>
                <p className="text-xs text-rose-800 font-mono mt-1 mb-0 font-semibold">
                  Credit: ৳ {overallTotals.creditAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <Tag color="error" className="m-0 text-xs px-2 py-0.5">
                Production
              </Tag>
            </div>
            <div className="text-[11px] text-gray-500 mt-2 border-t border-rose-100/80 pt-1.5 flex items-center justify-between">
              <span>Net: {(overallTotals.quantityAdd - overallTotals.quantityLess).toLocaleString()} {unitName}</span>
              {overallTotals.integratedCreditAmount > 0 && (
                <span className="text-purple-600 font-semibold font-mono">
                  Ad. Credit: ৳ {overallTotals.integratedCreditAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </Card>
        </Col>

        {/* Card 4: Closing Balance (Current Stock) */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl border border-gray-100 shadow-xs hover:shadow-sm transition-shadow h-full bg-linear-to-br from-blue-50/70 to-indigo-50/40">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider mb-1">
                  Current Stock Balance
                </p>
                <p className="text-2xl font-black text-blue-900 m-0 font-mono">
                  {overallTotals.closingQty.toLocaleString()}{' '}
                  <span className="text-xs font-bold text-blue-700">{unitName}</span>
                </p>
                <p className="text-xs text-blue-900 font-mono mt-1 mb-0 font-bold">
                  Valuation: ৳{' '}
                  {overallTotals.closingAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div
                className={`p-2 rounded-lg text-xs font-bold ${
                  isLowStock
                    ? 'bg-red-100 text-red-700 animate-pulse'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {isLowStock ? 'LOW' : 'STOCKED'}
              </div>
            </div>
            <div className="text-[11px] text-gray-500 mt-2 border-t border-blue-100/80 pt-1.5 flex items-center justify-between">
              <span>Alert Threshold:</span>
              <span className="font-semibold text-gray-700">
                {alertThreshold != null ? `${alertThreshold} ${unitName}` : 'Not configured'}
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Material Specification Details */}
      <Card className="shadow-xs rounded-xl border border-gray-100 overflow-hidden">
        <Descriptions
          column={{ xs: 2, sm: 3, md: 6 }}
          size="small"
          layout="vertical"
          className="m-0"
        >
          <Descriptions.Item label={<span className="text-gray-400 text-xs">Material Name</span>}>
            <span className="text-sm font-bold text-gray-900">{pm.name}</span>
          </Descriptions.Item>
          <Descriptions.Item label={<span className="text-gray-400 text-xs">Unit Type</span>}>
            <span className="text-sm font-semibold text-gray-700">{unitName}</span>
          </Descriptions.Item>
          <Descriptions.Item label={<span className="text-gray-400 text-xs">Base Unit Price</span>}>
            <span className="text-sm font-bold text-gray-800 font-mono">
              ৳ {Number(pm.unitPrice || 0).toLocaleString()}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={<span className="text-gray-400 text-xs">Initial Opening Qty</span>}>
            <span className="text-sm font-semibold text-amber-800 font-mono">
              {baseOpeningQty.toLocaleString()} {unitName}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={<span className="text-gray-400 text-xs">Initial Opening Value</span>}>
            <span className="text-sm font-semibold text-amber-800 font-mono">
              ৳ {baseOpeningAmount.toLocaleString()}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={<span className="text-gray-400 text-xs">Opening Date</span>}>
            <span className="text-sm text-gray-700 font-medium">
              {pm.openingDate ? dayjs(pm.openingDate).format('DD MMM YYYY') : '-'}
            </span>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Transaction History & Filter Section */}
      <Card
        title={
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 py-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-800">
                Ledger Transaction History
              </span>
              <Tag color="cyan" className="rounded-full px-2 text-xs">
                {displayedReports.length} {displayedReports.length === 1 ? 'Entry' : 'Entries'}
              </Tag>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2 no-print">
              {/* Department Filter */}
              <Select
                size="small"
                value={selectedDept}
                onChange={setSelectedDept}
                style={{ width: 140 }}
                options={[
                  { label: 'All Departments', value: 'ALL' },
                  { label: 'RMPM Store', value: 'RMPM_STORE' },
                  { label: 'Production', value: 'PRODUCTION' },
                ]}
              />

              {/* Movement Type Filter */}
              <Select
                size="small"
                value={selectedType}
                onChange={setSelectedType}
                style={{ width: 130 }}
                options={[
                  { label: 'All Types', value: 'ALL' },
                  { label: 'Stock In (+)', value: 'IN' },
                  { label: 'Stock Out (-)', value: 'OUT' },
                  { label: 'Opening Only', value: 'OPENING' },
                ]}
              />

              {/* Date Filters */}
              <DatePicker
                placeholder="Start Date"
                size="small"
                value={startDate ? dayjs(startDate) : null}
                onChange={(e) => setStartDate(e?.format('YYYY-MM-DD') || '')}
                className="w-32"
              />
              <DatePicker
                placeholder="End Date"
                size="small"
                value={endDate ? dayjs(endDate) : null}
                onChange={(e) => setEndDate(e?.format('YYYY-MM-DD') || '')}
                className="w-32"
              />

              {/* Sort Order Toggle */}
              <Button
                size="small"
                icon={<SwapOutlined rotate={90} />}
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                title="Toggle Sort Order"
              >
                {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
              </Button>

              {/* Reset Button */}
              {(startDate ||
                endDate ||
                selectedDept !== 'ALL' ||
                selectedType !== 'ALL' ||
                sortOrder !== 'desc') && (
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={handleResetFilters}
                  danger
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
          dataSource={displayedReports}
          rowKey="key"
          loading={isReportFetching}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            pageSizeOptions: ['15', '30', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transactions`,
          }}
          scroll={{ x: 1320 }}
          bordered={false}
          size="middle"
          rowClassName="hover:bg-blue-50/30 transition-colors"
          locale={{ emptyText: 'No transactions found for the selected criteria' }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-amber-50/90 font-bold text-xs border-t border-amber-200">
                <Table.Summary.Cell index={0} colSpan={4} className="text-center font-bold text-amber-900">
                  Filtered Subtotal ({displayedReports.length} records)
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} className="text-right font-bold text-emerald-700 font-mono">
                  +{filteredSubtotals.quantityAdd.toLocaleString()}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} className="text-right font-bold text-rose-700 font-mono">
                  -{filteredSubtotals.quantityLess.toLocaleString()}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} className="text-right font-extrabold text-blue-900 font-mono text-sm">
                  {(filteredSubtotals.quantityAdd - filteredSubtotals.quantityLess).toLocaleString()} {unitName}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} className="text-right font-bold text-emerald-800 font-mono">
                  ৳ {filteredSubtotals.debitAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} className="text-right font-bold text-rose-800 font-mono">
                  ৳ {filteredSubtotals.creditAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} className="text-right font-bold text-purple-800 font-mono">
                  ৳ {filteredSubtotals.integratedDebitAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} className="text-right font-bold text-purple-800 font-mono">
                  ৳ {filteredSubtotals.integratedCreditAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Table.Summary.Cell>
                <Table.Summary.Cell
                  index={8}
                  className={`text-right font-black font-mono text-sm ${
                    (filteredSubtotals.debitAmount - filteredSubtotals.creditAmount) >= 0 ? 'text-emerald-800' : 'text-rose-700'
                  }`}
                >
                  ৳ {(filteredSubtotals.debitAmount - filteredSubtotals.creditAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
