/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, Input, Button, InputNumber, DatePicker, Select } from "antd";
import { useCreatePackingMaterialMutation } from "../../../redux/features/packingMaterials/packingMaterials.api";
import { getResponse } from "../../../utils/getResponse";
import { useState } from "react";
import { useAllUnits } from "../../../hook/allUnits";
import dayjs from "dayjs";

const AddPackingMaterialsForm = ({ setIsModalOpen }: { setIsModalOpen: any }) => {
    const [form] = Form.useForm();
    const [addPackingMaterial, { isLoading: isSubmitting }] = useCreatePackingMaterialMutation();
    const [quantity, setQuantity] = useState<number | null>(null);
    const [unitPrice, setUnitPrice] = useState<number | null>(null);
    const allUnits = useAllUnits();

    const onFinish = async (values: any) => {
        const data = {
            ...values,
            quantity: Number(quantity) || 0,
            unitPrice: Number(unitPrice) || 0,
            amount: Number(((Number(quantity) || 0) * (Number(unitPrice) || 0)).toFixed(2)),
            openingAmount: Number(((Number(quantity) || 0) * (Number(unitPrice) || 0)).toFixed(2)),
            alertQuantity: values.alertQuantity !== undefined && values.alertQuantity !== null && values.alertQuantity !== ""
                ? Number(values.alertQuantity)
                : 0,
            ingredienteQty: values.ingredienteQty ? Number(values.ingredienteQty) : 0,
            date: values.date ? dayjs(values.date).toISOString() : dayjs().toISOString(),
            openingDate: values.date ? dayjs(values.date).toISOString() : dayjs().toISOString(),
        };
        const res = await addPackingMaterial(data);
        const response = getResponse(res);
        if (response?.success) {
            setIsModalOpen(false);
            form.resetFields();
            form.setFieldsValue({ date: dayjs() });
            setQuantity(null);
            setUnitPrice(null);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{
                date: dayjs(),
            }}
            onFinish={onFinish}
            className="p-4 rounded"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                {/* Name Field */}
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: "Please enter a name" }]}
                >
                    <Input placeholder="Enter name" />
                </Form.Item>

                <Form.Item
                    label="Unit"
                    name="unitId"
                    rules={[{ required: true, message: "Please select a unit" }]}
                >
                    <Select options={allUnits} placeholder="Select unit" />
                </Form.Item>

                <Form.Item label="Quantity" name="quantity" rules={[{ required: true, message: "Please enter quantity" }]}>
                    <InputNumber
                        type="number"
                        min={0}
                        onChange={(value) => setQuantity(value !== null ? Number(value.toFixed(2)) : 0)}
                        style={{ width: '100%' }}
                        placeholder="Quantity"
                    />
                </Form.Item>

                <Form.Item label="Unit Price" name="unitPrice" rules={[{ required: true, message: "Please enter unit price" }]}>
                    <InputNumber
                        type="number"
                        min={0}
                        onChange={(value) => setUnitPrice(value !== null ? Number(value.toFixed(2)) : 0)}
                        style={{ width: '100%' }}
                        placeholder="Unit price"
                    />
                </Form.Item>

                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-x-4">
                    <Form.Item label="Amount">
                        <InputNumber
                            type="number"
                            disabled
                            value={Number(((Number(quantity) || 0) * (Number(unitPrice) || 0)).toFixed(2))}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item label="Alert Quantity" name="alertQuantity">
                        <InputNumber
                            type="number"
                            min={0}
                            style={{ width: '100%' }}
                            placeholder="Alert quantity"
                        />
                    </Form.Item>

                    <Form.Item label="Opening Date" name="date" rules={[{ required: true, message: "Please select date" }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </div>
            </div>

            {/* Description Field */}
            <Form.Item
                label="Description"
                name="description"
            >
                <Input.TextArea rows={3} placeholder="Enter description (optional)" />
            </Form.Item>

            {/* Submit Button */}
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={isSubmitting} className="w-full">
                    {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default AddPackingMaterialsForm;
