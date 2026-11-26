import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from './api/baseApi'
import storage from "redux-persist/lib/storage";
import persistReducer from 'redux-persist/es/persistReducer';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import { persistStore } from 'redux-persist';
import logOrderReducer from './features/logAndGrade/logOrderSlice'
import authReducer from './features/auth/authSlice';
import logOrderVoucher from './features/logAndGrade/logOrderVoucherSlice'
import purchaseOrderRMReducer from './features/purchaseOrder/purchaseOrderRMSlice'
import purchaseCreditReducer from './features/purchaseOrder/purchaseCreditSlice'
import receiveVoucherDebitReducer from './features/purchaseReceiveVoucher/purchaseReceiveVoucherDebitSlice'
import receiveVoucherCreditReducer from './features/purchaseReceiveVoucher/receiveVoucherCreditSlice'
import packingMaterialDebitReducer from './features/packingMaterials/packingMaterialDebitSlice'
import packingMaterialCreditReducer from './features/packingMaterials/packingMaterialCreditSlice'
import salesDebitReducer from './features/accountsSales/salesDebitSlice'
import salesCreditReducer from './features/accountsSales/salesCreditSlice'
import paymentVoucherDebitReducer from './features/paymentVoucher/paymentVoucherDebitSlice'
import paymentVoucherCreditReducer from './features/paymentVoucher/paymentVoucherCreditSlice'
import productionReducer from './features/production/productionSlice'
import accountsReceiveVoucherReducer from '../pages/accounts/receivedVoucher/AccountsReceiveVoucher';

const persistConfig = {
    key: "auth",
    storage,
}
const LogOrderConfig = {
    key: "logOrder",
    storage,
}
const persistAuthReducer = persistReducer(persistConfig, authReducer)
const logOrderPersist = persistReducer(LogOrderConfig, logOrderVoucher)
export const store = configureStore({
    reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
        auth: persistAuthReducer,
        logOrder: logOrderReducer,
        logVoucher: logOrderPersist,
        purchaseOrderRM: purchaseOrderRMReducer,
        purchaseCredit: purchaseCreditReducer,
        receiveVoucherDebit: receiveVoucherDebitReducer,
        receiveVoucherCredit: receiveVoucherCreditReducer,
        packingMaterialDebit: packingMaterialDebitReducer,
        packingMaterialCredit: packingMaterialCreditReducer,
        salesDebit: salesDebitReducer,
        salesCredit: salesCreditReducer,
        paymentVoucherDebit: paymentVoucherDebitReducer,
        paymentVoucherCredit: paymentVoucherCreditReducer,
        production: productionReducer,
        accountsReceiveVoucher: accountsReceiveVoucherReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        }
    }).concat(baseApi.middleware)
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export const persistor = persistStore(store)