/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type TPurchaseOrderRMItem = {
    key: number;
    rawId?: number;
    productId?: number;
    itemName?: string;
    quantity: number;
    unit?: string;
};

type TPurchaseOrderRMState = {
    items: TPurchaseOrderRMItem[];
};

const initialState: TPurchaseOrderRMState = {
    items: [],
};

const purchaseOrderRMSlice = createSlice({
    name: "purchaseOrderRM",
    initialState,
    reducers: {
        addPurchaseOrderRMItem: (state, action: PayloadAction<TPurchaseOrderRMItem>) => {
            state.items.push(action.payload);
        },
        removePurchaseOrderRMItem: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter((item) => item.key !== action.payload);
        },
        updatePurchaseOrderRMItem: (state, action: PayloadAction<{ key: number; field: string; value: any }>) => {
            const { key, field, value } = action.payload;
            const item = state.items.find((item) => item.key === key);
            if (item) {
                (item as any)[field] = value;
            }
        },
        clearPurchaseOrderRMItems: (state) => {
            state.items = [];
        },
    },
});

export const {
    addPurchaseOrderRMItem,
    removePurchaseOrderRMItem,
    updatePurchaseOrderRMItem,
    clearPurchaseOrderRMItems,
} = purchaseOrderRMSlice.actions;

export default purchaseOrderRMSlice.reducer;
