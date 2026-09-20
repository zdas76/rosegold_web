/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";


 















const initialState = {
    items: [],
};

const salesDebitSlice = createSlice({
    name: "salesDebit",
    initialState,
    reducers: {
        addSalesDebitItem: (state, action) => {
            state.items.push(action.payload);
        },
        removeSalesDebitItem: (state, action) => {
            state.items = state.items.filter((item) => item.key !== action.payload);
        },
        updateSalesDebitItem: (state, action) => {
            const { key, field, value } = action.payload;
            const item = state.items.find((item) => item.key === key);
            if (item) {
                (item )[field] = value;
                if (field === "quantity" || field === "unitPrice" || field === "discountRate") {
                    const quantity = field === "quantity" ? value : item.quantity;
                    const unitPrice = field === "unitPrice" ? value : item.unitPrice;
                    const discountRate = field === "discountRate" ? value : item.discountRate;
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
