/* eslint-disable @typescript-eslint/no-explicit-any */
type TPayment = {
    accountsItemId: number;
    bankAccountId?: number;
    creditAmount: number;
    narration?: string;
};

type Texpense = {
    accountsItemId: string;
    debitAmount: number;
    narration?: string;
};

type TLogOrderItem = {
    addQuantity: number;
    debitAmount: number;
    height: number;
    logGradesId: number;
    radis: number;
    u_price: number;
};

export type TCreatLogOrderItems = {
    chalanNo: string;
    creditItem: Texpense[];
    date: any; // You can use `Date` or a date library type like `Dayjs` or `Moment` if you're using one
    debitItem: TPayment[];
    debitTotal: number;
    logOrderItem: TLogOrderItem[];
    supplierId: number;
    voucherNo: string;
};
