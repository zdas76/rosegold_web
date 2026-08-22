/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input, Button, Form, Checkbox, Divider } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router';
import { useLoginMutation } from '../../redux/features/auth/authApi';
import { getResponse } from '../../utils/getResponse';
import { decodeToken } from '../../utils/decodeToken';
import { useAppDispatch } from '../../redux/hooks';
import { addUser } from '../../redux/features/auth/authSlice';
import cookies from "js-cookie"

export default function LoginPage() {
    const dispatch = useAppDispatch()
    const [login, { isLoading }] = useLoginMutation()
    const navigate = useNavigate()

    interface LoginFormValues {
        email: string;
        password: string;
    }


    const onFinish = async (values: LoginFormValues) => {
        const res: any = await login(values)
        const data = getResponse(res)
        if (data?.success) {
            const decodeData = decodeToken(data?.data?.accessToken);
            cookies.set("accessToken", data?.data?.accessToken);
            dispatch(addUser({ user: decodeData, token: data?.data?.accessToken }))
        }
        navigate("/dashboard")
    };

    return (
        <Form layout="vertical" onFinish={onFinish} size="large" requiredMark={false}>
            <Form.Item
                label="Email Address"
                name="email"
                rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Enter a valid email!' },
                ]}
            >
                <Input
                    prefix={<MailOutlined className="text-slate-400" />}
                    placeholder="Enter your email"
                    className="rounded-lg py-2.5"
                />
            </Form.Item>

            <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please enter your password' }]}
            >
                <Input.Password
                    prefix={<LockOutlined className="text-slate-400" />}
                    placeholder="Enter your password"
                    className="rounded-lg py-2.5"
                />
            </Form.Item>

            <div className="flex items-center justify-between mb-6">
                <Checkbox className="text-slate-600">Remember me</Checkbox>
                <span className="text-gold-600 text-sm font-semibold cursor-pointer hover:text-gold-700">
                    Forgot password?
                </span>
            </div>

            <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="w-full h-12 font-semibold rounded-lg"
            >
                {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <Divider className="text-slate-400 text-xs">OR</Divider>

            <p className="text-center text-slate-500 m-0">
                Don't have an account?{" "}
                <Link to="/register" className="text-gold-600 font-semibold hover:text-gold-700">
                    Create one
                </Link>
            </p>
        </Form>
    );
}