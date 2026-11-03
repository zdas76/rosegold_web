export type TSalesVoucher = {
    id: number;
    voucherNo: string;
    invoiceNo: string | null;
    date: string; // ISO string
    partyId: number | null;
    customerId: number | null;
    voucherType: "SALES";
    createdAt: string;
    updatedAt: string;

    party: null | {
        // if you later include party fields
    };

    customer: null | {
        name: string;
        contactNumber: string;
        address: string;
        status: "ACTIVE" | "INACTIVE";
    };

    bankTransaction: Array<{
        date: string;
        debitAmount: number | null;
        creditAmount: number | null;
        bankAccount: {
            bankName: string;
            branceName: string;
            accountNumber: string;
            status: "ACTIVE" | "INACTIVE";
        };
    }>;

    journal: Array<{
        accountsItemId: number;
        date: string;
        creditAmount: number;
        debitAmount: number;
        narration: string;
        accountsItem: {
            accountsItemName: string;
        };
    }>;

    logOrderItem: any[]; // update when you have structure
    logOrdByCategory: any[]; // update when you have structure

    inventory: Array<{
        id: number;
        productId: number | null;
        rawId: number | null;

        product: null | {
            name: string;
        };

        raWMaterial: null | {
            // if you later include raw material fields
        };

        date: string;
        quantityAdd: number;
        quantityLess: number;
        debitAmount: number;
        creditAmount: number;
    }>;
};

export interface TJournalVoucherReport {
  id: number;
  voucherNo: string;
  invoiceNo: string | null;

  date: string; // ISO string
  partyId: number | null;
  customerId: number | null;

  voucherType: "JOURNAL";

  createdAt: string;
  updatedAt: string;

  party: Party | null;
  customer: null;

  bankTransaction: [];

  journal: JournalEntry[];

  logOrderItem: [];
  inventory: [];
  logOrdByCategory: [];
}

export interface Party {
  name: string;
  contactNo: string;
  address: string;
    partyType: "PARTY" | "CUSTOMER" | "DISTRIBUTOR";
}
export interface JournalEntry {
  accountsItemId: number;
  date: string;

  creditAmount: number;
  debitAmount: number;

  narration: string;

  accountsItem: AccountsItem;
}
export interface AccountsItem {
  accountsItemName: string;
}
