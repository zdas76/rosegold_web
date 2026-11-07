/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Form, InputNumber, Select, Button, Row, Col, Input, Divider, DatePicker } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import { TAccountsItem, TProduct, TrowMaterials } from '../../../types/types';
import { useGetAccountItemQuery, useLazyGetTotalQuantityAndUnitPriceQuery } from '../../../redux/features/transactions/transactons.api';
import { useConvertProductMutation, useGetProductsQuery } from '../../../redux/features/product/product.api';
import { generateInvoiceNumber } from '../../../utils/generateRandomNumber';
import { getResponse } from '../../../utils/getResponse';
import { useGetRowMaterialsQuery } from '../../../redux/features/rowMaterials/rowMaterials.api';
import { toast } from 'sonner';
const { Option } = Select;

const ConvertRowToProduct = () => {
    const [form] = Form.useForm();
    const [voucherNo, setVoucherNo] = useState<number | string>()
    const [productQuantity, setProductQuantity] = useState<number | null>(0)
    const { data: rawMaterialsData } = useGetRowMaterialsQuery({})
    const { data: expenceItem } = useGetAccountItemQuery({ accountMainPillerId: ["03"] })
    const { data: productData } = useGetProductsQuery({})
    const [productUnit, setProductUnit] = useState()
    const [convertProduct, { isLoading: isSubmitting }] = useConvertProductMutation({})

    const [getTotal] = useLazyGetTotalQuantityAndUnitPriceQuery()
    // Corrected type
    const [rawMaterials, setrawMaterials] = useState(rawMaterialsData?.data)

    // set initial data after fetching
    useEffect(() => {
        if (rawMaterialsData?.data) {
            setrawMaterials(rawMaterialsData.data);
        }
        const vouseno = generateInvoiceNumber("CPV")
        setVoucherNo(vouseno)
    }, [rawMaterialsData]);

    // get the total cost of product and
    const rawMaterialsall = Form.useWatch("rawMaterials", form);

    const expensesall = Form.useWatch("expenses", form);
    // const totalRMCost = 
    const totalCostAmountofRaw = rawMaterialsall?.reduce((sum: number, item: { amount: number }) => sum + (item?.amount || 0), 0);
    const totalExpenses = expensesall?.reduce((sum: number, item: { amount: number }) => (sum + item?.amount || 0), 0);




    const handleSubmitForm = async (values: any) => {
        const formData = {
            ...values,
            voucherNo,
            product: {
                productId: values?.productId,
                quantity: productQuantity,
                unitcost: Number(((totalCostAmountofRaw + totalExpenses) / productQuantity!).toFixed(2)),
                amount: Number((totalCostAmountofRaw + totalExpenses).toFixed(2)),
                narration: values?.narration
            }
        }
        // console.log(formData);
        const res = await convertProduct(formData)
        const result = getResponse(res)
        if (result.success) {
            form.resetFields()
            const vouseno = generateInvoiceNumber("CPV")
            setVoucherNo(vouseno)
        }
    }

    return (
        <div>
            <div className="bg-white rounded-lg px-4 py-2 mb-3">
                <h1 className='text-xl font-bold m-0'>Convert Row Materials To Product</h1>
            </div>
            <Form
                onFinish={handleSubmitForm}
                form={form}
                layout="vertical"
                // onValuesChange={handleValuesChange}
                initialValues={{ rawMaterials: [{}], expenses: [{}], }}>
                {/* ROW MATERIALS */}
                <div className='flex flex-col sm:flex-row gap-5 bg-white mb-4 rounded-lg shadow p-3 pb-1'>
                    <Form.Item label="Voucher No" rules={[{ required: true }]} className='w-full'>
                        <InputNumber disabled value={voucherNo} placeholder='Voucher No' style={{ width: "100%", color: "#000", }} />
                    </Form.Item>
                    <Form.Item name={"date"} label="Date" rules={[{ required: true }]} className='w-full'>
                        <DatePicker placeholder='Date' style={{ width: "100%" }} />
                    </Form.Item>
                </div>
                <div className='bg-white mb-4 rounded-lg shadow pt-1 p-3'>
                    <Divider orientation="left">Row Materials</Divider>
                    <div className=''>
                        <Row style={{ marginBottom: "5px" }}>
                            <Col className='px-3' span={6}>Raw Materials <span className='text-red-500'>*</span></Col>
                            <Col className='px-3' span={8}>Quantity <span className='text-red-500'>*</span></Col>
                            <Col className='px-3' span={5}>Unit Price</Col>
                            <Col className='px-3' span={4}>Total Amount</Col>
                        </Row>
                        <Form.List name="rawMaterials">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name }) => {
                                        // const rowitems = form.getFieldValue(["rawMaterials", name]) || {};
                                        // console.log(rowitems);
                                        return <Row gutter={12} key={key} align="middle" content='center'>
                                            <Col span={6}>
                                                <Form.Item name={[name, 'rawMaterialsId']} label="" rules={[{ required: true }]}>
                                                    <Select placeholder="Select Raw Material" style={{ width: "100%" }} onChange={async (value) => {
                                                        const totalResult = await getTotal({ itemType: "raw", rawId: value });
                                                        const totalData = totalResult?.data?.data;
                                                        const selectedItem = rawMaterials?.find((item: TrowMaterials) => item?.id === value)
                                                        // console.log(totalData, "total data");
                                                        form.setFieldsValue({
                                                            rawMaterials: {
                                                                [name]: {
                                                                    rawUnitprice: Number((totalData?.netAmount / totalData?.netQuantity).toFixed(2)) || 0,
                                                                    netQuantity: totalData?.netQuantity,
                                                                    unit: selectedItem?.unit?.name
                                                                },
                                                            },
                                                        });
                                                    }}>
                                                        {
                                                            rawMaterials?.map((item: TrowMaterials, idx: number) => {
                                                                // Get all selected values
                                                                const selectedValues = form.getFieldValue("rawMaterials")?.map((rm: any) => rm?.rawMaterialsId);
                                                                const isSelected = selectedValues?.includes(item?.id)
                                                                const currentValue = form.getFieldValue(["rawMaterials", name, "rawMaterialsId"]);
                                                                const shouldDisable = isSelected && currentValue !== item?.id;
                                                                return <Option disabled={shouldDisable} key={idx} value={item?.id}>{item?.name}</Option>
                                                            })
                                                        }
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <div className='flex items-center'>
                                                    <Form.Item label="" name={[name, 'quantity']} rules={[{ required: true, message: "Quantity required" }]}>
                                                        <InputNumber addonBefore={form.getFieldValue(["rawMaterials", name, "netQuantity"]) || "Q"} addonAfter={form.getFieldValue(["rawMaterials", name, "unit"]) || "Unit"} style={{ width: "100%", borderRadius: "0" }} min={0} onChange={(value: any) => {
                                                            const existingQuantity = form.getFieldValue(["rawMaterials", name, "netQuantity"]);
                                                            if (existingQuantity >= value) {
                                                                const unitPrice = form.getFieldValue(["rawMaterials", name, "rawUnitprice"]);
                                                                form.setFieldsValue({
                                                                    rawMaterials: {
                                                                        [name]: { amount: Number((unitPrice * value).toFixed(2)) || 0 },
                                                                    },
                                                                });
                                                            } else {
                                                                toast.error("Quantity Shouldn't more than stock")
                                                                form.setFieldsValue({
                                                                    rawMaterials: {
                                                                        [name]: { quantity: existingQuantity || 0 },
                                                                    },
                                                                });
                                                            }

                                                        }} />
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                            <Col span={5}>
                                                <Form.Item name={[name, "rawUnitprice"]}>
                                                    <InputNumber min={0} style={{ width: "100%", color: "black" }} readOnly />
                                                </Form.Item>
                                            </Col>
                                            <Col span={4}>
                                                <Form.Item name={[name, 'amount']} initialValue={0}>
                                                    <InputNumber readOnly style={{ width: "100%" }} />
                                                </Form.Item>
                                            </Col>
                                            <Col className='mt-2'>
                                                <MinusCircleOutlined onClick={() => remove(name)} />
                                            </Col>
                                        </Row>
                                    })}
                                    <button
                                        onClick={() => add()}
                                        type="button"
                                        className="w-full bg-slate-900 cursor-pointer text-white py-1 px-3 rounded mt-3">
                                        Add Row Material
                                    </button>
                                </>
                            )}
                        </Form.List>
                    </div>
                    <p className="text-right font-semibold pr-20 text-xl mt-4">Grand Total: {totalCostAmountofRaw || 0} ৳</p>
                </div>
                {/* EXPENSES */}
                <div className='bg-white rounded-lg shadow pt-1 p-3'>
                    <Divider orientation="left">Expenses</Divider>
                    <Row style={{ marginBottom: "5px" }} align="middle">
                        <Col className='px-3' span={8}>Expense <span className='text-red-500'>*</span></Col>
                        <Col className='px-3' span={6}>Amount <span className='text-red-500'>*</span></Col>
                        <Col className='px-3' span={9}>Narration</Col>
                    </Row>
                    <Form.List name="expenses">
                        {(fields, { add, remove }) => (
                            <div>
                                {fields.map(({ key, name }) => (
                                    <Row gutter={12} key={key} align="middle">
                                        <Col span={8}>
                                            <Form.Item name={[name, 'accountsItemId']} rules={[{ required: true }]}>
                                                <Select placeholder="Select Expense" style={{ width: "100%" }}>
                                                    {
                                                        expenceItem?.data?.map((item: TAccountsItem, idx: number) => (
                                                            <Option key={idx} value={item?.id}>{item?.accountsItemName}</Option>
                                                        ))
                                                    }
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item name={[name, 'amount']} rules={[{ required: true }]}>
                                                <InputNumber min={0} style={{ width: "100%" }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={9}>
                                            <Form.Item name={[name, 'narration']}>
                                                <Input style={{ width: "100%" }} />
                                            </Form.Item>
                                        </Col>
                                        <Col>
                                            <MinusCircleOutlined onClick={() => remove(name)} />
                                        </Col>
                                    </Row>
                                ))}
                                <button onClick={() => add()} type="button"
                                    className="w-full bg-slate-900 cursor-pointer text-white py-1 px-3 rounded mt-3">
                                    Add Expense
                                </button>
                            </div>
                        )}
                    </Form.List>
                    <p className="text-right font-semibold text-xl pr-20 mt-4 mr-4">Total Expense: {totalExpenses} ৳</p>
                </div>

                {/* PRODUCTS */}
                <div className='bg-white rounded-lg shadow p-3 pt-1 mt-4'>
                    <Divider orientation="left">Products</Divider>
                    <Row gutter={12} align="middle">
                        <Col span={4}>
                            <Form.Item
                                name="productId"
                                label="Product"
                                rules={[{ required: true, message: 'Please select a product' }]}
                            >
                                <Select placeholder="Select Product" style={{ width: '100%' }} onChange={(value) => {
                                    const unit = productData?.data?.find((item: TProduct) => item?.id === value)?.unit?.name;
                                    setProductUnit(unit)
                                }}>
                                    {productData?.data?.map((item: TProduct, idx: number) => (
                                        <Select.Option key={idx} value={item?.id}>
                                            {item?.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item
                                name="quantity"
                                label="Quantity"
                                rules={[{ required: true, message: 'Please enter quantity' }]}>
                                <InputNumber min={0} addonAfter={productUnit || "unit"} style={{ width: '100%' }} onChange={(value) => setProductQuantity(value)} />
                            </Form.Item>
                        </Col>

                        <Col span={4}>
                            <Form.Item
                                label="Unit Cost">
                                <Input min={0} value={((totalCostAmountofRaw + totalExpenses) / productQuantity!).toFixed(2) || 1} readOnly name="unitCost" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>

                        <Col span={4}>
                            <Form.Item
                                label="Total Cost">
                                <InputNumber value={totalCostAmountofRaw + totalExpenses} readOnly style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>

                        <Col span={5}>
                            <Form.Item name="narration" label="Narration">
                                <Input style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                {/* <p className="text-right font-semibold">Grand Total: {productsTotal} ৳</p> */}
                <Form.Item style={{ textAlign: "right", marginTop: "20px" }}>

                    <Button type="primary" size="large" htmlType="submit" className="w-full text-lg max-w-[300px]" loading={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ConvertRowToProduct;
