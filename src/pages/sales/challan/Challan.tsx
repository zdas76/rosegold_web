import { useState } from 'react';
import { Form, Input, DatePicker, Button, Table, Tag, Card, Typography, Badge, Row, Col } from 'antd';
import { useGetVoucherReportQuery } from '../../../redux/features/transactions/transactons.api';
import { formateData } from '../../../utils/getFormateData';
import { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router';
import { EyeOutlined, PrinterOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import { FiRefreshCw, FiFileText } from 'react-icons/fi';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

type TCustomerOrParty = {
    id: number;
    name: string;
    contactNumber?: string;
    contactNo?: string;
    address?: string;
    status?: string;
};

type TvoucherReport = {
    id: number;
    voucherNo: string;
    invoiceNo: string | null;
    date: string;
    voucherType: string;
    paymentType: string | null;
    createdAt: string;
    party: TCustomerOrParty | null;
    customer: TCustomerOrParty | null;
    customerId: number | null;
    partyId: number | null;
};

const colHeaderStyle = { color: '#64748b', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' };

const Challan = () => {
    const [form] = Form.useForm();
    const [queryParams, setQueryParams] = useState<any>({ type: 'SALES' });
    const { data, isLoading, isFetching } = useGetVoucherReportQuery(queryParams);
    const tableData = formateData(data?.data, "");

    const handleSearch = () => {
        form.validateFields().then(values => {
            const formattedValues = {
                ...values,
                type: 'SALES',
                startDate: values.startDate ? dayjs(values.startDate).format('YYYY-MM-DD') : undefined,
                endDate: values.endDate ? dayjs(values.endDate).format('YYYY-MM-DD') : undefined,
            };
            setQueryParams(formattedValues);
        });
    };

    const handleReset = () => {
        form.resetFields();
        setQueryParams({ type: 'SALES' });
    };

    const columns: ColumnsType<TvoucherReport> = [
        {
            title: <Text strong style={colHeaderStyle}>S/N</Text>,
            dataIndex: 'sNo',
            key: 'sNo',
            width: 60,
            align: 'center',
            render: (_, __, index) => <Text style={{ color: '#94a3b8', fontWeight: 500 }}>{index + 1}</Text>,
        },
        {
            title: <Text strong style={colHeaderStyle}>Name</Text>,
            key: 'customerParty',
            render: (_, record) => {
                const name = record.customer?.name || record.party?.name || '—';
                const contact = record.customer?.contactNumber || record.party?.contactNo || '';
                const isCustomer = !!record.customer;
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <Text strong style={{ color: '#0f172a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <UserOutlined style={{ color: '#94a3b8', fontSize: '11px' }} />
                            {name}
                        </Text>
                        {contact && (
                            <Text style={{ color: '#94a3b8', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '17px' }}>
                                <PhoneOutlined style={{ fontSize: '10px' }} />
                                {contact}
                            </Text>
                        )}
                        <div style={{ paddingLeft: '17px' }}>
                            <Tag
                                bordered={false}
                                color={isCustomer ? 'cyan' : 'geekblue'}
                                style={{ fontSize: '10px', lineHeight: '16px', padding: '0 5px', fontWeight: 600 }}
                            >
                                {isCustomer ? 'Customer' : 'Party'}
                            </Tag>
                        </div>
                    </div>
                );
            },
        },
        {
            title: <Text strong style={colHeaderStyle}>Voucher No</Text>,
            dataIndex: 'voucherNo',
            key: 'voucherNo',
            width: 240,
            render: (text: string) => (
                <Text style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: '#1e40af' }}>{text}</Text>
            ),
        },
        {
            title: <Text strong style={colHeaderStyle}>Date</Text>,
            dataIndex: 'date',
            key: 'date',
            width: 130,
            render: (date: string) => (
                <Text strong style={{ color: '#334155', fontSize: '13px' }}>{dayjs(date).format("DD-MMM-YYYY")}</Text>
            ),
        },
        {
            title: <Text strong style={colHeaderStyle}>Actions</Text>,
            key: 'actions',
            width: 200,
            align: 'center',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <Link to={`/dashboard/sales/challan/${record.voucherNo}`} target="_blank">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            style={{
                                borderRadius: '6px',
                                fontWeight: 600,
                                fontSize: '12px',
                                background: '#0f172a',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            View
                        </Button>
                    </Link>
                    <Link to={`/dashboard/sales/challan/${record.voucherNo}`} target="_blank">
                        <Button
                            size="small"
                            icon={<PrinterOutlined />}
                            style={{
                                borderRadius: '6px',
                                fontWeight: 600,
                                fontSize: '12px',
                                background: '#059669',
                                color: '#fff',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            Print
                        </Button>
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <div style={{ padding: '10px 15px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Header */}
            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Badge color="#2563eb" />
                    <Text strong style={{ color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '11px' }}>Sales</Text>
                    <Title level={4} style={{ margin: 0, color: '#0f172a', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em' }}>
                        Delivery Challan
                    </Title>
                </div>
                <Tag bordered={false} color="blue" style={{ fontSize: '11px', fontWeight: 600 }}>
                    {tableData?.length || 0} Total
                </Tag>
            </div>

            {/* Filter Card */}
            <Card
                bordered={false}
                size="small"
                style={{
                    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                    borderRadius: '10px',
                    marginBottom: '10px',
                    background: '#ffffff',
                    border: '1px solid #f1f5f9'
                }}>
                <Form
                    size='small'
                    form={form}
                    layout="vertical"
                    onFinish={handleSearch}>
                    <Row gutter={24} align="bottom">
                        <Col xs={24} sm={12} md={7}>
                            <Form.Item
                                label={<Text strong style={{ color: '#475569', fontSize: '13px' }}>Period Start</Text>}
                                name="startDate"
                                style={{ marginBottom: 0 }}
                            >
                                <DatePicker
                                    placeholder="yyyy-mm-dd"
                                    format="YYYY-MM-DD"
                                    style={{ width: '100%', borderRadius: '6px' }}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={7}>
                            <Form.Item
                                label={<Text strong style={{ color: '#475569', fontSize: '13px' }}>Period End</Text>}
                                name="endDate"
                                style={{ marginBottom: 0 }}>
                                <DatePicker
                                    placeholder="yyyy-mm-dd"
                                    format="YYYY-MM-DD"
                                    style={{ width: '100%', borderRadius: '6px' }}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                            <Form.Item
                                label={<Text strong style={{ color: '#475569', fontSize: '13px' }}>Search</Text>}
                                name="searchTerm"
                                style={{ marginBottom: 0 }}
                            >
                                <Input
                                    placeholder="Voucher, customer..."
                                    allowClear
                                    style={{ borderRadius: '6px' }}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={4}>
                            <Form.Item style={{ marginBottom: 0 }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={isLoading || isFetching}
                                        size="middle"
                                        style={{
                                            borderRadius: '8px',
                                            fontWeight: 700,
                                            height: '32px',
                                            flex: 1,
                                            background: '#0f172a',
                                            border: 'none'
                                        }}
                                    >
                                        Search
                                    </Button>
                                    <Button
                                        onClick={handleReset}
                                        size="middle"
                                        style={{
                                            borderRadius: '8px',
                                            fontWeight: 600,
                                            height: '32px',
                                            color: '#64748b'
                                        }}>
                                        <FiRefreshCw />
                                    </Button>
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>

            {/* Table Card */}
            {tableData && tableData.length > 0 ? (
                <Card
                    bordered={false}
                    style={{
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
                        borderRadius: '12px',
                        border: '1px solid #f1f5f9'
                    }}
                    title={
                        <Title level={5} style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                            <FiFileText style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            Sales Voucher List
                        </Title>
                    }                >
                    <Table
                        loading={isLoading || isFetching}
                        columns={columns}
                        dataSource={tableData}
                        rowKey="id"
                        bordered={false}
                        pagination={{ pageSize: 15, showSizeChanger: false, showTotal: (total) => `Total ${total} records` }}
                        size="middle"
                        rowClassName={(_, index) => (index % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]/50')}
                        style={{ borderRadius: '8px', overflow: 'hidden' }}
                    />
                </Card>
            ) : !isLoading && !isFetching ? (
                <div style={{ textAlign: 'center', padding: '120px 0', background: '#fff', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                    <FiFileText size={48} style={{ color: '#cbd5e1', marginBottom: '20px' }} />
                    <Title level={4} style={{ color: '#475569', margin: 0 }}>No Challans Found</Title>
                    <Text style={{ color: '#94a3b8' }}>Adjust your filters or date range to find sales vouchers.</Text>
                </div>
            ) : (
                <Card
                    bordered={false}
                    style={{
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        borderRadius: '12px',
                        border: '1px solid #f1f5f9'
                    }}
                >
                    <Table
                        loading={true}
                        columns={columns}
                        dataSource={[]}
                        rowKey="id"
                        size="middle"
                    />
                </Card>
            )}
        </div>
    );
};

export default Challan;