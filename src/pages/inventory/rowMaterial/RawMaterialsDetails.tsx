/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router";
import { useGetRawMaterialsReportQuery } from "../../../redux/features/reports/reports.api";
import { Table, Tag, Card, Button, DatePicker, Form, Spin, Empty, Descriptions } from "antd";
import { ArrowLeftOutlined, FallOutlined, RiseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useState } from "react";
import { toast } from "sonner";
import { ColumnsType } from "antd/es/table";

interface ReportItem {
    id: number;
    date: string;
    quantityAdd: number;
    quantityLess: number;
    debitAmount: number;
    creditAmount: number;
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
    const reports = data?.data?.report ?? [];
    const openningDate = data?.data?.rawMaterial?.openingDate;

    let runningBalance = 0;
    let qtyBalance = 0;
    const reportData: ReportItem[] = reports.map((item: any) => {
        runningBalance += (item.debitAmount || 0) - (item.creditAmount || 0);
        qtyBalance += (item.quantityAdd || 0) - (item.quantityLess || 0);
        return {
            ...item,
            balance: runningBalance,
            quantityBalance: qtyBalance,
        };
    });

    const totalDebit = reports.reduce(
        (sum: number, item: any) => sum + (item.debitAmount || 0),
        0
    );
    const totalCredit = reports.reduce(
        (sum: number, item: any) => sum + (item.creditAmount || 0),
        0
    );

    const [form] = Form.useForm();
    const onFinish = (values: any) => {
        const { startDate, endDate } = values;
        if (startDate > endDate) {
            toast.error("Start date must be less than end date");
            return;
        }
        setStartDate(startDate?.format("YYYY-MM-DD"));
        setEndDate(endDate?.format("YYYY-MM-DD"));
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
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (date) => <span className="font-semibold">{dayjs(date).format("DD MMM YYYY")}</span>,
        },
        {
            title: "Stock In (+)",
            dataIndex: "quantityAdd",
            key: "quantityAdd",
            align: "center",
            render: (qty) => (
                <span className={qty > 0 ? "text-green-600 font-semibold" : "text-gray-400"}>
                    {qty > 0 && <RiseOutlined className="mr-1" />}
                    {qty || 0}
                </span>
            ),
        },
        {
            title: "Stock Out (-)",
            dataIndex: "quantityLess",
            key: "quantityLess",
            align: "center",
            render: (qty) => (
                <span className={qty > 0 ? "text-red-500 font-semibold" : "text-gray-400"}>
                    {qty > 0 && <FallOutlined className="mr-1" />}
                    {qty || 0}
                </span>
            ),
        },
        {
            title: "QTY Balance",
            dataIndex: "quantityBalance",
            key: "quantityBalance",
            align: "right",
            render: (quantityBalance) => `${quantityBalance?.toFixed(2) || 0}`,
        },
        {
            title: "Debit Amount",
            dataIndex: "debitAmount",
            key: "debitAmount",
            align: "right",
            render: (amount) => <span className="text-green-700 font-semibold font-mono">{`৳ ${amount?.toFixed(2) || 0}`}</span>,
        },
        {
            title: "Credit Amount",
            dataIndex: "creditAmount",
            key: "creditAmount",
            align: "right",
            render: (amount) => <span className="text-red-700 font-semibold font-mono">{`৳ ${amount?.toFixed(2) || 0}`}</span>,
        },
        {
            title: "Amount Balance",
            dataIndex: "balance",
            key: "balance",
            align: "right",
            render: (balance) => <span className="text-green-700 font-semibold font-mono">{`৳ ${balance?.toFixed(2) || 0}`}</span>,
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
                            <span className="text-base font-bold text-gray-800 font-mono">৳ {rawMaterial.unitPrice?.toLocaleString() || 0}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label={<span className="text-gray-500 font-medium text-sm">Current Amount</span>} className="pb-0" style={{ paddingBottom: 0 }}>
                            <span className={`text-base font-bold ${runningBalance > 0 ? "text-green-700" : "text-red-600"} font-mono`}>৳ {runningBalance?.toFixed(2) || 0}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label={<span className="text-gray-500 font-medium text-sm">Opening Date</span>} className="pb-0" style={{ paddingBottom: 0 }}>
                            <span className="text-base text-gray-700 font-medium">{dayjs(rawMaterial.openingDate).format("DD MMM YYYY")}</span>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            )}

            {/* Report Table Card */}
            <Card
                style={{ marginTop: "5px" }}
                title={<span className="text-xl font-bold text-gray-800">Transaction History</span>}
                className="shadow-sm rounded-xl border-gray-100"
                styles={{ header: { borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' } }}>
                <Table
                    loading={isFetching}
                    columns={columns}
                    dataSource={reportData}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transactions`
                    }}
                    scroll={{ x: 1000 }}
                    bordered={false}
                    size="middle"
                    rowClassName="hover:bg-gray-50/80 transition-colors"
                    summary={() => (
                        <Table.Summary fixed>
                            <Table.Summary.Row className="bg-gray-50 font-semibold">
                                <Table.Summary.Cell index={0} colSpan={4} className="text-lg font-bold">
                                    Total
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={4} align="right">
                                    <span className="text-green-700 font-semibold font-mono text-base">৳ {totalDebit?.toFixed(2)}</span>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={5} align="right">
                                    <span className="text-red-700 font-semibold font-mono text-base">৳ {totalCredit?.toFixed(2)}</span>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={6} align="right">
                                    <span className="text-green-700 font-semibold font-mono text-base">৳ {(totalDebit - totalCredit)?.toFixed(2)}</span>
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
