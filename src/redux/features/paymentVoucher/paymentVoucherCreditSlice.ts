/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type TPaymentVoucherCreditItem = {
    key: number;
    accountsItemId: number | null;
    accountsItemName: string;
    bankAccountId: number | null;
    amount: number;
    narration: string;
    checkOrRTGS?: number | null;
};

type TPaymentVoucherCreditState = {
    creditItems: TPaymentVoucherCreditItem[];
};

const initialState: TPaymentVoucherCreditState = {
    creditItems: [],
};

const paymentVoucherCreditSlice = createSlice({
    name: "paymentVoucherCredit",
    initialState,
    reducers: {
        addPaymentVoucherCreditItem: (state, action: PayloadAction<TPaymentVoucherCreditItem>) => {
            state.creditItems.push(action.payload);
        },
        removePaymentVoucherCreditItem: (state, action: PayloadAction<number>) => {
            state.creditItems = state.creditItems.filter((item) => item.key !== action.payload);
        },
        updatePaymentVoucherCreditItem: (state, action: PayloadAction<{ key: number; field: string; value: any }>) => {
            const { key, field, value } = action.payload;
            const item = state.creditItems.find((item) => item.key === key);
            if (item) {
                (item as any)[field] = value;
            }
        },
        clearPaymentVoucherCreditItems: (state) => {
            state.creditItems = [];
        },
    },
});

export const {
    addPaymentVoucherCreditItem,
    removePaymentVoucherCreditItem,
    updatePaymentVoucherCreditItem,
    clearPaymentVoucherCreditItems,
} = paymentVoucherCreditSlice.actions;

export default paymentVoucherCreditSlice.reducer;
