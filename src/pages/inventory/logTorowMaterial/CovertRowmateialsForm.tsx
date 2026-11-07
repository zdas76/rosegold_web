
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, Input, Button, DatePicker, Select, InputNumber } from "antd";
import { generateInvoiceNumber } from "../../../utils/generateRandomNumber";
import { useAllLogCategory, useAllRowMaterials } from "../../../hook/getAllRowMaterials";
import { useState } from "react";
import { useLazyGetTotalLogCategoryQuery, useLogToRowMaterialMutation } from "../../../redux/features/OthersApi/othersApi";
import { getResponse } from "../../../utils/getResponse";
import { toast } from "sonner";
const ConvertForm = ({ setIsModalOpen }: { setIsModalOpen: any }) => {

    const [logCategoryId, setLogCategoryId] = useState<number>(0);
    const [getTotalFromapi] = useLazyGetTotalLogCategoryQuery()

    const [form] = Form.useForm();
    const allRowMaterials = useAllRowMaterials()
    const allLogCategory = useAllLogCategory()
    const [vaucher, setVoucher] = useState(generateInvoiceNumber("LR"))
    const [logToRow, { isLoading: isSubmitting }] = useLogToRowMaterialMutation()

    const onFinish = async (values: any) => {
        const data = {
            ...values,
            vaucher,
        }
        const res = await logToRow(data)
        const result = getResponse(res)
        if (result?.success) {
            setIsModalOpen(false)
            form.resetFields()
            setVoucher(generateInvoiceNumber("LR"))
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{ logs: [{}] }}
            //   initialValues={formData} 
            onFinish={onFinish}
            className="p-4 rounded"
        >
            <div className="flex justify-center gap-4">
                <Form.Item label="Select Date" name="date" style={{ width: "100%" }} rules={[{ required: true, message: 'Select a date' }]}
                >
                    <DatePicker style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item style={{ width: "100%" }} label="Voucher No.">
                    <Input value={vaucher} readOnly />
                </Form.Item>
            </div>
            {/* fileds headers */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-4 items-center bg-slate-50 shadow-xs px-1 py-1 rounded mb-2">
                <b>Row Materials</b>
                <b>Log Category</b>
                <b>Date</b>
                <b>Qunatity</b>
                <b>Amount</b>
            </div>
            {/* Name Field */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center"
                style={{ display: 'flex', marginBottom: 3 }}>
                <Form.Item
                    style={{ width: "100%" }}
                    name="rawId"
                    rules={[{ required: true, message: 'Missing rawId' }]}
                >
                    <Select options={allRowMaterials} placeholder="Select Row Materials" />
                </Form.Item>

                <Form.Item
                    style={{ width: "100%" }}
                    name="logCategoryId"
                    rules={[{ required: true, message: 'Missing logCategoryId' }]}>
                    <Select options={allLogCategory} placeholder="Select Log category" onChange={(value) => setLogCategoryId(value)} />
                </Form.Item>

                <Form.Item
                    style={{ width: "100%" }}
                >
                    <DatePicker style={{ width: "100%" }} onChange={async (value) => {
                        try {
                            const res = await getTotalFromapi({ logCategoryId, date: value?.format("YYYY-MM-DD") });
                            const netAmount = res?.data?.data?.netAmount;
                            const netQuantity = res?.data?.data?.netQuantity;
                            if (netAmount < 1 || netQuantity < 1) {
                                toast.error("Your all value already merged")
                                return
                            }
                            form.setFields([
                                {
                                    name: "quantity",
                                    value: netQuantity.toFixed(2)
                                },
                                {
                                    name: "amount",
                                    value: netAmount
                                }
                            ])
                        } catch (error) {
                            console.log(error);
                        }

                    }} />
                </Form.Item>

                <Form.Item
                    style={{ width: "100%" }}
                    name="quantity"
                    rules={[{ required: true, message: "Quantity Not Found" }]}
                >
                    <InputNumber min={1} readOnly style={{ width: "100%", color: "black" }} disabled placeholder="Quantity" />
                </Form.Item>

                <Form.Item
                    style={{ width: "100%" }}
                    name="amount"
                    rules={[{ required: true, message: "Amount Not found" }]}
                >
                    <InputNumber disabled min={1} readOnly style={{ width: "100%", color: "black" }} placeholder="Amount" />
                </Form.Item>
            </div>

            {/* Submit Button */}
            <Form.Item style={{ marginTop: "50px" }}>
                <Button type="primary" htmlType="submit" className="w-full" loading={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default ConvertForm;
