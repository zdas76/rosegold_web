import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TLogCategory } from "../../../types/types";

// Type for Log Voucher
export type TLogVoucher = {
  createdAt: string;
  id: number;
  invoiceNo: string;
  logOrdByCategory: {
    id: number;
    transectionId: number;
    logCategoryId: Number;
    logCategory: TLogCategory;
    date: string;
    unitPrice: number;
    quantityAdd: number;
    debitAmount: number;
  }[];
  logOrderItem: {
    id: number;
    transectionId: number;
    logGradeId: number;
    radis: number;
    height: number;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  paymentType: string | null;
  updatedAt: string;
  voucherNo: string;
  voucherType: string;
};

// Initial State
type LogVoucherState = {
  voucher: TLogVoucher | null;
};

const initialState: LogVoucherState = {
  voucher: null,
};

// Slice
const logOrderVoucherSlice = createSlice({
  name: "logOrderVoucher",
  initialState,
  reducers: {
    setVoucher: (state, action: PayloadAction<TLogVoucher>) => {
      state.voucher = action.payload;
    },
    clearVoucher: (state) => {
      state.voucher = null;
    },
    updateVoucherField: (
      state,
      action: PayloadAction<{ key: keyof TLogVoucher; value: any }>
    ) => {
      if (state.voucher) {
        (state.voucher[action.payload.key] as any) = action.payload.value;
      }
    },
  },
});

// Export Actions
export const { setVoucher, clearVoucher, updateVoucherField } =
  logOrderVoucherSlice.actions;

// Export Reducer
export default logOrderVoucherSlice.reducer;
