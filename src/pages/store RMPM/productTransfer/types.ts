export enum Department {
  PRODUCTION = 'PRODUCTION',
  RMPM_STORE = 'RMPM_STORE',
  FG_STORE = 'FG_STORE',
}

export const departmentOptions = [
  { value: Department.PRODUCTION, label: 'PRODUCTION' },
  { value: Department.RMPM_STORE, label: 'RMPM_STORE' },
  { value: Department.FG_STORE, label: 'FG_STORE' },
];

export interface ProductRequisitionItem {
  key: string;
  si: number;
  productId: number | null;
  productName: string;
  categoryName?: string;
  unit: string;
  unitId?: number | null;
  availableStock: number | null;
  isLoadingStock?: boolean;
  quantity: number | null;
  remarks?: string;
}

export interface RequisitionRecord {
  id: string;
  requisitionNo: string;
  date: string;
  fromStore: Department | string;
  toStore: Department | string;
  eInvoiceNo?: string;
  items: ProductRequisitionItem[];
  totalQty: number;
  status: 'PENDING' | 'APPROVED' | 'TRANSFERRED';
  remarks?: string;
  createdAt: string;
}
