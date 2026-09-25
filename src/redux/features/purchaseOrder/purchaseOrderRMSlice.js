/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";


 












const initialState = {
    items: [],
};

const purchaseOrderRMSlice = createSlice({
    name: "purchaseOrderRM",
    initialState,
    reducers: {
        addPurchaseOrderRMItem: (state, action) => {
            state.items.push(action.payload);
        },
        removePurchaseOrderRMItem: (state, action) => {
            state.items = state.items.filter((item) => item.key !== action.payload);
        },
        updatePurchaseOrderRMItem: (state, action) => {
            const { key, field, value } = action.payload;
            const item = state.items.find((item) => item.key === key);
            if (item) {
                (item )[field] = value;
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
