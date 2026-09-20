/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type TReceiveVoucherDebitItem = {
    key: number;
    productId?: number | null;
    productName?: string;
    rawMaterialId?: number | null;
    rawMaterialName?: string;
    qty: number;
    unitPrice: number;
    amount: number;
    narration: string;
};

type TReceiveVoucherDebitState = {
    debitItems: TReceiveVoucherDebitItem[];
};

const initialState: TReceiveVoucherDebitState = {
    debitItems: [],
};

const receiveVoucherDebitSlice = createSlice({
    name: "receiveVoucherDebit",
    initialState,
    reducers: {
        addReceiveVoucherDebitItem: (state, action: PayloadAction<TReceiveVoucherDebitItem>) => {
            state.debitItems.push(action.payload);
        },
        setReceiveVoucherDebitItems: (state, action: PayloadAction<TReceiveVoucherDebitItem[]>) => {
            state.debitItems = action.payload;
        },
        removeReceiveVoucherDebitItem: (state, action: PayloadAction<number>) => {
            state.debitItems = state.debitItems.filter((item) => item.key !== action.payload);
        },
        updateReceiveVoucherDebitItem: (state, action: PayloadAction<{ key: number; field: string; value: any }>) => {
            const { key, field, value } = action.payload;
            const item = state.debitItems.find((item) => item.key === key);
            if (item) {
                (item as any)[field] = value;
            }
        },
        clearReceiveVoucherDebitItems: (state) => {
            state.debitItems = [];
        },
    },
});

export const {
    addReceiveVoucherDebitItem,
    setReceiveVoucherDebitItems,
    removeReceiveVoucherDebitItem,
    updateReceiveVoucherDebitItem,
    clearReceiveVoucherDebitItems,
} = receiveVoucherDebitSlice.actions;

export default receiveVoucherDebitSlice.reducer;
