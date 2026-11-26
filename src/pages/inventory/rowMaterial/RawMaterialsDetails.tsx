/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router";
import { useGetRawMaterialsReportQuery } from "../../../redux/features/reports/reports.api";
import { Table, Tag, Card, Button, DatePicker, Form, Spin, Empty, Descriptions } from "antd";
import { ArrowLeftOutlined, FallOutlined, RiseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useState } from "react";
import { toast } from "sonner";
import type { ColumnsType } from "antd/es/table";

interface ReportItem {
    id: number;
    date: string;
    unitPrice?: number;
    integratedUnitPrice?: number;
    quantityAdd: number;
    quantityLess: number;
    debitAmount: number;
    creditAmount: number;
    integratedDebitAmount?: number;
    integratedCreditAmount?: number;
    quantityBalance: number;
    balance: number;
}

const RawMaterialsDetails = () => {
    const { id } = useParams();
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const { data, isLoading, isFetching } = useGetRawMaterialsReportQuery({ id, startDate, endDate }, { skip: !id });
    const navigate = useNavigate();
    const rawMaterial = data?.data?.rawMaterial;
    const reports: any[] = Array.isArray(data?.data?.report) ? data.data.report : [];

    // Sort chronologically (oldest to newest) to calculate correct running balances
    const sortedAsc = [...reports].sort((a: any, b: any) => {
        const timeA = new Date(a.date || a.createdAt).getTime();
        const timeB = new Date(b.date || b.createdAt).getTime();
        if (timeA !== timeB) return timeA - timeB;
        return Number(a.id) - Number(b.id);
    });

    // Start from 0 because all inventory additions/deductions (including opening entries) are recorded in the inventory transactions
    let runningBalance = 0;
    let qtyBalance = 0;

    const chronologicalData: ReportItem[] = sortedAsc.map((item: any, idx) => {
        const qAdd = Number(item.quantityAdd ?? 0);
        const qLess = Number(item.quantityLess ?? 0);
        const debit = Number(item.debitAmount ?? 0);
        const credit = Number(item.creditAmount ?? 0);
        const intDebit = Number(item.integratedDebitAmount ?? 0);
        const intCredit = Number(item.integratedCreditAmount ?? 0);
        const uPrice = Number(item.unitPrice ?? 0);
        const intUPrice = Number(item.integratedUnitPrice ?? 0);

        runningBalance += debit - credit;
        qtyBalance += qAdd - qLess;
        return {
            ...item,
            key: item.id,
            unitPrice: uPrice,
            integratedUnitPrice: intUPrice,
            quantityAdd: qAdd,
            quantityLess: qLess,
            debitAmount: debit,
            creditAmount: credit,
            integratedDebitAmount: intDebit,
            integratedCreditAmount: intCredit,
            balance: runningBalance,
            quantityBalance: qtyBalance,
        };
    });

    // Display newest first (descending)
    const reportData = [...chronologicalData].reverse();

    // Summary totals across all report records
    const totals = reports.reduce(
        (acc: any, item: any) => {
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
    const [form] = Form.useForm();
    const onFinish = (values: any) => {
        const { startDate: sDate, endDate: eDate } = values;
        if (sDate && eDate && sDate > eDate) {
            toast.error("Start date must be less than end date");
            return;
        }
        setStartDate(sDate ? sDate.format("YYYY-MM-DD") : null);
        setEndDate(eDate ? eDate.format("YYYY-MM-DD") : null);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <Spin size="large" />
            </div>
        );
    }

    if (!data?.data) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <Empty description="Failed to load report or raw material not found" />
            </div>
        );
    }

    const columns: ColumnsType<ReportItem> = [
        {
            title: "SL",
            key: "sl",
            width: 50,
            align: "center",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            width: 120,
            render: (date) => (
                <span className="font-semibold text-gray-800">
                    {date ? dayjs(date).format("DD MMM YYYY") : "-"}
                </span>
            ),
        },
        {
            title: "Unit Price",
            dataIndex: "unitPrice",
            key: "unitPrice",
            align: "right",
            width: 100,
            render: (price) => (
                <span className="font-mono font-medium text-gray-800 text-xs">
                    ৳ {Number(price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            ),
        },
        {
            title: "Ad. Unit Price",
            dataIndex: "integratedUnitPrice",
            key: "integratedUnitPrice",
            align: "right",
            width: 110,
            render: (price) => (
                <span className="font-mono font-semibold text-purple-700 text-xs">
                    ৳ {Number(price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            ),
        },
        {
            title: "Stock In (+)",
            dataIndex: "quantityAdd",
            key: "quantityAdd",
            align: "right",
            width: 100,
            render: (qty) => {
                const num = Number(qty || 0);
                return (
                    <span className={num > 0 ? "text-green-600 font-semibold font-mono text-xs" : "text-gray-300 font-mono text-xs"}>
                        {num > 0 && <RiseOutlined className="mr-0.5 text-[10px]" />}
                        {num > 0 ? `+${num.toLocaleString()}` : "0"}
                    </span>
                );
            },
        },
        {
            title: "Stock Out (-)",
            dataIndex: "quantityLess",
            key: "quantityLess",
            align: "right",
            width: 100,
            render: (qty) => {
                const num = Number(qty || 0);
                return (
                    <span className={num > 0 ? "text-red-500 font-semibold font-mono text-xs" : "text-gray-300 font-mono text-xs"}>
                        {num > 0 && <FallOutlined className="mr-0.5 text-[10px]" />}
                        {num > 0 ? `-${num.toLocaleString()}` : "0"}
                    </span>
                );
            },
        },
        {
            title: "QTY",
            dataIndex: "quantityBalance",
            key: "quantityBalance",
            align: "right",
            width: 115,
            render: (quantityBalance) => (
                <span className="font-bold text-gray-900 font-mono text-xs">
                    {Number(quantityBalance || 0).toLocaleString()}
                </span>
            ),
        },
        {
            title: "Debit",
            dataIndex: "debitAmount",
            key: "debitAmount",
            align: "right",
            width: 110,
            render: (amount) => (
                <span className={Number(amount) > 0 ? "text-green-700 font-semibold font-mono text-xs" : "text-gray-300 font-mono text-xs"}>
                    {Number(amount) > 0
                        ? `৳ ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : "৳ 0.00"}
                </span>
            ),
        },
        {
            title: "Credit",
            dataIndex: "creditAmount",
            key: "creditAmount",
            align: "right",
            width: 105,
            render: (amount) => (
                <span className={Number(amount) > 0 ? "text-red-700 font-semibold font-mono text-xs" : "text-gray-300 font-mono text-xs"}>
                    {Number(amount) > 0
                        ? `৳ ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : "৳ 0.00"}
                </span>
            ),
        },
        {
            title: "Ad. Debit",
            dataIndex: "integratedDebitAmount",
            key: "integratedDebitAmount",
            align: "right",
            width: 115,
            render: (amount) => (
                <span className={Number(amount) > 0 ? "text-purple-700 font-semibold font-mono text-xs" : "text-gray-300 font-mono text-xs"}>
                    {Number(amount) > 0
                        ? `৳ ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : "৳ 0.00"}
                </span>
            ),
        },
        {
            title: "Ad. Credit",
            dataIndex: "integratedCreditAmount",
            key: "integratedCreditAmount",
            align: "right",
            width: 105,
            render: (amount) => (
                <span className={Number(amount) > 0 ? "text-purple-700 font-semibold font-mono text-xs" : "text-gray-300 font-mono text-xs"}>
                    {Number(amount) > 0
                        ? `৳ ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : "৳ 0.00"}
                </span>
            ),
        },
        {
            title: "Balance",
            dataIndex: "balance",
            key: "balance",
            align: "right",
            width: 130,
            render: (balance) => (
                <span className={`font-bold font-mono text-xs ${Number(balance || 0) >= 0 ? "text-green-700" : "text-red-600"}`}>
                    ৳ {Number(balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            ),
        },
    ];
    return (
        <div className="space-y-2">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-2 bg-white rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        className="rounded-full shadow-sm hover:shadow-md transition-shadow bg-white"
                    />
                    <h1 className="text-xl font-bold text-gray-800 m-0">Raw Material Ledger Details</h1>
                </div>
                {/* Date filter */}
                <Form form={form} onFinish={onFinish} className="m-0">
                    <div className="flex items-center gap-3">
                        <Form.Item name="startDate" className="m-0">
                            <DatePicker placeholder="Start Date" />
                        </Form.Item>
                        <Form.Item name="endDate" className="m-0">
                            <DatePicker placeholder="End Date" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={isFetching}>
                            {isFetching ? "Filtering..." : "Filter"}
                        </Button>
                    </div>
                </Form>
            </div>

            {/* Raw Material Summary Card */}
            {rawMaterial && (
                <Card className="shadow-sm rounded-xl border-gray-100 overflow-hidden">
                    <div className="flex flex-col md:flex-row items-start justify-between mb-2 gap-2">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 m-0">
                                {rawMaterial.name}
                                <Tag color={rawMaterial.status === "ACTIVE" ? "success" : "default"} className="text-sm px-3 py-0.5 rounded-full">
                                    {rawMaterial.status}
                                </Tag>
                            </h2>
                            <p className="text-gray-500 mt-1 mb-0 text-base">{rawMaterial.description || "No description provided"}</p>
                        </div>
                        <div className="text-left md:text-right bg-blue-50/80 border border-blue-100 px-3 py-2 rounded-xl shadow-sm">
                            <p className="text-xs text-gold-600 font-semibold uppercase tracking-wider m-0">Current Stock</p>
                            <p className="text-2xl font-extrabold text-blue-700 m-0 flex items-baseline gap-2">
                                {qtyBalance?.toLocaleString()}
                                <span className="text-base font-medium text-gold-600">units</span>
                            </p>
                        </div>
                    </div>
                    <Descriptions
                        column={5}
                        size="small"
                        layout="vertical"
                        className="border-t border-gray-100 pt-3 mt-2"
                    >
                        <Descriptions.Item label={<span className="text-gray-500 font-medium text-sm">Size</span>} className="pb-0" style={{ paddingBottom: 0 }}>
                            <span className="text-base font-semibold text-gray-700">{rawMaterial.size || "N/A"}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label={<span className="text-gray-500 font-medium text-sm">Item Type</span>} className="pb-0" style={{ paddingBottom: 0 }}>
                            <Tag color="cyan" className="m-0 border-transparent bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded text-xs font-medium">
                                {rawMaterial.itemType || "Raw Material"}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label={<span className="text-gray-500 font-medium text-sm">Unit Price</span>} className="pb-0" style={{ paddingBottom: 0 }}>
                            <span className="text-base font-bold text-gray-800 font-mono">৳ {Number(rawMaterial.unitPrice || 0).toLocaleString()}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label={<span className="text-gray-500 font-medium text-sm">Current Amount</span>} className="pb-0" style={{ paddingBottom: 0 }}>
                            <span className={`text-base font-bold ${runningBalance >= 0 ? "text-green-700" : "text-red-600"} font-mono`}>
                                ৳ {Number(runningBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </Descriptions.Item>
                        <Descriptions.Item label={<span className="text-gray-500 font-medium text-sm">Opening Date</span>} className="pb-0" style={{ paddingBottom: 0 }}>
                            <span className="text-base text-gray-700 font-medium">
                                {rawMaterial.openingDate ? dayjs(rawMaterial.openingDate).format("DD MMM YYYY") : "-"}
                            </span>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            )}

            {/* Report Table Card */}
            <Card
                style={{}}
                title={<span className="text-xl font-bold text-gray-800">Transaction History</span>}
                className="shadow-sm rounded-xl border-gray-100"
                styles={{ header: { borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' } }}>
                <Table
                    loading={isFetching}
                    columns={columns}
                    dataSource={reportData}
                    rowKey="id"
                    pagination={{
                        pageSize: 20,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '25', '50', '100'],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transactions`
                    }}
                    scroll={{ x: 1250 }}
                    bordered={false}
                    size="middle"
                    rowClassName="hover:bg-gray-50/80 transition-colors"
                    summary={() => (
                        <Table.Summary fixed>
                            <Table.Summary.Row className="bg-amber-50/80 font-bold text-xs">
                                <Table.Summary.Cell index={0} colSpan={4} className="text-center font-bold text-amber-900">
                                    Total ({reportData.length} records)
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} className="text-right font-bold text-green-700 font-mono">
                                    +{totals.quantityAdd.toLocaleString()}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} className="text-right font-bold text-red-600 font-mono">
                                    -{totals.quantityLess.toLocaleString()}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={3} className="text-right font-extrabold text-blue-900 font-mono">
                                    {qtyBalance.toLocaleString()}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={4} className="text-right font-bold text-green-700 font-mono">
                                    ৳ {totals.debitAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={5} className="text-right font-bold text-red-700 font-mono">
                                    ৳ {totals.creditAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={6} className="text-right font-bold text-purple-700 font-mono">
                                    ৳ {totals.integratedDebitAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={7} className="text-right font-bold text-purple-700 font-mono">
                                    ৳ {totals.integratedCreditAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell
                                    index={8}
                                    className={`text-right font-black font-mono ${runningBalance >= 0 ? "text-green-800" : "text-red-700"
                                        }`}
                                >
                                    ৳ {Number(runningBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        </Table.Summary>
                    )}
                />
            </Card>
        </div>
    );
};

export default RawMaterialsDetails;
