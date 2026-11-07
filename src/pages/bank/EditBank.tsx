/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, DatePicker, Form, Input, InputNumber } from "antd"
import { useEffect } from "react";
import { TBankAccount } from "../../types/types";
import dayjs from "dayjs";
import { useUpdateBankMutation } from "../../redux/features/bank/bank.api";
import { getResponse } from "../../utils/getResponse";

const EditBank = ({ item, setOpenModal }: { item: TBankAccount; setOpenModal: any }) => {
    const [form] = Form.useForm();
    const [updateBank] = useUpdateBankMutation()

    const onFinish = async (values: any) => {
        const res = await updateBank({ data: values, id: item?.id })
        if (res?.data?.success) {
            setOpenModal(false)
        }
    };

    useEffect(() => {
        if (item) {
            form.setFieldsValue({
                ...item,
                closingAmount: item?.bankClosing?.closingAmount,
                date: item?.bankClosing?.date ? dayjs(item?.bankClosing?.date) : ((item as any)?.date ? dayjs((item as any).date) : (item?.createdAt ? dayjs(item.createdAt) : null)),
            });
        }
    }, [item, form]);

    const itemData = {
        ...item,
        closingAmount: item?.bankClosing?.closingAmount,
        date: item?.bankClosing?.date ? dayjs(item?.bankClosing?.date) : ((item as any)?.date ? dayjs((item as any).date) : (item?.createdAt ? dayjs(item.createdAt) : null)),
    }

    return (
        <div>
            <Form
                form={form}
                initialValues={itemData}
                layout="vertical"
                onFinish={onFinish}>
                <Form.Item
                    label="Bank Name"
                    name="bankName"
                    rules={[{ required: true, message: "Please enter the bank name" }]}>
                    <Input placeholder="Bank name" />
                </Form.Item>
                <Form.Item
                    label="Branch Name"
                    name="branceName"
                    rules={[{ required: true, message: "Please enter the branch name" }]}>
                    <Input placeholder="Branch name" />
                </Form.Item>
                <Form.Item
                    label="Account Number"
                    name="accountNumber"
                    rules={[{ required: true, message: "Please enter the account number" }]}>
                    <Input placeholder="Account Number" />
                </Form.Item>



                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default EditBank