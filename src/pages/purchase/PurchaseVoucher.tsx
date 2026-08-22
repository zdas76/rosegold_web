/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
    useState, useMemo,
} from "react";
import { Form, Input, Button, Select, DatePicker, Table, InputNumber } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { generateInvoiceNumber } from "../../utils/generateRandomNumber";
import { useGetRowMaterialsQuery } from "../../redux/features/rowMaterials/rowMaterials.api";
import { useGetProductsQuery } from "../../redux/features/product/product.api";
import { TAccountsItem, TBankAccount, TItems, TParty, TProduct, TRawMaterial } from "../../types/types";
import { useGetPartiesQuery } from "../../redux/features/auth/authApi";
import { toast } from "sonner";
import { useAddPurchaseReceiveMutation } from "../../redux/features/journal/journal.api";
import { useGetAccountItemQuery, useLazyGetTotalQuantityAndUnitPriceQuery } from "../../redux/features/transactions/transactons.api";
import { useGetBankQuery } from "../../redux/features/bank/bank.api";
import { getResponse } from "../../utils/getResponse";
import { useLazyAccountsItemTotalQuery } from "../../redux/features/OthersApi/othersApi";
import PostSubmitModal from "../../components/shared/PostSubmitModal";
import Loading from "../../components/shared/Loading";

