/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type TAccountsReceiveVoucherDebitItem = {
    key: number;
    accountsItemId: number | null;
    accountsItemName: string;
    bankAccountId?: number | null;
    amount: number;
    narration?: string;
    productId?: number | null;
    productName?: string;
    rawMaterialId?: number | null;
    rawMaterialName?: string;
    qty?: number;
    unitPrice?: number;
};

export type TAccountsReceiveVoucherCreditItem = {
    key: number;
    accountsItemId: number | null;
    accountsItemName: string;
    bankAccountId?: number | null;
    amount: number;
    narration?: string;
    checkOrRTGS?: string | number | null;
};

// Aliases for compatibility
export type TReceiveVoucherDebitItem = TAccountsReceiveVoucherDebitItem;
export type TReceiveVoucherCreditItem = TAccountsReceiveVoucherCreditItem;

export type TAccountsReceiveVoucherState = {
    debitItems: TAccountsReceiveVoucherDebitItem[];
    creditItems: TAccountsReceiveVoucherCreditItem[];
};

const initialState: TAccountsReceiveVoucherState = {
    debitItems: [],
    creditItems: [],
};

const accountsReceiveVoucher = createSlice({
    name: "accountsReceiveVoucher",
    initialState,
    reducers: {
        // --- Debit Actions ---
        addReceiveVoucherDebitItem: (state, action: PayloadAction<TAccountsReceiveVoucherDebitItem>) => {
            state.debitItems.push(action.payload);
        },
        setReceiveVoucherDebitItems: (state, action: PayloadAction<TAccountsReceiveVoucherDebitItem[]>) => {
            state.debitItems = action.payload;
        },
        removeReceiveVoucherDebitItem: (state, action: PayloadAction<number>) => {
            state.debitItems = state.debitItems.filter((item) => item.key !== action.payload);
        },
        updateReceiveVoucherDebitItem: (state, action: PayloadAction<{ key: number; field: string; value: any }>) => {
            const { key, field, value } = action.payload;
            const item = state.debitItems.find((item) => item.key === key);
            if (item) {
                (item as any)[field] = value;
                if (field === "unitPrice") {
                    item.amount = Number(((Number(item.qty) || 0) * (Number(value) || 0)).toFixed(2));
                }
            }
        },
        updateReceiveVoucherDebitUnitPrice: (state, action: PayloadAction<{ key: number; unitPrice: number }>) => {
            const { key, unitPrice } = action.payload;
            const item = state.debitItems.find((item) => item.key === key);
            if (item) {
                item.unitPrice = unitPrice;
                item.amount = Number(((Number(item.qty) || 0) * unitPrice).toFixed(2));
            }
        },
        clearReceiveVoucherDebitItems: (state) => {
            state.debitItems = [];
        },

        // --- Credit Actions ---
        addReceiveVoucherCreditItem: (state, action: PayloadAction<TAccountsReceiveVoucherCreditItem>) => {
            state.creditItems.push(action.payload);
        },
        setReceiveVoucherCreditItems: (state, action: PayloadAction<TAccountsReceiveVoucherCreditItem[]>) => {
            state.creditItems = action.payload;
        },
        removeReceiveVoucherCreditItem: (state, action: PayloadAction<number>) => {
            state.creditItems = state.creditItems.filter((item) => item.key !== action.payload);
        },
        updateReceiveVoucherCreditItem: (state, action: PayloadAction<{ key: number; field: string; value: any }>) => {
            const { key, field, value } = action.payload;
            const item = state.creditItems.find((item) => item.key === key);
            if (item) {
                (item as any)[field] = value;
            }
        },
        clearReceiveVoucherCreditItems: (state) => {
            state.creditItems = [];
        },

        // --- Clear Both Debit & Credit ---
        clearAllReceiveVoucherItems: (state) => {
            state.debitItems = [];
            state.creditItems = [];
        },
    },
});

export const {
    addReceiveVoucherDebitItem,
    setReceiveVoucherDebitItems,
    removeReceiveVoucherDebitItem,
    updateReceiveVoucherDebitItem,
    updateReceiveVoucherDebitUnitPrice,
    clearReceiveVoucherDebitItems,
    addReceiveVoucherCreditItem,
    setReceiveVoucherCreditItems,
    removeReceiveVoucherCreditItem,
    updateReceiveVoucherCreditItem,
    clearReceiveVoucherCreditItems,
    clearAllReceiveVoucherItems,
} = accountsReceiveVoucher.actions;

export default accountsReceiveVoucher.reducer;
