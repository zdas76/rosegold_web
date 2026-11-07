import React, { useEffect, useState } from 'react';
import {
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
import { Link, Outlet, useNavigate } from 'react-router';
import { sideBarRoutes } from './sideBarItems';
import { FaCircleUser } from 'react-icons/fa6';
import logo from "/logo.png"
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { logOut } from '../redux/features/auth/authSlice';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import '../App.css'
const { Header, Sider, Content } = Layout;
import useOnlineStatus from '../hook/useOnlineStatus';

const MainLayout: React.FC = () => {
    const user = useAppSelector(state => state.auth.user)
    const dispatch = useAppDispatch()
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate()
    const { token: { borderRadiusLG } } = theme.useToken();

    const handleLogout = () => {
        dispatch(logOut())
        Cookies.remove("accessToken")
        toast.success("Logout Successfully")
        navigate("/")
    }
    const isOnline = useOnlineStatus()
    const toastId = "network-status";
    useEffect(() => {
        if (isOnline) {
            toast.dismiss(toastId); // Remove any existing offline toast
            toast.success("You Are Online", { id: toastId });
        } else {
            toast.error("You Are Offline", {
                id: toastId,
                position: "bottom-center",
                duration: 10000,
            });
        }
    }, [isOnline]);

    return (
        <>
            <Layout style={{ height: "100vh" }}>
                <div className='relative'>
                    <Sider trigger={null} collapsible collapsed={collapsed} width={"300px"} className='h-full overflow-y-auto no-scrollbar'>
                        <div className={`demo-logo-vertical border-b text-center font-bold py-1 border-brand-700 ${collapsed ? "hidden" : "block"}`}>
                            <Link to="/dashboard">
                                <img src={logo} alt="Golden Mart" className='w-[90px] mx-auto' />
                            </Link>
                        </div>
                        <Menu
                            theme="dark"
                            mode="inline"
                            defaultSelectedKeys={['1']}
                            // sidebar items
                            items={sideBarRoutes}
                        />
                    </Sider>
                    {/* <div className='py-2 px-4 absolute bottom-0 bg-white w-full'>
                    <h3 className=''>Email: <b>{user?.email}</b></h3>
                </div> */}
                </div>
                <Layout>
                    <Header style={{ padding: 0, background: "#2d1849", }} className='flex items-center'>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                fontSize: '20px',
                                width: 64,
                                height: 64,
                                color: "white"
                            }}
                        />
                        <div className={`flex ${collapsed ? "justify-between" : "justify-end"} w-full items-center`}>
                            <div className={`demo-logo-vertical text-center font-bold ${collapsed ? "block" : "hidden"}`}>
                                <Link to="/dashboard" className='hidden sm:block'>
                                    <img src={logo} alt="Golden Mart" className='w-[100px]' />
                                </Link>
                            </div>
                            <div className='flex justify-center items-center'>
                                <div className='flex bg-brand-50 items-center mr-1 md:mr-5 gap-1 border p-1 rounded-md border-brand-200 cursor-pointer'>
                                    <p className='text-xl md:text-2xl rounded-full'><FaCircleUser /></p>
                                    <b className='text-base hidden sm:block'>{user?.email}</b>
                                </div>
                                <button onClick={handleLogout} className='cursor-pointer hover:bg-gold-100 text-base capitalize flex gap-2 items-center font-bold bg-white py-1 rounded-md px-3 mr-3 border border-surface-200'><LogoutOutlined /><span>Logout</span></button>
                            </div>
                        </div>
                    </Header>
                    <Content
                        className='sm:p-6 h-screen overflow-y-auto'
                        style={{
                            margin: 0,
                            minHeight: 280,
                            background: "#f7f8ffff",
                            borderRadius: borderRadiusLG,
                        }}>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
            {/* {
                isOnline &&
                <div className={`p-4 rounded ${isOnline ? 'bg-green-100' : 'bg-red-100'} fixed bottom-40 left-1/2`}>
                    <p className="text-center font-semibold">
                        {isOnline ? '🟢 You are online' : '🔴 You are offline'}
                    </p>
                </div>
            } */}
        </>
    );
};

export default MainLayout;