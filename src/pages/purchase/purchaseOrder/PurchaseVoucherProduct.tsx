/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
    useState, useMemo,
} from "react";
import { Form, Input, Button, Select, DatePicker, Table, InputNumber } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useGetProductsQuery } from "../../../redux/features/product/product.api";
import { TAccountsItem, TBankAccount, TParty, TProduct } from "../../../types/types";
import { useGetPartiesQuery } from "../../../redux/features/auth/authApi";
import { toast } from "sonner";
import { useAddPurchaseReceiveMutation } from "../../../redux/features/journal/journal.api";
import { useGetAccountItemQuery } from "../../../redux/features/transactions/transactons.api";
import { useGetBankQuery } from "../../../redux/features/bank/bank.api";
import { getResponse } from "../../../utils/getResponse";
import { useLazyAccountsItemTotalQuery } from "../../../redux/features/OthersApi/othersApi";
import PostSubmitModal from "../../../components/shared/PostSubmitModal";
import Loading from "../../../components/shared/Loading";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
    addPurchaseOrderRMItem,
    removePurchaseOrderRMItem,
    clearPurchaseOrderRMItems,
} from "../../../redux/features/purchaseOrder/purchaseOrderRMSlice";
import {
    addCreditItem,
    removeCreditItem,
    updateCreditItem,
    clearCreditItems,
} from "../../../redux/features/purchaseOrder/purchaseCreditSlice";

