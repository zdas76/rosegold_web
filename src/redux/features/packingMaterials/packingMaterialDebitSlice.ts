/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type TPackingMaterialDebitItem = {
    key: number;
    packingMaterialId: number | null;
    packingMaterialName: string;
    qty: number;
    unitPrice: number;
    amount: number;
    narration: string;
};

type TPackingMaterialDebitState = {
    debitItems: TPackingMaterialDebitItem[];
};

const initialState: TPackingMaterialDebitState = {
    debitItems: [],
};

const packingMaterialDebitSlice = createSlice({
    name: "packingMaterialDebit",
    initialState,
    reducers: {
        addPackingMaterialDebitItem: (state, action: PayloadAction<TPackingMaterialDebitItem>) => {
            state.debitItems.push(action.payload);
        },
        setPackingMaterialDebitItems: (state, action: PayloadAction<TPackingMaterialDebitItem[]>) => {
            state.debitItems = action.payload;
        },
        removePackingMaterialDebitItem: (state, action: PayloadAction<number>) => {
            state.debitItems = state.debitItems.filter((item) => item.key !== action.payload);
        },
        updatePackingMaterialDebitItem: (state, action: PayloadAction<{ key: number; field: string; value: any }>) => {
            const { key, field, value } = action.payload;
            const item = state.debitItems.find((item) => item.key === key);
            if (item) {
                (item as any)[field] = value;
            }
        },
        clearPackingMaterialDebitItems: (state) => {
            state.debitItems = [];
        },
    },
});

export const {
    addPackingMaterialDebitItem,
    setPackingMaterialDebitItems,
    removePackingMaterialDebitItem,
    updatePackingMaterialDebitItem,
    clearPackingMaterialDebitItems,
} = packingMaterialDebitSlice.actions;

export default packingMaterialDebitSlice.reducer;
