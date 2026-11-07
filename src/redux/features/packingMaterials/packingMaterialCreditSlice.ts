/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type TPackingMaterialCreditItem = {
    key: number;
    accountsItemId: number | null;
    accountsItemName: string;
    amount: number;
    bankId?: number | null;
    checkOrRTGS?: string;
    narration: string;
};

type TPackingMaterialCreditState = {
    creditItems: TPackingMaterialCreditItem[];
};

const initialState: TPackingMaterialCreditState = {
    creditItems: [],
};

const packingMaterialCreditSlice = createSlice({
    name: "packingMaterialCredit",
    initialState,
    reducers: {
        addPackingMaterialCreditItem: (state, action: PayloadAction<TPackingMaterialCreditItem>) => {
            state.creditItems.push(action.payload);
        },
        removePackingMaterialCreditItem: (state, action: PayloadAction<number>) => {
            state.creditItems = state.creditItems.filter((item) => item.key !== action.payload);
        },
        updatePackingMaterialCreditItem: (state, action: PayloadAction<{ key: number; field: string; value: any }>) => {
            const { key, field, value } = action.payload;
            const item = state.creditItems.find((item) => item.key === key);
            if (item) {
                (item as any)[field] = value;
            }
        },
        clearPackingMaterialCreditItems: (state) => {
            state.creditItems = [];
        },
    },
});

export const {
    addPackingMaterialCreditItem,
    removePackingMaterialCreditItem,
    updatePackingMaterialCreditItem,
    clearPackingMaterialCreditItems,
} = packingMaterialCreditSlice.actions;

export default packingMaterialCreditSlice.reducer;