interface AccountsItemType extends TAccountsItem {
    key: number;
    value: string;
    label: string
}
const PurchaseVoucher: React.FC = () => {
    const [rawOrProduct, setRawOrProduct] = useState("")
    const [rawOrProductId, setRawOrProductId] = useState<any>()
    const [getBalanceTotal] = useLazyAccountsItemTotalQuery()
    const { data: banks, isLoading: isBanksLoading } = useGetBankQuery({})
    const [getTotalQuantity] = useLazyGetTotalQuantityAndUnitPriceQuery()
    const [isModalOpen, setIsModalOpen] = useState(false);

    const bankData = banks?.data?.map((item: TBankAccount) => {
        return {
            key: item?.id,
            value: item?.id,
            label: `${item?.bankName} - (${item?.accountNumber})`,
            ...item
        }
    });
    const [form] = Form.useForm();
    // const [brand, setBanck] = useState()
    const [addPurchaseJournal, { isLoading: isSubmitting }] = useAddPurchaseReceiveMutation()
    const [voucherNo, setVoucerNo] = useState(generateInvoiceNumber("PRV"));
    const { data: party, isLoading: isPartiesLoading } = useGetPartiesQuery({})
    const { data: rowmaterials, isLoading: isRowMaterialsLoading } = useGetRowMaterialsQuery({})
    const { data: product, isLoading: isProductLoading } = useGetProductsQuery({})
    const { data: accountsItem, isLoading: isAccountItemsLoading } = useGetAccountItemQuery({ accountMainPillerId: ["01", "04"] })

    const [creditItem, setCreditItem] = useState<any[]>([
        { key: Date.now(), accountsItemId: null, balance: 0, amount: 0, bankId: null, narration: "", selectedAccountitemName: "" }
    ]);
    const [items, setItems] = useState<TItems[]>([{ key: Date.now(), itemType: undefined, rawOrProductId: null, discount: 0, quantityAdd: 1.00, unitPrice: null, debitAmount: 0, narration: "" }]);

    /** Use useMemo to optimize total calculation */
    const getCalculationSummery: { grandTotal: number; subTotal: number; } = useMemo(() => {
        const subTotal = items.reduce((acc, item) => (acc + item.quantityAdd * item.unitPrice!) - item?.discount, 0);
        const grandTotal = subTotal;

        return { subTotal, grandTotal }
    }, [items]);

    if (isBanksLoading || isPartiesLoading || isRowMaterialsLoading || isProductLoading || isAccountItemsLoading) {
        return <Loading tip="Loading Purchase Voucher details..." />;
    }

    const accountsItems: AccountsItemType[] = accountsItem?.data?.map((item: TAccountsItem, idx: number) => {
        return {
            ...item,
            key: idx,
            value: item?.id,
            label: item?.accountsItemName
        }
    })

    const partyData = party?.data?.map((item: TParty) => {
        if (item?.partyType === "VENDOR") {
            return {
                key: item?.id,
                label: item?.name, // Fixed typo (lable → label)
                value: item?.id
            };
        }
    }).filter(Boolean);
    const row_materials = rowmaterials?.data?.map((item: TRawMaterial) => {
        return {
            key: item?.id,
            label: item?.name,
            value: item?.id
        }
    })
    const productData = product?.data?.map((item: TProduct) => {
        return {
            key: item?.id,
            label: item?.name,
            value: item?.id
        }
    })
    // Account item related functions
    const addItem = () => {
        setItems([...items, { key: Date.now(), itemType: undefined, discount: 0.00, rawOrProductId: null, quantityAdd: 1.00, unitPrice: null, debitAmount: 0.00, narration: "" }]);
    };

    const removeItem = (key: number | undefined) => {
        setItems(items.filter((item) => item.key !== key));
    };


    const updateItem = async (key: number | undefined, field: string, value: any) => {
        if (field === "rawOrProductId") {
            if (rawOrProduct && rawOrProduct === "PRODUCT") {
                const res = await getTotalQuantity({ itemType: "raw", rawId: rawOrProductId });
                console.log(res);
            } else if (rawOrProduct === "RAW_MATERIAL") {
                const res = await getTotalQuantity({ itemType: "raw", rawId: rawOrProductId });
                console.log(res);
            }
        }

        setItems((prev) =>
            prev.map((item) =>
                item.key === key
                    ? {
                        ...item,
                        [field]: value,
                        debitAmount:
                            field === "quantityAdd" || field === "unitPrice" || field === "discount"
                                ? ((field === "discount"
                                    ? (item.quantityAdd * item.unitPrice!) - value
                                    : (value * (field === "quantityAdd" ? item.unitPrice! : item.quantityAdd)) - item.discount))
                                : item.debitAmount,
                    }
                    : item
            )
        );
    };

    const addCreditItem = () => {
        setCreditItem([...creditItem, { key: Date.now(), accountsItemId: "", balance: 0.00, amount: 0.00, bankId: null, narration: '' }]);
    };

    const removeCreditItem = (key: number) => {
        setCreditItem(creditItem.filter((item) => item.key !== key));
    };
    const updateLedgerItm = async (key: string | number, field: string, value: any, accountsItemName?: any) => {
        // set the balance based on accounts items;
        if (accountsItemName === "Balance") {
            const res = await getBalanceTotal(value)
            const netBalance = res?.data?.data?.netAmount;
            value = netBalance || "not found";
        }
        setCreditItem((prev) =>
            prev.map((item) =>
                item.key === key
                    ? {
                        ...item,
                        [field]: value,
                        ...(field === "accountsItemId" && accountsItemName && { accountsItemName: accountsItemName }),
                    }
                    : item
            )
        );
    };

    const getCreditItemCalculation = () => {
        return creditItem?.reduce((acc, item) => acc + item?.amount, 0);
    }
    // handle submit form data
    const handleSubmit = async (values: any) => {
        if (getCreditItemCalculation() !== getCalculationSummery.subTotal) {
            return toast.error(<span className="font-bold text-red-600">Credit Amount should be same as Debit amount</span>)
        }
        for (const item of creditItem || []) {
            if ((item?.accountsItemId === null && item?.amount < 1) && (!item?.bankId || !item?.balance)) {
                toast.error(<span className="font-bold text-red-600">Please select Ledger Head</span>, {
                    position: "bottom-center",
                    duration: 5000,
                });
                return;
            }
        }
        for (const item of items || []) {
            if (
                item?.rawOrProductId === null || !item?.rawOrProductId &&
                item?.quantityAdd < 1 &&
                item?.unitPrice && item?.unitPrice < 1 &&
                item?.itemType === undefined || !item?.itemType
            ) {
                toast.error(<span className="font-bold text-red-600">Please Full fill all the Items fields</span>, {
                    position: "bottom-center",
                    duration: 5000,
                });
                return;
            }
        }
        const data = { ...values, voucherNo, items, grandTotal: getCalculationSummery.grandTotal, creditItem, subTotal: getCalculationSummery?.subTotal };

        const res = await addPurchaseJournal(data)
        const result = getResponse(res)
        console.log(result, "result");
        if (result?.success) {
            setIsModalOpen(true);
        }
    };

    const handleNewVoucher = () => {
        form.resetFields();
        setCreditItem([{ key: Date.now(), accountsItemId: null, balance: 0, amount: 0, bankId: null, narration: "", selectedAccountitemName: "" }]);
        setItems([{ key: Date.now(), itemType: undefined, rawOrProductId: null, discount: 0, quantityAdd: 1.00, unitPrice: null, debitAmount: 0, narration: "" }]);
        setVoucerNo(generateInvoiceNumber());
        setIsModalOpen(false);
    };

    // console.log(partyData, "partyDatak d")

    return (
        <div className="mx-auto rounded purchaseVoucher">
            <div className="bg-white rounded-lg px-4 py-2 mb-3">
                <h2 className="text-xl font-bold m-0">Purchase</h2>
            </div>
            <Form size="middle" className="" form={form} layout="vertical" onFinish={handleSubmit}>
                {/* Parties & Invoice */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white px-3 py-2 pb-1 rounded-md shadow">
                    <Form.Item name="partyOrcustomerId" label="Select Vendor" rules={[{ required: true, message: "Please select a party" }]}>
                        <Select
                            style={{ width: "100%" }}
                            placeholder="Select Name"
                            options={partyData}
                        />
                        {/* <Select placeholder="Select a party" options={partyData} /> */}
                    </Form.Item>
                    <Form.Item label="Receive Date" name="date" rules={[{ required: true, message: "Select a date" }]}>
                        <DatePicker className="w-full" />
                    </Form.Item>
                    <Form.Item name="invoiceNo" label="Invoice No">
                        <Input placeholder="Invoice Number" />
                    </Form.Item>
                    {/* <Form.Item name="paymentType" label="Payment Status" rules={[{ required: true }]}>
                        <Select placeholder="Select payment status">
                            <Option value="PAID">Paid</Option>
                            <Option value="DUE">Due</Option>
                            <Option value="PARTIAL">Partial</Option>
                        </Select>
                    </Form.Item> */}
                    <Form.Item label="Voucher No">
                        <Input value={voucherNo} disabled style={{ color: "black" }} />
                    </Form.Item>
                </div>
                <div className=" bg-white px-3 py-2 pb-3 rounded-md shadow mt-4">
                    <h3 className="text-lg font-semibold mb-1">Items</h3>
                    {/*-------------------------- Items List--------------------------------------------- */}
                    <Table
                        dataSource={items}
                        className="mb-0 itemsTable"
                        columns={[
                            {
                                title: "Select Type",
                                dataIndex: "itemType",
                                render: (_, record) => (
                                    <Form.Item
                                        style={{ margin: 0, minWidth: "130px" }}>
                                        <Select
                                            onChange={(value) => { updateItem(record?.key, "itemType", value); setRawOrProduct(value) }}
                                            value={record.itemType}
                                            style={{ width: "100%" }}
                                            placeholder="Select type"
                                            options={[{
                                                label: "row_materials",
                                                value: "RAW_MATERIAL",
                                            }, {
                                                label: "product",
                                                value: "PRODUCT",
                                            }]}
                                        />
                                    </Form.Item>
                                ),
                            },
                            {
                                title: "Item Name",
                                dataIndex: "rawOrProductId",
                                render: (_, record) => (
                                    <Form.Item style={{ margin: 0, minWidth: "130px" }}
                                        rules={[{ required: true, message: "Required" }]}>
                                        <Select
                                            disabled={!record.itemType}
                                            onChange={(value) => { updateItem(record.key, "rawOrProductId", value); setRawOrProductId(value) }}
                                            value={record.rawOrProductId}
                                            style={{ width: "100%" }}
                                            placeholder="Select Name"
                                            options={record?.itemType === "PRODUCT" ? productData : row_materials}
                                        />
                                    </Form.Item>
                                ),
                            },
                            {
                                title: "Quantity",
                                dataIndex: "quantityAdd",
                                render: (_, record) => (
                                    <Form.Item>
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            min={1}
                                            type="number"
                                            value={record.quantityAdd}
                                            onChange={(value) => updateItem(record.key, "quantityAdd", value)}
                                        />
                                    </Form.Item>
                                ),
                            },
                            {
                                title: "Unit Price",
                                dataIndex: "unitPrice",
                                render: (_, record) => (
                                    <Form.Item style={{ margin: 0 }}>
                                        <InputNumber
                                            type="number"
                                            placeholder="Unit price"
                                            style={{ width: "100%" }}
                                            min={0}
                                            value={record.unitPrice}
                                            onChange={(value) => updateItem(record.key, "unitPrice", value)}
                                        />
                                    </Form.Item>
                                ),
                            }, {
                                title: "Discount",
                                dataIndex: "discount",
                                render: (_, record) => (
                                    <Form.Item style={{ margin: 0 }}>
                                        <InputNumber
                                            type="number"
                                            placeholder="discount"
                                            style={{ width: "100%" }}
                                            min={0}
                                            value={record.discount}
                                            onChange={(value) => updateItem(record.key, "discount", value)}
                                        />
                                    </Form.Item>
                                ),
                            },
                            {
                                title: "Total",
                                dataIndex: "debitAmount",
                                render: (_, record) => <Form.Item className="border border-slate-300 rounded-md min-w-[120px] text-left">
                                    <b className="pl-4">{((record.quantityAdd * record.unitPrice!) - record.discount)?.toFixed(2)}</b>
                                </Form.Item>,
                            },
                            {
                                title: "Narration",
                                dataIndex: "narration",
                                render: (_, record) => {
                                    return (
                                        <Form.Item style={{ margin: 0 }}>
                                            <Input.TextArea
                                                value={record?.narration}
                                                style={{ width: "100%" }}
                                                rows={1}
                                                onChange={(e) => updateItem(record.key!, "narration", e.target.value)}
                                            />
                                        </Form.Item>
                                    );
                                }
                            },
                            {
                                title: "Actions",
                                render: (_, record) => (
                                    <Button className="mb-5" style={{ background: "#e8e5e0" }} type="link" icon={<DeleteOutlined />} onClick={() => removeItem(record.key)} danger />
                                ),
                            },
                        ]}
                        pagination={false}
                    />
                    <Button onClick={addItem} icon={<PlusOutlined />} className="mt-2" style={{ fontSize: "12px", background: "#2d1849", color: "white" }}>
                        Add
                    </Button>
                </div>
                <div className="mt-4 bg-white px-2 py-1 rounded-t pb-3">
                    <Table
                        dataSource={creditItem}
                        className=""
                        columns={[
                            {
                                title: "Ledger Head",
                                dataIndex: "id",
                                render: (_, record) => (
                                    <>
                                        <Form.Item
                                            rules={[{ required: true, message: "Accounts Title is required" }]}>
                                            <Select
                                                style={{ minWidth: "220px" }}
                                                options={accountsItems}
                                                placeholder="Select Ledger"
                                                value={record?.accountsItemId}
                                                onChange={(value) => {
                                                    const selected = accountsItems?.find((item: TAccountsItem) => item?.id === value);
                                                    updateLedgerItm(
                                                        record.key,
                                                        "accountsItemId",
                                                        value,
                                                        selected?.accountsItemName
                                                    );
                                                    // if (selected?.accountsItemName !== "Bank") {
                                                    //     updateLedgerItm(
                                                    //         record.key,
                                                    //         "balance",
                                                    //         value,
                                                    //         "Balance"
                                                    //     );
                                                    // }
                                                }}
                                            />
                                        </Form.Item>
                                        {record?.accountsItemName?.toLowerCase()?.includes("bank") && (
                                            <div className="-mt-4 rounded flex gap-2 items-center">
                                                <Form.Item
                                                    style={{ margin: 0 }}
                                                    rules={[{ required: true, message: "required field" }]}
                                                    className="w-full">
                                                    <Select
                                                        placeholder="Select Bank"
                                                        value={record.bankId}
                                                        onChange={(value) => {
                                                            updateLedgerItm(record.key, "bankId", value)
                                                            updateLedgerItm(record.key, "balance", value, "Balance");
                                                        }
                                                        }
                                                        options={bankData}
                                                    />
                                                </Form.Item>
                                            </div>
                                        )}
                                    </>
                                )
                            },
                            // {
                            //     title: "Balance",
                            //     dataIndex: "balance",
                            //     render: (_, record) => <Form.Item>
                            //         <Input placeholder="Balance" style={{ width: "fit-content" }} disabled value={record?.balance} />
                            //     </Form.Item>,
                            // },
                            {
                                title: "Amount",
                                dataIndex: "amount",
                                render: (_, record) => (
                                    <Form.Item
                                        style={{ margin: 0, width: "100%" }}
                                        name={record.key + 545445}
                                        rules={[{ required: true, message: "Required" }]}>
                                        <InputNumber
                                            placeholder="Amount"
                                            style={{ minWidth: "100%" }}
                                            value={record.amount?.toFixed(2)}
                                            min={0}
                                            onChange={(value) => updateLedgerItm(record.key, "amount", value)} />
                                    </Form.Item>
                                ),
                            },
                            {
                                title: "Narration",
                                dataIndex: "narration",
                                render: (_, record) => {
                                    // console.log(record?.narration, "narration");
                                    return (
                                        <Form.Item style={{ margin: 0, width: "100%" }}>
                                            <Input.TextArea
                                                value={record?.narration}
                                                rows={1}
                                                onChange={(e) => updateLedgerItm(record.key!, "narration", e.target.value)}
                                            />
                                        </Form.Item>
                                    );
                                }
                            },
                            {
                                title: "Actions",
                                render: (_, record) => (
                                    <div className="flex items-center gap-2 justify-end">
                                        <Button className="mb-5" style={{ background: "#e8e5e0" }} type="link" icon={<DeleteOutlined />} onClick={() => removeCreditItem(record.key)} danger />
                                    </div>
                                ),
                            },
                        ]} pagination={false}
                    />
                    {/* Ledger Items Table */}
                    <div className="flex justify-between items-center max-w-[77%] mt-2">
                        <div className="flex gap-2 items-center">
                            <Button style={{ fontSize: "12px", background: "#2d1849", color: "white" }} onClick={addCreditItem} icon={<PlusOutlined />} className="">Add</Button>
                        </div>
                        <b className="">Total = {getCreditItemCalculation()}</b>
                    </div>
                </div>
                <div className="bg-white px-3 pb-2 rounded-b-md shadow">
                    {/* Discount & Total */}
                    <div className="flex flex-col gap-2 pb-3">
                        <div className="flex justify-between items-center py-2 border-t border-slate-200 mt-5 md:text-xl">
                            <h3 className="font-bold">Grnad Total</h3>
                            <b>{(getCalculationSummery?.subTotal)?.toFixed(2)}</b>
                        </div>
                    </div>
                    {/* Submit Button */}
                    <div className="flex justify-end items-center">
                        {
                            ((getCalculationSummery.subTotal) - getCreditItemCalculation()) == 0 ?
                                <span className="font-bold text-green-600">Procced</span> :
                                <span className="font-bold">Need Credit or debit: {((getCalculationSummery.subTotal) - getCreditItemCalculation())?.toFixed(2)}</span>
                        }
                    </div>
                </div>
                <div className="flex justify-end items-center mt-4">
                    <Button type="primary" htmlType="submit" loading={isSubmitting} style={{ background: "black", color: "white" }}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                </div>
            </Form>
            <PostSubmitModal
                voucherNo={voucherNo}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onNewVoucher={handleNewVoucher}
            />
        </div>
    );
};

export default PurchaseVoucher;
