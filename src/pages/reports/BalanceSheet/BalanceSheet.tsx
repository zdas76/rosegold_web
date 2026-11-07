import { Card, Col, DatePicker, Divider, Row, Spin, Statistic, Table, Tag, Empty } from 'antd';
import { useGetBalanceSheetQuery } from '../../../redux/features/reports/reports.api';
import dayjs from 'dayjs';
import { useState } from 'react';
import { BsBank, BsCashCoin, BsWallet2 } from 'react-icons/bs';
import { FaBalanceScale, FaHandHoldingUsd, FaMoneyCheckAlt } from 'react-icons/fa';

const BalanceSheet = () => {
  const [date, setDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const { data, isLoading, isFetching, isError } = useGetBalanceSheetQuery(date);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !data?.success || !data?.data) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Empty description="Failed to load balance sheet" />
      </div>
    );
  }

  const { assets, liabilities, equity, totals, asOfDate } = data.data;

  const formatCurrency = (value: number) => {
    const abs = Math.abs(value);
    const formatted = `৳ ${abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return value < 0 ? `(${formatted})` : formatted;
  };

  // ... (rest stays the same until the header JSX)

  const assetsData = [
    { key: '1', particular: 'Cash in Hand', amount: assets.cashInHand },
    { key: '2', particular: 'Cash at Bank', amount: assets.cashAtBank },
    { key: '3', particular: 'Accounts Receivable', amount: assets.accountsReceivable },
    { key: '4', particular: 'Closing Stock', amount: assets.closingStock },
  ];

  const liabilitiesData = [
    { key: '1', particular: 'Accounts Payable', amount: liabilities.accountsPayable },
  ];

  const equityData = [
    { key: '1', particular: 'Capital Account', amount: equity.capitalAccount },
    { key: '2', particular: 'Retained Earnings', amount: equity.calculateEquity },
  ];

  const tableColumns = [
    {
      title: 'Particulars',
      dataIndex: 'particular',
      key: 'particular',
      render: (text: string) => <span className="font-medium text-slate-700">{text}</span>,
    },
    {
      title: 'Amount (৳)',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (amount: number) => (
        <span className={`font-bold ${amount < 0 ? 'text-red-500' : 'text-slate-800'}`}>
          {formatCurrency(amount)}
        </span>
      ),
    },
  ];

  return (
    <div className="p-2 md:p-4 bg-[#f8fafc] min-h-screen text-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
        <div className="bg-white rounded-lg px-4 py-2">
          <h1 className="font-bold md:text-lg text-slate-800 flex items-center gap-2">
            <FaBalanceScale className="text-gold-600" /> Balance Sheet
          </h1>
          <p className="text-slate-400 text-xs mt-0">
            As of {dayjs(asOfDate).format('DD MMM YYYY, hh:mm A')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-500 bg-white px-3 py-1.5 rounded-lg shadow-sm text-sm">
            <DatePicker
              defaultValue={dayjs()}
              format="DD-MMM-YYYY"
              onChange={(_date, dateString) => {
                if (dateString) {
                  setDate(dateString as string);
                } else {
                  setDate(dayjs().format('YYYY-MM-DD'));
                }
              }}
            />
          </div>
          {isFetching && <Spin size="small" />}
        </div>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm border-l-4 border-l-emerald-500 py-0" bodyStyle={{ padding: '12px 16px' }}>
            <Statistic
              title={<span className="text-slate-400 font-medium text-[12px] uppercase tracking-wider">Total Assets</span>}
              value={totals.totalAssets}
              precision={2}
              valueStyle={{ color: '#10b981', fontWeight: 700, fontSize: '1.25rem' }}
              prefix={<BsCashCoin className="inline mb-1 mr-1 text-base" />}
              suffix={<span className="text-xs ml-1">৳</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm border-l-4 border-l-red-500 py-0" bodyStyle={{ padding: '12px 16px' }}>
            <Statistic
              title={<span className="text-slate-400 font-medium text-[12px] uppercase tracking-wider">Total Liabilities</span>}
              value={totals.totalLiabilities}
              precision={2}
              valueStyle={{ color: '#ef4444', fontWeight: 700, fontSize: '1.25rem' }}
              prefix={<FaHandHoldingUsd className="inline mb-1 mr-1 text-base" />}
              suffix={<span className="text-xs ml-1">৳</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm border-l-4 border-l-blue-500 py-0" bodyStyle={{ padding: '12px 16px' }}>
            <Statistic
              title={<span className="text-slate-400 font-medium text-[12px] uppercase tracking-wider">Total Equity</span>}
              value={equity.totalEquity}
              precision={2}
              valueStyle={{ color: '#3b82f6', fontWeight: 700, fontSize: '1.25rem' }}
              prefix={<FaMoneyCheckAlt className="inline mb-1 mr-1 text-base" />}
              suffix={<span className="text-xs ml-1">৳</span>}
            />
          </Card>
        </Col>
      </Row>

      {/* Balance Sheet Tables */}
      <Row gutter={[16, 16]}>
        {/* Assets */}
        <Col xs={24} lg={12}>
          <Card
            className="shadow-sm rounded-lg overflow-hidden h-full"
            bodyStyle={{ padding: 0 }}
          >
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-emerald-50">
              <h2 className="font-bold text-sm text-emerald-700 mb-0 uppercase tracking-tight flex items-center gap-2">
                <BsWallet2 /> Assets
              </h2>
              <Tag color="success" className="font-bold text-sm border-transparent">
                {formatCurrency(totals.totalAssets)}
              </Tag>
            </div>
            <Table
              columns={tableColumns}
              dataSource={assetsData}
              pagination={false}
              bordered
              size="small"
              className="balance-sheet-table"
              summary={() => (
                <Table.Summary.Row className="font-bold bg-emerald-50/50">
                  <Table.Summary.Cell index={0} className="text-emerald-700 py-2">
                    Total Assets
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} className="text-right text-emerald-700 font-extrabold">
                    {formatCurrency(totals.totalAssets)}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </Card>
        </Col>

        {/* Liabilities & Equity */}
        <Col xs={24} lg={12}>
          <Card
            className="shadow-sm rounded-lg overflow-hidden h-full"
            bodyStyle={{ padding: 0 }}
          >
            {/* Liabilities Section */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-red-50">
              <h2 className="font-bold text-sm text-red-700 mb-0 uppercase tracking-tight flex items-center gap-2">
                <FaHandHoldingUsd /> Liabilities
              </h2>
              <Tag color="error" className="font-bold text-sm border-transparent">
                {formatCurrency(totals.totalLiabilities)}
              </Tag>
            </div>
            <Table
              columns={tableColumns}
              dataSource={liabilitiesData}
              pagination={false}
              bordered
              size="small"
              className="balance-sheet-table"
              summary={() => (
                <Table.Summary.Row className="font-bold bg-red-50/50">
                  <Table.Summary.Cell index={0} className="text-red-700 py-2">
                    Total Liabilities
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} className="text-right text-red-700 font-extrabold">
                    {formatCurrency(totals.totalLiabilities)}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />

            <Divider className="my-0" />

            {/* Equity Section */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-blue-50">
              <h2 className="font-bold text-sm text-blue-700 mb-0 uppercase tracking-tight flex items-center gap-2">
                <BsBank /> Equity
              </h2>
              <Tag color="blue" className="font-bold text-sm border-transparent">
                {formatCurrency(equity.totalEquity)}
              </Tag>
            </div>
            <Table
              columns={tableColumns}
              dataSource={equityData}
              pagination={false}
              bordered
              size="small"
              className="balance-sheet-table"
              summary={() => (
                <Table.Summary.Row className="font-bold bg-blue-50/50">
                  <Table.Summary.Cell index={0} className="text-blue-700 py-2">
                    Total Equity
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} className="text-right text-blue-700 font-extrabold">
                    {formatCurrency(equity.totalEquity)}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />

            <Divider className="my-0" />

            {/* Liabilities + Equity Total */}
            <div className="px-5 py-3 flex items-center justify-between bg-slate-100">
              <span className="font-bold text-sm text-slate-700 uppercase tracking-tight">
                Total Liabilities & Equity
              </span>
              <span className="font-extrabold text-base text-slate-800">
                {formatCurrency(totals.totalLiabilities + equity.totalEquity)}
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      <style>{`
        .balance-sheet-table .ant-table-thead > tr > th {
          background-color: #f8fafc;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
          padding: 10px 16px !important;
        }
        .balance-sheet-table .ant-table-tbody > tr > td {
          color: #475569;
          font-size: 13px;
          padding: 10px 16px !important;
        }
        .balance-sheet-table .ant-table-row:hover > td {
          background-color: #f1f5f9 !important;
        }
        .ant-statistic-title {
           margin-bottom: 2px !important;
        }
      `}</style>
    </div>
  );
};

export default BalanceSheet;