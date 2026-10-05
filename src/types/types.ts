/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from "react";

export type TrouteItems = {
    path?: string | undefined;
    label: ReactNode;
    key: string;
    element?: ReactNode,
    icon: ReactNode,
    children?: TrouteItems[];
}
export type TEmployee = {
    id: number;
    name: string;
    nid: string;
    workingPlase: string;
    photo: string;
    address: string;
    dob: string;
    email: string;
    mobile: string;
    createdAt?: string;
    updatedAt?: string;
};
export type TWorker = {
    id: number;
    name: string;
    nid: string;
    workingPlase: string;
    photo: string;
    address: string;
    dob: string;
    mobile: string;
    createdAt?: string;
    updatedAt?: string;
};
export type TUser = {
    id: number;
    email: string;
    role: "USER" | "ADMIN"; // Adjust based on possible roles
    needPasswordChange: boolean;
    status: "ACTIVE" | "INACTIVE"; // Adjust based on possible statuses
    admin: null | any; // Define a proper type if admin has a structure
    employee: TEmployee;
    createdAt: string;
    updatedAt: string;
};


export type TrowMaterials = {
    id: number;
    name: string;
    status: "ACTIVE" | "DEACTIVE";
    description: string;
    itemType: string;
    alertQuantity?: number;
}

export type TLogCategory = {
    id: number;
    name: string;
};
export type TCategory = {
    id: number;
    categoryName: string;
};

export type Tsubcategroy = {
    id: number;
    subCategoryName: string;
    categorryId: number; // Note: There's a typo in "categorryId", should be "categoryId"
    category: TCategory;
};

export type TParty = {
    id: number;
    name: string;
    contactNo: string;
    address: string;
    partyType: "VENDOR" | "PARTY" | "SUPPLIER" | "DISTRIBUTOR"; // Adjust based on possible party types
    openingAmount: number;
    openingDate: string;
}
export type TUnit = {
    id: number;
    key?: number;
    label?: string;
    name: string;
    createdAt: string;  // Date string in ISO format
    updatedAt: string;
}

export type TProduct = {
    id: number;
    name: string;
    description: string;
    subCategoryId: number;
    minPrice: number;
    color: string;
    size: string; // If size has fixed values, use: 'Small' | 'Medium' | 'Large'
    alertQuantity?: number;
    isDeleted: boolean;
    status: 'ACTIVE' | 'INACTIVE'; // Assuming only these two statuses exist
    createdAt: string; // ISO date string
    updateAt: string; // ISO date string
};

export type TRawMaterial = {
    id: number;
    name: string;
    description: string;
    isDeleted: boolean;
    status: "ACTIVE" | "INACTIVE"; // Assuming status can be either
    createdAt: string;
    updateAt: string;
};

export type TPiller = {
    id: number;
    headName: string;
    headId: string;
    createdAt: string;
    updatedAt: string;
}
export type TAccountsPiler = {
    id: number;
    pillerName: string;
    pillerId: string;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
};
export type TAccountsItem = {
    id: number;
    accountsPiler?: TAccountsPiler;
    accountsItemName: string;
    accountMainPillerId: string;
    accountsItemId: string;
    createdAt: string;
    updatedAt: string;
}
export type TBankitem = {
    bankName: string;
    key: number;
    bankAccounts: string[];
    label: string;
    value: number
}
export type TItems = {
    key?: number;
    itemType: 'RAW_MATERIAL' | "PRODUCT" | undefined;
    rawOrProductId: number | null;
    quantityAdd: number;
    unitPrice: number | null;
    discount: number;
    debitAmount: number;
    narration?: string;
}
export type TCreaditItem = {
    key?: number;
    selectedAccountitemName: string; // Note: "accoutnItemName" might be a typo, possibly meant to be "accountItemName"
    accountsItemId: number | null;
    balance: number;
    amount: number;
    bankId: number | null;
    narration: string;
}
export type costItem = {
    key?: number | undefined;
    costItemId: number | null;
    amount: number;
    narration: string;
}
export type TPurchaseVaouchar = {
    key?: number | undefined;
    creditItem: TCreaditItem[];
    discountAmount?: number;
    grandTotal?: number;
    invoiceNo: string;
    item: TItems[];
    party: number;
    payment_status?: string;
    data: any;
    subTotal: number
};

export type TVendor = {
    id: number;
    name: string;
    contactNo: string;
    address: string;
    partyType: "VENDOR" | "CUSTOMER" | string; // Adjust enum if other values are possible
    isDeleted: boolean;
    createdAt: string; // or Date if you're parsing it
    updatedAt: string; // or Date if you're parsing it
};

