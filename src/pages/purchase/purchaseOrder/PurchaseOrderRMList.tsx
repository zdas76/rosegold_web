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
            render: (value: any) => <b>{value || "-"}</b>,
        },
        {
            title: "Supplier",
            key: "partyName",
            render: (_: any, record: any) => record?.party?.name || "-",
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
        },
        {
            title: "Invoice No",
            dataIndex: "invoiceNo",
            key: "invoiceNo",
            render: (value: any) => value || "-",
        },
        {
            title: "Total Items",
            key: "totalItems",
            render: (_: any, record: any) => record?.purchaseOrder?.length || 0,
        },
        {
            title: "Total Amount",
            key: "totalAmount",
            render: (_: any, record: any) => {
                const total = record?.purchaseOrder?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0;
                return <b>{total.toFixed(2)}</b>;
            },
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={status === "APPROVED" ? "green" : status === "PENDING" ? "orange" : "blue"}>
                    {status || "PENDING"}
                </Tag>
            ),
        },
    ];

    return (
        <div className="mx-auto rounded">
            <div className="flex justify-between items-center bg-white rounded-lg px-4 py-2 mb-3">
                <h2 className="text-xl font-bold m-0">Purchase Order - Raw Material</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalOpen(true)}
                    style={{ background: "#2d1849", color: "white" }}
                >
                    Create Order
                </Button>
            </div>
            <div className="bg-white rounded-lg p-3 shadow">
                <Table
                    dataSource={orders?.data || []}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    onRow={(record) => ({
                        onClick: () => navigate(`/dashboard/purchase-order/${record.id}`),
                        style: { cursor: "pointer" },
                    })}
                />
            </div>
            <PurchaseOrderRMModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default PurchaseOrderRMList;
