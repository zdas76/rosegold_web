/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type TSalesDebitItem = {
    key: number;
    rawOrProductId: number | null;
    quantity: number;
    unitPrice: number;
    discountRate?: number;
    discount?: number;
    creditAmount: number;
    existingQuantity?: number;
    narration: string;
};

type TSalesDebitState = {
    items: TSalesDebitItem[];
};

const initialState: TSalesDebitState = {
    items: [],
};

const salesDebitSlice = createSlice({
    name: "salesDebit",
    initialState,
    reducers: {
        addSalesDebitItem: (state, action: PayloadAction<TSalesDebitItem>) => {
            state.items.push(action.payload);
        },
        removeSalesDebitItem: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter((item) => item.key !== action.payload);
        },
        updateSalesDebitItem: (state, action: PayloadAction<{ key: number; field: string; value: any }>) => {
            const { key, field, value } = action.payload;
            const item = state.items.find((item) => item.key === key);
            if (item) {
                (item as any)[field] = value;
                if (field === "quantity" || field === "unitPrice") {
                    const quantity = field === "quantity" ? value : item.quantity;
                    const unitPrice = field === "unitPrice" ? value : item.unitPrice;
                    const discountRate = item.discountRate || 0;
                    const discount = Number((((quantity * unitPrice) * discountRate) / 100).toFixed(2)) || 0;
                    item.discount = discount;
                    item.creditAmount = (quantity * unitPrice) - discount;
                }
            }
        },
        clearSalesDebitItems: (state) => {
            state.items = [];
        },
    },
});

export const {
    addSalesDebitItem,
    removeSalesDebitItem,
    updateSalesDebitItem,
    clearSalesDebitItems,
} = salesDebitSlice.actions;

export default salesDebitSlice.reducer;
