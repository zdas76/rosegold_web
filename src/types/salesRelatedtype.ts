export type TsalesItem = {
    rawOrProductId: number;
    unitPrice: number;
    quantity: number;
    discount: number;
    creditAmount: number;
    existingQuantity?: number;
};

export type TDebititems = {
    accountsItemId: number;
    debitAmount: number;
    narration: string;
}
