/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";


 















const initialState = {
    debitItems: [],
};

const receiveVoucherDebitSlice = createSlice({
    name: "receiveVoucherDebit",
    initialState,
    reducers: {
        addReceiveVoucherDebitItem: (state, action) => {
            state.debitItems.push(action.payload);
        },
        setReceiveVoucherDebitItems: (state, action) => {
            state.debitItems = action.payload;
        },
        removeReceiveVoucherDebitItem: (state, action) => {
            state.debitItems = state.debitItems.filter((item) => item.key !== action.payload);
        },
        updateReceiveVoucherDebitItem: (state, action) => {
            const { key, field, value } = action.payload;
            const item = state.debitItems.find((item) => item.key === key);
            if (item) {
                (item )[field] = value;
            }
        },
        clearReceiveVoucherDebitItems: (state) => {
            state.debitItems = [];
        },
    },
});

export const {
    addReceiveVoucherDebitItem,
    setReceiveVoucherDebitItems,
    removeReceiveVoucherDebitItem,
    updateReceiveVoucherDebitItem,
    clearReceiveVoucherDebitItems,
} = receiveVoucherDebitSlice.actions;

export default receiveVoucherDebitSlice.reducer;
