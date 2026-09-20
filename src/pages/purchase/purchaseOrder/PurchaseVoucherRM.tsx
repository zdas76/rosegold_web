/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Form, Input, Button, Select, DatePicker, Table, InputNumber } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useGetRowMaterialsQuery } from "../../../redux/features/rowMaterials/rowMaterials.api";
import { TParty, TRawMaterial } from "../../../types/types";
import { useGetPartiesQuery } from "../../../redux/features/auth/authApi";
import { useAddPurchaseOrderMutation } from "../../../redux/features/journal/journal.api";
import { getResponse } from "../../../utils/getResponse";
import PostSubmitModal from "../../../components/shared/PostSubmitModal";
import Loading from "../../../components/shared/Loading";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
    addPurchaseOrderRMItem,
    removePurchaseOrderRMItem,
    clearPurchaseOrderRMItems,
} from "../../../redux/features/purchaseOrder/purchaseOrderRMSlice";

const PurchaseOrderRM: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dispatch = useAppDispatch();
    const items = useAppSelector((state) => state.purchaseOrderRM.items);

    const [itemForm] = Form.useForm();
    const [form] = Form.useForm();
    const watchedQty = Form.useWatch("quantity", itemForm) || 0;
    const watchedUnitPrice = Form.useWatch("unitPrice", itemForm) || 0;

    const [addPurchaseOrder, { isLoading: isSubmitting }] = useAddPurchaseOrderMutation();
    const { data: party, isLoading: isPartiesLoading } = useGetPartiesQuery({});
    const { data: rowmaterials, isLoading: isRowMaterialsLoading } = useGetRowMaterialsQuery({});

    if (isPartiesLoading || isRowMaterialsLoading) {
        return <Loading tip="Loading Purchase Voucher details..." />;
    }

    const partyData = party?.data?.map((item: TParty) => {
        if (item?.partyType === "SUPPLIER") {
            return { key: item?.id, label: item?.name, value: item?.id };
        }
    }).filter(Boolean);

    const row_materials = rowmaterials?.data?.map((item: TRawMaterial) => {
        return { key: item?.id, label: item?.name, value: item?.id };
    });

    const handleAddItem = () => {
        itemForm.validateFields().then((values) => {
            const quantity = values.quantity || 1;
            const unitPrice = values.unitPrice || 0;
            const selectedItem = row_materials?.find((r: any) => r.value === values.rawId);
            dispatch(addPurchaseOrderRMItem({
                key: Date.now(),
                rawId: values.rawId,
                itemName: selectedItem?.label || "",
                quantity,
            }));
            itemForm.resetFields();
            itemForm.setFieldsValue({ quantity: 1 });
        });
    };

    const removeItem = (key: number | undefined) => {
        if (key !== undefined) dispatch(removePurchaseOrderRMItem(key));
    };

    const handleSubmit = async (values: any) => {
        const data = { ...values, items };
        const res = await addPurchaseOrder(data);
        const result = getResponse(res);
        if (result?.success) {
            setIsModalOpen(true);
        }
    };

    const handleNewVoucher = () => {
        form.resetFields();
        dispatch(clearPurchaseOrderRMItems());
        setIsModalOpen(false);
    };

    return (
        <div className="mx-auto rounded purchaseVoucher">
            <div className="bg-white rounded-lg px-4 py-2 mb-3">
                <h2 className="text-xl font-bold m-0">Purchase Order - Raw Material</h2>
            </div>
            <Form
                size="middle"
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    date: dayjs(),
                }}
            >
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white px-3 py-2 pb-1 rounded-md shadow">
                    <Form.Item name="partyId" label="Select Supplier" rules={[{ required: true, message: "Please select a party" }]}>
                        <Select style={{ width: "100%" }} placeholder="Select Name" options={partyData} />
                    </Form.Item>
                    <Form.Item label="Date" name="date" rules={[{ required: true, message: "Select a date" }]}>
                        <DatePicker className="w-full" />
                    </Form.Item>
                    <Form.Item name="invoiceNo" label="Invoice No">
                        <Input placeholder="Invoice Number" />
                    </Form.Item>
                </div>
                <div className="bg-white px-3 py-2 pb-3 rounded-md shadow mt-4">
                    <h3 className="text-lg font-semibold mb-1">Items</h3>
                    <Form component="div" form={itemForm} layout="vertical" className="mb-3">
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-6 gap-3">
                            <Form.Item name="rawId" label="Raw Material" rules={[{ required: true, message: "Required" }]}>
                                <Select placeholder="Select Name" options={row_materials} />
                            </Form.Item>
                            <Form.Item name="quantity" label="Qty" initialValue={1}>
                                <InputNumber style={{ width: "100%" }} min={1} />
                            </Form.Item>
                            <Form.Item name="unitPrice" label="Unit Price" rules={[{ required: true, message: "Required" }]}>
                                <InputNumber style={{ width: "100%" }} min={0} placeholder="Unit price" />
                            </Form.Item>
                            <Form.Item label="Total">
                                <InputNumber style={{ width: "100%" }} value={watchedQty * watchedUnitPrice} readOnly />
                            </Form.Item>
                            <Form.Item label=" ">
                                <Button onClick={handleAddItem} icon={<PlusOutlined />} style={{ fontSize: "12px", background: "#2d1849", color: "white", width: "100%" }}>
                                    Add
                                </Button>
                            </Form.Item>
                        </div>
                    </Form>
                    {items.length > 0 && (
                        <Table
                            dataSource={items}
                            className="mb-0 itemsTable"
                            rowKey="key"
                            columns={[
                                { title: "Item Name", dataIndex: "itemName" },
                                { title: "Quantity", dataIndex: "quantity" },
                                { title: "Unit Price", dataIndex: "unitPrice", render: (value: number) => value?.toFixed(2) },
                                { title: "Amount", dataIndex: "amount", render: (value: number) => <b>{value?.toFixed(2)}</b> },
                                { title: "Actions", render: (_, record) => <Button type="link" icon={<DeleteOutlined />} onClick={() => removeItem(record.key)} danger /> },
                            ]}
                            pagination={false}
                        />
                    )}
                </div>
                <div className="flex justify-end items-center mt-4">
                    <Button type="primary" htmlType="submit" loading={isSubmitting} style={{ background: "black", color: "white" }}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                </div>
            </Form>
            <PostSubmitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onNewVoucher={handleNewVoucher} />
        </div>
    );
};

export default PurchaseOrderRM;
