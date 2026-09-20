 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";

import { roundToTwo } from "../unit/roundToTow";

 

























const initialState = {
    logOrderCreditItem: [],
    logOrderByCategory: [],
};

const logOrderSlice = createSlice({
    name: "logOrderCreditItem",
    initialState,
    reducers: {
        addLorgOrderItem: (state, action) => {
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
                const logorderItemByCategoryItem = {
                    logId: logOrderItem.logId ,
                    quantity: Number(logOrderItem.quantity.toFixed(2)),
                    amount: Number(logOrderItem.amount.toFixed(2)),
                    unitPriceByCategory: Number((_optionalChain([logOrderItem, 'optionalAccess', _ => _.amount]) / logOrderItem.quantity).toFixed(2)),
                };
                state.logOrderByCategory.push(logorderItemByCategoryItem);
            }

        },
        removeLogOrderCreditItem: (state, action) => {
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
