/* eslint-disable @typescript-eslint/no-explicit-any */
import { TProduct, Tsubcategroy, TUnit } from '../../../types/types'
import { Button, DatePicker, Form, Input, InputNumber, Select } from 'antd';
import { getResponse } from '../../../utils/getResponse';
import { useGetsubCategoryQuery } from '../../../redux/features/category/category.api';
import { useUpdateProductMutation } from '../../../redux/features/product/product.api';
import { useState, useEffect } from 'react';
import { useAllUnits } from '../../../hook/allUnits';
import dayjs from 'dayjs';

const EdiitProduct = ({ item, setIsEditModal }: { item: TProduct | any, setIsEditModal: any }) => {
    const [form] = Form.useForm()
    const { Option } = Select
    const { data: subcategory } = useGetsubCategoryQuery({})
    const [updateProduct, { isLoading }] = useUpdateProductMutation()
    const allUnits = useAllUnits()

    const [quantity, setQuantity] = useState<number | null>(item?.quantity || 0)
    const [unitPrice, setUnitPrice] = useState<number | null>(item?.unitPrice || 0)

    useEffect(() => {
        if (item) {
            setQuantity(item?.quantity || 0)
            setUnitPrice(item?.unitPrice || 0)
            form.setFieldsValue({
                ...item,
                alertQuantity: item?.alertQuantity ?? 0,
                date: item?.openingDate ? dayjs(item?.openingDate) : undefined
            })
        }
    }, [item, form])

    const onFinish = async (values: any) => {
        const data = {
            ...values,
            alertQuantity: values.alertQuantity !== undefined && values.alertQuantity !== null && values.alertQuantity !== ""
                ? Number(values.alertQuantity)
                : 0,
            initialStock: {
                quantity: values?.quantity,
                amount: Number((unitPrice! * quantity!).toFixed(2)),
                date: values?.date,
                unitPrice: Number(unitPrice?.toFixed(2))
            }
        }
        // Perform any actions like sending the data to the server
        const res = await updateProduct({ data: data, id: item?.id })
        const status = getResponse(res)
        if (status?.success) {
            form.resetFields()
            setIsEditModal(false)
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
                initialValues={{
                    ...item,
                    alertQuantity: item?.alertQuantity ?? 0,
                    date: item?.openingDate ? dayjs(item?.openingDate) : undefined
                }}>
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
                        <InputNumber
                            type="number"
                            min={0}
                            onChange={(value) => setQuantity(Number(Number(value).toFixed(2)))}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item label="Unit Price" name={"unitPrice"}>
                        <InputNumber
                            type="number"
                            min={0}
                            style={{ width: '100%' }}
                            onChange={(value) => setUnitPrice(Number(value))}
                            disabled={!quantity}
                        />
                    </Form.Item>

                    <div className='col-span-2 grid grid-cols-3 gap-x-4'>
                        <Form.Item label="Initial Total Amount">
                            <InputNumber
                                type="number"
                                min={0}
                                readOnly
                                style={{ width: '100%', color: "black" }}
                                value={Number((unitPrice! * quantity!).toFixed(2))}
                            />
                        </Form.Item>

                        <Form.Item label="Date" name="date" rules={[{ required: true }]}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item label="Alert Quantity" name="alertQuantity">
                            <InputNumber
                                min={0}
                                placeholder="Enter alert quantity"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </div>
                </div>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={isLoading}>
                        {isLoading ? "Submitting..." : "Submit"}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default EdiitProduct
