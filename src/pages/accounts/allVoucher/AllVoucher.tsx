/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Tag,
  DatePicker,
  Select,
  Input,
  Button,
  Space,
  Tooltip,
  Row,
  Col,
  Statistic,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  PhoneOutlined,
  UserOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router';
import dayjs from 'dayjs';
import { useGetVoucherReportQuery } from '../../../redux/features/transactions/transactons.api';

const { Option } = Select;
const { RangePicker } = DatePicker;

export interface TParty {
  id: number;
  name: string;
  contactNo?: string;
  address?: string;
  partyType?: string;
  openingDate?: string;
  openingAmount?: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TVoucherItem {
  id: number;
  voucherNo: string;
  invoiceNo: string | null;
  status: string;
  date: string;
  partyId: number | null;
  voucherType: string;
  createdAt: string;
  updatedAt: string;
  party: TParty | null;
  customer?: TParty | null;
}

const voucherTypes = [
  'ALL',
  'PURCHASE',
  'PAYMENT',
  'PRODUCTION',
  'SALES',
  'RECEIPT',
  'JOURNAL',
  'CONTRA',
  'REQUEST',
  'TRANSFER',
  'LOGORDERS',
  'CREATEPRODUCT',
];

const getVoucherTypeTag = (type: string) => {
  const upper = (type || '').toUpperCase();
  switch (upper) {
    case 'PURCHASE':
      return <Tag color="blue" className="font-semibold px-2.5 py-0.5 rounded-full">{upper}</Tag>;
    case 'PAYMENT':
      return <Tag color="volcano" className="font-semibold px-2.5 py-0.5 rounded-full">{upper}</Tag>;
    case 'PRODUCTION':
      return <Tag color="purple" className="font-semibold px-2.5 py-0.5 rounded-full">{upper}</Tag>;
    case 'SALES':
      return <Tag color="green" className="font-semibold px-2.5 py-0.5 rounded-full">{upper}</Tag>;
    case 'RECEIPT':
      return <Tag color="cyan" className="font-semibold px-2.5 py-0.5 rounded-full">{upper}</Tag>;
    case 'JOURNAL':
      return <Tag color="magenta" className="font-semibold px-2.5 py-0.5 rounded-full">{upper}</Tag>;
    case 'CONTRA':
      return <Tag color="orange" className="font-semibold px-2.5 py-0.5 rounded-full">{upper}</Tag>;
    case 'REQUEST':
      return <Tag color="gold" className="font-semibold px-2.5 py-0.5 rounded-full">{upper}</Tag>;
    case 'TRANSFER':
      return <Tag color="lime" className="font-semibold px-2.5 py-0.5 rounded-full">{upper}</Tag>;
    default:
      return <Tag color="default" className="font-semibold px-2.5 py-0.5 rounded-full">{upper}</Tag>;
  }
};

const getStatusTag = (status: string) => {
  const upper = (status || '').toUpperCase();
  if (upper === 'CONFIRMED') {
    return (
      <Tag icon={<CheckCircleOutlined />} color="success" className="font-medium px-2 py-0.5 rounded-full">
        CONFIRMED
      </Tag>
    );
  }
  if (upper === 'PENDING') {
    return (
      <Tag icon={<ClockCircleOutlined />} color="warning" className="font-medium px-2 py-0.5 rounded-full">
        PENDING
      </Tag>
    );
  }
  return <Tag color="default" className="font-medium px-2 py-0.5 rounded-full">{upper || 'N/A'}</Tag>;
};

const AllVoucher: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // API parameters
  const apiQueryParams = useMemo(() => {
    const params: { startDate?: string; endDate?: string; type?: string; searchTerm?: string } = {};
    if (dateRange && dateRange[0]) {
      params.startDate = dateRange[0].format('YYYY-MM-DD');
    }
    if (dateRange && dateRange[1]) {
      params.endDate = dateRange[1].format('YYYY-MM-DD');
    }
    if (selectedType && selectedType !== 'ALL') {
      params.type = selectedType;
    }
    if (searchTerm.trim()) {
      params.searchTerm = searchTerm.trim();
    }
    return params;
  }, [dateRange, selectedType, searchTerm]);

  const { data, isLoading, isFetching, refetch } = useGetVoucherReportQuery(apiQueryParams);

  // Raw list
  const voucherList: TVoucherItem[] = useMemo(() => {
    if (Array.isArray(data?.data)) {
      return data.data;
    }
    return [];
  }, [data]);

