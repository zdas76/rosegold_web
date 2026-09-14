/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Table, Button, Tag, InputNumber, Input, message, Descriptions } from "antd";
import { ArrowLeftOutlined, EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { useGetPurchaseOrderByIdQuery, useUpdatePurchaseOrderMutation } from "../../../redux/features/journal/journal.api";
import Loading from "../../../components/shared/Loading";

const PurchaseOrderDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: orderResponse, isLoading } = useGetPurchaseOrderByIdQuery(Number(id));
    const [updatePurchaseOrder, { isLoading: isUpdating }] = useUpdatePurchaseOrderMutation();

    const [isEditing, setIsEditing] = useState(false);
    const [editedItems, setEditedItems] = useState<any[]>([]);
    const [invoiceNo, setInvoiceNo] = useState("");

    const order = orderResponse?.data;

    useEffect(() => {
        if (order) {
            setEditedItems(
                (order.purchaseOrder || []).map((item: any) => ({
                    ...item,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    amount: item.amount,
                }))
            );
            setInvoiceNo(order.invoiceNo || "");
        }
    }, [order]);

    if (isLoading) {
        return <Loading tip="Loading Purchase Order..." />;
    }

    if (!order) {
        return <div className="text-center py-10 text-gray-500">Order not found</div>;
    }

    const handleItemChange = (index: number, field: string, value: number | null) => {
        setEditedItems((prev) =>
            prev.map((item, i) => {
                if (i !== index) return item;
                const updated = { ...item, [field]: value };
                if (field === "quantity" || field === "unitPrice") {
                    updated.amount = (updated.quantity || 0) * (updated.unitPrice || 0);
                }
                return updated;
            })
        );
    };

    const handleSave = async () => {
        const payload = {
            invoiceNo,
            purchaseOrder: editedItems.map((item: any) => ({
                id: item.id,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.amount,
            })),
        };
        const res = await updatePurchaseOrder({ id: Number(id), data: payload });
        if ("data" in res && res.data?.success) {
            message.success("Purchase order updated successfully");
            setIsEditing(false);
        } else {
            message.error("Failed to update purchase order");
        }
    };

    const handleCancel = () => {
        setEditedItems(
            (order.purchaseOrder || []).map((item: any) => ({ ...item }))
        );
        setInvoiceNo(order.invoiceNo || "");
        setIsEditing(false);
    };

    const grandTotal = editedItems.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);

    const columns = [
        {
            title: "#",
            key: "index",
            width: 50,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: "Product Name",
            key: "productName",
            render: (_: any, record: any) => record?.product?.name || "-",
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            key: "quantity",
            width: 120,
            render: (value: number, _: any, index: number) =>
                isEditing ? (
                    <InputNumber
                        min={0}
                        precision={2}
                        value={value}
                        onChange={(v) => handleItemChange(index, "quantity", v)}
                        controls={false}
                        style={{ width: "100%" }}
                    />
                ) : (
                    value?.toFixed(2) || "0.00"
                ),
        },
        {
            title: "Unit Price",
            dataIndex: "unitPrice",
            key: "unitPrice",
            width: 120,
            render: (value: number, _: any, index: number) =>
                isEditing ? (
                    <InputNumber
                        min={0}
                        precision={2}
                        value={value}
                        onChange={(v) => handleItemChange(index, "unitPrice", v)}
                        controls={false}
                        style={{ width: "100%" }}
                    />
                ) : (
                    value?.toFixed(2) || "0.00"
                ),
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            width: 120,
            render: (value: number) => <b>{value?.toFixed(2) || "0.00"}</b>,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 100,
            render: (status: string) => (
                <Tag color={status === "APPROVED" ? "green" : status === "PENDING" ? "orange" : "blue"}>
                    {status || "PENDING"}
                </Tag>
            ),
        },
    ];

    return (
        <div className="p-1">
            <div className="flex items-center gap-3 mb-4">
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                <h2 className="text-xl font-bold m-0">Purchase Order Details</h2>
                <div className="ml-auto flex gap-2">
                    {isEditing ? (
                        <>
                            <Button
                                icon={<SaveOutlined />}
                                type="primary"
                                onClick={handleSave}
                                loading={isUpdating}
                                style={{ background: "#2d1849", color: "white" }}
                            >
                                Save
                            </Button>
                            <Button icon={<CloseOutlined />} onClick={handleCancel}>
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button
                            icon={<EditOutlined />}
                            type="primary"
                            onClick={() => setIsEditing(true)}
                            style={{ background: "#2d1849", color: "white" }}
                        >
                            Edit
                        </Button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow mb-4">
                <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
                    <Descriptions.Item label="Order No">
                        <b>{order.orderNo}</b>
                    </Descriptions.Item>
                    <Descriptions.Item label="Date">
                        {new Date(order.date).toLocaleDateString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <Tag color={order.status === "APPROVED" ? "green" : order.status === "PENDING" ? "orange" : "blue"}>
                            {order.status || "PENDING"}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Supplier">
                        {order.party?.name || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Contact">
                        {order.party?.contactNo || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Address">
                        {order.party?.address || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Invoice No">
                        {isEditing ? (
                            <Input
                                value={invoiceNo}
                                onChange={(e) => setInvoiceNo(e.target.value)}
                                placeholder="Invoice number"
                            />
                        ) : (
                            order.invoiceNo || "-"
                        )}
                    </Descriptions.Item>
                </Descriptions>
            </div>

            <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="font-semibold mb-3">Order Items</h3>
                <Table
                    dataSource={editedItems}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    bordered
                    size="small"
                />
                <div className="flex justify-end mt-3">
                    <div className="text-right">
                        <p className="text-lg font-bold">
                            Grand Total: {grandTotal.toLocaleString()} ৳
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderDetails;