export type TBankForm = {
    bankName: string;
    branchName: string;
    accountNumber: string;
    date: string;
    initalAmount: number;
};
export type TBankAccount = {
    id: number;
    bankName: string;
    branceName: string; // Possible typo: Should this be "branchName"?
    accountNumber: string;
    createdAt: string;
    updatedAt: string;
    bankClosing: {
        id: number;
        bankAccountId: number;
        date: string;
        closingAmount: string;
        createdAt: string;
        updatedAt: string;
    };
};
export interface TGrade {
    id: number;
    categoryId: number;
    gradeName: string;
    minRadius: number;
    maxRadius: number;
    unitPrice: number;
}
export type TLogs = {
    id: number;
    name: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type TlogOrderItems = {
    logId: number | undefined;
    radis: number;
    height: number;
    logGradeId: number;
    quantity: number;
    u_price: number;
    amount: number;
}


export type TLogToRawItem = {
    id: number;
    voucherNo: string;
    date: string; // ISO date string
    createdAt: string;
    updatedAt: string;
    inventory: {
        id: number;
        date: string;
        productId: number | null;
        rawId: number;
        createProductId: number | null;
        logToRawId: number;
        unitPrice: number;
        quantityAdd: number;
        quantityLess: number;
        discount: number;
        isClosing: boolean;
        jurnaStatus: string;
        createdAt: string;
        updatedAt: string;
    }[];
    logOrdByCategory: {
        id: number;
        logOrderId: number | null;
        logToRawId: number;
        logCategoryId: number;
        date: string;
        unitPrice: number;
        quantityAdd: number | null;
        quantityLess: number | null;
        debitAmount: number | null;
        creditAmount: number | null;
        status: string;
        createdAt: string;
        updatedAt: string;
    }[];
};

export type TCustomer = {
    id: number;
    name: string;
    contactNumber: string;
    address: string;
    status: 'ACTIVE' | 'INACTIVE'; // Assuming status can be either
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
};

// ---------------------------------------------- reports types ----------------------------------------------
export type TLedgerReport = {
    id: number;
    accountsItemId: number;
    createProductId: number | null;
    inventoryItemId: number | null;
    logOrderId: number | null;
    transectionId: number | null;
    debitAmount: number;
    creditAmount: number;
    date: string; // ISO Date string
    narration: string;
    type: 'debit' | 'credit' | 'journal' | 'opening' | 'closing' | 'transfer'; // or restrict to only 'debit'/'credit' if needed
    isClosing: boolean;
    createdAt: string; // ISO Date string
    updatedAt: string; // ISO Date string
    transactionInfo?: {
        id: number;
        voucherNo: string;
        invoiceNo: string;
        partyId: number;
        voucherType: "PURCHASE" | "SALE" | "TRANSFER" | "JOURNAL" | "OPENING" | "CLOSING";
    }
}
export type TJournalVoucher = {
    accountsItem: {
        accountsItemName: string;
    };
    accountsItemId: number;
    creditAmount: number;
    customer: TCustomer | null;
    customerId: number | null;
    date: string; // ISO string (e.g. "2025-08-11T00:00:00.000Z")
    debitAmount: number;
    narration: string;
    party: TParty;
    partyId: number;
};
type Product = {
    id: number;
    name: string;
};

export type TInventoryTransaction = {
    creditAmount: number;         // Possibly represents money added (e.g. sale)
    date: string;                 // ISO date string
    debitAmount: number;         // Money subtracted (not used here)
    discount: number;            // Discount applied
    product: Product;            // The product involved in the transaction
    quantityAdd: number;         // Quantity added to inventory
    quantityLess: number;        // Quantity removed from inventory
    raWMaterial: any | null;     // Possibly a reference to raw material (nullable)
    unitPrice: number;           // Price per unit of product
    balance?: number;            // Running balance after this transaction (optional)

};

export type TLogOrderVoucher = {
    creditAmount: number | null;
    debitAmount: number | null;
    date: string; // ISO format
    logCategory: TLogCategory | null; // Assuming TLogCategory is defined elsewhere
    quantityAdd: number | null;
    quantityLess: number | null;
    unitPrice: number;
};


export type TRawMaterialsitem = {
    id: number;
    name: string;
    description: string;
    itemType: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    status: string;
    openingDate: string;
    createdAt: string;
    unit: {
        id: number;
        name: string;
    };
}

export type TStauffUser = {
    name: string;
    email: string;
    password?: string;
    phone: number;
}


export type TProductStockReport = {
  product: {
    id: number;
    name: string;
    description: string;
    size: string;
    amount: number;
    quantity: number;
    unitPrice: number;
    status: "ACTIVE" | "INACTIVE";
    createdAt: string;
    updateAt: string;
  };
  total: {
    _sum: {
      debitAmount: number | null;
      creditAmount: number | null;
      quantityAdd: number | null;
      quantityLess: number | null;
    };
  };
};



export type TRawMaterialStockReport = {
    rawMaterial: {
        id: number;
        name: string;
        description: string;
        unitId: number;
        openingDate: string;
        unitPrice: number;
        amount: number;
        quantity: number;
        itemType: string;
        isDeleted: boolean;
        status: string;
        createdAt: string;
        updateAt: string;
        unit?: {
            id: number;
            name: string;
        };
    };
    total: {
        _sum: {
            debitAmount: number | null;
            creditAmount: number | null;
            quantityAdd: number | null;
            quantityLess: number | null;
        };
    };
};

export type TProductionExpItem = {
    id: number;
    expItemName: string;
    unitRate: number;
    createdAt?: string;
    updatedAt?: string;
};

