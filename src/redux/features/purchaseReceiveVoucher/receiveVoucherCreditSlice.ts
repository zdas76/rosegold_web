/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type TReceiveVoucherCreditItem = {
    key: number;
    accountsItemId: number | null;
    accountsItemName: string;
    amount: number;
    bankId?: number | null;
    checkOrRTGS?: string;
    narration: string;
};

type TReceiveVoucherCreditState = {
    creditItems: TReceiveVoucherCreditItem[];
};

const initialState: TReceiveVoucherCreditState = {
    creditItems: [],
};

const receiveVoucherCreditSlice = createSlice({
    name: "receiveVoucherCredit",
    initialState,
    reducers: {
        addReceiveVoucherCreditItem: (state, action: PayloadAction<TReceiveVoucherCreditItem>) => {
            state.creditItems.push(action.payload);
        },
        removeReceiveVoucherCreditItem: (state, action: PayloadAction<number>) => {
            state.creditItems = state.creditItems.filter((item) => item.key !== action.payload);
        },
        updateReceiveVoucherCreditItem: (state, action: PayloadAction<{ key: number; field: string; value: any }>) => {
            const { key, field, value } = action.payload;
            const item = state.creditItems.find((item) => item.key === key);
            if (item) {
                (item as any)[field] = value;
            }
        },
        clearReceiveVoucherCreditItems: (state) => {
            state.creditItems = [];
        },
    },
});

export const {
    addReceiveVoucherCreditItem,
    removeReceiveVoucherCreditItem,
    updateReceiveVoucherCreditItem,
    clearReceiveVoucherCreditItems,
} = receiveVoucherCreditSlice.actions;

export default receiveVoucherCreditSlice.reducer;
