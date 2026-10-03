/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, DatePicker, Form, FormProps, Input, InputNumber, Select } from 'antd';
import { TRawMaterial } from '../../../types/types';
import { useUpdateRowMaterialMutation } from '../../../redux/features/rowMaterials/rowMaterials.api';
import { getResponse } from '../../../utils/getResponse';
import { useAllUnits } from '../../../hook/allUnits';
import { useState } from 'react';
import dayjs from 'dayjs';

const EditRowMaterials = ({ item, setIsEditModal }: { setIsEditModal: any; item: any }) => {
    const [form] = Form.useForm();
    const [updateRowMaterial, { isLoading }] = useUpdateRowMaterialMutation()
    const allUnits = useAllUnits()

    const [quantity, setQuantity] = useState<number | null>(item?.quantity || 0)
    const [unitPrice, setUnitPrice] = useState<number | null>(item?.unitPrice || 0)

    const onFinish: FormProps['onFinish'] = async (values) => {
        const data = {
            ...values,
            id: item?.id,
            alertQuantity: values.alertQuantity !== undefined && values.alertQuantity !== null && values.alertQuantity !== ""
                ? Number(values.alertQuantity)
                : 0,
            amount: Number((Number(quantity) * Number(unitPrice)).toFixed(2)),
        }
        const res = await updateRowMaterial(data)
        const response = getResponse(res)
        if (response?.success) {
            setIsEditModal(false)
        }
    };

    const initialValues = {
        ...item,
        alertQuantity: item?.alertQuantity ?? 0,
        date: item?.openingDate ? dayjs(item.openingDate) : null
    }

    return (
        <div>
            <Form
                form={form}
                layout="vertical"
                name="basic"
                initialValues={initialValues}
                onFinish={onFinish}
                autoComplete="off">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
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
                        <InputNumber type="number" disabled value={Number((Number(quantity) * Number(unitPrice)).toFixed(2))} style={{ width: '100%' }} />
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

                <Form.Item label={null}>
                    <Button type="primary" htmlType="submit" loading={isLoading} className="w-full">
                        {isLoading ? "Updating..." : "Update"}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default EditRowMaterials
