/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { Form, Input, Button, DatePicker, Select, Table } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useGetAccountItemQuery } from "../../../redux/features/transactions/transactons.api";
import { TAccountsItem, TBankAccount, TParty } from "../../../types/types";
import { useCreateReceiveVoucherMutation } from "../../../redux/features/journal/journal.api";
import { getResponse } from "../../../utils/getResponse";
import { useGetPartiesQuery } from "../../../redux/features/auth/authApi";
import { generateInvoiceNumber } from "../../../utils/generateRandomNumber";
import { useGetBankQuery } from "../../../redux/features/bank/bank.api";
import PostSubmitModal from "../../../components/shared/PostSubmitModal";
import Loading from "../../../components/shared/Loading";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
    addReceiveVoucherDebitItem,
    removeReceiveVoucherDebitItem,
    clearReceiveVoucherDebitItems,
    addReceiveVoucherCreditItem,
    removeReceiveVoucherCreditItem,
    clearReceiveVoucherCreditItems,
    clearAllReceiveVoucherItems,
} from "./AccountsReceiveVoucher";

const { Option } = Select;

const AccountsReceivedVoucher: React.FC = () => {
    const [form] = Form.useForm();
    const [debitForm] = Form.useForm();
    const [creditForm] = Form.useForm();
    const [partyType, setPartyType] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDebitLedgerName, setSelectedDebitLedgerName] = useState("");
    const [selectedCreditLedgerName, setSelectedCreditLedgerName] = useState("");
    const dispatch = useAppDispatch();
    const debitItems = useAppSelector((state) => state.accountsReceiveVoucher.debitItems);
    const creditItems = useAppSelector((state) => state.accountsReceiveVoucher.creditItems);

    const { data: party, isLoading } = useGetPartiesQuery({ partyType: partyType });

    const parties = party?.data?.map((item: TParty) => ({
        ...item,
        key: item?.id,
        value: item?.id,
        label: item?.name,
    }));

    const { data: banks, isLoading: isBanksLoading } = useGetBankQuery({});
    const allBanks = banks?.data?.map((item: TBankAccount) => {
        return {
            key: item?.id,
            value: item?.id,
            label: `${item?.bankName} (${item?.accountNumber})`,
            ...item,
        };
    });

    const [createReceviveVoucher, { isLoading: isSubmitting }] = useCreateReceiveVoucherMutation();
    const { data: debitAccountsData, isLoading: isDebitAccountsLoading } = useGetAccountItemQuery({ accountMainPillerId: ["01"] });
    const debitAccountsItems = debitAccountsData?.data;

    const { data: CreditAccountsData, isLoading: isCreditAccountsLoading } = useGetAccountItemQuery({ accountMainPillerId: ["01", "02"] });

    const debitTotal = useMemo(() => {
        return debitItems.reduce((acc, item) => acc + (item?.amount || 0), 0);
    }, [debitItems]);

    const creditTotal = useMemo(() => {
        return creditItems.reduce((acc, item) => acc + (item?.amount || 0), 0);
    }, [creditItems]);

    if (isLoading || isBanksLoading || isDebitAccountsLoading || isCreditAccountsLoading) {
        return <Loading tip="Loading Received Voucher details..." />;
    }

    const debitAccounts = debitAccountsItems?.map((item: TAccountsItem) => ({
        ...item,
        key: item.id,
        value: item.id,
        label: item.accountsItemName,
    }));

    const creditAccounts = CreditAccountsData?.data?.map((item: TAccountsItem) => ({
        ...item,
        key: item.id,
        value: item.id,
        label: item.accountsItemName,
    }));

    const handleAddDebitItem = () => {
        debitForm.validateFields().then((values) => {
            const selected = debitAccountsItems?.find((item: TAccountsItem) => item?.id === values.accountsItemId);
            dispatch(addReceiveVoucherDebitItem({
                key: Date.now(),
                accountsItemId: values.accountsItemId,
                accountsItemName: selected?.accountsItemName || "",
                bankAccountId: values.bankAccountId || null,
                amount: Number(values.amount) || 0,
                narration: values.narration || "",
            }));
            debitForm.resetFields();
            setSelectedDebitLedgerName("");
        });
    };

    const handleAddCreditItem = () => {
        creditForm.validateFields().then((values) => {
            const selected = CreditAccountsData?.data?.find((item: TAccountsItem) => item?.id === values.accountsItemId);
            dispatch(addReceiveVoucherCreditItem({
                key: Date.now(),
                accountsItemId: values.accountsItemId,
                accountsItemName: selected?.accountsItemName || "",
                bankAccountId: values.bankAccountId || null,
                amount: Number(values.amount) || 0,
                narration: values.narration || "",
            }));
            creditForm.resetFields();
            setSelectedCreditLedgerName("");
        });
    };

    const onFinish = async (values: any) => {
        const res = await createReceviveVoucher({
            ...values,
            debitItem: debitItems.map(({ key, ...rest }) => rest),
            creditItem: creditItems.map(({ key, ...rest }) => rest),
        });
        const result = getResponse(res);
        if (result?.success) {
            setIsModalOpen(true);
        }
    };

    const handleNewVoucher = () => {
        form.resetFields();
        dispatch(clearAllReceiveVoucherItems());
        setIsModalOpen(false);
    };

    const isSubmitDisabled = debitTotal !== creditTotal || debitItems.length === 0 || creditItems.length === 0;

    return (
        <div className="rounded-2xl">
            <div className="bg-white rounded-lg px-4 py-2 mb-3">
                <h2 className="text-2xl font-semibold m-0">Received Voucher</h2>
            </div>
            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ date: dayjs(new Date()) }}>
                <div className="bg-white p-4 shadow rounded grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Form.Item name="partyType" label="Party Type" rules={[{ required: true, message: "Please select a party" }]}>
                        <Select placeholder="Select party" onChange={(value) => setPartyType(value)}>
                            <Option value={"VENDOR"}>Vendor</Option>
                            <Option value={"DISTRIBUTOR"}>Distributor</Option>
                            <Option value={"PARTY"}>Party</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="partyId" label="Party" rules={[{ required: true, message: "Please select a party" }]}>
                        <Select placeholder="Select party" disabled={isLoading}>
                            {partyType && parties?.map((item: TParty) => (
                                <Option key={item?.id} value={item?.id}>{item?.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    {/* <Form.Item label="Voucher No">
                        <Input placeholder="Enter voucher number" disabled style={{ color: "#000" }} />
                    </Form.Item> */}
                    <Form.Item name="date" label="Date" rules={[{ required: true, message: "Please select date" }]}>
                        <DatePicker className="w-full" />
                    </Form.Item>
                </div>

                <div className="mb-5 mt-5 bg-white shadow rounded-lg p-3 pt-0">
                    <h3 className="text-lg font-semibold mb-1">Debit Items</h3>
                    <Form component="div" form={debitForm} layout="vertical" className="mb-3">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <Form.Item name="accountsItemId" label="Debit Item" rules={[{ required: true, message: "Required" }]}>
                                <Select placeholder="Select debit item" onChange={(value) => {
                                    const selected = debitAccountsItems?.find((item: TAccountsItem) => item?.id === value);
                                    setSelectedDebitLedgerName(selected?.accountsItemName || "");
                                }}>
                                    {debitAccounts?.map((item: TAccountsItem) => (
                                        <Option key={item?.id} value={item?.id}>{item?.accountsItemName}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            {selectedDebitLedgerName?.toLowerCase() === "bank" && (
                                <Form.Item name="bankAccountId" label="Bank" rules={[{ required: true, message: "Required" }]}>
                                    <Select placeholder="Select Bank" options={allBanks} />
                                </Form.Item>
                            )}
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
                                    render: (value: number) => <b>{value?.toFixed(2)}</b>,
                                },
                                {
                                    title: "Narration",
                                    dataIndex: "narration",
                                },
                                {
                                    title: "Actions",
                                    render: (_, record) => (
                                        <Button type="link" icon={<DeleteOutlined />} onClick={() => dispatch(removeReceiveVoucherDebitItem(record.key))} danger />
                                    ),
                                },
                            ]}
                            pagination={false}
                        />
                    )}
                    <div className="text-right font-bold mt-2">
                        <b>Total Debit: {debitTotal.toFixed(2)}</b>
                    </div>
                </div>

                <div className="mb-5 bg-white shadow rounded-lg p-3 pt-0">
                    <h3 className="text-lg font-semibold mb-1">Credit Items</h3>
                    <Form component="div" form={creditForm} layout="vertical" className="mb-3">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <Form.Item name="accountsItemId" label="Credit Item" rules={[{ required: true, message: "Required" }]}>
                                <Select placeholder="Select credit item" onChange={(value) => {
                                    const selected = CreditAccountsData?.data?.find((item: TAccountsItem) => item?.id === value);
                                    setSelectedCreditLedgerName(selected?.accountsItemName || "");
                                }}>
                                    {creditAccounts?.map((item: TAccountsItem) => (
                                        <Option key={item?.id} value={item?.id}>{item?.accountsItemName}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            {selectedCreditLedgerName?.toLowerCase() === "bank" && (
                                <Form.Item name="bankAccountId" label="Bank" rules={[{ required: true, message: "Required" }]}>
                                    <Select placeholder="Select Bank" options={allBanks} />
                                </Form.Item>
                            )}
                            <Form.Item name="amount" label="Amount" rules={[{ required: true, message: "Required" }]}>
                                <Input type="number" placeholder="Amount" min={0} />
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
                                },
                                {
                                    title: "Amount",
                                    dataIndex: "amount",
                                    render: (value: number) => <b>{value?.toFixed(2)}</b>,
                                },
                                {
                                    title: "Narration",
                                    dataIndex: "narration",
                                },
                                {
                                    title: "Actions",
                                    render: (_, record) => (
                                        <Button type="link" icon={<DeleteOutlined />} onClick={() => dispatch(removeReceiveVoucherCreditItem(record.key))} danger />
                                    ),
                                },
                            ]}
                            pagination={false}
                        />
                    )}
                    <div className="text-right font-bold mt-2">
                        <b>Total Credit: {creditTotal.toFixed(2)}</b>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                    <div>
                        {
                            debitTotal !== creditTotal ?
                                <span className="font-bold text-sm text-slate-900">Debit or credit Difference {(debitTotal - creditTotal).toFixed(2)}</span> :
                                <span className="text-green-600 font-bold">Procced</span>
                        }
                    </div>
                    <Button type="primary" size="middle" htmlType="submit" loading={isSubmitting} disabled={isSubmitDisabled} style={{ background: isSubmitDisabled ? "#d9d9d9" : "black", color: isSubmitDisabled ? "#bfbfbf" : "white", cursor: isSubmitDisabled ? "not-allowed" : "pointer" }}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                </div>
            </Form>
            <PostSubmitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onNewVoucher={handleNewVoucher} />
        </div>
    );
};

export default AccountsReceivedVoucher;
