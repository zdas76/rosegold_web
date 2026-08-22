/* eslint-disable @typescript-eslint/no-explicit-any */

import { Form, Input, Button, Select, } from "antd";

import { useAddPartyMutation } from "../../../redux/features/auth/authApi";
import { getResponse } from "../../../utils/getResponse";
import { TParty } from "../../../types/types";

const AddPartyForm = ({ setIsModalOpen }: { setIsModalOpen: any }) => {

    const [form] = Form.useForm();
    const [addParty, { isLoading: isSubmitting }] = useAddPartyMutation()

    const onFinish = async (values: TParty) => {
        const response = await addParty(values);
        const getres = getResponse(response)
        if (getres.success) {
            form.resetFields();
            setIsModalOpen(false)
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}>
            <Form.Item label="Name" name="name" rules={[{ required: true, message: "Name is required" }]}>
                <Input placeholder="Enter your name" />
            </Form.Item>
            <Form.Item label="Contact Number" name="contactNo" rules={[{ required: true, message: "Contact Number is required" }]}>
                <Input placeholder="Enter Contact Number" maxLength={14} />
            </Form.Item>
            <Form.Item label="Party Type" name="partyType" initialValue="PARTY" rules={[{ required: true, message: "Please select a type" }]}>
                <Select
                    placeholder="Select Type"
                    disabled
                    options={[
                        { value: 'PARTY', label: 'PARTY' },
                    ]} />
            </Form.Item>
            <Form.Item label="Address" name="address" rules={[{ required: true, message: "Address is required" }]}>
                <Input placeholder="Enter your Address" />
            </Form.Item>
            {/* <div className="grid gap-4">
                <Form.Item label="Due Amount" name="openingAmount" rules={[{ required: true, message: "this is required at least 0" }]}>
                    <InputNumber style={{ width: "100%" }} min={0} placeholder="Enter your Address" />
                </Form.Item>
            </div>
            <Form.Item label="Opening Date" name="openingDate" rules={[{ required: true, message: "Please enter a valid email" }]}>
                <DatePicker style={{ width: "100%" }} />
            </Form.Item> */}
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
            </Form.Item>
        </Form>

    )
}

export default AddPartyForm