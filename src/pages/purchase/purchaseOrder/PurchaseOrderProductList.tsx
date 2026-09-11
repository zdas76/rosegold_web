/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Table, Button, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useGetPurchaseOrdersQuery } from "../../../redux/features/journal/journal.api";
import Loading from "../../../components/shared/Loading";
import PurchaseOrderProductModal from "./PurchaseOrderProductModal";

const PurchaseOrderProductList: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: orders, isLoading } = useGetPurchaseOrdersQuery({ type: "PRODUCT" });

    if (isLoading) {
        return <Loading tip="Loading Purchase Orders..." />;
    }

    const columns = [
        {
            title: "Order No",
            dataIndex: "orderNo",
            key: "orderNo",
        },
        {
            title: "Supplier",
            dataIndex: "partyName",
            key: "partyName",
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
        },
        {
            title: "Total Items",
            dataIndex: "totalItems",
            key: "totalItems",
            render: (value: number) => value || 0,
        },
        {
            title: "Total Amount",
            dataIndex: "totalAmount",
            key: "totalAmount",
            render: (value: number) => <b>{value?.toFixed(2) || "0.00"}</b>,
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
                <h2 className="text-xl font-bold m-0">Purchase Order - Product</h2>
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
                />
            </div>
            <PurchaseOrderProductModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default PurchaseOrderProductList;
