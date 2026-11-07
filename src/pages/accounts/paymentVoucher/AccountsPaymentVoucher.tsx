/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { Form, Input, Button, DatePicker, Select, Table } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useGetPartiesQuery } from "../../../redux/features/auth/authApi";
import { TAccountsItem, TBankAccount, TParty } from "../../../types/types";
import { generateInvoiceNumber } from "../../../utils/generateRandomNumber";
import { useCreatePaymentVoucherMutation, useGetAccountItemQuery } from "../../../redux/features/transactions/transactons.api";
import { useGetBankQuery } from "../../../redux/features/bank/bank.api";
import { getResponse } from "../../../utils/getResponse";
import PostSubmitModal from "../../../components/shared/PostSubmitModal";
import Loading from "../../../components/shared/Loading";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
    addPaymentVoucherDebitItem,
    removePaymentVoucherDebitItem,
    clearPaymentVoucherDebitItems,
} from "../../../redux/features/paymentVoucher/paymentVoucherDebitSlice";
import {
    addPaymentVoucherCreditItem,
    removePaymentVoucherCreditItem,
    clearPaymentVoucherCreditItems,
} from "../../../redux/features/paymentVoucher/paymentVoucherCreditSlice";

const { Option } = Select;

const AccountsPaymentVoucher: React.FC = () => {
    const [form] = Form.useForm();
    const [debitForm] = Form.useForm();
    const [creditForm] = Form.useForm();
    // const [voucherNo] = useState(generateInvoiceNumber("PV"));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCreditLedgerName, setSelectedCreditLedgerName] = useState("");
    const dispatch = useAppDispatch();
    const debitItems = useAppSelector((state) => state.paymentVoucherDebit.debitItems);
    const creditItems = useAppSelector((state) => state.paymentVoucherCredit.creditItems);

    const { data: bank, isLoading } = useGetBankQuery({});
    const banks = bank?.data?.map((item: TBankAccount) => {
        return {
            key: item?.id,
            value: item?.id,
            label: `${item?.bankName} (${item?.accountNumber})`,
            ...item,
        };
    });

    const [createPayment, { isLoading: isSubmitting }] = useCreatePaymentVoucherMutation();
    const { data: party, isLoading: isPartyLoading } = useGetPartiesQuery({});
    const paymentParty = party?.data?.map((item: TParty) => {
        return {
            key: item?.id,
            value: item?.id,
            label: item?.name,
            ...item,
        };
    });

    const { data: accountItems, isLoading: isAccountItemsLoading } = useGetAccountItemQuery({ accountMainPillerId: ["01"] });
    const { data: debitAccounts, isLoading: isDebitAccountsLoading } = useGetAccountItemQuery({ accountMainPillerId: ["04", "03"] });

    const debitaccountItem = debitAccounts?.data;
    const creditAccountItem = accountItems?.data;

    const debitTotal = useMemo(() => {
        return debitItems.reduce((acc, item) => acc + (Number(item?.amount) || 0), 0);
    }, [debitItems]);

    const creditTotal = useMemo(() => {
        return creditItems.reduce((acc, item) => acc + (Number(item?.amount) || 0), 0);
    }, [creditItems]);

    if (isLoading || isPartyLoading || isAccountItemsLoading || isDebitAccountsLoading) {
        return <Loading tip="Loading Payment Voucher details..." />;
    }

    const handleAddDebitItem = () => {
        debitForm.validateFields().then((values) => {
            const selected = debitaccountItem?.find((item: TAccountsItem) => item?.id === values.accountsItemId);
            dispatch(addPaymentVoucherDebitItem({
                key: Date.now(),
                accountsItemId: values.accountsItemId,
                accountsItemName: selected?.accountsItemName || "",
                amount: Number(values.amount) || 0,
                narration: values.narration || "",
            }));
            debitForm.resetFields();
        });
    };

    const handleAddCreditItem = () => {
        creditForm.validateFields().then((values) => {
            const selected = creditAccountItem?.find((item: TAccountsItem) => item?.id === values.accountsItemId);
            dispatch(addPaymentVoucherCreditItem({
                key: Date.now(),
                accountsItemId: values.accountsItemId,
                accountsItemName: selected?.accountsItemName || "",
                bankAccountId: values.bankAccountId || null,
                amount: Number(values.amount) || 0,
                narration: values.narration || "",
                checkOrRTGS: Number(values?.checkOrRTGS) || null
            }));
            creditForm.resetFields();
            setSelectedCreditLedgerName("");
        });
    };
    const onFinish = async (values: any) => {
        const data = {
            ...values,
            // voucherNo,
            debitItem: debitItems.map(({ key, ...rest }) => rest),
            creditItem: creditItems.map(({ key, ...rest }) => rest),
        };
        const res = await createPayment(data);
        const result = getResponse(res);
        if (result?.success) {
            setIsModalOpen(true);
        }
    };

    const handleNewVoucher = () => {
        form.resetFields();
        dispatch(clearPaymentVoucherDebitItems());
        dispatch(clearPaymentVoucherCreditItems());
        setIsModalOpen(false);
    };

    const isSubmitDisabled = debitTotal !== creditTotal || debitItems.length === 0 || creditItems.length === 0;

    return (
        <div className="rounded-2xl">
            <div className="bg-white rounded-lg px-4 py-2 mb-3">
                <h2 className="text-xl md:text-2xl font-semibold m-0">Payment Voucher</h2>
            </div>
            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ date: dayjs(new Date()) }}>
                <div className="grid bg-white grid-cols-1 sm:grid-cols-2 md:grid-cols-2 md:gap-x-4 p-4 rounded-lg">
                    <Form.Item name="partyId" label="Party" rules={[{ required: true, message: "Party Is Required" }]}>
                        <Select placeholder="Select party">
                            {paymentParty?.map((item: TParty, idx: number) => (
                                <Option key={idx} value={item?.id}>{item?.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="date" label="Voucher Date" initialValue={dayjs()} rules={[{ required: true, message: "Please select voucher date" }]}>
                        <DatePicker className="w-full" />
                    </Form.Item>
                    {/* <Form.Item label="Voucher No">
                        <Input placeholder="Enter voucher code" value={voucherNo} disabled style={{ color: "#000" }} />
                    </Form.Item> */}
                </div>

                <div className="bg-white mt-5 shadow pt-0 rounded-lg p-3">
                    <h3 className="text-lg font-semibold mb-1">Credit Items</h3>
                    <Form component="div" form={creditForm} layout="vertical" className="mb-3">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                            <Form.Item name="accountsItemId" label="Credit Item" rules={[{ required: true, message: "Required" }]}>
                                <Select placeholder="Select Credit Item" onChange={(value) => {
                                    const selected = creditAccountItem?.find((item: TAccountsItem) => item?.id === value);
                                    setSelectedCreditLedgerName(selected?.accountsItemName || "");
                                }}>
                                    {creditAccountItem?.map((item: TAccountsItem, idx: number) => (
                                        <Option key={idx} value={item?.id}>{item?.accountsItemName}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            {selectedCreditLedgerName?.toLowerCase() === "bank" && (
                                <Form.Item name="bankAccountId" label="Bank" rules={[{ required: true, message: "Required" }]}>
                                    <Select placeholder="Select Bank" options={banks} />
                                </Form.Item>
                            )}
                            <Form.Item name="amount" label="Amount" rules={[{ required: true, message: "Required" }]}>
                                <Input type="number" placeholder="Amount" min={0} />
                            </Form.Item>
                            <Form.Item name="checkOrRTGS" label="check No/Rtgs">
                                <Input type="number" placeholder="check No" min={0} />
                            </Form.Item>
                            <Form.Item name="narration" label="Narration">
                                <Input placeholder="Narration (optional)" />
                            </Form.Item>
                            <Form.Item label=" ">
                                <Button onClick={handleAddCreditItem} icon={<PlusOutlined />} style={{ fontSize: "12px", background: "#2d1849", color: "white", width: "100%" }}>
                                    Add
                                </Button>
                            </Form.Item>
                        </div>
                    </Form>
                    {creditItems.length > 0 && (
                        <Table
                            dataSource={creditItems}
                            className="mb-0 itemsTable"
                            rowKey="key"
                            columns={[
                                {
                                    title: "Credit Item",
                                    dataIndex: "accountsItemName",
                                    render: (value: string) => <span className="font-medium">{value}</span>,
                                },
                                {
                                    title: "Amount",
                                    dataIndex: "amount",
                                    render: (value: number) => <b>{Number(value)?.toFixed(2)}</b>,
                                },
                                {
                                    title: "check/RTGS",
                                    dataIndex: "checkOrRTGS",
                                    render: (value: number) => <span className="font-medium">{Number(value)}</span>,
                                },
                                {
                                    title: "Narration",
                                    dataIndex: "narration",
                                },
                                {
                                    title: "Actions",
                                    render: (_, record) => (
                                        <Button type="link" icon={<DeleteOutlined />} onClick={() => dispatch(removePaymentVoucherCreditItem(record.key))} danger />
                                    ),
                                },
                            ]}
                            pagination={false}
                        />
                    )}
                    <div className="text-right font-bold text-lg mb-4 mt-2">
                        <b>Total Credit Amount: {Number(creditTotal).toFixed(2)}</b>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-4 mt-5 pt-0">
                    <h3 className="text-lg font-semibold mb-1">Debit Items</h3>
                    <Form component="div" form={debitForm} layout="vertical" className="mb-3">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <Form.Item name="accountsItemId" label="Debit Item" rules={[{ required: true, message: "Required" }]}>
                                <Select placeholder="Select debit Item">
                                    {debitaccountItem?.map((item: TAccountsItem, idx: number) => (
                                        <Option key={idx} value={item?.id}>{item?.accountsItemName}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name="amount" label="Amount" rules={[{ required: true, message: "Required" }]}>
                                <Input type="number" placeholder="Amount" min={0} />
                            </Form.Item>
                            <Form.Item name="narration" label="Narration">
                                <Input placeholder="Narration (optional)" />
                            </Form.Item>
                            <Form.Item label=" ">
                                <Button onClick={handleAddDebitItem} icon={<PlusOutlined />} style={{ fontSize: "12px", background: "#2d1849", color: "white", width: "100%" }}>
                                    Add
                                </Button>
                            </Form.Item>
                        </div>
                    </Form>
                    {debitItems.length > 0 && (
                        <Table
                            dataSource={debitItems}
                            className="mb-0 itemsTable"
                            rowKey="key"
                            columns={[
                                {
                                    title: "Debit Item",
                                    dataIndex: "accountsItemName",
                                },
                                {
                                    title: "Amount",
                                    dataIndex: "amount",
                                    render: (value: any) => <b>{Number(value || 0).toFixed(2)}</b>,
                                },
                                {
                                    title: "Narration",
                                    dataIndex: "narration",
                                },
                                {
                                    title: "Actions",
                                    render: (_, record) => (
                                        <Button type="link" icon={<DeleteOutlined />} onClick={() => dispatch(removePaymentVoucherDebitItem(record.key))} danger />
                                    ),
                                },
                            ]}
                            pagination={false}
                        />
                    )}
                    <div className="text-right font-bold text-base mt-2">
                        <b>Total Debit Amount: {Number(debitTotal || 0).toFixed(2)}</b>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-4">
                    <div>
                        {
                            debitTotal !== creditTotal ?
                                <span className="font-bold text-sm text-slate-900">Debit or credit Required {Number(debitTotal - creditTotal || 0).toFixed(2)}</span> :
                                <span className="font-bold text-green-700">Procced</span>
                        }
                    </div>
                    <Button type="primary" className="min-w-52" size="large" htmlType="submit" loading={isSubmitting} disabled={isSubmitDisabled} style={{ background: isSubmitDisabled ? "#d9d9d9" : "black", color: isSubmitDisabled ? "#bfbfbf" : "white", cursor: isSubmitDisabled ? "not-allowed" : "pointer" }}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                </div>
            </Form>
            <PostSubmitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onNewVoucher={handleNewVoucher} />
        </div>
    );
};

export default AccountsPaymentVoucher;
