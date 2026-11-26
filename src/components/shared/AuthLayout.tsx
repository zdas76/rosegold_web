import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaWarehouse, FaFileInvoiceDollar, FaUsersGear } from 'react-icons/fa6';
import logo from '/logo.png';

const features = [
    { icon: <FaChartLine />, title: 'Smart Reporting', desc: 'Real-time financial insights and daily reports' },
    { icon: <FaWarehouse />, title: 'Inventory Control', desc: 'Track raw materials and finished goods' },
    { icon: <FaFileInvoiceDollar />, title: 'Voucher Management', desc: 'Sales, purchase, payment and receipt vouchers' },
    { icon: <FaUsersGear />, title: 'User Management', desc: 'Role-based access for team members' },
];

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
    return (
        <div className="flex min-h-screen bg-surface-50">
            {/* Brand panel */}
            <div className="hidden lg:flex flex-col justify-between w-[46%] bg-gradient-to-br from-brand-900 via-brand-700 to-gold-600 p-12 text-white">
                <div>
                    <img src={logo} alt="Golden Mart" className="w-28 bg-white/10 p-3 rounded-xl" />
                </div>

                <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}>
                    <h1 className="text-3xl xl:text-4xl font-bold leading-tight m-0">
                        Golden Mart Industries
                    </h1>
                    <p className="text-brand-100 text-base xl:text-lg leading-relaxed m-0">
                        Complete business management system for accounts, inventory, sales and production.
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                                <div className="text-gold-400 text-xl mt-0.5">{feature.icon}</div>
                                <div>
                                    <p className="font-semibold text-sm m-0">{feature.title}</p>
                                    <p className="text-xs text-brand-100 mt-0.5 mb-0">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <p className="text-brand-200 text-sm m-0">© {new Date().getFullYear()} Golden Mart Industries. All rights reserved.</p>
            </div>

            {/* Form panel */}
            <div className="flex flex-1 items-center justify-center p-6 md:p-12">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}>
                    <div className="lg:hidden text-center mb-8">
                        <img src={logo} alt="Golden Mart" className="w-24 mx-auto mb-4" />
                    </div>
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 m-0">{title}</h2>
                        <p className="text-slate-500 mt-2 mb-0">{subtitle}</p>
                    </div>
                    {children}
                </motion.div>
            </div>
        </div>
    );
};

export default AuthLayout;