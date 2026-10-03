/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, Input, Button, InputNumber, DatePicker, Select } from "antd";
import { useCreateRowMaterialMutation } from "../../../redux/features/rowMaterials/rowMaterials.api";
import { getResponse } from "../../../utils/getResponse";
import { useState } from "react";
import { useAllUnits } from "../../../hook/allUnits";

const AddRowMaterialsForm = ({ setIsModalOpen }: { setIsModalOpen: any }) => {
    const [form] = Form.useForm();
    const [addRowMaterials, { isLoading: isSubmitting }] = useCreateRowMaterialMutation();
    // const [intialStcok, setInitialStock] = useState(false)
    const [quantity, setQuantity] = useState<number | null>()
    const [unitPrice, setUnitPrice] = useState<number | null>()
    const allUnits = useAllUnits()


    const onFinish = async (values: any) => {
        const data = {
            ...values,
            alertQuantity: values.alertQuantity !== undefined && values.alertQuantity !== null && values.alertQuantity !== ""
                ? Number(values.alertQuantity)
                : 0,
            amount: Number((Number(quantity || 0) * Number(unitPrice || 0)).toFixed(2)),
        }
        const res = await addRowMaterials(data);
        const response = getResponse(res)
        if (response?.success) {
            setIsModalOpen(false);
            form.resetFields();
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            //   initialValues={formData} 
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
                    <Select options={allUnits} placeholder="select unit" />
                </Form.Item>

                <Form.Item label="Quantity" name="quantity" rules={[{ required: true }]}>
                    <InputNumber type="number" min={0} onChange={(value) => setQuantity(Number(value?.toFixed(2)))} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item label="Unit Price" name="unitPrice" rules={[{ required: true }]}>
                    <InputNumber type="number" min={0} onChange={(value) => setUnitPrice(Number(value?.toFixed(2)))} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item label="Amount" rules={[{ required: true }]}>
                    <InputNumber type="number" disabled value={Number(((quantity || 0) * (unitPrice || 0)).toFixed(2))} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item label="Date" name="date" rules={[{ required: true }]}>
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item label="Alert Quantity" name="alertQuantity">
                    <InputNumber min={0} placeholder="Enter alert quantity" style={{ width: '100%' }} />
                </Form.Item>
            </div>

            {/* Description Field */}
            <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: "Please enter a description" }]}
            >
                <Input.TextArea rows={4} placeholder="Enter description" />
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

export default AddRowMaterialsForm;
