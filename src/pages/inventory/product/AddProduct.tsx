/* eslint-disable @typescript-eslint/no-explicit-any */

import { Form, Input, Button, Select, InputNumber, DatePicker, } from 'antd';
import { useGetsubCategoryQuery } from '../../../redux/features/category/category.api';
import { Tsubcategroy, TUnit } from '../../../types/types';
import { useAddProductMutation } from '../../../redux/features/product/product.api';
import { getResponse } from '../../../utils/getResponse';
import { useState } from 'react';
import { useAllUnits } from '../../../hook/allUnits';
import dayjs from 'dayjs';
const AddProduct = ({ setIsModalOpen }: { setIsModalOpen: any }) => {
    const [form] = Form.useForm();
    const { Option } = Select;
    const { data: subcategory } = useGetsubCategoryQuery({});
    const [addProduct, { isLoading }] = useAddProductMutation()
    // const [intialStcok, setInitialStock] = useState(true)
    const [quantity, setQuantity] = useState<number | null>()
    const [unitPrice, setUnitPrice] = useState<number | null>()
    // const [unitPrice, setUnitPrice] = useState<number | null>()
    const allUnits = useAllUnits()

    const onFinish = async (values: any) => {
        const data = {
            ...values,
            alertQuantity: values.alertQuantity !== undefined && values.alertQuantity !== null && values.alertQuantity !== ""
                ? Number(values.alertQuantity)
                : 0,
            initialStock: {
                quantity: values?.quantity,
                amount: Number(((unitPrice || 0) * (quantity || 0)).toFixed(2)),
                date: values?.date,
                unitPrice: Number((unitPrice || 0).toFixed(2))
            }
        }
        // Perform any actions like sending the data to the server
        const res = await addProduct(data)
        const status = getResponse(res)
        if (status.success) {
            form.resetFields()
            setIsModalOpen(false)
        }
    };
    return (
        <div className='max-h-[600px] overflow-y-auto pr-2'>
            <Form
                form={form}
                name="productForm"
                layout="vertical"
                wrapperCol={{ span: 24 }}
                onFinish={onFinish}
                initialValues={{}}>
                <div className='grid grid-cols-2 gap-x-4'>
                    <Form.Item
                        label="Product Name"
                        name="name"
                        rules={[{ required: true, message: 'Please input the product name!' }]}>
                        <Input placeholder="Enter product name" />
                    </Form.Item>
                    <Form.Item
                        label="Unit"
                        name="unitId"
                        rules={[{ required: true, message: 'Please select a unit!' }]}>
                        <Select placeholder="Select a unit">
                            {allUnits?.map((item: TUnit) => (
                                <Option key={item?.id} value={item?.id}>{item?.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <div className='col-span-2'>
                        <Form.Item
                            label="Description"
                            name="description"
                            rules={[{ required: true, message: 'Please input the product description!' }]}>
                            <Input.TextArea placeholder="Enter product description" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        label="Sub Category"
                        name="subCategoryId"
                        rules={[{ required: true, message: 'Please select a sub category!' }]}>
                        <Select placeholder="Select a sub category">
                            {subcategory?.data?.map((item: Tsubcategroy) => (
                                <Option key={item?.id} value={item?.id}>{item?.subCategoryName}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Size"
                        name="size">
                        <Input type='text' />
                    </Form.Item>
                    <Form.Item label="Initial Quantity" name="quantity" rules={[{ required: true }]}>
                        <InputNumber type="number" min={0} onChange={(value) => {
                            const qty = value !== null && value !== undefined ? Number(value.toFixed(2)) : null;
                            setQuantity(qty);
                            if (qty === 0) {
                                setUnitPrice(0);
                                form.setFieldsValue({ unitPrice: 0 });
                            }
                        }} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item label="Unit Price" name={"unitPrice"}>
                        <InputNumber type="number" min={0} style={{ width: '100%' }} onChange={(value) => setUnitPrice(value)} disabled={quantity === undefined || quantity === null} />
                    </Form.Item>

                    <div className='col-span-2 grid grid-cols-3 gap-x-4'>
                        <Form.Item label="Initial Total Amount" rules={[{ required: true }]} style={{ width: '100%' }}>
                            <InputNumber type="number" min={0} readOnly style={{ width: '100%', color: "black" }} value={Number(((unitPrice || 0) * (quantity || 0)).toFixed(2))} />
                        </Form.Item>

                        <Form.Item label="Date" name="date" rules={[{ required: true }]} initialValue={dayjs()} style={{ width: '100%' }}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item label="Alert Quantity" name="alertQuantity" style={{ width: '100%' }}>
                            <InputNumber min={0} placeholder="Enter alert quantity" style={{ width: '100%' }} />
                        </Form.Item>
                    </div>
                </div>
                <Form.Item className='mt-4'>
                    <Button type="primary" htmlType="submit" loading={isLoading}>
                        {isLoading ? "Submitting..." : "Submit"}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default AddProduct