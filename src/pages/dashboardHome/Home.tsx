import { Table, Tag, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    FaArrowTrendUp,
    FaArrowTrendDown,
    FaMoneyBillTrendUp,
    FaBagShopping,
    FaUsers,
    FaBoxesStacked,
    FaTruckFast,
    FaClockRotateLeft,
    FaCircleCheck,
    FaArrowRight
} from 'react-icons/fa6';
import { FaFileInvoiceDollar, FaBoxOpen, FaCartFlatbed } from 'react-icons/fa6';
import dayjs from 'dayjs';
import { useAppSelector } from '../../redux/hooks';

interface TRecentOrder {
    key: string;
    voucherNo: string;
    date: string;
    party: string;
    type: string;
    amount: number;
}

interface TKpi {
    title: string;
    value: string;
    change: number;
    trend: 'up' | 'down';
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
}

const recentOrders: TRecentOrder[] = [
    { key: '1', voucherNo: 'PV-2026-0012', date: '18 Aug 2026', party: 'Dhaka Timber Traders', type: 'PAYMENT', amount: 45000 },
    { key: '2', voucherNo: 'RV-2026-0008', date: '18 Aug 2026', party: 'Agrabad Hardware', type: 'RECEIVE', amount: 120000 },
    { key: '3', voucherNo: 'SV-2026-0034', date: '17 Aug 2026', party: 'Chattogram Ply Works', type: 'SALES', amount: 275000 },
    { key: '4', voucherNo: 'PV-2026-0011', date: '17 Aug 2026', party: 'Sundarban Saw Mills', type: 'PURCHASE', amount: 96000 },
    { key: '5', voucherNo: 'RV-2026-0007', date: '16 Aug 2026', party: 'Narayanganj Furniture', type: 'RECEIVE', amount: 64000 },
];

const kpis: TKpi[] = [
    {
        title: 'Total Revenue',
        value: '৳ 4,85,200',
        change: 12.5,
        trend: 'up',
        icon: <FaMoneyBillTrendUp />,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
    },
    {
        title: 'Total Sales',
        value: '৳ 3,12,400',
        change: 8.2,
        trend: 'up',
        icon: <FaBagShopping />,
        iconBg: 'bg-gold-50',
        iconColor: 'text-gold-600',
    },
    {
        title: 'Total Orders',
        value: '1,248',
        change: 3.1,
        trend: 'up',
        icon: <FaBoxesStacked />,
        iconBg: 'bg-brand-50',
        iconColor: 'text-brand-600',
    },
    {
        title: 'Total Customers',
        value: '850',
        change: 1.8,
        trend: 'down',
        icon: <FaUsers />,
        iconBg: 'bg-sky-50',
        iconColor: 'text-sky-600',
    },
];

const stockItems = [
    { name: 'Ply Board 6mm', pct: 72, qty: 420 },
    { name: 'Particle Board 18mm', pct: 55, qty: 285 },
    { name: 'Raw Timber Logs', pct: 88, qty: 760 },
    { name: 'PVC Edge Banding', pct: 34, qty: 142 },
];

const pendingTasks = [
    { title: 'Payment Voucher Approval', sub: '3 vouchers awaiting', icon: <FaClockRotateLeft />, color: 'text-amber-500' },
    { title: 'Purchase Receive Pending', sub: '2 purchase orders', icon: <FaCartFlatbed />, color: 'text-brand-500' },
    { title: 'Inventory Reorder Alert', sub: '4 items below min stock', icon: <FaBoxOpen />, color: 'text-rose-500' },
    { title: 'Completed Deliveries', sub: '12 this week', icon: <FaCircleCheck />, color: 'text-emerald-500' },
];

const getTagColor = (type: string): string => {
    switch (type) {
        case 'SALES': return 'green';
        case 'PURCHASE': return 'blue';
        case 'RECEIVE': return 'cyan';
        case 'PAYMENT': return 'red';
        default: return 'default';
    }
};

const columns: ColumnsType<TRecentOrder> = [
    {
        title: 'Voucher No',
        dataIndex: 'voucherNo',
        key: 'voucherNo',
        render: (text: string) => <span className="font-semibold text-brand-700">{text}</span>,
    },
    {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
    },
    {
        title: 'Party',
        dataIndex: 'party',
        key: 'party',
        render: (text: string) => <span className="text-slate-700">{text}</span>,
    },
    {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (type: string) => <Tag color={getTagColor(type)} className="font-medium">{type}</Tag>,
    },
    {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        align: 'right',
        render: (amount: number) => <span className="font-bold">৳ {amount.toLocaleString()}</span>,
    },
];

const Home = () => {
    const user = useAppSelector(state => state.auth.user);
    const hour = dayjs().hour();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    const today = dayjs().format('dddd, DD MMMM YYYY');

    return (
        <div className="space-y-6">
            {/* Greeting header */}
            <div className="bg-white rounded-lg px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800 m-0">
                        {greeting}, <span className="text-gold-600">{user?.name || 'there'}</span> 👋
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 mb-0">{today}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-2 rounded-lg text-sm font-semibold">
                        <FaFileInvoiceDollar />
                        Voucher No: <span className="text-gold-700">VC-2026-0048</span>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {kpis.map((kpi, index) => (
                    <div key={index} className="bg-white rounded-lg p-5 shadow-sm border border-surface-200/60 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${kpi.iconBg} ${kpi.iconColor}`}>
                                {kpi.icon}
                            </div>
                            <span className={`flex items-center gap-1 text-xs font-semibold ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {kpi.trend === 'up' ? <FaArrowTrendUp /> : <FaArrowTrendDown />}
                                {kpi.change}%
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800 mt-4 mb-1">{kpi.value}</p>
                        <p className="text-sm text-slate-500 m-0">{kpi.title}</p>
                    </div>
                ))}
            </div>

            {/* Bottom section: recent transactions + side panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Recent transactions */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-surface-200/60 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-surface-100">
                        <h3 className="font-bold text-slate-800 m-0">Recent Transactions</h3>
                        <button className="flex items-center gap-1 text-sm font-semibold text-gold-600 hover:text-gold-700 cursor-pointer bg-transparent border-0">
                            View All <FaArrowRight size={12} />
                        </button>
                    </div>
                    <Table
                        dataSource={recentOrders}
                        columns={columns}
                        pagination={false}
                        size="middle"
                        scroll={{ x: 640 }}
                    />
                </div>

                {/* Right column */}
                <div className="space-y-4">
                    {/* Stock overview */}
                    <div className="bg-white rounded-lg shadow-sm border border-surface-200/60 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800 m-0">Stock Overview</h3>
                            <FaTruckFast className="text-gold-600 text-xl" />
                        </div>
                        <div className="space-y-4">
                            {stockItems.map((item, index) => (
                                <div key={index}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-700">{item.name}</span>
                                        <span className="text-slate-400">{item.qty} pcs</span>
                                    </div>
                                    <Progress
                                        percent={item.pct}
                                        showInfo={false}
                                        strokeColor="#C58D2F"
                                        trailColor="#f5f3f0"
                                        size="small"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pending tasks */}
                    <div className="bg-white rounded-lg shadow-sm border border-surface-200/60 p-5">
                        <h3 className="font-bold text-slate-800 mb-4">Attention Needed</h3>
                        <div className="space-y-3">
                            {pendingTasks.map((task, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-surface-50">
                                    <div className={`text-xl ${task.color}`}>{task.icon}</div>
                                    <div>
                                        <p className="font-semibold text-slate-700 text-sm m-0">{task.title}</p>
                                        <p className="text-xs text-slate-400 m-0">{task.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;