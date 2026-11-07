/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, Input, Divider } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { Link } from "react-router";
import AuthLayout from "../../components/shared/AuthLayout";

const Register = () => {
    const onFinish = (values: any) => {
        console.log("Success:", values);
    };

    return (
        <AuthLayout
            title="Create an Account"
            subtitle="Join Golden Mart and manage your business efficiently"
        >
            <Form layout="vertical" onFinish={onFinish} size="large" requiredMark={false}>
                {/* Full Name */}
                <Form.Item
                    label="Full Name"
                    name="fullName"
                    rules={[{ required: true, message: "Please enter your name!" }]}
                >
                    <Input
                        prefix={<UserOutlined className="text-slate-400" />}
                        placeholder="Enter your full name"
                        className="rounded-lg py-2.5"
                    />
                </Form.Item>

                {/* Email */}
                <Form.Item
                    label="Email Address"
                    name="email"
                    rules={[
                        { required: true, message: "Please enter your email!" },
                        { type: "email", message: "Enter a valid email!" },
                    ]}
                >
                    <Input
                        prefix={<MailOutlined className="text-slate-400" />}
                        placeholder="Enter your email"
                        className="rounded-lg py-2.5"
                    />
                </Form.Item>

                {/* Password */}
                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: "Please enter your password!" }]}
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-slate-400" />}
                        placeholder="Enter your password"
                        className="rounded-lg py-2.5"
                    />
                </Form.Item>

                {/* Confirm Password */}
                <Form.Item
                    label="Confirm Password"
                    name="confirmPassword"
                    dependencies={["password"]}
                    rules={[
                        { required: true, message: "Please confirm your password!" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("password") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject("Passwords do not match!");
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-slate-400" />}
                        placeholder="Confirm your password"
                        className="rounded-lg py-2.5"
                    />
                </Form.Item>

                {/* Register Button */}
                <Button type="primary" htmlType="submit" className="w-full h-12 font-semibold rounded-lg">
                    Create Account
                </Button>

                <Divider className="text-slate-400 text-xs">OR</Divider>

                {/* Login Link */}
                <p className="text-center text-slate-500 m-0">
                    Already have an account?{" "}
                    <Link to="/login" className="text-gold-600 font-semibold hover:text-gold-700">
                        Login here
                    </Link>
                </p>
            </Form>
        </AuthLayout>
    );
};

export default Register;