/* eslint-disable @typescript-eslint/no-explicit-any */

import { Form, Input, Button, Select, } from "antd";

import { useAddPartyMutation } from "../../../redux/features/auth/authApi";
import { getResponse } from "../../../utils/getResponse";
import { TParty } from "../../../types/types";


const AddVendorForm = ({ setIsModalOpen }: { setIsModalOpen: any }) => {
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
                <Input placeholder="Enter vendor name" />
            </Form.Item>
            <Form.Item label="Contact Number" name="contactNo" rules={[{ required: true, message: "Contact Number is required" }]}>
                <Input placeholder="Enter Contact Number" maxLength={14} />
            </Form.Item>
            <Form.Item label="Party Type" name="partyType" initialValue="VENDOR" rules={[{ required: true, message: "Please select a type" }]}>
                <Select
                    placeholder="Select Type"
                    disabled
                    options={[
                        { value: 'VENDOR', label: 'VENDOR' },
                    ]} />
            </Form.Item>
            <Form.Item label="Address" name="address" rules={[{ required: true, message: "Address is required" }]}>
                <Input placeholder="Enter vendor Address" />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
            </Form.Item>
        </Form>

    )
}

export default AddVendorForm
