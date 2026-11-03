import { DatabaseFilled, DollarCircleFilled, HomeFilled, InsertRowRightOutlined, ProductFilled, ProductOutlined, SettingFilled, TransactionOutlined, UserAddOutlined, } from '@ant-design/icons';
import { MdAccountBalance, MdAccountBox, MdCreate, MdOutlineProductionQuantityLimits, MdPayments, MdRawOn, MdReport, MdRequestPage } from 'react-icons/md';
import { Link } from 'react-router';
import Home from '../pages/dashboardHome/Home';
import Product from '../pages/inventory/product/Product';
import { BiCategory, BiCategoryAlt, BiPackage, BiParty, BiPurchaseTag, BiReceipt, BiStore, BiStoreAlt, BiUnite } from 'react-icons/bi';
import Category from '../pages/masterData/category/Category';
import SubCategory from '../pages/masterData/subCategory/SubCategory';
import Vendors from '../pages/userManagement/vendor/Vendors';
import Employee from '../pages/userManagement/employee/Employee';
import RowMaterial from '../pages/inventory/rowMaterial/RowMaterial';
import Settings from '../pages/Settings/Settings';
import Unit from '../pages/masterData/unit/Unit';
import PurchaseVoucher from '../pages/purchase/purchaseOrder/PurchaseOrderProductList';
import AccountsItem from '../pages/accounts_Item/AccountsItem';
import SalesVoucher from '../pages/transactions/salesVoucher/SalesVoucher';
import BankAccount from '../pages/bank/bank';
import ReceivedVoucher from '../pages/transactions/receivedVoucher/ReceivedVoucher';
import PaymentVoucher from '../pages/transactions/paymentVoucher/PaymentVoucher';
import { LuLogs, LuReceiptText } from 'react-icons/lu';
import { GrAed } from 'react-icons/gr';
import ConvertRowToProduct from '../pages/production/createProduction/ConvertRowToProduct';
import LogToRowMaterials from '../pages/inventory/logTorowMaterial/LogToRowMaterials';
import JournalVoucher from '../pages/transactions/journalAndQantra/JournalVoucher';
import { BsHr, BsJournal } from 'react-icons/bs';
import ContraVoucher from '../pages/transactions/journalAndQantra/ContraVoucher';
import { GoReport } from 'react-icons/go';
import LedgerRepors from '../pages/reports/LedgerRepors';
import PartyReport from '../pages/reports/ParytLedger/PartyLedger';
import VoucherList from '../pages/voucherList/VoucherList';
import { FaBalanceScale, FaGift, FaList, FaMoneyBillWave, FaProductHunt, FaUndoAlt } from 'react-icons/fa';
import Worker from '../pages/userManagement/worker/Worker';
import { ProductStockReport } from '../pages/production/createProduction/ProductStockReport';
import Grade from '../pages/logManagement/grade/Grade';
import LogCategory from '../pages/logManagement/logs/Logs';
import { User } from '../pages/userManagement/user/User';
import LogVoucherList from '../pages/logManagement/logOrder/LogVoucherList';
import Hr from '../pages/HR/Hr';
import LedgerReport from '../pages/reports/LedgerRepors';
import ProductionSales from '../pages/sales/productionSales/ProductionSales';
import Challan from '../pages/sales/challan/Challan';
import DailyReport from '../pages/reports/DailyReport/DailyReport';
import BalanceSheet from '../pages/reports/BalanceSheet/BalanceSheet';
import VendorLedger from '../pages/reports/VendorLedger/VendorLedger';
import EmployeeLedger from '../pages/reports/EmployeeLedger/EmployeeLedger';
import { MaterialStockReport } from '../pages/inventory/rowMaterial/RawStockReport';
import Party from '../pages/sales/party/Party';
import PurchaseReceiveVoucher from '../pages/purchase/purchaseReceivedVoucher/PurchaseReceiveVoucherP';
import PurchaseReceiveVoucherRM from '../pages/purchase/purchaseReceivedVoucher/PurchaseReceiveVoucherRM';
import PurchasePackingMaterial from '../pages/purchase/purchasePackingMaterial/PurchasePackingMaterial';
import Supplier from '../pages/userManagement/supllier/Supplier';
import Packaging from '../pages/store RMPM/packaging/Packaging';
import RequestSendFG from '../pages/store RMPM/request send(FG)/RequestSendFG';
import RequsitionSlip from '../pages/store RMPM/requisitionSlip/RequsitionSlip';
import RequestAccept from '../pages/store FG/requestAccept/RequestAccept';
import SalesVoucherView from '../pages/store FG/salesVoucherView/SalesVoucherView';
import SalesReturn from '../pages/store FG/salesReturn/SalesReturn';
import SRReceivedVoucher from '../pages/SR/receivedVoucher/SRReceivedVoucher';
import SRPaymentVoucher from '../pages/SR/paymentVoucher/SRPaymentVoucher';
import AccountsSalesVoucher from '../pages/accounts/salesVoucher/AccountsSalesVoucher';
import AccountsReceivedVoucher from '../pages/accounts/receivedVoucher/AccountsReceivedVoucher';
import AccountsPaymentVoucher from '../pages/accounts/paymentVoucher/AccountsPaymentVoucher';
import AccountsJournalVoucher from '../pages/accounts/journal/AccountsJournalVoucher';
import AccountsContraVoucher from '../pages/accounts/contraVoucher/AccountsContraVoucher';
import OrderReceived from '../pages/accounts/orderReceived/OrderReceived';
import ExpenseVoucher from '../pages/accounts/expenseVoucher/ExpenseVoucher';
import GiftVoucher from '../pages/accounts/giftVoucher/GiftVoucher';
import ProductionCreationForm from '../pages/store RMPM/production/ProductionCreationForm';
import ProductionVoucher from '../pages/store RMPM/production/ProductionVoucher';
import PurchaseOrderRM from '../pages/purchase/purchaseOrder/PurchaseOrderRMList';
import ProductIngredient from '../pages/inventory/productionIngredient/ProductIngredient';
import PackingMaterial from '../pages/inventory/packingMaterial/PackingMaterial';
import ProductionExpItem from '../pages/inventory/productionExpItem/ProductionExpItem';