  // Client-side filtering (ensures instant feedback & covers status and extra fields)
  const filteredList = useMemo(() => {
    return voucherList.filter((item) => {
      // Status filter
      if (selectedStatus !== 'ALL') {
        const itemStatus = (item.status || '').toUpperCase();
        if (itemStatus !== selectedStatus) return false;
      }

      // Type filter (client fallback in case backend didn't filter)
      if (selectedType !== 'ALL') {
        const itemType = (item.voucherType || '').toUpperCase();
        if (itemType !== selectedType.toUpperCase()) return false;
      }

      // Search term filter (client fallback)
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const vNo = (item.voucherNo || '').toLowerCase();
        const invNo = (item.invoiceNo || '').toLowerCase();
        const partyName = (item.party?.name || item.customer?.name || '').toLowerCase();
        const partyContact = (item.party?.contactNo || item.customer?.contactNo || '').toLowerCase();
        const type = (item.voucherType || '').toLowerCase();

        const match =
          vNo.includes(term) ||
          invNo.includes(term) ||
          partyName.includes(term) ||
          partyContact.includes(term) ||
          type.includes(term);

        if (!match) return false;
      }

      return true;
    });
  }, [voucherList, selectedStatus, selectedType, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = voucherList.length;
    let confirmed = 0;
    let pending = 0;
    const typeCount: Record<string, number> = {};

    voucherList.forEach((v) => {
      const statusUpper = (v.status || '').toUpperCase();
      if (statusUpper === 'CONFIRMED') confirmed++;
      else if (statusUpper === 'PENDING') pending++;

      const typeUpper = (v.voucherType || 'OTHER').toUpperCase();
      typeCount[typeUpper] = (typeCount[typeUpper] || 0) + 1;
    });

    return { total, confirmed, pending, typeCount };
  }, [voucherList]);

  const handleResetFilters = () => {
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setDateRange(null);
    setSearchTerm('');
  };

  const columns: ColumnsType<TVoucherItem> = [
    {
      title: 'SL',
      key: 'sl',
      width: 60,
      align: 'center',
      render: (_, __, index) => <span className="font-medium text-gray-500">{index + 1}</span>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 130,
      render: (dateStr: string) => {
        if (!dateStr) return <span className="text-gray-400">—</span>;
        const d = dayjs(dateStr);
        return (
          <div className="leading-tight">
            <span className="font-medium text-gray-800">{d.format('DD MMM YYYY')}</span>
            <div className="text-xs text-gray-400">{d.format('hh:mm A')}</div>
          </div>
        );
      },
    },
    {
      title: 'Voucher No',
      dataIndex: 'voucherNo',
      key: 'voucherNo',
      width: 190,
      render: (voucherNo: string) => (
        <Link
          to={`/dashboard/voucher-details/${voucherNo}`}
          target="_blank"
          className="font-semibold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1.5"
        >
          <FileTextOutlined className="text-amber-600" />
          <span>{voucherNo}</span>
        </Link>
      ),
    },
    {
      title: 'Invoice / Ref No',
      dataIndex: 'invoiceNo',
      key: 'invoiceNo',
      width: 150,
      render: (invoiceNo: string | null) =>
        invoiceNo ? (
          <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
            {invoiceNo}
          </span>
        ) : (
          <span className="text-gray-300 font-mono text-xs">—</span>
        ),
    },
    {
      title: 'Voucher Type',
      dataIndex: 'voucherType',
      key: 'voucherType',
      width: 140,
      align: 'center',
      render: (type: string) => getVoucherTypeTag(type),
    },
    {
      title: 'Party / Supplier / Account',
      key: 'party',
      render: (_, record) => {
        const partyObj = record.party || record.customer;
        if (!partyObj || !partyObj.name) {
          return (
            <span className="text-gray-400 italic text-xs">
              Internal / System
            </span>
          );
        }
        return (
          <div className="text-xs">
            <div className="font-semibold text-gray-800 flex items-center gap-1.5">
              <UserOutlined className="text-gray-400" />
              <span>{partyObj.name}</span>
              {partyObj.partyType && (
                <Tag color="cyan" className="text-[10px] py-0 px-1.5 m-0 leading-normal">
                  {partyObj.partyType}
                </Tag>
              )}
            </div>
            {partyObj.contactNo && (
              <div className="text-gray-500 mt-0.5 flex items-center gap-1">
                <PhoneOutlined className="text-[10px] text-gray-400" />
                <span>{partyObj.contactNo}</span>
              </div>
            )}
            {partyObj.address && (
              <div className="text-gray-400 truncate max-w-[220px]" title={partyObj.address}>
                {partyObj.address}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      align: 'center',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 170,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View voucher details in new tab">
            <Link to={`/dashboard/voucher-details/${record.voucherNo}`} target="_blank">
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                className="bg-amber-600 hover:bg-amber-700 border-none flex items-center"
              >
                View
              </Button>
            </Link>
          </Tooltip>
          <Tooltip title="Print voucher">
            <Link to={`/dashboard/voucher-details/${record.voucherNo}`} target="_blank">
              <Button
                size="small"
                icon={<PrinterOutlined />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white border-none flex items-center"
              >
                Print
              </Button>
            </Link>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5 bg-gray-50/50 min-h-screen">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-700 border border-amber-200">
              <FileTextOutlined className="text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                All Vouchers
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Accounts ledger vouchers directory with complete details, filters, and print access
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={<ReloadOutlined spin={isLoading || isFetching} />}
            onClick={() => refetch()}
            loading={isLoading || isFetching}
            className="hover:border-amber-500"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6} lg={6}>
          <Card className="rounded-xl border border-gray-200 shadow-xs hover:shadow-sm transition-all" styles={{ body: { padding: '16px' } }}>
            <Statistic
              title={<span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Vouchers</span>}
              value={stats.total}
              valueStyle={{ color: '#1f2937', fontWeight: 'bold' }}
              prefix={<FileTextOutlined className="text-amber-600 mr-1.5" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={6}>
          <Card className="rounded-xl border border-gray-200 shadow-xs hover:shadow-sm transition-all" styles={{ body: { padding: '16px' } }}>
            <Statistic
              title={<span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Confirmed</span>}
              value={stats.confirmed}
              valueStyle={{ color: '#16a34a', fontWeight: 'bold' }}
              prefix={<CheckCircleOutlined className="text-green-600 mr-1.5" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={6}>
          <Card className="rounded-xl border border-gray-200 shadow-xs hover:shadow-sm transition-all" styles={{ body: { padding: '16px' } }}>
            <Statistic
              title={<span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending</span>}
              value={stats.pending}
              valueStyle={{ color: '#d97706', fontWeight: 'bold' }}
              prefix={<ClockCircleOutlined className="text-amber-600 mr-1.5" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={6}>
          <Card className="rounded-xl border border-gray-200 shadow-xs hover:shadow-sm transition-all" styles={{ body: { padding: '16px' } }}>
            <Statistic
              title={<span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Filtered Count</span>}
              value={filteredList.length}
              valueStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
              suffix={<span className="text-xs font-normal text-gray-400">/ {stats.total}</span>}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Toolbar Card */}
      <Card className="rounded-xl border border-gray-200/80 shadow-xs" styles={{ body: { padding: '16px 20px' } }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 items-end">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Search Keyword</label>
            <Input
              placeholder="Search voucher no, invoice, party..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              className="w-full"
            />
          </div>

          {/* Type Select */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Voucher Type</label>
            <Select
              value={selectedType}
              onChange={(val) => setSelectedType(val)}
              className="w-full"
              placeholder="Select Type"
            >
              {voucherTypes.map((type) => (
                <Option key={type} value={type}>
                  {type === 'ALL' ? 'All Types' : type}
                </Option>
              ))}
            </Select>
          </div>

          {/* Status Select */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <Select
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              className="w-full"
              placeholder="Select Status"
            >
              <Option value="ALL">All Status</Option>
              <Option value="CONFIRMED">CONFIRMED</Option>
              <Option value="PENDING">PENDING</Option>
            </Select>
          </div>

          {/* Date Range Picker */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date Range</label>
            <RangePicker
              value={dateRange}
              onChange={(val) => setDateRange(val as any)}
              className="w-full"
              format="YYYY-MM-DD"
            />
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-wrap items-center justify-between mt-3 pt-3 border-t border-gray-100 gap-2">
          <div className="text-xs text-gray-500">
            Showing <span className="font-semibold text-gray-800">{filteredList.length}</span> of{' '}
            <span className="font-semibold text-gray-800">{voucherList.length}</span> records
          </div>
          <Button
            icon={<ClearOutlined />}
            size="small"
            onClick={handleResetFilters}
            className="text-gray-600 hover:text-amber-700"
          >
            Reset Filters
          </Button>
        </div>
      </Card>

      {/* Main Table Card */}
      <Card className="rounded-xl border border-gray-200/80 shadow-xs overflow-hidden" styles={{ body: { padding: 0 } }}>
        <Table<TVoucherItem>
          columns={columns}
          dataSource={filteredList}
          rowKey={(record) => record.id || record.voucherNo}
          loading={isLoading || isFetching}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            pageSizeOptions: ['10', '15', '25', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} vouchers`,
          }}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: (
              <div className="py-12 text-center text-gray-400">
                <FileTextOutlined className="text-4xl text-gray-300 mb-2" />
                <p className="text-sm font-medium">No Vouchers Found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting the filter criteria or date range</p>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default AllVoucher;
