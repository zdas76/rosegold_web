import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RawMaterialItem {
  rawId: string;
  unitId: string;
  quantity: number;
  uniterate: number;
}

export interface ProductionExpenseItem {
  expenseId: string;
  qty_duration: number;
  expRate: number;
}

export interface PackingMaterialItem {
  packingMaterialId: string;
  unitePrice: number;
  qty: number;
}

export interface ProductionState {
  productId: string;
  date: string;
  rawMaterials: RawMaterialItem[];
  productionExpenses: ProductionExpenseItem[];
  packingMaterials: PackingMaterialItem[];
  numberOfProductProduced: number;
}

const initialState: ProductionState = {
  productId: '',
  date: '',
  rawMaterials: [],
  productionExpenses: [],
  packingMaterials: [],
  numberOfProductProduced: 0,
};

const productionSlice = createSlice({
  name: 'production',
  initialState,
  reducers: {
    setProductionStep1: (
      state,
      action: PayloadAction<{ productId: string; date: string; rawMaterials: RawMaterialItem[] }>
    ) => {
      state.productId = action.payload.productId;
      state.date = action.payload.date;
      state.rawMaterials = action.payload.rawMaterials;
    },
    setProductionExpenses: (state, action: PayloadAction<ProductionExpenseItem[]>) => {
      state.productionExpenses = action.payload;
    },
    setPackingMaterials: (state, action: PayloadAction<PackingMaterialItem[]>) => {
      state.packingMaterials = action.payload;
    },
    setNumberOfProductProduced: (state, action: PayloadAction<number>) => {
      state.numberOfProductProduced = action.payload;
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
  setProductionExpenses,
  setPackingMaterials,
  setNumberOfProductProduced,
  setProductionState,
  resetProductionState,
} = productionSlice.actions;

export default productionSlice.reducer;
