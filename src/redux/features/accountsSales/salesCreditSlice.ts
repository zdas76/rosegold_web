/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type TSalesCreditItem = {
    key: number;
    accountsItemId: number | null;
    accountsItemName: string;
    debitAmount: number;
    bankId: number | null;
    narration: string;
};

type TSalesCreditState = {
    creditItems: TSalesCreditItem[];
};

const initialState: TSalesCreditState = {
    creditItems: [],
};

const salesCreditSlice = createSlice({
    name: "salesCredit",
    initialState,
    reducers: {
        addSalesCreditItem: (state, action: PayloadAction<TSalesCreditItem>) => {
            state.creditItems.push(action.payload);
        },
        removeSalesCreditItem: (state, action: PayloadAction<number>) => {
            state.creditItems = state.creditItems.filter((item) => item.key !== action.payload);
        },
        updateSalesCreditItem: (state, action: PayloadAction<{ key: number; field: string; value: any }>) => {
            const { key, field, value } = action.payload;
            const item = state.creditItems.find((item) => item.key === key);
            if (item) {
                (item as any)[field] = value;
            }
        },
        clearSalesCreditItems: (state) => {
            state.creditItems = [];
        },
    },
});

export const {
    addSalesCreditItem,
    removeSalesCreditItem,
    updateSalesCreditItem,
    clearSalesCreditItems,
} = salesCreditSlice.actions;

export default salesCreditSlice.reducer;
