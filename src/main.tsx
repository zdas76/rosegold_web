import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import MainLayout from './layout/MainLayout'
import Welcome from './pages/Welcome'
import Register from './pages/loginRegister/Register'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import { Toaster } from 'sonner'
import { sideBarRoutes } from './layout/sideBarItems'
import { TrouteItems } from './types/types'
import ProtectedRoute from './layout/ProtectedRoute'
import Home from './pages/dashboardHome/Home'
import VoucherDetails from './pages/voucherList/VoucherDetails'
import LogVoucherPrint from './pages/logManagement/logOrder/LogOrderVoucher'
import RawMaterialsDetails from './pages/inventory/rowMaterial/RawMaterialsDetails'
import ProductStockReportDetails from './pages/production/createProduction/ProductStockReportDetails'
import CallanVoucher from './pages/sales/challan/CallanVoucher'
import Party from './pages/sales/party/Party'
import PurchaseOrderDetails from './pages/purchase/purchaseOrder/PurchaseOrderDetails'
import ProductionCreationForm from './pages/store RMPM/production/ProductionCreationForm'
import ProductionVoucher from './pages/store RMPM/production/ProductionVoucher'
import ProductionStep2Page from './pages/store RMPM/production/ProductionStep2Page'
import { ConfigProvider } from 'antd'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#C58D2F',
          colorLink: '#C58D2F',
          colorLinkHover: '#d49e3f',
          colorSuccess: '#16a34a',
          colorError: '#dc2626',
          colorWarning: '#d97706',
          colorBorder: '#e2e8f0',
          colorBorderSecondary: '#f1f5f9',
          borderRadius: 6,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        components: {
          Input: {
            colorBorder: '#e2e8f0',
            hoverBorderColor: '#cbd5e1',
            activeBorderColor: '#C58D2F',
          },
          InputNumber: {
            colorBorder: '#e2e8f0',
            hoverBorderColor: '#cbd5e1',
            activeBorderColor: '#C58D2F',
          },
          Select: {
            colorBorder: '#e2e8f0',
            hoverBorderColor: '#cbd5e1',
            activeBorderColor: '#C58D2F',
          },
          DatePicker: {
            colorBorder: '#e2e8f0',
            hoverBorderColor: '#cbd5e1',
            activeBorderColor: '#C58D2F',
          },
          Menu: {
            darkItemBg: '#2d1849',
            darkSubMenuItemBg: '#1f1035',
            darkItemSelectedBg: '#C58D2F',
            darkItemHoverBg: 'rgba(197, 141, 47, 0.3)',
          },
          Table: {
            headerBg: '#f9edcf',
            headerColor: '#5c3b20',
            headerBorderRadius: 6,
          },
          Button: {
            primaryShadow: '0 2px 4px rgba(197, 141, 47, 0.3)',
          },
        },
      }}
    >
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Welcome />} />
            <Route path='/login' element={<Welcome />} />
            <Route path='/register' element={<Register />} />
            <Route path='/dashboard' element={<ProtectedRoute allowedRoles={["EMPLOYEE", "ADMIN"]}><MainLayout /></ProtectedRoute>}>
              <Route index={true} element={<Home />} />
              {
                (() => {
                  const generateRoutes = (routes: TrouteItems[]): React.ReactNode[] => {
                    return routes.flatMap((route) => {
                      const routesList: React.ReactNode[] = [];
                      if (route?.path && route?.element) {
                        routesList.push(<Route key={route.key} path={route.path} element={route.element} />);
                      }
                      if (route?.children) {
                        routesList.push(...generateRoutes(route.children));
                      }
                      return routesList;
                    });
                  };
                  return generateRoutes(sideBarRoutes as TrouteItems[]);
                })()
              }
              <Route path="/dashboard/party" element={<Party />} />
              <Route path="/dashboard/log-order/logorder-voucher" element={<LogVoucherPrint />} />
              <Route path="/dashboard/row-material/:id" element={<RawMaterialsDetails />} />
              <Route path="/dashboard/product_stock_report/:productId" element={<ProductStockReportDetails />} />
              <Route path="/dashboard/purchase-order/:id" element={<PurchaseOrderDetails />} />
              <Route path="/dashboard/store_rmpm_production_soap" element={<ProductionCreationForm />} />
              <Route path="/dashboard/store_rmpm_production_detergent" element={<ProductionCreationForm />} />
              <Route path="/dashboard/store_rmpm_production_Kitchenbar" element={<ProductionCreationForm />} />
              <Route path="/dashboard/production-voucher" element={<ProductionVoucher />} />
              <Route path="/dashboard/store_rmpm_production_voucher" element={<ProductionVoucher />} />
              <Route path="/dashboard/production-step-two" element={<ProductionStep2Page />} />
              <Route path="/dashboard/production-step-two/:id" element={<ProductionStep2Page />} />
            </Route>
            <Route path="/dashboard/sales/challan/:voucherNo" element={<CallanVoucher />} />
            <Route path="/dashboard/voucher-details/:voucherNo" element={<VoucherDetails />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" />
      </Provider>
    </ConfigProvider>
  </StrictMode>,
)
