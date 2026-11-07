/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { roundToTwo } from "../unit/roundToTow";

export type TlogOrder = {
    logId: number | undefined;
    radis: number | any;
    height: number | any;
    logGradeId: { id: number } | any;
    quantity: number;
    u_price: number | any;
    amount: number;
};

export type TremoveIndex = {
    idx: number;
};

export type TlogOrderCategory = {
    logId: number;
    quantity: number;
    amount: number;
    unitPriceByCategory: number;
};

type TlogOrderState = {
    logOrderCreditItem: TlogOrder[];
    logOrderByCategory: TlogOrderCategory[];
};

const initialState: TlogOrderState = {
    logOrderCreditItem: [],
    logOrderByCategory: [],
};

const logOrderSlice = createSlice({
    name: "logOrderCreditItem",
    initialState,
    reducers: {
        addLorgOrderItem: (state, action: PayloadAction<TlogOrder>) => {
            const logOrderItem = action.payload;
            // Check if logId exists in the logOrderCreditItem
            state.logOrderCreditItem.push(logOrderItem);
            // Check if logId exists in the logOrderByCategory
            const existingItem = state.logOrderByCategory.find(
                (item) => item.logId === logOrderItem.logId
            );
            // If exists, update category-level quantity and amount
            if (existingItem) {
                existingItem.quantity = roundToTwo(existingItem.quantity + logOrderItem.quantity);
                existingItem.amount = roundToTwo(existingItem.amount + logOrderItem.amount);
                existingItem.unitPriceByCategory = roundToTwo(existingItem.amount / existingItem.quantity);
            } else {
                const logorderItemByCategoryItem: TlogOrderCategory = {
                    logId: logOrderItem.logId as number,
                    quantity: Number(logOrderItem.quantity.toFixed(2)),
                    amount: Number(logOrderItem.amount.toFixed(2)),
                    unitPriceByCategory: Number((logOrderItem?.amount / logOrderItem.quantity).toFixed(2)),
                };
                state.logOrderByCategory.push(logorderItemByCategoryItem);
            }

        },
        removeLogOrderCreditItem: (state, action: PayloadAction<TremoveIndex>) => {
            const indexToRemove = action.payload.idx;
            const itemToRemove = state.logOrderCreditItem[indexToRemove];

            if (!itemToRemove) return; // Invalid index safeguard
            // 1. Remove from logOrderCreditItem
            state.logOrderCreditItem.splice(indexToRemove, 1);
            // 2. Find and update the corresponding logOrderByCategory item
            const categoryItem = state.logOrderByCategory.find(
                (item) => item.logId === itemToRemove.logId
            );

            if (categoryItem) {
                // Subtract the removed item's quantity and amount
                categoryItem.quantity -= roundToTwo(itemToRemove.quantity);
                categoryItem.amount -= roundToTwo(itemToRemove.amount);

                if (categoryItem.quantity <= 0) {
                    // Remove the category item if quantity is zero or less
                    state.logOrderByCategory = state.logOrderByCategory.filter(
                        (item) => item.logId !== itemToRemove.logId
                    );
                } else {
                    // Recalculate the unit price
                    categoryItem.unitPriceByCategory = Number(
                        (categoryItem.amount / categoryItem.quantity).toFixed(2)
                    );
                }
            }
        },
        clearLogOrderitem: (state) => {
            state.logOrderCreditItem = [];
            state.logOrderByCategory = [];
        },
    },
});

export const { addLorgOrderItem, removeLogOrderCreditItem, clearLogOrderitem } = logOrderSlice.actions;

export default logOrderSlice.reducer;
