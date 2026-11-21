export interface ProductRequisitionItem {
  key: string;
  si: number;
  productId: number | null;
  productName: string;
  categoryName?: string;
  unit: string;
  availableStock: number | null;
  isLoadingStock?: boolean;
  quantity: number | null;
  remarks?: string;
}

export interface RequisitionRecord {
  id: string;
  requisitionNo: string;
  date: string;
  fromStore: string;
  toStore: string;
  items: ProductRequisitionItem[];
  totalQty: number;
  status: 'PENDING' | 'APPROVED' | 'TRANSFERRED';
  remarks?: string;
  createdAt: string;
}
