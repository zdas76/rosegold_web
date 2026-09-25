import { createSlice, } from "@reduxjs/toolkit";


// Type for Log Voucher
 


































const initialState = {
  voucher: null,
};

// Slice
const logOrderVoucherSlice = createSlice({
  name: "logOrderVoucher",
  initialState,
  reducers: {
    setVoucher: (state, action) => {
      state.voucher = action.payload;
    },
    clearVoucher: (state) => {
      state.voucher = null;
    },
    updateVoucherField: (
      state,
      action
    ) => {
      if (state.voucher) {
        (state.voucher[action.payload.key] ) = action.payload.value;
      }
    },
  },
});

// Export Actions
export const { setVoucher, clearVoucher, updateVoucherField } =
  logOrderVoucherSlice.actions;

// Export Reducer
export default logOrderVoucherSlice.reducer;
