/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";


 












const initialState = {
    creditItems: [],
};

const receiveVoucherCreditSlice = createSlice({
    name: "receiveVoucherCredit",
    initialState,
    reducers: {
        addReceiveVoucherCreditItem: (state, action) => {
            state.creditItems.push(action.payload);
        },
        removeReceiveVoucherCreditItem: (state, action) => {
            state.creditItems = state.creditItems.filter((item) => item.key !== action.payload);
        },
        updateReceiveVoucherCreditItem: (state, action) => {
            const { key, field, value } = action.payload;
            const item = state.creditItems.find((item) => item.key === key);
            if (item) {
                (item )[field] = value;
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
