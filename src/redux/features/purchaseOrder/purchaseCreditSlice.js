/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";


 













const initialState = {
    creditItems: [],
};

const purchaseCreditSlice = createSlice({
    name: "purchaseCredit",
    initialState,
    reducers: {
        addCreditItem: (state, action) => {
            state.creditItems.push(action.payload);
        },
        removeCreditItem: (state, action) => {
            state.creditItems = state.creditItems.filter((item) => item.key !== action.payload);
        },
        updateCreditItem: (state, action) => {
            const { key, field, value } = action.payload;
            const item = state.creditItems.find((item) => item.key === key);
            if (item) {
                (item )[field] = value;
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
