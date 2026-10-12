/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, DatePicker, Table, InputNumber, Modal } from "antd";
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

interface Props {
    open: boolean;
    onClose: () => void;
}

const PurchaseOrderRMModal: React.FC<Props> = ({ open, onClose }) => {
    const [isPostSubmitOpen, setIsPostSubmitOpen] = useState(false);
    const dispatch = useAppDispatch();
    const items = useAppSelector((state) => state.purchaseOrderRM.items);

    const [itemForm] = Form.useForm();
    const [form] = Form.useForm();
    const watchedRawId = Form.useWatch("rawId", itemForm);

    useEffect(() => {
        if (open) {
            form.setFieldsValue({ date: dayjs() });
        }
    }, [open, form]);

    const [addPurchaseOrder, { isLoading: isSubmitting }] = useAddPurchaseOrderMutation();
    const { data: party, isLoading: isPartiesLoading } = useGetPartiesQuery({});
    const { data: rowmaterials, isLoading: isRowMaterialsLoading } = useGetRowMaterialsQuery({});

    const selectedRawMaterial = rowmaterials?.data?.find((item: any) => item?.id === watchedRawId);
    const selectedUnitName = selectedRawMaterial?.unit?.name || "";

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
            const selectedItem = rowmaterials?.data?.find((r: any) => r.id === values.rawId);
            dispatch(addPurchaseOrderRMItem({
                key: Date.now(),
                rawId: values.rawId,
                itemName: selectedItem?.name || "",
                quantity,
                unit: selectedItem?.unit?.name || "",
            }));
            itemForm.resetFields();
            itemForm.setFieldsValue({ quantity: 1 });
        });
    };

    const removeItem = (key: number | undefined) => {
        if (key !== undefined) dispatch(removePurchaseOrderRMItem(key));
    };

    const handleSubmit = async (values: any) => {
        const data = { ...values, inventory: items };
        const res = await addPurchaseOrder(data);
        const result = getResponse(res);
        if (result?.success) {
            setIsPostSubmitOpen(true);
        }
    };

    const handleNewVoucher = () => {
        form.resetFields();
        dispatch(clearPurchaseOrderRMItems());
        setIsPostSubmitOpen(false);
        onClose();
    };

    const handleClose = () => {
        form.resetFields();
        dispatch(clearPurchaseOrderRMItems());
        onClose();
    };

    return (
        <>
            <Modal
                title="Requisition Order - Raw Material"
                open={open}
                onCancel={handleClose}
                footer={null}
                width={900}
                centered
            >
                {isPartiesLoading || isRowMaterialsLoading ? (
                    <Loading tip="Loading..." />
                ) : (
                    <Form
                        size="middle"
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                            date: dayjs(),
                        }}
                    >
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <Form.Item name="partyId" label="Select Supplier" rules={[{ required: true, message: "Please select a party" }]}>
                                <Select
                                    showSearch
                                    style={{ width: "100%" }}
                                    placeholder="Select Name"
                                    options={partyData}
                                    filterOption={(input, option) =>
                                        (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                                    }
                                />
                            </Form.Item>
                            <Form.Item label="Date" name="date" rules={[{ required: true, message: "Select a date" }]}>
                                <DatePicker className="w-full" />
                            </Form.Item>
                            <Form.Item name="invoiceNo" label="Invoice No">
                                <Input placeholder="Invoice Number" />
                            </Form.Item>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-1">Items</h3>
                            <Form component="div" form={itemForm} layout="vertical" className="mb-3">
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    <Form.Item name="rawId" label="Raw Material" rules={[{ required: true, message: "Required" }]}>
                                        <Select
                                            showSearch
                                            placeholder="Select Name"
                                            options={row_materials}
                                            filterOption={(input, option) =>
                                                (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                                            }
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        name="quantity"
                                        label="Qty"
                                        initialValue={1}
                                        rules={[{ required: true, message: "Required" }]}
                                    >
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            min={1}
                                            addonAfter={<span>{selectedUnitName || "Unit"}</span>}
                                        />
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
                                        { title: "Quantity", dataIndex: "quantity", render: (qty: any, record: any) => `${qty} ${record.unit || ""}`.trim() },
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
                )}
            </Modal>
            <PostSubmitModal isOpen={isPostSubmitOpen} onClose={() => setIsPostSubmitOpen(false)} onNewVoucher={handleNewVoucher} />
        </>
    );
};

export default PurchaseOrderRMModal;
