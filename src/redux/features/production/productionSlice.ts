import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProductionState {
  date: string;
  productinfo: {
    productId: number | null;
    quantityAdd?: number | null;
    unitPrice?: number | null;
  };
  rawMaterials?: {
    rawId: number;
    quantity: number;
    unitPrice: number;
  }[];
  productionExpenses?: {
    proExpencesItemId: number;
    unitRate: number;
    expDuration: number;
    amount: number;
  }[];
  packingMaterials?: {
    packingMaterialId: number;
    unitPrice: number;
    qty: number;
    perUnitQty: number;
    perUnitCost: number;
  }[];
  products?: {
    productId: number;
    quantityAdd?: number;
    quantityLess?: number;
    unitPrice: number;
  }[];
}


const initialState: ProductionState = {
  date: '',
  productinfo: {
    productId: null,
    quantityAdd: null,
    unitPrice: null,
  },
  rawMaterials: [],
  productionExpenses: [],
  packingMaterials: [],
  products: [],
};

const productionSlice = createSlice({
  name: 'production',
  initialState,
  reducers: {
    setProductionStep1: (
      state,
      action: PayloadAction<{ productId: number | null; date: string; rawMaterials: NonNullable<ProductionState['rawMaterials']> }>
    ) => {
      state.productinfo.productId = action.payload.productId;
      state.date = action.payload.date;
      state.rawMaterials = action.payload.rawMaterials;
    },
    setProductionStep2: (
      state,
      action: PayloadAction<{
        productionExpenses: NonNullable<ProductionState['productionExpenses']>;
        packingMaterials: NonNullable<ProductionState['packingMaterials']>;
      }>
    ) => {
      state.productionExpenses = action.payload.productionExpenses;
      state.packingMaterials = action.payload.packingMaterials;
    },
    setNumberOfProductProduced: (state, action: PayloadAction<number>) => {
      state.productinfo.quantityAdd = action.payload;
    },
    updatePackingMaterialQty: (
      state,
      action: PayloadAction<{ packingMaterialId: number; Qty: number }>
    ) => {
      const item = state.packingMaterials?.find(
        p => p.packingMaterialId === action.payload.packingMaterialId
      );
      if (item) {
        item.qty = action.payload.Qty;
      }
    },
    setProductionState: (state, action: PayloadAction<Partial<ProductionState>>) => {
      return { ...state, ...action.payload };
    },
    resetProductionState: () => {
      return initialState;
    },
  },
});

export const {
  setProductionStep1,
  setProductionStep2,
  setNumberOfProductProduced,
  updatePackingMaterialQty,
  setProductionState,
  resetProductionState,
} = productionSlice.actions;

export default productionSlice.reducer;
