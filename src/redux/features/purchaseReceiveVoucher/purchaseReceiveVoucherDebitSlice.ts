/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type TReceiveVoucherDebitItem = {
    key: number;
    itemType?: "PRODUCT" | "RAW_MATERIAL";
    productId?: number | null;
    productName?: string;
    rawMaterialId?: number | null;
    rawMaterialName?: string;
    qty: number;
    unitPrice: number;
    amount: number;
    narration: string;
    accountsItemId?: number;
    accountsItemName?: string;
    bankAccountId?: number;
    integratedUnitPrice?: number;
};

type TReceiveVoucherDebitState = {
    debitItems: TReceiveVoucherDebitItem[];
};

const initialState: TReceiveVoucherDebitState = {
    debitItems: [],
};

const getItemType = (item: TReceiveVoucherDebitItem): "PRODUCT" | "RAW_MATERIAL" | undefined => {
    if (item.itemType) return item.itemType;
    if (item.productId != null && !item.rawMaterialId) return "PRODUCT";
    if (item.rawMaterialId != null && !item.productId) return "RAW_MATERIAL";
    return undefined;
};

const receiveVoucherDebitSlice = createSlice({
    name: "receiveVoucherDebit",
    initialState,
    reducers: {
        addReceiveVoucherDebitItem: (state, action: PayloadAction<TReceiveVoucherDebitItem>) => {
            const item = { ...action.payload };
            if (!item.itemType) {
                item.itemType = getItemType(item);
            }
            state.debitItems.push(item);
        },
        setReceiveVoucherDebitItems: (
            state,
            action: PayloadAction<
                | TReceiveVoucherDebitItem[]
                | { items: TReceiveVoucherDebitItem[]; itemType?: "PRODUCT" | "RAW_MATERIAL" }
            >
        ) => {
            let newItems: TReceiveVoucherDebitItem[] = [];
            let targetType: "PRODUCT" | "RAW_MATERIAL" | undefined;

            if (Array.isArray(action.payload)) {
                newItems = action.payload;
                if (newItems.length > 0) {
                    targetType = getItemType(newItems[0]);
                }
            } else {
                newItems = action.payload.items;
                targetType = action.payload.itemType;
            }

            newItems = newItems.map((item) => ({
                ...item,
                itemType: item.itemType || targetType || getItemType(item),
            }));

            if (targetType) {
                const remainingItems = state.debitItems.filter((item) => {
                    const currentItemType = getItemType(item);
                    return currentItemType !== targetType;
                });
                state.debitItems = [...remainingItems, ...newItems];
            } else {
                state.debitItems = newItems;
            }
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
        updateAllIntegratedUnitPrice: (
            state,
            action: PayloadAction<number | { expenseTotal: number; itemType?: "PRODUCT" | "RAW_MATERIAL" }>
        ) => {
            let expenseTotal = 0;
            let targetType: "PRODUCT" | "RAW_MATERIAL" | undefined;

            if (typeof action.payload === "number") {
                expenseTotal = Number(action.payload) || 0;
            } else if (action.payload) {
                expenseTotal = Number(action.payload.expenseTotal) || 0;
                targetType = action.payload.itemType;
            }

            const targetItems = targetType
                ? state.debitItems.filter((item) => getItemType(item) === targetType)
                : state.debitItems;

            const totalQty = targetItems.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
            const expPerUnit = totalQty > 0 ? expenseTotal / totalQty : 0;
            targetItems.forEach((item) => {
                item.integratedUnitPrice = Number((Number(item.unitPrice) + expPerUnit).toFixed(2));
            });
        },
        clearReceiveVoucherDebitItems: {
            reducer: (state, action: PayloadAction<"PRODUCT" | "RAW_MATERIAL" | undefined>) => {
                const itemType = action.payload;
                if (itemType) {
                    state.debitItems = state.debitItems.filter((item) => getItemType(item) !== itemType);
                } else {
                    state.debitItems = [];
                }
            },
            prepare: (itemType?: "PRODUCT" | "RAW_MATERIAL") => ({
                payload: itemType,
            }),
        },
    },
});

export const {
    addReceiveVoucherDebitItem,
    setReceiveVoucherDebitItems,
    removeReceiveVoucherDebitItem,
    updateReceiveVoucherDebitItem,
    updateReceiveVoucherDebitUnitPrice,
    updateAllIntegratedUnitPrice,
    clearReceiveVoucherDebitItems,
} = receiveVoucherDebitSlice.actions;

export default receiveVoucherDebitSlice.reducer;
