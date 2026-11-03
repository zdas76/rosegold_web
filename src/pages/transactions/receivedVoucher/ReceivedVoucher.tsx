/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { Form, Input, Button, DatePicker, Select, Divider, } from "antd";
import { MinusCircleOutlined } from "@ant-design/icons";
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

const { Option } = Select;
interface Item {
    accountsItemId: number;
    amount: number;
    narration?: string;
}
interface ReceivedVoucherData {
    date: string;
    voucherNo: string;
    partyType: string;
    partyId: number;
    debitItem: Item[];
    creditItem: Item[];
}
export type TDebitItem = {
    accountsItemId: number;
    bankId?: number; // <-- Optional field
    amount: number;
    narration?: string;
}
export type TCreditItem = {
    accountsItemId: number;
    bankId?: number;
    amount: number;
    narration?: string;
    id?: number; // Optional field for existing items
}
const ReceivedVoucher: React.FC = () => {
    const [form] = Form.useForm();
    const [totalDebitAmount, settotalDebitAmount] = useState(0)
    const [creditTotalAmount, setCreditToalAmount] = useState(0)
    const [receiveVoucherCode, setReceiveVoucherCode] = useState(generateInvoiceNumber("RV"))
    const [total, setTotal] = React.useState<number>(0);
    const [partyType, setPartyType] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: party, isLoading } = useGetPartiesQuery({ partyType: partyType })

    const parties = party?.data?.map((item: TParty) => ({
        ...item,
        key: item?.id,
        value: item?.id,
        label: item?.name,
    }));


    const { data: banks, isLoading: isBanksLoading } = useGetBankQuery({})
    const allBanks = banks?.data?.map((item: TBankAccount) => {
        return {
            key: item?.id,
            value: item?.id,
            label: `${item?.bankName} (${item?.accountNumber})`,
            ...item
        }
    })
    const [createReceviveVoucher, { isLoading: isSubmitting }] = useCreateReceiveVoucherMutation()
    const { data: debitAccountsData, isLoading: isDebitAccountsLoading } = useGetAccountItemQuery({ accountMainPillerId: ["01"] })
    const debitAccountsItems = debitAccountsData?.data;

    const { data: CreditAccountsData, isLoading: isCreditAccountsLoading } = useGetAccountItemQuery({ accountMainPillerId: ["01", "02"] })

    const calculateTotal = (values: any) => {
        const items = values?.creditItem || [];
        const totalAmount = items?.reduce((sum: number, item: any) => sum + (Number(item?.amount) || 0), 0);
        setTotal(totalAmount);
    };
    const onValuesChange = (_: any, allValues: any) => {
        calculateTotal(allValues);
    };
    // calculation of total
    const debitItems: TDebitItem[] = Form.useWatch('debitItem', form)
    const creditITems: TCreditItem[] = Form.useWatch('creditItem', form)
    const debitTotal = useMemo(() => {
        return debitItems?.reduce((total: number, item: TDebitItem) => {
            const amount = Number(item?.amount || 0); // fallback to 0 if empty
            return total + amount;
        }, 0) ?? 0;
    }, [debitItems]);
    useEffect(() => {
        settotalDebitAmount(debitTotal);
    }, [debitTotal]);

    // credit total
    const creditTotal = useMemo(() => {
        return creditITems?.reduce((total: number, item: TCreditItem) => {
            const amount = total + Number(item?.amount || 0)
            return amount
        }, 0) ?? 0;

    }, [creditITems])

    useEffect(() => {
        setCreditToalAmount(creditTotal)
    }, [creditTotal])

    if (isLoading || isBanksLoading || isDebitAccountsLoading || isCreditAccountsLoading) {
        return <Loading tip="Loading Received Voucher details..." />;
    }

    const creditItems = CreditAccountsData?.data?.map((item: TAccountsItem) => ({
        ...item,
        key: item.id,
        value: item.id,
        label: item.accountsItemName,
    }));

    const onFinish = async (values: ReceivedVoucherData) => {
        const res = await createReceviveVoucher({ ...values, voucherNo: receiveVoucherCode })
        const result = getResponse(res)
        if (result?.success) {
            setIsModalOpen(true);
        };
    }

    const handleNewVoucher = () => {
        form.resetFields();
        const newVoucherno = generateInvoiceNumber("RV");
        setReceiveVoucherCode(newVoucherno);
        setIsModalOpen(false);
    };


    return (
        <div className="rounded-2xl">
            <div className="bg-white rounded-lg px-4 py-2 mb-3">
                <h2 className="text-2xl font-semibold m-0">Received Voucher</h2>
            </div>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={onValuesChange}
                initialValues={{
                    date: dayjs(new Date()),
                    debitItem: [{}],
                    creditItem: [{}],
                }}>
                <div className="bg-white  p-4 rounded grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <Form.Item name="partyType" label="Party Type" rules={[{ required: true, message: "Please select a party" }]}>
                        <Select placeholder="Select party" onChange={(value) => {
                            setPartyType(value)
                        }}>
                            <Option value={"VENDOR"}>Vendor</Option>
                            <Option value={"DISTRIBUTOR"}>Distributor</Option>
                            <Option value={"PARTY"}>Party</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="partyId" label="Party" rules={[{ required: true, message: "Please select a party" }]}>
                        <Select placeholder="Select party" disabled={isLoading}>
                            {
                                partyType && parties?.map((item: TParty) => (
                                    <Option key={item?.id} value={item?.id}>{item?.name}</Option>
                                ))
                            }
                        </Select>
                    </Form.Item>

                    <Form.Item label="Voucher No" rules={[{ required: true, message: "Please enter voucher number" }]}>
                        <Input placeholder="Enter voucher number" disabled value={receiveVoucherCode} style={{ color: "#000" }} />
                    </Form.Item>

                    <Form.Item name="date" label="Date" rules={[{ required: true, message: "Please select date" }]}>
                        <DatePicker className="w-full" />
                    </Form.Item>


                </div>

                <div className="mb-5 bg-white shadow-md rounded-lg p-3 pt-0">
                    <Divider orientation="left" style={{ paddingTop: "10px" }}>Debit Items</Divider>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 px-3">
                        <b>Select Debit Item <span className="text-red-500">*</span></b>
                        <b>Amount <span className="text-red-500">*</span></b>
                        <b>Narration<span className="text-red-500"></span></b>
                    </div>
                    <Form.List name="debitItem">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => {
                                    const salesItem = form.getFieldValue(["debitItem", name]) || {};
                                    return <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-x-5 mt-2">
                                        <div>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "accountsItemId"]}
                                                rules={[{ required: true, message: "Please debit item" }]}>
                                                <Select placeholder="Select debit item">
                                                    {
                                                        debitAccountsItems?.map((item: TAccountsItem) => (
                                                            <Option key={item?.id} value={item?.id}>{item?.accountsItemName}</Option>
                                                        ))
                                                    }
                                                </Select>
                                            </Form.Item>
                                            {
                                                debitAccountsItems?.find((item: TAccountsItem) => salesItem?.accountsItemId === item?.id)?.accountsItemName.toLowerCase() === "bank" &&
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
                                                            options={allBanks} />
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
                                            <MinusCircleOutlined onClick={() => remove(name)} className="text-red-500 mt-2 cursor-pointer" />
                                        </div>
                                    </div>
                                }
                                )}
                                <Form.Item>
                                    <button className="text-white bg-slate-900 w-full py-1 rounded-lg cursor-pointer"
                                        style={{ background: "ccc" }}
                                        type="button"
                                        onClick={() => add()}>
                                        Add Debit Item
                                    </button>
                                </Form.Item>

                            </>
                        )}
                    </Form.List>
                    <div className="text-right font-bold -mt-3 text-base">
                        <b>Total Debit: {totalDebitAmount}</b>
                    </div>
                </div>

                <div className="mb-5 bg-white shadow-md rounded-lg p-3 pt-0">
                    <Divider orientation="left" style={{ paddingTop: "10px" }}>Credit Items</Divider>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 px-3">
                        <b>Select Credit Item <span className="text-red-500">*</span></b>
                        <b>Amount <span className="text-red-500">*</span></b>
                        <b>Narration<span className="text-red-500"></span></b>
                    </div>
                    <Form.List name="creditItem">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-x-5 mt-2">
                                        <Form.Item
                                            {...restField}
                                            name={[name, "accountsItemId"]}
                                            rules={[{ required: true, message: "Please select debit item" }]}>
                                            <Select placeholder="Select Cedit item">
                                                {
                                                    creditItems?.map((item: TAccountsItem) => (
                                                        <Option key={item?.id} value={item?.id}>{item?.accountsItemName}</Option>
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
                                            <MinusCircleOutlined onClick={() => remove(name)} className="text-red-500 mt-2 cursor-pointer" />
                                        </div>
                                    </div>
                                ))}
                                <Form.Item>
                                    <button className="text-white bg-slate-900 w-full py-1 rounded-lg cursor-pointer"
                                        style={{ background: "ccc" }}
                                        type="button"
                                        onClick={() => add()}>
                                        Add Credit Item
                                    </button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                    <div className="text-right font-bold -mt-3 text-base">
                        Total Credit: {total}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4">

                    <div className="">
                        {
                            creditTotalAmount !== totalDebitAmount ?
                                <h3 className="font-bold text-sm text-slate-900">Debit or credit Difference {creditTotalAmount - totalDebitAmount}</h3>
                                :
                                <p className="text-green-600" style={{ fontSize: "15px", padding: "5px" }}>Procced</p>
                        }

                    </div>
                    <Button type="primary" size="middle" htmlType="submit" loading={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                </div>
            </Form>
            <PostSubmitModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                voucherNo={receiveVoucherCode}
                onNewVoucher={handleNewVoucher}
            />
        </div>
    );
};

export default ReceivedVoucher;
