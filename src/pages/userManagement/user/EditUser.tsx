/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, Input, Button } from "antd";
import { getResponse } from "../../../utils/getResponse";
import { useUpdateUserMutation } from "../../../redux/features/auth/authApi";
const EditUser = ({ userData, setOpenModal }: { userData: { name: string; email: string; phone: string; id: string }; setOpenModal: any }) => {
    console.log(userData)
    const [form] = Form.useForm();
    const [updateUser, { isLoading }] = useUpdateUserMutation()

    const onFinish = async (values: { name?: string; email?: string; phone?: string }) => {
        if (!userData?.id) return;

        const response = await updateUser({
            ...values,
            id: Number(userData.id),
        });

        const res = getResponse(response);
        if (res?.success) {
            form.resetFields();
            setOpenModal(false);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{
                name: userData.name,
                email: userData.email,
                phone: userData?.phone,
            }}
            onFinish={onFinish}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label="Name" name={`name`}>
                    <Input placeholder="Enter your name" />
                </Form.Item>
                <Form.Item label="Email" name={`email`}>
                    <Input type="email" disabled placeholder="Enter your email" />
                </Form.Item>
            </div>
            <div className="grid grid-cols-1 items-center md:grid-cols-2 gap-4">
                <Form.Item label="Mobile Number" name={`phone`}>
                    <Input placeholder="Enter your phone" />
                </Form.Item>

            </div>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={isLoading}>
                    {isLoading ? "Submitting..." : "Submit"}
                </Button>
            </Form.Item>
        </Form>
    )
}

export default EditUser