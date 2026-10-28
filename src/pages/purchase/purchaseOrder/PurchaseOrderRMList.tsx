/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Table, Button, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { useGetPurchaseOrdersQuery } from "../../../redux/features/journal/journal.api";
import Loading from "../../../components/shared/Loading";
import PurchaseOrderRMModal from "./PurchaseOrderRMModal";

const PurchaseOrderRMList: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const { data: orders, isLoading } = useGetPurchaseOrdersQuery({ type: "RAW_MATERIAL" });

    if (isLoading) {
        return <Loading tip="Loading Purchase Orders..." />;
    }

    const columns = [
        {
            title: "Order No",
            dataIndex: "orderNo",
            key: "orderNo",
            render: (value: any) => <b className="font-mono text-xs text-slate-800">{value || "-"}</b>,
        },
        {
            title: "Supplier",
            key: "partyName",
            render: (_: any, record: any) => <span className="text-xs text-slate-700 font-medium">{record?.party?.name || "-"}</span>,
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (date: any) => <span className="text-xs text-slate-500 font-medium">{date || "-"}</span>,
        },
        {
            title: "Invoice No",
            dataIndex: "invoiceNo",
            key: "invoiceNo",
            render: (value: any) => <span className="text-xs text-slate-600 font-mono">{value || "-"}</span>,
        },
        {
            title: "Total Items",
            key: "totalItems",
            align: "center" as const,
            render: (_: any, record: any) => (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                    {record?.purchaseOrder?.length || 0}
                </span>
            ),
        },
        {
            title: "Total Amount",
            key: "totalAmount",
            align: "right" as const,
            render: (_: any, record: any) => {
                const total = record?.purchaseOrder?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0;
                return <span className="font-bold font-mono text-xs text-[#C58D2F]">{total.toFixed(2)} ৳</span>;
            },
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            align: "center" as const,
            render: (status: string) => (
                <Tag
                    className="rounded text-[11px] font-medium"
                    color={status === "APPROVED" ? "success" : status === "PENDING" ? "warning" : "processing"}
                >
                    {status || "PENDING"}
                </Tag>
            ),
        },
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)] p-6 space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-1 border-b border-slate-100">
                <div>
                    <h1 className="text-lg font-bold text-slate-800 m-0 tracking-tight">Requisition - Raw Material</h1>
                    <p className="text-xs text-slate-400 m-0 mt-0.5">Manage and track purchase orders and requisitions for raw materials</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#C58D2F] hover:bg-[#b07d28] border-none text-white font-semibold rounded-lg px-5 h-9 text-xs shadow-[0_3px_12px_rgba(197,141,47,0.3)] hover:shadow-[0_4px_16px_rgba(197,141,47,0.45)] transition-all"
                >
                    Create Order
                </Button>
            </div>
            <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-[0_2px_12px_-3px_rgba(15,23,42,0.05)]">
                <Table
                    dataSource={orders?.data || []}
                    columns={columns}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} orders` }}
                    onRow={(record) => ({
                        onClick: () => navigate(`/dashboard/purchase-order/${record.id}`),
                        style: { cursor: "pointer" },
                        className: "hover:bg-slate-50/70 transition-colors",
                    })}
                />
            </div>
            <PurchaseOrderRMModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default PurchaseOrderRMList;
