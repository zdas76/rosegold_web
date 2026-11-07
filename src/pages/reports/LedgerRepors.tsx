/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, DatePicker, Form, Select, Table, Card, Row, Col, Typography, Tag, Badge, TableProps } from 'antd';
const { Title, Text } = Typography;
import { useGetAccountItemQuery } from '../../redux/features/transactions/transactons.api';
import { formateData } from '../../utils/getFormateData';
import { TAccountsItem, TLedgerReport } from '../../types/types';
import { useLazyGetLedgerReportQuery } from '../../redux/features/reports/reports.api';
import { toast } from 'sonner';
import { useState } from 'react';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiRefreshCw } from 'react-icons/fi';

const LedgerReport = () => {
    const [reportData, setReportData] = useState<TLedgerReport[] | null>(null);
    const [selectedAccountName, setSelectedAccountName] = useState<string>('');
    const { data } = useGetAccountItemQuery({});
    const formatedData = formateData(data?.data || [], "accountsItemName").filter((item: TAccountsItem) => item?.accountsItemName.toLocaleLowerCase() !== "bank");
    const [getReport, { isLoading, isFetching }] = useLazyGetLedgerReportQuery();
    const [form] = Form.useForm();

    // Calculate totals
    let balance: number = 0;
    let totalDebit = 0;
    let totalCredit = 0;

    const tableData = reportData?.map((item: TLedgerReport, index: number) => {
        totalDebit += item.debitAmount;
        totalCredit += item.creditAmount;
        balance += item.debitAmount - item.creditAmount;
        const roundBalance = parseFloat(balance.toFixed(2));
        return {
            key: index,
            sNo: index + 1,
            date: dayjs(item.date).format('DD-MM-YYYY'),
            voucherNo: item.transactionInfo?.voucherNo || '-',
            narration: item.narration || '-',
            type: item.type,
            debit: item.debitAmount,
            credit: item.creditAmount,
            balance: roundBalance
        };
    });

    const onFinish = async (values: any) => {
        if (!values.accountsItem) return;

        const res = await getReport({
            accountsItemId: values.accountsItem,
            startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
            endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        });
        if (res?.data?.success && res?.data?.data?.length > 0) {
            setReportData(res?.data?.data);
            // Find the selected account name
            const selected = formatedData.find((item: any) => item.value === values.accountsItem);
            setSelectedAccountName(selected?.label || '');
            toast.success("Ledger Report fetched successfully");
        } else {
            setReportData(null);
            toast.error("No data found for the selected criteria");
        }
    };

    const handleReset = () => {
        form.resetFields();
        setReportData(null);
        setSelectedAccountName('');
    };

    const typeColors: Record<string, string> = {
        debit: 'blue',
        credit: 'green',
        journal: 'purple',
        opening: 'gold',
        closing: 'red',
        transfer: 'cyan',
    };

    const columns: TableProps<any>['columns'] = [
        {
            title: <Text strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>S/N</Text>,
            dataIndex: 'sNo',
            width: 70,
            align: 'center'
        },
        {
            title: <Text strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</Text>,
            dataIndex: 'date',
            width: 120
        },
        {
            title: <Text strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Narration</Text>,
            dataIndex: 'narration',
            ellipsis: true
        },
        {
            title: <Text strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Voucher No</Text>,
            dataIndex: 'voucherNo',
            width: 140
        },
        {
            title: <Text strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</Text>,
            dataIndex: 'type',
            width: 100,
            align: 'center',
            render: (v: string) => (
                <Tag bordered={false} color={typeColors[v] || 'default'} style={{ textTransform: 'capitalize', fontSize: '11px', fontWeight: 600 }}>
                    {v}
                </Tag>
            ),
        },
        {
            title: <div style={{ textAlign: 'right' }}><Text strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Debit (৳)</Text></div>,
            dataIndex: 'debit',
            align: 'right',
            width: 140,
            render: (v: number) => (
                v ? <Text style={{ fontFamily: 'monospace', fontSize: '14px', color: '#0f172a' }}>{v.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text> : <Text type="secondary" style={{ fontSize: '14px' }}>-</Text>
            ),
        },
        {
            title: <div style={{ textAlign: 'right' }}><Text strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Credit (৳)</Text></div>,
            dataIndex: 'credit',
            align: 'right',
            width: 140,
            render: (v: number) => (
                v ? <Text style={{ fontFamily: 'monospace', fontSize: '14px', color: '#0f172a' }}>{v.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text> : <Text type="secondary" style={{ fontSize: '14px' }}>-</Text>
            ),
        },
        {
            title: <div style={{ textAlign: 'right' }}><Text strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance (৳)</Text></div>,
            dataIndex: 'balance',
            align: 'right',
            width: 150,
            render: (v: number) => (
                <Text strong style={{
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: v >= 0 ? '#1e40af' : '#b91c1c'
                }}>
                    {v.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
            ),
        },
    ];

    return (
        <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Header */}
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <Badge color="#2563eb" /> <Text strong style={{ color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '12px' }}>Financial Reports</Text>
                    <Title level={1} style={{ margin: '3px 0 0 0', color: '#0f172a', fontWeight: 800, fontSize: '22px', letterSpacing: '-0.02em' }}>
                        Ledger Head Report
                    </Title>
                    {/* <Text style={{ color: '#64748b', fontSize: '16px' }}>Track account-wise debit, credit, and running balance.</Text> */}
                </div>
            </div>

            {/* Filter Card */}
            <Card
                bordered={false}
                style={{
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
                    borderRadius: '12px',
                    marginBottom: '32px',
                    background: '#ffffff',
                    border: '1px solid #f1f5f9'
                }}>
                <Form
                    size='middle'
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}>
                    <Row gutter={24} align="bottom">
                        <Col xs={24} sm={12} md={9}>
                            <Form.Item
                                label={<Text strong style={{ color: '#475569', fontSize: '13px' }}>Account Head</Text>}
                                name="accountsItem"
                                rules={[{ required: true, message: 'Please select an account item' }]}
                                style={{ marginBottom: 0 }}
                            >
                                <Select
                                    showSearch
                                    placeholder="Search by account name"
                                    options={formatedData}
                                    style={{ width: '100%' }}
                                    dropdownStyle={{ borderRadius: '8px' }}
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                    }
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={5}>
                            <Form.Item label={<Text strong style={{ color: '#475569', fontSize: '13px' }}>Period Start</Text>} name="startDate" style={{ marginBottom: 0 }}>
                                <DatePicker
                                    placeholder="yyyy-mm-dd"
                                    format="YYYY-MM-DD"
                                    style={{ width: '100%', borderRadius: '6px' }}
                                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={5}>
                            <Form.Item label={<Text strong style={{ color: '#475569', fontSize: '13px' }}>Period End</Text>} name="endDate" style={{ marginBottom: 0 }}>
                                <DatePicker
                                    placeholder="yyyy-mm-dd"
                                    format="YYYY-MM-DD"
                                    style={{ width: '100%', borderRadius: '6px' }}
                                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={5}>
                            <Form.Item style={{ marginBottom: 0 }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={isLoading || isFetching}
                                        size="large"
                                        style={{
                                            borderRadius: '8px',
                                            fontWeight: 700,
                                            height: '40px',
                                            flex: 1,
                                            background: '#0f172a',
                                            border: 'none'
                                        }}
                                    >
                                        Run Report
                                    </Button>
                                    <Button
                                        onClick={handleReset}
                                        size="large"
                                        style={{
                                            borderRadius: '8px',
                                            fontWeight: 600,
                                            height: '40px',
                                            color: '#64748b'
                                        }}
                                    >
                                        <FiRefreshCw />
                                    </Button>
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>

            {/* Results */}
            <AnimatePresence mode="wait">
                {reportData ? (
                    <motion.div
                        key="report-data"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}>
                        {/* Summary Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                            <Card bordered={false} bodyStyle={{ padding: '24px' }} style={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                <Text style={{ color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Entries</Text>
                                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <Title level={3} style={{ margin: 0, fontWeight: 700 }}>{reportData.length}</Title>
                                    <Text style={{ color: '#94a3b8', fontSize: '14px' }}>records</Text>
                                </div>
                            </Card>
                            <Card bordered={false} bodyStyle={{ padding: '24px' }} style={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                <Text style={{ color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Debit</Text>
                                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <Text style={{ color: '#94a3b8', fontSize: '18px' }}>৳</Text>
                                    <Title level={3} style={{ margin: 0, fontWeight: 700 }}>{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Title>
                                </div>
                            </Card>
                            <Card bordered={false} bodyStyle={{ padding: '24px' }} style={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                <Text style={{ color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Credit</Text>
                                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <Text style={{ color: '#94a3b8', fontSize: '18px' }}>৳</Text>
                                    <Title level={3} style={{ margin: 0, fontWeight: 700 }}>{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Title>
                                </div>
                            </Card>
                            <Card bordered={false} bodyStyle={{ padding: '24px', background: '#f8fafc' }} style={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 10, 30, 0.05)' }}>
                                <Text style={{ color: '#1e40af', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Balance</Text>
                                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <Text style={{ color: '#3b82f6', fontSize: '18px' }}>৳</Text>
                                    <Title level={3} style={{ margin: 0, fontWeight: 800, color: balance >= 0 ? '#1e40af' : '#b91c1c' }}>{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Title>
                                </div>
                            </Card>
                        </div>

                        {/* Transaction Table */}
                        <Card
                            bordered={false}
                            style={{
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
                                borderRadius: '12px',
                                border: '1px solid #f1f5f9'
                            }}
                            title={<Title level={4} style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Statement of Transactions</Title>}
                            extra={selectedAccountName && <Tag bordered={false} color="blue">{selectedAccountName}</Tag>}
                        >
                            <Table
                                columns={columns}
                                dataSource={tableData}
                                loading={isLoading || isFetching}
                                bordered={false}
                                pagination={false}
                                size="middle"
                                rowClassName={(_, index) => (index % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]/50')}
                                style={{ borderRadius: '8px', overflow: 'hidden' }}
                                summary={() => (
                                    <Table.Summary fixed="bottom">
                                        <Table.Summary.Row style={{ background: '#f8fafc' }}>
                                            <Table.Summary.Cell index={0} colSpan={5} align="right">
                                                <Text strong style={{ fontSize: '14px', color: '#64748b' }}>TOTALS</Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={5} align="right">
                                                <Text strong style={{ fontSize: '14px', fontFamily: 'monospace' }}>{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={6} align="right">
                                                <Text strong style={{ fontSize: '14px', fontFamily: 'monospace' }}>{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={7} align="right">
                                                <Text strong style={{ fontSize: '14px', fontFamily: 'monospace', color: balance >= 0 ? '#1e40af' : '#b91c1c' }}>
                                                    {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </Text>
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    </Table.Summary>
                                )}
                            />
                        </Card>
                    </motion.div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '120px 0', background: '#fff', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                        <FiFileText size={48} style={{ color: '#cbd5e1', marginBottom: '20px' }} />
                        <Title level={4} style={{ color: '#475569', margin: 0 }}>Ready to analyze</Title>
                        <Text style={{ color: '#94a3b8' }}>Select an account head from the dropdown above to view its ledger.</Text>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default LedgerReport