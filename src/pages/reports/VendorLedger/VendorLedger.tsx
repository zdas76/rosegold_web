/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, DatePicker, Form, Select, Table, Card, TableProps, Badge, Row, Col, Typography, Tag } from 'antd';
const { Title, Text } = Typography;
import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiPrinter, FiRefreshCw } from 'react-icons/fi';

import { formateData } from '../../../utils/getFormateData';
import { TLedgerReport, TParty } from '../../../types/types';
import { useLazyGetPartyReportQuery } from '../../../redux/features/reports/reports.api';
import { useGetPartiesQuery } from '../../../redux/features/auth/authApi';
import VendorLedgerPrint from './VendorLedgerPrint';

const VendorLedger = () => {
    const [form] = Form.useForm();
    const componentRef = useRef<HTMLDivElement>(null);
    const { data } = useGetPartiesQuery({ partyType: "VENDOR" });
    const partyOptions = formateData(data?.data || [], 'name');
    const [getReport, { isLoading, isFetching }] = useLazyGetPartyReportQuery();

    const [reportData, setReportData] = useState<{
        party: TParty;
        result: TLedgerReport[];
    } | null>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    });

    const onFinish = async (values: any) => {
        const res = await getReport({
            partyId: values.partyId,
            partyType: "VENDOR",
            startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
            endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        });

        if (res?.isSuccess && res?.data?.data?.result?.length > 0) {
            setReportData(res.data.data);
            toast.success('Ledger Report fetched successfully');
        } else {
            setReportData(null);
            toast.error('No data found for the selected criteria');
        }
    };

    const handleReset = () => {
        form.resetFields();
        setReportData(null);
    };

    let runningBalance = reportData?.party?.openingAmount ?? 0;
    let totalDebit = 0;
    let totalCredit = 0;

    const tableData = reportData?.result?.map((item, index) => {
        totalDebit += item.debitAmount;
        totalCredit += item.creditAmount;
        runningBalance += item.debitAmount - item.creditAmount;

        return {
            key: index + 1,
            sNo: index + 1,
            date: dayjs(item.date).format('DD-MM-YYYY'),
            voucherNo: item.transactionInfo?.voucherNo,
            invoiceNo: item.transactionInfo?.invoiceNo,
            narration: item.narration || '-',
            debit: item.debitAmount || 0,
            credit: item.creditAmount || 0,
            balance: runningBalance,
        };
    });

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
            width: 150
        },
        {
            title: <div style={{ textAlign: 'right' }}><Text strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Debit</Text></div>,
            dataIndex: 'debit',
            align: 'right',
            width: 130,
            render: (v: number) => (
                v ? <Text style={{ fontFamily: 'monospace', fontSize: '14px', color: '#0f172a' }}>{v.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text> : <Text type="secondary" style={{ fontSize: '14px' }}>-</Text>
            ),
        },
        {
            title: <div style={{ textAlign: 'right' }}><Text strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Credit</Text></div>,
            dataIndex: 'credit',
            align: 'right',
            width: 130,
            render: (v: number) => (
                v ? <Text style={{ fontFamily: 'monospace', fontSize: '14px', color: '#0f172a' }}>{v.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text> : <Text type="secondary" style={{ fontSize: '14px' }}>-</Text>
            ),
        },
        {
            title: <div style={{ textAlign: 'right' }}><Text strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance</Text></div>,
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
        <div style={{ padding: '15px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* PAGE HEADER */}
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <Badge color="#2563eb" /> <Text strong style={{ color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '12px' }}>Financial Reports</Text>
                    <Title level={1} style={{ margin: '3px 0 0 0', color: '#0f172a', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.02em' }}>
                        Vendor Ledger
                    </Title>
                    {/* <Text style={{ color: '#64748b', fontSize: '16px' }}>Detailed financial history and balance tracking.</Text> */}
                </div>
                {reportData && (
                    <Button
                        type="default"
                        icon={<FiPrinter />}
                        size="large"
                        onClick={() => handlePrint()}
                        style={{
                            borderRadius: '8px',
                            height: '45px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 600,
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    >
                        Print Statement
                    </Button>
                )}
            </div>

            {/* CONTROL PANEL */}
            <Card
                bordered={false}
                style={{
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
                    borderRadius: '12px',
                    marginBottom: '32px',
                    background: '#ffffff',
                    border: '1px solid #f1f5f9'
                }}
            >
                <Form
                    size='middle'
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Row gutter={24} align="bottom">
                        <Col xs={24} sm={12} md={9}>
                            <Form.Item
                                label={<Text strong style={{ color: '#475569', fontSize: '13px' }}>Select Vendor</Text>}
                                name="partyId"
                                rules={[{ required: true, message: 'Please select a vendor' }]}
                                style={{ marginBottom: 0 }}
                            >
                                <Select
                                    showSearch
                                    placeholder="Search by name or ID"
                                    options={partyOptions}
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

            {/* REPORT CONTENT */}
            <AnimatePresence mode="wait">
                {reportData ? (
                    <motion.div
                        key="report-data"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* ACCOUNT SUMMARY DASHBOARD */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                            <Card bordered={false} bodyStyle={{ padding: '24px' }} style={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                <Text style={{ color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Opening Balance</Text>
                                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <Text style={{ color: '#94a3b8', fontSize: '18px' }}>৳</Text>
                                    <Title level={3} style={{ margin: 0, fontWeight: 700 }}>{reportData.party.openingAmount.toLocaleString()}</Title>
                                </div>
                            </Card>
                            <Card bordered={false} bodyStyle={{ padding: '24px' }} style={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                <Text style={{ color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Period Debit</Text>
                                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <Text style={{ color: '#94a3b8', fontSize: '18px' }}>৳</Text>
                                    <Title level={3} style={{ margin: 0, fontWeight: 700 }}>{totalDebit.toLocaleString()}</Title>
                                </div>
                            </Card>
                            <Card bordered={false} bodyStyle={{ padding: '24px' }} style={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                <Text style={{ color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Period Credit</Text>
                                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <Text style={{ color: '#94a3b8', fontSize: '18px' }}>৳</Text>
                                    <Title level={3} style={{ margin: 0, fontWeight: 700 }}>{totalCredit.toLocaleString()}</Title>
                                </div>
                            </Card>
                            <Card bordered={false} bodyStyle={{ padding: '24px', background: '#f8fafc' }} style={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 10, 30, 0.05)' }}>
                                <Text style={{ color: '#1e40af', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Balance</Text>
                                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <Text style={{ color: '#3b82f6', fontSize: '18px' }}>৳</Text>
                                    <Title level={3} style={{ margin: 0, fontWeight: 800, color: (totalDebit - totalCredit) >= 0 ? '#1e40af' : '#b91c1c' }}>{(totalDebit - totalCredit).toLocaleString()}</Title>
                                </div>
                            </Card>
                        </div>

                        {/* TRANSACTION DETAILS */}
                        <Card
                            bordered={false}
                            style={{
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
                                borderRadius: '12px',
                                border: '1px solid #f1f5f9'
                            }}
                            title={<Title level={4} style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Statement of Transactions</Title>}
                            extra={<Tag bordered={false} color="blue">{reportData.party.name} · {reportData.party.partyType}</Tag>}
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
                                            <Table.Summary.Cell index={0} colSpan={4} align="right">
                                                <Text strong style={{ fontSize: '14px', color: '#64748b' }}>TOTALS</Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={5} align="right">
                                                <Text strong style={{ fontSize: '14px', fontFamily: 'monospace' }}>{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={6} align="right">
                                                <Text strong style={{ fontSize: '14px', fontFamily: 'monospace' }}>{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={7} align="right">
                                                <Text strong style={{ fontSize: '14px', fontFamily: 'monospace', color: (totalDebit - totalCredit) >= 0 ? '#1e40af' : '#b91c1c' }}>
                                                    {(totalDebit - totalCredit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                        <Text style={{ color: '#94a3b8' }}>Select a vendor from the dropdown above to view their financial state.</Text>
                    </div>
                )}
            </AnimatePresence>

            {/* PRINT COMPONENT (HIDDEN) */}
            <div style={{ display: 'none' }}>
                <div ref={componentRef}>
                    {reportData && (
                        <VendorLedgerPrint
                            party={reportData.party}
                            result={reportData.result}
                            totalDebit={totalDebit}
                            totalCredit={totalCredit}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorLedger;
