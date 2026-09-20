/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";


 











const initialState = {
    debitItems: [],
};

const paymentVoucherDebitSlice = createSlice({
    name: "paymentVoucherDebit",
    initialState,
    reducers: {
        addPaymentVoucherDebitItem: (state, action) => {
            state.debitItems.push(action.payload);
        },
        removePaymentVoucherDebitItem: (state, action) => {
            state.debitItems = state.debitItems.filter((item) => item.key !== action.payload);
        },
        updatePaymentVoucherDebitItem: (state, action) => {
            const { key, field, value } = action.payload;
            const item = state.debitItems.find((item) => item.key === key);
            if (item) {
                (item )[field] = value;
            }
        },
        clearPaymentVoucherDebitItems: (state) => {
            state.debitItems = [];
        },
    },
});

export const {
    addPaymentVoucherDebitItem,
    removePaymentVoucherDebitItem,
    updatePaymentVoucherDebitItem,
    clearPaymentVoucherDebitItems,
} = paymentVoucherDebitSlice.actions;

export default paymentVoucherDebitSlice.reducer;