interface AccountsItemType extends TAccountsItem {
    key: number;
    value: string;
    label: string
}
const PurchaseVoucherProduct: React.FC = () => {
    const [getBalanceTotal] = useLazyAccountsItemTotalQuery()
    const { data: banks, isLoading: isBanksLoading } = useGetBankQuery({})
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLedgerName, setSelectedLedgerName] = useState("");
    const dispatch = useAppDispatch();
    const items = useAppSelector((state) => state.purchaseOrderRM.items);
    const creditItem = useAppSelector((state) => state.purchaseCredit.creditItems);

    const [itemForm] = Form.useForm();
    const [creditForm] = Form.useForm();

    const bankData = banks?.data?.map((item: TBankAccount) => {
        return {
            key: item?.id,
            value: item?.id,
            label: `${item?.bankName} - (${item?.accountNumber})`,
            ...item
        }
    });
    const [form] = Form.useForm();
    const [addPurchaseJournal, { isLoading: isSubmitting }] = useAddPurchaseReceiveMutation()
    const { data: party, isLoading: isPartiesLoading } = useGetPartiesQuery({});
    const { data: product, isLoading: isProductLoading } = useGetProductsQuery({})
    const { data: accountsItem, isLoading: isAccountItemsLoading } = useGetAccountItemQuery({ accountMainPillerId: ["01", "04"] });

    /** Use useMemo to optimize total calculation */
    const getCalculationSummery: { grandTotal: number; subTotal: number; } = useMemo(() => {
        const subTotal = items.reduce((acc, item) => (acc + item.quantityAdd * item.unitPrice!) - item?.discount, 0);
        const grandTotal = subTotal;

        return { subTotal, grandTotal }
    }, [items]);

    if (isBanksLoading || isPartiesLoading || isProductLoading || isAccountItemsLoading) {
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
        if (item?.partyType === "SUPPLIER") {
            return {
                key: item?.id,
                label: item?.name,
                value: item?.id
            };
        }
    }).filter(Boolean);
    const productData = product?.data?.map((item: TProduct) => {
        return {
            key: item?.id,
            label: item?.name,
            value: item?.id
        }
    })

    const handleAddItem = () => {
        itemForm.validateFields().then((values) => {
            const quantity = values.quantityAdd || 1;
            const unitPrice = values.unitPrice || 0;
            const discount = values.discount || 0;
            dispatch(addPurchaseOrderRMItem({
                key: Date.now(),
                itemType: "PRODUCT",
                rawOrProductId: values.rawOrProductId,
                quantityAdd: quantity,
                unitPrice: unitPrice,
                discount: discount,
                debitAmount: (quantity * unitPrice) - discount,
                narration: values.narration || "",
            }));
            itemForm.resetFields();
            itemForm.setFieldsValue({ quantityAdd: 1, discount: 0 });
        });
    };

    const removeItem = (key: number | undefined) => {
        if (key !== undefined) dispatch(removePurchaseOrderRMItem(key));
    };

    const removeCreditItemByKey = (key: number) => {
        dispatch(removeCreditItem(key));
    };

    const handleAddCreditItem = () => {
        creditForm.validateFields().then((values) => {
            const selected = accountsItems?.find((item: TAccountsItem) => item?.id === values.accountsItemId);
            dispatch(addCreditItem({
                key: Date.now(),
                accountsItemId: values.accountsItemId,
                accountsItemName: selected?.accountsItemName || "",
                balance: 0,
                amount: values.amount || 0,
                bankId: values.bankId || null,
                narration: values.narration || "",
            }));
            creditForm.resetFields();
            setSelectedLedgerName("");
        });
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
                item?.unitPrice && item?.unitPrice < 1
            ) {
                toast.error(<span className="font-bold text-red-600">Please Full fill all the Items fields</span>, {
                    position: "bottom-center",
                    duration: 5000,
                });
                return;
            }
        }
        const data = { ...values, items, grandTotal: getCalculationSummery.grandTotal, creditItem, subTotal: getCalculationSummery?.subTotal };

        const res = await addPurchaseJournal(data)
        const result = getResponse(res)
        if (result?.success) {
            setIsModalOpen(true);
        }
    };

    const handleNewVoucher = () => {
        form.resetFields();
        dispatch(clearCreditItems());
        dispatch(clearPurchaseOrderRMItems());
        setIsModalOpen(false);
    };

    return (
        <div className="mx-auto rounded purchaseVoucher">
            <div className="bg-white rounded-lg px-4 py-2 mb-3">
                <h2 className="text-xl font-bold m-0">Purchase Order - Product</h2>
            </div>
            <Form size="middle" className="" form={form} layout="vertical" onFinish={handleSubmit}>
                {/* Parties & Invoice */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white px-3 py-2 pb-1 rounded-md shadow">
                    <Form.Item name="partyOrcustomerId" label="Select Supplier" rules={[{ required: true, message: "Please select a party" }]}>
                        <Select
                            style={{ width: "100%" }}
                            placeholder="Select Name"
                            options={partyData}
                        />
                    </Form.Item>
                    <Form.Item label="Date" name="date" rules={[{ required: true, message: "Select a date" }]}>
                        <DatePicker className="w-full" />
                    </Form.Item>
                    <Form.Item name="invoiceNo" label="Invoice No">
                        <Input placeholder="Invoice Number" />
                    </Form.Item>
                </div>
                <div className=" bg-white px-3 py-2 pb-3 rounded-md shadow mt-4">
                    <h3 className="text-lg font-semibold mb-1">Items</h3>
                    {/*-------------------------- Item Input Form--------------------------------------------- */}
                    <Form form={itemForm} layout="vertical" className="mb-3">
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-6 gap-3">
                            <Form.Item name="rawOrProductId" label="Product" rules={[{ required: true, message: "Required" }]}>
                                <Select placeholder="Select Name" options={productData} />
                            </Form.Item>
                            <Form.Item name="quantityAdd" label="Qty" initialValue={1}>
                                <InputNumber style={{ width: "100%" }} min={1} />
                            </Form.Item>
                            <Form.Item name="unitPrice" label="Unit Price" rules={[{ required: true, message: "Required" }]}>
                                <InputNumber style={{ width: "100%" }} min={0} placeholder="Unit price" />
                            </Form.Item>
                            <Form.Item name="discount" label="Discount" initialValue={0}>
                                <InputNumber style={{ width: "100%" }} min={0} />
                            </Form.Item>
                            <Form.Item name="narration" label="Narration">
                                <Input.TextArea rows={1} />
                            </Form.Item>
                            <Form.Item label=" ">
                                <Button onClick={handleAddItem} icon={<PlusOutlined />} style={{ fontSize: "12px", background: "#2d1849", color: "white", width: "100%" }}>
                                    Add
                                </Button>
                            </Form.Item>
                        </div>
                    </Form>
                    {/*-------------------------- Items List Table (display only)--------------------------------------------- */}
                    {items.length > 0 && (
                        <Table
                            dataSource={items}
                            className="mb-0 itemsTable"
                            rowKey="key"
                            columns={[
                                {
                                    title: "Item Name",
                                    dataIndex: "rawOrProductId",
                                    render: (value: number) => productData?.find((r:any) => r.value === value)?.label || value,
                                },
                                {
                                    title: "Quantity",
                                    dataIndex: "quantityAdd",
                                },
                                {
                                    title: "Unit Price",
                                    dataIndex: "unitPrice",
                                    render: (value: number) => value?.toFixed(2),
                                },
                                {
                                    title: "Discount",
                                    dataIndex: "discount",
                                    render: (value: number) => value?.toFixed(2),
                                },
                                {
                                    title: "Total",
                                    dataIndex: "debitAmount",
                                    render: (value: number) => <b>{value?.toFixed(2)}</b>,
                                },
                                {
                                    title: "Narration",
                                    dataIndex: "narration",
                                },
                                {
                                    title: "Actions",
                                    render: (_, record) => (
                                        <Button type="link" icon={<DeleteOutlined />} onClick={() => removeItem(record.key)} danger />
                                    ),
                                },
                            ]}
                            pagination={false}
                        />
                    )}
                </div>
                <div className="mt-4 bg-white px-2 py-1 rounded-t pb-3">
                    <h3 className="text-lg font-semibold mb-1">Ledger Head</h3>
                    {/*-------------------------- Ledger Head Input Form--------------------------------------------- */}
                    <Form form={creditForm} layout="vertical" className="mb-3">
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            <Form.Item name="accountsItemId" label="Ledger Head" rules={[{ required: true, message: "Required" }]}>
                                <Select
                                    options={accountsItems}
                                    placeholder="Select Ledger"
                                    onChange={(value) => {
                                        const selected = accountsItems?.find((item: TAccountsItem) => item?.id === value);
                                        setSelectedLedgerName(selected?.accountsItemName || "");
                                        if (selected?.accountsItemName?.toLowerCase()?.includes("bank")) {
                                            creditForm.setFieldsValue({ bankId: undefined });
                                        }
                                    }}
                                />
                            </Form.Item>
                            {selectedLedgerName?.toLowerCase()?.includes("bank") && (
                                <Form.Item name="bankId" label="Bank" rules={[{ required: true, message: "Required" }]}>
                                    <Select placeholder="Select Bank" options={bankData} />
                                </Form.Item>
                            )}
                            <Form.Item name="amount" label="Amount" rules={[{ required: true, message: "Required" }]}>
                                <InputNumber style={{ width: "100%" }} min={0} placeholder="Amount" />
                            </Form.Item>
                            <Form.Item name="narration" label="Narration">
                                <Input.TextArea rows={1} />
                            </Form.Item>
                            <Form.Item label=" ">
                                <Button onClick={handleAddCreditItem} icon={<PlusOutlined />} style={{ fontSize: "12px", background: "#2d1849", color: "white", width: "100%" }}>
                                    Add
                                </Button>
                            </Form.Item>
                        </div>
                    </Form>
                    {/*-------------------------- Ledger Head Table (display only)--------------------------------------------- */}
                    {creditItem.length > 0 && (
                        <Table
                            dataSource={creditItem}
                            rowKey="key"
                            columns={[
                                {
                                    title: "Ledger Head",
                                    dataIndex: "accountsItemName",
                                },
                                {
                                    title: "Amount",
                                    dataIndex: "amount",
                                    render: (value: number) => value?.toFixed(2),
                                },
                                {
                                    title: "Narration",
                                    dataIndex: "narration",
                                },
                                {
                                    title: "Actions",
                                    render: (_, record) => (
                                        <Button style={{ background: "#e8e5e0" }} type="link" icon={<DeleteOutlined />} onClick={() => removeCreditItemByKey(record.key)} danger />
                                    ),
                                },
                            ]}
                            pagination={false}
                        />
                    )}
                    <div className="flex justify-end items-center mt-2">
                        <b>Total = {getCreditItemCalculation()}</b>
                    </div>
                </div>
                <div className="bg-white px-3 pb-2 rounded-b-md shadow">
                    {/* Discount & Total */}
                    <div className="flex flex-col gap-2 pb-3">
                        <div className="flex justify-between items-center py-2 border-t border-slate-200 mt-5 md:text-xl">
                            <h3 className="font-bold">Grand Total</h3>
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
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onNewVoucher={handleNewVoucher}
            />
        </div>
    );
};

export default PurchaseVoucherProduct;
