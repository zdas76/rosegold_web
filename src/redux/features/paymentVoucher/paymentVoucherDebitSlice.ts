/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type TPaymentVoucherDebitItem = {
    key: number;
    accountsItemId: number | null;
    accountsItemName: string;
    amount: number;
    narration: string;
};

type TPaymentVoucherDebitState = {
    debitItems: TPaymentVoucherDebitItem[];
};

const initialState: TPaymentVoucherDebitState = {
    debitItems: [],
};

const paymentVoucherDebitSlice = createSlice({
    name: "paymentVoucherDebit",
    initialState,
    reducers: {
        addPaymentVoucherDebitItem: (state, action: PayloadAction<TPaymentVoucherDebitItem>) => {
            state.debitItems.push(action.payload);
        },
        removePaymentVoucherDebitItem: (state, action: PayloadAction<number>) => {
            state.debitItems = state.debitItems.filter((item) => item.key !== action.payload);
        },
        updatePaymentVoucherDebitItem: (state, action: PayloadAction<{ key: number; field: string; value: any }>) => {
            const { key, field, value } = action.payload;
            const item = state.debitItems.find((item) => item.key === key);
            if (item) {
                (item as any)[field] = value;
            }
        },
        clearPaymentVoucherDebitItems: (state) => {
            state.debitItems = [];
        },
    },
});

export const {
    addPaymentVoucherDebitItem,
    removePaymentVoucherDebitItem,
    updatePaymentVoucherDebitItem,
    clearPaymentVoucherDebitItems,
} = paymentVoucherDebitSlice.actions;

export default paymentVoucherDebitSlice.reducer;
