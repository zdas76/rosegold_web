/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, FormProps, Input, InputNumber, Select } from 'antd';
import { useUpdatePackingMaterialMutation } from '../../../redux/features/packingMaterials/packingMaterials.api';
import { getResponse } from '../../../utils/getResponse';
import { useAllUnits } from '../../../hook/allUnits';
import { useState } from 'react';

const EditPackingMaterials = ({ item, setIsEditModal }: { setIsEditModal: any; item: any }) => {
    const [form] = Form.useForm();
    const [updatePackingMaterial, { isLoading }] = useUpdatePackingMaterialMutation();
    const allUnits = useAllUnits();

    const [quantity, setQuantity] = useState<number | null>(item?.quantity || 0);
    const [unitPrice, setUnitPrice] = useState<number | null>(item?.unitPrice || 0);

    const onFinish: FormProps['onFinish'] = async (values) => {
        const data = {
            id: item?.id,
            body: {
                ...values,
                quantity: Number(quantity) || 0,
                unitPrice: Number(unitPrice) || 0,
                amount: Number(((Number(quantity) || 0) * (Number(unitPrice) || 0)).toFixed(2)),
                openingAmount: Number(((Number(quantity) || 0) * (Number(unitPrice) || 0)).toFixed(2)),
                alertQuantity: values.alertQuantity !== undefined && values.alertQuantity !== null && values.alertQuantity !== ""
                    ? Number(values.alertQuantity)
                    : 0,
            }
        };
        const res = await updatePackingMaterial(data);
        const response = getResponse(res);
        if (response?.success) {
            setIsEditModal(false);
        }
    };

    const initialValues = {
        name: item?.name,
        unitId: item?.unitId,
        quantity: item?.quantity,
        unitPrice: item?.unitPrice,
        alertQuantity: item?.alertQuantity ?? 0,
        description: item?.description,
    };

    return (
        <div>
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
                onFinish={onFinish}
                autoComplete="off"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter a name' }]}
                    >
                        <Input placeholder="Enter name" />
                    </Form.Item>

                    <Form.Item
                        label="Unit"
                        name="unitId"
                        rules={[{ required: true, message: 'Please select unit' }]}
                    >
                        <Select options={allUnits} placeholder="Select unit" />
                    </Form.Item>

                    <Form.Item label="Quantity" name="quantity" rules={[{ required: true }]}>
                        <InputNumber
                            type="number"
                            min={0}
                            onChange={(value) => setQuantity(value !== null ? Number(value.toFixed(2)) : 0)}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item label="Unit Price" name="unitPrice" rules={[{ required: true }]}>
                        <InputNumber
                            type="number"
                            min={0}
                            onChange={(value) => setUnitPrice(value !== null ? Number(value.toFixed(2)) : 0)}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

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
                </div>

                <Form.Item label="Description" name="description">
                    <Input.TextArea rows={3} placeholder="Enter description" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={isLoading} className="w-full">
                        {isLoading ? 'Updating...' : 'Update'}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default EditPackingMaterials;
