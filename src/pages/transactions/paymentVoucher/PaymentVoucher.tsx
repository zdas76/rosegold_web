/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Form, Input, Button, DatePicker, Select, Divider, } from "antd";
import dayjs from "dayjs";
import { useGetPartiesQuery } from "../../../redux/features/auth/authApi";
import { TAccountsItem, TBankAccount, TParty } from "../../../types/types";
import { generateInvoiceNumber } from "../../../utils/generateRandomNumber";
import { useCreatePaymentVoucherMutation, useGetAccountItemQuery } from "../../../redux/features/transactions/transactons.api";
import { useGetBankQuery } from "../../../redux/features/bank/bank.api";
import { getResponse } from "../../../utils/getResponse";
import { FaTrash } from "react-icons/fa";
import PostSubmitModal from "../../../components/shared/PostSubmitModal";
import Loading from "../../../components/shared/Loading";

const { Option } = Select;
export type TDebitItem = {
    accountsItemId: number;
    amount: number;
    narration: string;
};
export type TCreditItem = {
    accountsItemId: number;
    bankAccountId: number;
    amount: number;
    narration: string;
};
const PaymentVoucher: React.FC = () => {
    const [form] = Form.useForm();
    const [grandDebitTotal, setGrandDebitTotal] = useState<number>(0)
    const [vaoucherNo, setVoucherNo] = useState(generateInvoiceNumber("PV"))
    const [creditTotal, setCreditTotal] = useState<number>(0)
    const { data: bank, isLoading } = useGetBankQuery({})
    const [createPayment, { isLoading: isSubmitting }] = useCreatePaymentVoucherMutation()
    const [isModalOpen, setIsModalOpen] = useState(false);

    const banks = bank?.data?.map((item: TBankAccount) => {
        return {
            key: item?.id,
            value: item?.id,
            label: item?.bankName,
            ...item
        }
    })

    const { data: party, isLoading: isPartyLoading } = useGetPartiesQuery({})
    const paymentParty = party?.data?.map((item: TParty) => {
        return {
            key: item?.id,
            value: item?.id,
            label: item?.name,
            ...item
        }
    })
    const { data: accountItems, isLoading: isAccountItemsLoading } = useGetAccountItemQuery({ accountMainPillerId: ["01"] })
    const { data: debitAccounts, isLoading: isDebitAccountsLoading } = useGetAccountItemQuery({ accountMainPillerId: ["04", "03"] })

    const debitaccountItem = debitAccounts?.data
    const creditAccountItem = accountItems?.data
    const debitItem: TDebitItem[] = Form.useWatch('debitItem', form)
    const creditITem: TCreditItem[] = Form.useWatch('creditItem', form)

    // debit items total calculation
    useEffect(() => {
        const debitItemCalculate = debitItem?.reduce((total: number, item: TDebitItem) => {
            return total + Number(item?.amount || 0);
        }, 0);
        setGrandDebitTotal(Number(debitItemCalculate));
    }, [debitItem])

    // credit items total calculation
    useEffect(() => {
        const creditTotal = creditITem?.reduce((total: number, item: TDebitItem) => {
            return total + Number(item?.amount || 0);
        }, 0);
        setCreditTotal(Number(creditTotal));
    }, [creditITem])

    if (isLoading || isPartyLoading || isAccountItemsLoading || isDebitAccountsLoading) {
        return <Loading tip="Loading Payment Voucher details..." />;
    }


    const onFinish = async (values: any) => {
        const data = { ...values, voucherNo: vaoucherNo }
        const res = await createPayment(data)
        const result = getResponse(res)
        if (result?.success) {
            setIsModalOpen(true);
        }
    };

    const handleNewVoucher = () => {
        const newVoucherNo = generateInvoiceNumber("PV");
        setVoucherNo(newVoucherNo);
        form.resetFields();
        setIsModalOpen(false);
    };


    return (
        <div className="rounded-2xl">
            <div className="bg-white rounded-lg px-4 py-2 mb-3">
                <h2 className="text-xl md:text-2xl font-semibold m-0">Payment Voucher</h2>
            </div>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                // onValuesChange={onValuesChange}
                initialValues={{
                    voucherDate: dayjs(new Date()),
                    debitItem: [{}],
                    creditItem: [{}],
                }}
            >
                <div className="grid bg-white grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:gap-x-4 p-4 rounded-lg">
                    {/* <Form.Item name="partyType" label="Party Type">
                        <Select placeholder="Select party" onChange={(value) => setPartyType(value)}>
                            <Option value="SUPPLIER">SUPPLIER</Option>
                            <Option value="VENDOR">VENDOR</Option>
                        </Select>
                    </Form.Item> */}

                    <Form.Item name="partyId" label="Party" rules={[{ required: true, message: "Party Is Required" }]}>
                        <Select placeholder="Select party">
                            {
                                paymentParty?.map((item: TParty, idx: number) => (
                                    <Option key={idx} value={item?.id}>{item?.name}</Option>
                                ))
                            }
                        </Select>
                    </Form.Item>

                    <Form.Item name="date" label="Voucher Date" rules={[{ required: true, message: "Please select voucher date" }]}>
                        <DatePicker className="w-full" />
                    </Form.Item>

                    {/* <Form.Item name="creditAccountId" label="Credit Account" rules={[{ required: true, message: "Please select credit account" }]}>
                        <Select placeholder="Select credit account">
                            <Option value="account payable">Account Payable</Option>
                            <Option value="purchases">Purchases</Option>
                        </Select>
                    </Form.Item> */}

                    <Form.Item label="Voucher No" rules={[{ required: true, message: "Please enter voucher code" }]}>
                        <Input placeholder="Enter voucher code" value={vaoucherNo} disabled className="pointer-events-none" style={{ color: "#000" }} />
                    </Form.Item>
                </div>
                <div className="bg-white mt-5 pt-0 rounded-lg p-3">
                    <Divider orientation="left" style={{ paddingTop: "10px" }}>Credit Items</Divider>
                    <Form.List name="creditItem">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => {
                                    const creditItem = form.getFieldValue(["creditItem", name]) || {}
                                    return <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "accountsItemId"]}
                                                rules={[{ required: true, message: "Please select a Credit account" }]}>
                                                <Select placeholder="Select Credit Item">
                                                    {
                                                        creditAccountItem?.map((item: TAccountsItem, idx: number) => (
                                                            <Option key={idx} value={item?.id}>{item?.accountsItemName}</Option>
                                                        ))
                                                    }
                                                </Select>
                                            </Form.Item>
                                            {
                                                creditAccountItem?.find((item: TAccountsItem) => creditItem?.accountsItemId === item?.id)?.accountsItemName.toLowerCase() === "bank" &&
                                                <div className="-mt-4 rounded flex gap-2 items-center">
                                                    <Form.Item
                                                        style={{ margin: 0 }}
                                                        name={[name, "bankAccountId"]}
                                                        rules={[{ required: true, message: "required field" }]}
                                                        className="w-full">
                                                        <Select
                                                            placeholder="Select Bank"
                                                            {...restField}
                                                            disabled={isLoading}
                                                            options={banks} />
                                                    </Form.Item>
                                                </div>
                                            }
                                        </div>

                                        <Form.Item
                                            {...restField}
                                            name={[name, "amount"]}
                                            rules={[{ required: true, message: "Please enter amount" }]}
                                        >
                                            <Input type="number" placeholder="Amount" min={0} />
                                        </Form.Item>

                                        <div className="flex items-start gap-2">
                                            <Form.Item
                                                {...restField}
                                                name={[name, "narration"]}
                                                className="w-full"
                                            >
                                                <Input placeholder="Narration (optional)" />
                                            </Form.Item>
                                            <button onClick={() => remove(name)} className="text-white mt-1 rounded-full border cursor-pointer p-1.5 bg-black">
                                                <FaTrash />
                                            </button>

                                        </div>
                                    </div>
                                })}
                                <Form.Item>
                                    <button className="text-white bg-slate-900 w-full py-1 rounded-lg cursor-pointer"
                                        style={{ background: "ccc" }}
                                        type="button"
                                        onClick={() => add()}>
                                        Add Cedit Item
                                    </button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                    <div className="text-right font-bold text-lg mb-4 mt-5">
                        Total Credit Amount: {creditTotal ? creditTotal : 0}
                    </div>
                </div>
                <div className="bg-white shadow-md rounded-lg p-4 mt-5 pt-0">
                    <Divider orientation="left" style={{ paddingTop: "10px" }}>Debit Items</Divider>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
                        <b>Select Debit Item<span className="text-red-500 ml-2">*</span></b>
                        <b>Amount<span className="text-red-500 ml-2">*</span></b>
                        <b>Amount<span className="text-red-500 ml-2"></span></b>
                    </div>
                    <Form.List name="debitItem">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => {
                                    return <div key={key} className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Form.Item
                                            {...restField}
                                            name={[name, "accountsItemId"]}
                                            rules={[{ required: true, message: "Please select a debit account" }]}>
                                            <Select placeholder="Select debit Item">
                                                {
                                                    debitaccountItem?.map((item: TAccountsItem, idx: number) => (
                                                        <Option key={idx} value={item?.id}>{item?.accountsItemName}</Option>
                                                    ))
                                                }
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, "amount"]}
                                            rules={[{ required: true, message: "Please enter amount" }]}
                                        >
                                            <Input type="number" placeholder="Amount" min={0} />
                                        </Form.Item>

                                        <div className="flex items-start gap-2">
                                            <Form.Item
                                                {...restField}
                                                name={[name, "narration"]}
                                                className="w-full"
                                            >
                                                <Input placeholder="Narration (optional)" />
                                            </Form.Item>
                                            <button onClick={() => remove(name)} className="text-white mt-1 rounded-full border cursor-pointer p-1.5 bg-black">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                })}
                                <Form.Item>
                                    <button className="text-white bg-slate-900 w-full py-1 rounded-lg cursor-pointer"
                                        style={{ background: "ccc" }}
                                        type="button"
                                        onClick={() => add()}>
                                        Add Debit Item
                                    </button>
                                </Form.Item>
                                <div className="pr-3 text-right font-bold text-base -mt-3 flex justify-end">
                                    <p>Total Debit Amount</p>
                                    <p>: {grandDebitTotal ? grandDebitTotal : 0}</p>
                                </div>
                            </>
                        )}
                    </Form.List>

                    <div className="flex items-center justify-end gap-3">
                        <div>
                            {
                                grandDebitTotal !== creditTotal ?
                                    <h3>Debit or credit Required {(grandDebitTotal - creditTotal)}</h3>
                                    :
                                    <p className="font-bold text-green-700">Procced</p>
                            }
                        </div>
                        <Button type="primary" className="min-w-52" size="large" htmlType="submit" loading={isSubmitting} disabled={grandDebitTotal !== creditTotal}>
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </Button>
                    </div>
                </div>


            </Form>
            <PostSubmitModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                voucherNo={vaoucherNo}
                onNewVoucher={handleNewVoucher}
            />
        </div>
    );
};

export default PaymentVoucher;
