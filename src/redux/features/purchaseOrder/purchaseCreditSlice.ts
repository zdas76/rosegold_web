/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type TPurchaseCreditItem = {
    key: number;
    accountsItemId: number | null;
    accountsItemName: string;
    balance: number;
    amount: number;
    bankId: number | null;
    narration: string;
};

type TPurchaseCreditState = {
    creditItems: TPurchaseCreditItem[];
};

const initialState: TPurchaseCreditState = {
    creditItems: [],
};

const purchaseCreditSlice = createSlice({
    name: "purchaseCredit",
    initialState,
    reducers: {
        addCreditItem: (state, action: PayloadAction<TPurchaseCreditItem>) => {
            state.creditItems.push(action.payload);
        },
        removeCreditItem: (state, action: PayloadAction<number>) => {
            state.creditItems = state.creditItems.filter((item) => item.key !== action.payload);
        },
        updateCreditItem: (state, action: PayloadAction<{ key: number | string; field: string; value: any }>) => {
            const { key, field, value } = action.payload;
            const item = state.creditItems.find((item) => item.key === key);
            if (item) {
                (item as any)[field] = value;
            }
        },
        clearCreditItems: (state) => {
            state.creditItems = [];
        },
    },
});

export const {
    addCreditItem,
    removeCreditItem,
    updateCreditItem,
    clearCreditItems,
} = purchaseCreditSlice.actions;

export default purchaseCreditSlice.reducer;
