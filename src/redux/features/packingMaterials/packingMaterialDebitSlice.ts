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
    integratedUnitPrice?: number;
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
        updateAllIntegratedUnitPrice: (state, action: PayloadAction<number>) => {
            const expenseTotal = Number(action.payload) || 0;
            const totalQty = state.debitItems.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
            const expPerUnit = totalQty > 0 ? expenseTotal / totalQty : 0;
            state.debitItems.forEach((item) => {
                item.integratedUnitPrice = Number((Number(item.unitPrice) + expPerUnit).toFixed(2));
            });
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
    updateAllIntegratedUnitPrice,
    clearPackingMaterialDebitItems,
} = packingMaterialDebitSlice.actions;

export default packingMaterialDebitSlice.reducer;
