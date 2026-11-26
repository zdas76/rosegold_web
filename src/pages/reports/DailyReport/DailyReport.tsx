import { useGetDailyReportQuery } from '../../../redux/features/reports/reports.api'
import { ColumnsType } from 'antd/es/table'
import { Link } from 'react-router'
import { Button, Card, Col, Divider, Row, Statistic, Table, Tag, DatePicker } from 'antd'
import { BsArrowDownCircle, BsArrowUpCircle, BsEye, BsListTask } from 'react-icons/bs'
import { useState } from 'react'
import dayjs from 'dayjs'

interface TDailyReportTable {
  key: string;
  date: string;
  voucherNo: string;
  party: string;
  narration: string;
  accountTitle: string;
  debit: number;
  credit: number;
  rowSpan: number;
  voucherType: string;
}

const DailyReport = () => {
  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const { data, isLoading, isFetching } = useGetDailyReportQuery({ date: date })


  const tableData: TDailyReportTable[] = data?.data?.flatMap((voucher: any, vIndex: number) =>
    voucher.journal.map((entry: any, index: number) => ({
      key: `${voucher.id}-${index}`,
      date: new Date(voucher.date).toLocaleDateString(),
      voucherNo: voucher.voucherNo,
      party: voucher.party?.name || voucher.customer?.name || "N/A",
      narration: entry.narration || "-",
      accountTitle: entry.accountsItem?.accountsItemName || "-",
      debit: entry.debitAmount,
      credit: entry.creditAmount,
      rowSpan: index === 0 ? voucher.journal.length : 0,
      voucherType: voucher.voucherType,
      voucherIndex: vIndex,
    }))
  ) || [];

  const totalDebit = tableData.reduce((acc, curr) => acc + (curr.debit || 0), 0);
  const totalCredit = tableData.reduce((acc, curr) => acc + (curr.credit || 0), 0);
  const totalVouchers = data?.data?.length || 0;

  const getVoucherTagColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'SALES': return 'green';
      case 'PURCHASE': return 'blue';
      case 'RECEIVE': return 'cyan';
      case 'PAYMENT': return 'red';
      case 'CONTRA': return 'purple';
      case 'JOURNAL': return 'orange';
      default: return 'default';
    }
  };

  const columns: ColumnsType<TDailyReportTable> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      onCell: (record: TDailyReportTable) => ({
        rowSpan: record.rowSpan,
      }),

    },
    {
      title: 'Voucher No',
      dataIndex: 'voucherNo',
      key: 'voucherNo',
      onCell: (record: TDailyReportTable) => ({
        rowSpan: record.rowSpan,
      }),
      render: (_: any, record: TDailyReportTable) => (
        <Link to={`/dashboard/voucher-details/${record.voucherNo}`} target='_blank' className='text-ellipsis  whitespace-break-spaces max-w-[200px] overflow-hidden'>
          {record.voucherNo}
        </Link>
      ),
    },
    {
      title: 'Voucher Type',
      dataIndex: 'voucherType',
      key: 'voucherType',
      onCell: (record: TDailyReportTable) => ({
        rowSpan: record.rowSpan,
      }),
      render: (type: string) => <Tag color={getVoucherTagColor(type)} className="font-medium text-[10px] px-1 line-height-1">{type}</Tag>
    },
    {
      title: 'Party',
      dataIndex: 'party',
      key: 'party',
      onCell: (record: TDailyReportTable) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: 'Narration',
      dataIndex: 'narration',
      key: 'narration',
      render: (text: string) => <div className="narration-text">{text}</div>
    },
    {
      title: 'Account Title',
      dataIndex: 'accountTitle',
      key: 'accountTitle',
      render: (accountTitle: string) => <b className="text-slate-700 font-medium text-sm">{accountTitle}</b>
    },
    {
      title: 'Debit (৳)',
      dataIndex: 'debit',
      key: 'debit',
      render: (amount: number) => <span className='font-bold'>{amount?.toLocaleString()}</span>,
    },
    {
      title: 'Credit (৳)',
      dataIndex: 'credit',
      key: 'credit',
      render: (amount: number) => <span className='font-bold'>{amount?.toLocaleString()}</span>,
    },
  ];

  return (
    <div className="p-2 md:p-2 rounded-lg bg-[#f8fafc] min-h-screen text-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
        <div className="bg-white rounded-lg px-4 py-2">
          <h1 className="font-bold md:text-lg text-slate-800">Daily Transaction Report</h1>
          <p className="text-slate-400 text-xs mt-0">Daily financial summary overview</p>
        </div>
        <div className="flex items-center gap-2 text-slate-500 bg-white px-3 py-1.5 rounded-lg shadow-sm text-sm">
          <DatePicker
            defaultValue={dayjs(date)}
            format="DD-MMM-YYYY"
            onChange={(date, dateString) => {
              if (dateString) {
                setDate(dateString as string);
              } else {
                // Fallback to today if cleared
                setDate(dayjs().format("DD-MMM-YYYY"));
              }
            }}
          />
        </div>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm border-l-4 border-l-green-500 py-0" bodyStyle={{ padding: '12px 16px' }}>
            <Statistic
              title={<span className="text-slate-400 font-medium text-[12px] uppercase tracking-wider">Total Credit</span>}
              value={totalCredit}
              precision={2}
              valueStyle={{ color: '#10b981', fontWeight: 700, fontSize: '1.25rem' }}
              prefix={<BsArrowUpCircle className="inline mb-1 mr-1 text-base" />}
              suffix={<span className="text-xs ml-1">৳</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm border-l-4 border-l-red-500 py-0" bodyStyle={{ padding: '12px 16px' }}>
            <Statistic
              title={<span className="text-slate-400 font-medium text-[12px] uppercase tracking-wider">Total Debit</span>}
              value={totalDebit}
              precision={2}
              valueStyle={{ color: '#ef4444', fontWeight: 700, fontSize: '1.25rem' }}
              prefix={<BsArrowDownCircle className="inline mb-1 mr-1 text-base" />}
              suffix={<span className="text-xs ml-1">৳</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm border-l-4 border-l-blue-500 py-0" bodyStyle={{ padding: '12px 16px' }}>
            <Statistic
              title={<span className="text-slate-400 font-medium text-[12px] uppercase tracking-wider">Transactions</span>}
              value={totalVouchers}
              valueStyle={{ color: '#3b82f6', fontWeight: 700, fontSize: '1.25rem' }}
              prefix={<BsListTask className="inline mb-1 mr-1 text-base" />}
            />
          </Card>
        </Col>
      </Row>

      <Card className="shadow-md rounded-lg overflow-hidden" bodyStyle={{ padding: 0 }}>
        <div className="px-5 py-3 border-b border-slate-100 flex items-center bg-white">
          <h2 className="font-bold text-sm text-slate-600 mb-0 uppercase tracking-tight">Transaction Details</h2>
        </div>
        <div className="p-0 overflow-x-auto text-sm">
          <Table
            columns={columns}
            dataSource={tableData}
            loading={isLoading || isFetching}
            pagination={false}
            bordered
            sticky={{ offsetHeader: 0 }}
            size="small"
            className="daily-report-table font-medium"
            rowClassName={(record) => (record as any).voucherIndex % 2 === 0 ? 'bg-white' : 'bg-slate-100'}
            summary={(pageData: readonly TDailyReportTable[]) => {
              let currentDebit = 0;
              let currentCredit = 0;
              pageData.forEach(({ debit, credit }) => {
                currentDebit += debit || 0;
                currentCredit += credit || 0;
              });

              return (
                <Table.Summary.Row className="font-bold bg-slate-50 text-sm">
                  <Table.Summary.Cell index={0} colSpan={6} className="text-right text-slate-700 py-2">TOTAL</Table.Summary.Cell>
                  <Table.Summary.Cell index={1} className="text-red-500">{currentDebit?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Table.Summary.Cell>
                  <Table.Summary.Cell index={2} className="text-green-500">{currentCredit?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />
        </div>
      </Card>

      <style>{`
        .daily-report-table .ant-table-thead > tr > th {
          background-color: #f8fafc;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
          padding: 10px 12px !important;
        }
        .daily-report-table .ant-table-tbody > tr > td {
          color: #475569;
          font-size: 13px;
          padding: 8px 12px !important;
        }
        .daily-report-table .ant-table-row:hover > td {
          background-color: #f1f5f9 !important;
        }
        .bg-slate-50\/50 {
          background-color: #f8fafc !important;
        }
        .narration-text {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 250px;
        }
        .ant-statistic-title {
           margin-bottom: 2px !important;
        }
      `}</style>
    </div>
  )
}

export default DailyReport
