/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";


 












const initialState = {
    creditItems: [],
};

const paymentVoucherCreditSlice = createSlice({
    name: "paymentVoucherCredit",
    initialState,
    reducers: {
        addPaymentVoucherCreditItem: (state, action) => {
            state.creditItems.push(action.payload);
        },
        removePaymentVoucherCreditItem: (state, action) => {
            state.creditItems = state.creditItems.filter((item) => item.key !== action.payload);
        },
        updatePaymentVoucherCreditItem: (state, action) => {
            const { key, field, value } = action.payload;
            const item = state.creditItems.find((item) => item.key === key);
            if (item) {
                (item )[field] = value;
            }
        },
        clearPaymentVoucherCreditItems: (state) => {
            state.creditItems = [];
        },
    },
});

export const {
    addPaymentVoucherCreditItem,
    removePaymentVoucherCreditItem,
    updatePaymentVoucherCreditItem,
    clearPaymentVoucherCreditItems,
} = paymentVoucherCreditSlice.actions;

export default paymentVoucherCreditSlice.reducer;
