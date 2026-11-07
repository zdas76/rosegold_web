import { Button, Form, Input } from "antd";
import { TStauffUser } from "../../../types/types";
import { useAddUserMutation } from "../../../redux/features/auth/authApi";
import { getResponse } from "../../../utils/getResponse";
import { toast } from "sonner";

type TProps = {
    setIsModalOpen: any;

}

export const UserCreateForm = ({ setIsModalOpen }: TProps) => {
    const [form] = Form.useForm<TStauffUser>();
    const [addUser, { isLoading }] = useAddUserMutation()
    const onFinish = async (values: TStauffUser) => {
        const res = await addUser(values)
        const result = getResponse(res)
        if (result.success) {
            setIsModalOpen(false)
            toast.success("User Added Successfully")
        }
    }


    return (
        <div>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}>
                <Form.Item label="Name" name="name" rules={[
                    {
                        required: true, message: "Enter Name Please"
                    }
                ]}>
                    <Input placeholder="Enter Name" />
                </Form.Item>

                {/* Email */}
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: "Please enter your email" },
                        { type: "email", message: "Invalid email address" },
                    ]}
                >
                    <Input placeholder="Enter email" />
                </Form.Item>
                {/* Password */}
                <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                        { required: true, message: "Please enter your password" },
                        { min: 6, message: "Minimum 6 characters" },
                    ]}
                >
                    <Input.Password placeholder="Enter password" />
                </Form.Item>
                {/* Mobile */}
                <Form.Item
                    label="Phone"
                    name="phone"
                    rules={[
                        { required: true, message: "Please enter your mobile number" },
                        {
                            pattern: /^[0-9]{10,11}$/,
                            message: "Enter valid mobile number",
                        },
                    ]}>
                    <Input placeholder="Enter mobile number" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={isLoading} block>
                        {isLoading ? "Submitting..." : "Submit"}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}
