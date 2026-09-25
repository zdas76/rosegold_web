/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";


 












const initialState = {
    creditItems: [],
};

const salesCreditSlice = createSlice({
    name: "salesCredit",
    initialState,
    reducers: {
        addSalesCreditItem: (state, action) => {
            state.creditItems.push(action.payload);
        },
        removeSalesCreditItem: (state, action) => {
            state.creditItems = state.creditItems.filter((item) => item.key !== action.payload);
        },
        updateSalesCreditItem: (state, action) => {
            const { key, field, value } = action.payload;
            const item = state.creditItems.find((item) => item.key === key);
            if (item) {
                (item )[field] = value;
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