export const sideBarRoutes = [
    {
        key: "home",
        path: "home",
        element: <Home />,
        icon: <HomeFilled />,
        label: <Link to="/dashboard">Home</Link>,
    },
    {
        key: 'Inventory',
        icon: <InsertRowRightOutlined />,
        label: "Inventory",
        children: [
            {
                key: 'inventory_stock_report',
                path: "/dashboard/raw_stock_report",
                element: <MaterialStockReport />,
                icon: <GoReport />,
                label: <Link to="/dashboard/raw_stock_report">Material</Link>,
            },
            {
                key: 'inventory_product',
                path: "/dashboard/product_stock_report",
                element: <ProductStockReport />,
                icon: <MdRawOn />,
                label: <Link to="/dashboard/product_stock_report">Product</Link>,
            },
        ]
    },
    {
        key: 'User',
        path: "dashboard/user",
        icon: <UserAddOutlined />,
        label: "User Management",
        children: [
            {
                key: 'user_employee',
                path: "/dashboard/employee",
                element: <Employee />,
                icon: <UserAddOutlined />,
                label: <Link to="/dashboard/employee">Employee</Link>,
            },
            // {
            //     key: 'user_worker',
            //     path: "/dashboard/worker",
            //     element: <Worker />,
            //     icon: <UserAddOutlined />,
            //     label: <Link to="/dashboard/worker">Worker</Link>,
            // },
            {
                key: 'user_user',
                path: "/dashboard/user",
                element: <User />,
                icon: <UserAddOutlined />,
                label: <Link to="/dashboard/user">User</Link>,
            }
        ]
    },
    // {
    //     key: "HR",
    //     icon: <BsHr />,
    //     element: <Hr />,
    //     path: "/dashboard/hr",
    //     label: <Link to={`/dashboard/hr`}>HR</Link>
    // },
    {
        key: 'Purchase_Department',
        icon: <BiPurchaseTag />,
        label: "Purchase Department",
        children: [
            {
                key: "Purchase_order_Product",
                icon: <BsHr />,
                element: <PurchaseVoucher />,
                path: "/dashboard/purchase",
                label: <Link to={`/dashboard/purchase`}>Requisition Product</Link>
            },
            {
                key: "Purchase_order_Raw_Material",
                icon: <BsHr />,
                element: <PurchaseOrderRM />,
                path: "/dashboard/purchase-rm",
                label: <Link to={`/dashboard/purchase-rm`}>Requisition RMPM</Link>
            },
            {
                key: 'purchase_p',
                path: "/dashboard/purchase-receive-voucher",
                element: <PurchaseReceiveVoucher />,
                icon: <BiPurchaseTag />,
                label: <Link to="/dashboard/purchase-receive-voucher">Purchase Receive Voucher (P)</Link>,
            },
            {
                key: 'purchase_rm',
                path: "/dashboard/purchase-receive-voucher-rm",
                element: <PurchaseReceiveVoucherRM />,
                icon: <BiPurchaseTag />,
                label: <Link to="/dashboard/purchase-receive-voucher-rm">Purchase Receive Voucher (RM)</Link>,
            },
            {
                key: 'purchase_packing_material',
                path: "/dashboard/purchase-packing-material",
                element: <PurchasePackingMaterial />,
                icon: <BiPurchaseTag />,
                label: <Link to="/dashboard/purchase-packing-material">Purchase Packing Material</Link>,
            },
            // {
            //     key: 'purchase_vendor',
            //     path: "/dashboard/vendor",
            //     element: <Vendors />,
            //     icon: <UserAddOutlined />,
            //     label: <Link to="/dashboard/vendor">Vendor</Link>,
            // },
            {
                key: 'purchase_supplier',
                path: "/dashboard/supplier",
                element: <Supplier />,
                icon: <UserAddOutlined />,
                label: <Link to="/dashboard/supplier">Supplier</Link>,
            },

        ]
    },
    {
        key: "store_rmpm",
        icon: <BiStore />,
        label: "Store (RMPM)",
        children: [
            {
                key: "store_rmpm_production",
                path: "/dashboard/store_rmpm_production",
                icon: <MdOutlineProductionQuantityLimits />,
                element: <ProductionCreationForm formTitle="Production Creation" />,
                label: <Link to="/dashboard/store_rmpm_production">Production Creation</Link>,
            },
            {
                key: "store_rmpm_production_voucher",
                path: "/dashboard/production-voucher",
                icon: <LuReceiptText />,
                element: <ProductionVoucher />,
                label: <Link to="/dashboard/production-voucher">Production Voucher</Link>,
            },

            // {
            //     key: "store_rmpm_packaging",
            //     path: "/dashboard/store_rmpm_packaging",
            //     icon: <BiPackage />,
            //     element: <Packaging />,
            //     label: <Link to="/dashboard/store_rmpm_packaging">Packaging</Link>,
            // },
            {
                key: "store_rmpm_request_sent_fg",
                path: "/dashboard/store_rmpm_request_sent_fg",
                icon: <MdRequestPage />,
                element: <RequestSendFG />,
                label: <Link to="/dashboard/store_rmpm_request_sent_fg">Request sent(FG)</Link>,
            },
            {
                key: "store_rmpm_requisition_slip",
                path: "/dashboard/store_rmpm_requisition_slip",
                icon: <MdRequestPage />,
                element: <RequsitionSlip />,
                label: <Link to="/dashboard/store_rmpm_requisition_slip">Requisition Slip</Link>,
            },
        ]
    },
    {
        key: "store_fg",
        icon: <BiStoreAlt />,
        label: "Store (FG)",
        children: [
            {
                key: "store_fg_request_accept",
                path: "/dashboard/store_fg_request_accept",
                icon: <MdRequestPage />,
                element: <RequestAccept />,
                label: <Link to="/dashboard/store_fg_request_accept">Request Accept</Link>,
            },
            {
                key: "store_fg_sales_voucher_view",
                path: "/dashboard/store_fg_sales_voucher_view",
                icon: <LuReceiptText />,
                element: <SalesVoucherView />,
                label: <Link to="/dashboard/store_fg_sales_voucher_view">Sales Voucher View</Link>,
            },
            {
                key: "store_fg_sales_return",
                path: "/dashboard/store_fg_sales_return",
                icon: <FaUndoAlt />,
                element: <SalesReturn />,
                label: <Link to="/dashboard/store_fg_sales_return">Sales Return</Link>,
            },
            {
                key: "store_fg_distributor",
                path: "/dashboard/distributor",
                element: <Party />,
                icon: <UserAddOutlined />,
                label: <Link to="/dashboard/distributor">Distributor</Link>,
            },
        ]
    },
    {
        key: "sr",
        icon: <FaUndoAlt />,
        label: "SR",
        children: [
            {
                key: "sr_received_voucher",
                path: "/dashboard/sr_received_voucher",
                icon: <LuReceiptText />,
                element: <SRReceivedVoucher />,
                label: <Link to="/dashboard/sr_received_voucher">Received Voucher</Link>,
            },
            {
                key: "sr_payment_voucher",
                path: "/dashboard/sr_payment_voucher",
                icon: <MdPayments />,
                element: <SRPaymentVoucher />,
                label: <Link to="/dashboard/sr_payment_voucher">Payment Voucher</Link>,
            },
        ]
    },
    {
        key: "accounts",
        icon: <MdAccountBalance />,
        label: "Accounts",
        children: [
            // {
            //     key: "accounts_order_received",
            //     path: "/dashboard/accounts_order_received",
            //     icon: <BiReceipt />,
            //     element: <OrderReceived />,
            //     label: <Link to="/dashboard/accounts_order_received">Order Received</Link>,
            // },
            {
                key: "accounts_sales_voucher",
                path: "/dashboard/accounts_sales_voucher",
                icon: <DollarCircleFilled />,
                element: <AccountsSalesVoucher />,
                label: <Link to="/dashboard/accounts_sales_voucher">Sales Voucher</Link>,
            },
            {
                key: "accounts_received_voucher",
                path: "/dashboard/accounts_received_voucher",
                icon: <LuReceiptText />,
                element: <AccountsReceivedVoucher />,
                label: <Link to="/dashboard/accounts_received_voucher">Received Voucher</Link>,
            },
            {
                key: "accounts_payment_voucher",
                path: "/dashboard/accounts_payment_voucher",
                icon: <MdPayments />,
                element: <AccountsPaymentVoucher />,
                label: <Link to="/dashboard/accounts_payment_voucher">Payment Voucher</Link>,
            },
            // {
            //     key: "accounts_expense_voucher",
            //     path: "/dashboard/accounts_expense_voucher",
            //     icon: <FaMoneyBillWave />,
            //     element: <ExpenseVoucher />,
            //     label: <Link to="/dashboard/accounts_expense_voucher">Expense Voucher</Link>,
            // },
            {
                key: "accounts_gift_voucher",
                path: "/dashboard/accounts_gift_voucher",
                icon: <FaGift />,
                element: <GiftVoucher />,
                label: <Link to="/dashboard/accounts_gift_voucher">Gift Voucher</Link>,
            },
            {
                key: "accounts_journal",
                path: "/dashboard/accounts_journal",
                icon: <BsJournal />,
                element: <AccountsJournalVoucher />,
                label: <Link to="/dashboard/accounts_journal">Journal</Link>,
            },
            {
                key: "accounts_quantra_voucher",
                path: "/dashboard/accounts_quantra_voucher",
                icon: <TransactionOutlined />,
                element: <AccountsContraVoucher />,
                label: <Link to="/dashboard/accounts_quantra_voucher">Quantra Voucher</Link>,
            },
        ]
    },
    // {
    //     key: 'Sales',
    //     icon: <DollarCircleFilled />,
    //     label: "Sales",
    //     children: [
    //         {
    //             key: 'Sales_sales',
    //             path: "/dashboard/sales",
    //             element: <SalesVoucher />,
    //             icon: <DollarCircleFilled />,
    //             label: <Link to="/dashboard/sales">Sales Order</Link>,
    //         },
    //         {
    //             key: 'Sales_Production',
    //             path: "/dashboard/sales/production-sale",
    //             element: <ProductionSales />,
    //             icon: <DollarCircleFilled />,
    //             label: <Link to="/dashboard/sales/production-sale">Production Sale</Link>,
    //         },
    //         {
    //             key: 'Sales_Challan',
    //             path: "/dashboard/sales/challan",
    //             element: <Challan />,
    //             icon: <LuReceiptText />,
    //             label: <Link to="/dashboard/sales/challan">Challan</Link>,
    //         },
    //         {
    //             key: 'Sales_parties',
    //             path: "/dashboard/party",
    //             element: <Party />,
    //             icon: <UserAddOutlined />,
    //             label: <Link to="/dashboard/party">Party</Link>,
    //         },

    //     ]
    // },
    // {
    //     key: "production",
    //     icon: <ProductOutlined />,
    //     label: "Production",
    //     children: [
    //         {
    //             key: "production_Create_Production",
    //             path: "/dashboard/create-production",
    //             icon: <MdCreate />,
    //             element: <ConvertRowToProduct />,
    //             label: <Link to="/dashboard/create-production">Create Production</Link>
    //         },
    //         {
    //             key: "production_Production_Report",
    //             path: "/dashboard/production-report",
    //             icon: <MdReport />,
    //             element: <ProductStockReport />,
    //             label: <Link to="/dashboard/production-report">Production Report</Link>
    //         },
    //     ]
    // },
    // {
    //     key: 'transactions',
    //     path: "home",
    //     element: <Home />,
    //     icon: <TransactionOutlined />,
    //     label: "Transactions",
    //     children: [
    //         {
    //             key: 'transaction_payment',
    //             path: "/dashboard/payment_voucher",
    //             element: <PaymentVoucher />,
    //             icon: <MdPayments />,
    //             label: <Link to="/dashboard/payment_voucher">Payment Vouchers</Link>,
    //         }, {
    //             key: 'transaction_received',
    //             path: "/dashboard/received_voucher",
    //             element: <ReceivedVoucher />,
    //             icon: <BiReceipt />,
    //             label: <Link to="/dashboard/received_voucher">Received Vouchers</Link>,
    //         }, {
    //             key: 'transaction_journal',
    //             path: "/dashboard/journal_voucher",
    //             element: <JournalVoucher />,
    //             icon: <BsJournal />,
    //             label: <Link to="/dashboard/journal_voucher">Journal Vouchers</Link>,
    //         }, {
    //             key: 'transaction_quantra',
    //             path: "/dashboard/contra_voucher",
    //             element: <ContraVoucher />,
    //             icon: <MdOutlineProductionQuantityLimits />,
    //             label: <Link to="/dashboard/contra_voucher">Contra Vouchers</Link>,
    //         },
    //         {
    //             key: 'transaction_voucher_list',
    //             path: "/dashboard/voucher-list",
    //             element: <VoucherList />,
    //             icon: <FaList />,
    //             label: <Link to="/dashboard/voucher-list">Voucher list</Link>,
    //         }
    //     ]
    // },
    {
        // Master Data
        key: "Master_Data",
        icon: <DatabaseFilled />,
        label: "Master Data",
        children: [
            {
                key: "Master_data_Material",
                icon: <MdOutlineProductionQuantityLimits />,
                label: "Material",
                children: [
                    {
                        key: "Master_data_RawMaterial",
                        path: "/dashboard/raw-material",
                        element: <RowMaterial />,
                        icon: <FaProductHunt />,
                        label: <Link to="/dashboard/raw-material">Raw Material</Link>,
                    },
                    {
                        key: "Master_data_Product",
                        path: "/dashboard/raw-product",
                        element: <Product />,
                        icon: <FaProductHunt />,
                        label: <Link to="/dashboard/raw-product">Products</Link>,
                    },

                    {
                        key: "Master_data_ProductionIngredient",
                        path: "/dashboard/product-ingredient",
                        element: <ProductIngredient />,
                        icon: <FaProductHunt />,
                        label: <Link to="/dashboard/product-ingredient">Product Ingredient</Link>,
                    },
                    {
                        key: "Master_data_PackingMaterial",
                        path: "/dashboard/packing-material",
                        element: <PackingMaterial />,
                        icon: <FaProductHunt />,
                        label: <Link to="/dashboard/packing-material">Packing Material</Link>,
                    },
                    {
                        key: "Master_data_ProductionExpItem",
                        path: "/dashboard/production-exp-item",
                        element: <ProductionExpItem />,
                        icon: <FaProductHunt />,
                        label: <Link to="/dashboard/production-exp-item">Production Exp Item</Link>,
                    },
                    // {
                    //     key: "Master_convert_Product",
                    //     path: "/dashboard/log-to-row-material",
                    //     element: <LogToRowMaterials />,
                    //     icon: <FaProductHunt />,
                    //     label: <Link to="/dashboard/log-to-row-material">Convert Product</Link>,
                    // },
                ]
            },
            {
                key: "Master_Data_Category",
                path: "/dashboard/category",
                element: <Category />,
                icon: <BiCategoryAlt />,
                label: <Link to="/dashboard/category">Category</Link>,
            },
            {
                key: "Master_Data_SubCategory",
                path: "/dashboard/sub_category",
                element: <SubCategory />,
                icon: <BiCategoryAlt />,
                label: <Link to="/dashboard/sub_category">Sub Category</Link>,
            },
            {
                key: "Master_Data_Unit",
                path: "/dashboard/unit",
                element: <Unit />,
                icon: <BiCategoryAlt />,
                label: <Link to="/dashboard/unit">Unit</Link>,
            },
            // {
            //     key: "Master_Data_Log",
            //     icon: <BiCategoryAlt />,
            //     label: "Log",
            //     children: [
            //         {
            //             key: "Master_Data_LogCategory",
            //             path: "/dashboard/logs",
            //             element: <LogCategory />,
            //             icon: <BiCategoryAlt />,
            //             label: <Link to="/dashboard/logs">Log Category</Link>,
            //         },
            //         {
            //             key: "Master_Data_LogGrade",
            //             path: "/dashboard/grade",
            //             element: <Grade />,
            //             icon: <BiCategoryAlt />,
            //             label: <Link to="/dashboard/grade">Log Grade</Link>,
            //         },
            //         // Log Voucher List
            //         {
            //             key: "Master_Data_LogVoucherList",
            //             path: "/dashboard/voucher-list",
            //             element: <LogVoucherList />,
            //             icon: <BiCategoryAlt />,
            //             label: <Link to="/dashboard/voucher-list">Log Voucher List</Link>,
            //         },
            //         // Log Ledger
            //         {
            //             key: "Master_Data_LogLedger",
            //             path: "/dashboard/log-ledger",
            //             element: <LedgerReport />,
            //             icon: <BiCategoryAlt />,
            //             label: <Link to="/dashboard/log-ledger">Log Ledger</Link>,
            //         },
            //     ]
            // }
        ]
    },

    {
        key: 'account_item',
        path: '/dashboard/accounts_item',
        element: <AccountsItem />,
        icon: <MdAccountBox />,
        label: <Link to="/dashboard/accounts_item">Accounts Item</Link>,
    },
    {
        key: 'Reports',
        icon: <GoReport />,
        label: "Reports",
        children: [
            {
                key: 'report_ledger',
                path: "/dashboard/ledger_report",
                element: <LedgerRepors />,
                icon: <MdRawOn />,
                label: <Link to="/dashboard/ledger_report">Ledger Report</Link>,
            },
            {
                key: 'report_daily',
                path: "/dashboard/daily_report",
                element: <DailyReport />,
                icon: <GoReport />,
                label: <Link to="/dashboard/daily_report">Daily Report</Link>,
            },
            {
                key: 'report_balance_sheet',
                path: "/dashboard/balance_sheet",
                element: <BalanceSheet />,
                icon: <FaBalanceScale />,
                label: <Link to="/dashboard/balance_sheet">Balance Sheet</Link>,
            },
            {
                key: 'report_party',
                path: "/dashboard/party_ledger",
                element: <PartyReport />,
                icon: <BiParty />,
                label: <Link to="/dashboard/party_ledger">Party Ledger</Link>,
            },
            {
                key: 'report_vendor_ladger',
                path: "/dashboard/vendor_ledger",
                element: <VendorLedger />,
                icon: <GoReport />,
                label: <Link to="/dashboard/vendor_ledger">Vendor Ladger</Link>,
            },
            // {
            //     key: 'report_employee_ladger',
            //     path: "/dashboard/employee_ledger",
            //     element: <EmployeeLedger />,
            //     icon: <GoReport />,
            //     label: <Link to="/dashboard/employee_ledger">Employee Ladger</Link>,
            // }
        ]
    },
    {
        key: 'bank',
        path: '/dashboard/bank',
        element: <BankAccount />,
        icon: <SettingFilled />,
        label: <Link to="/dashboard/bank">Bank</Link>,
    },
    // {
    //     key: 'Settings',
    //     path: '/dashboard/settings',
    //     element: <Settings />,
    //     icon: <SettingFilled />,
    //     label: <Link to="/dashboard/settings">Settings</Link>,
    // },

]
