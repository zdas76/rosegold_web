/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, Input, Select, Button, DatePicker, InputNumber } from 'antd';
import { useGetAccountItemQuery } from '../../../redux/features/transactions/transactons.api';
import { formateData } from '../../../utils/getFormateData';
import { useGetPartiesQuery } from '../../../redux/features/auth/authApi';
import { generateInvoiceNumber } from '../../../utils/generateRandomNumber';
import { useState } from 'react';
import { TAccountsItem } from '../../../types/types';
import { useGetBankQuery } from '../../../redux/features/bank/bank.api';
import { useAddContraVoucherMutation } from '../../../redux/features/journal/journal.api';
import { getResponse } from '../../../utils/getResponse';
import PostSubmitModal from '../../../components/shared/PostSubmitModal';

const ContraVoucher = () => {
    const [setSelectedDebitAccountItem, setSetSelectedDebitAccountItem] = useState()
    const [selectedAccountItemId, setSelectedAccountItem] = useState()
    const [selectedDebitItem, setSelectedDebitItem] = useState();
    const [selectedCreditItem, setSelectedCreditItem] = useState();
    const [addContra, { isLoading: isSubmitting }] = useAddContraVoucherMutation()

    const { data } = useGetAccountItemQuery({ accountMainPillerId: ["01"] })
    const formatedValue = formateData(data?.data, "accountsItemName")


    const { data: banks } = useGetBankQuery({})
    const allBanks = formateData(banks?.data, "bankName")


    const debitAccountItem = formatedValue?.filter((item: TAccountsItem) => {
        const accountItemsName = item?.accountsItemName.toLowerCase();
        if (
            accountItemsName === "cash" ||
            accountItemsName === "bank" ||
            accountItemsName === "cheque"
        ) {
            return item;
        }
    })?.filter(item => item?.id !== selectedCreditItem)

    const creditAccountItem = formatedValue?.filter((item: TAccountsItem) => {
        const accountItemsName = item?.accountsItemName.toLowerCase();
        if (
            accountItemsName === "cash" ||
            accountItemsName === "bank" ||
            accountItemsName === "cheque"
        ) {
            return item;
        }
    })?.filter(item => item?.id !== selectedDebitItem)

    const { data: party } = useGetPartiesQuery({})
    const partyData = formateData(party?.data, "name")
    const [voucherNo, setvoucherNo] = useState(generateInvoiceNumber("CV"))
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();


    const onFinish = async (values: any) => {
        const data = {
            ...values,
            voucherNo,
        }
        const res = await addContra(data);
        const result = getResponse(res)
        if (result?.success) {
            setIsModalOpen(true);
        }
    };

    const handleNewVoucher = () => {
        setvoucherNo(generateInvoiceNumber("CV"));
        form.resetFields();
        setIsModalOpen(false);
    };
    const handlePrint = () => {
        console.log("Print Voucher");
        setIsModalOpen(false);
    };

    return (
        <div className='p-6 bg-white rounded-2xl'>
            <h2 className="text-2xl font-semibold mb-6">Contra Voucher</h2>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="bg-white p-6 rounded-md mx-auto"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 custom-margin-5px ">
                    {/* Select Party (optional) */}
                    <Form.Item name="party" label="Select Party">
                        <Select placeholder="Select a debit item" options={partyData} />
                    </Form.Item>

                    {/* Date (required) */}
                    <Form.Item
                        name="date"
                        label="Date"
                        rules={[{ required: true, message: 'Please select a date' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    {/* Voucher No. (optional) */}
                    <Form.Item label="Voucher No.">
                        <Input placeholder="Enter voucher number" value={voucherNo} readOnly />
                    </Form.Item>

                    {/* Debit Item (required) */}
                    <div className='flex flex-col'>
                        <Form.Item
                            name="debitItem"
                            style={{ width: "100%" }}
                            label="Select Debit Item"
                            rules={[{ required: true, message: 'Please select a debit item' }]}
                        >
                            <Select placeholder="Select a debit item" options={debitAccountItem} onChange={(value) => {
                                setSetSelectedDebitAccountItem(value)
                                setSelectedDebitItem(value)
                            }} />
                        </Form.Item>
                        {
                            debitAccountItem?.find((item: TAccountsItem) => item?.id === setSelectedDebitAccountItem)?.accountsItemName.toLowerCase() === "bank" &&
                            <Form.Item name={"debitBankId"}
                                rules={[{ required: true, message: 'Please select a debit item' }]}
                                style={{ width: "100%" }}
                            >
                                <Select placeholder="Select a debit item" options={allBanks} />
                            </Form.Item>
                        }
                    </div>


                    <div className='flex flex-col'>
                        <Form.Item
                            name="creditItem"
                            style={{ width: "100%", }}
                            label="Select Credit Item"
                            rules={[{ required: true, message: 'Please select a credit item' }]}
                        >
                            <Select placeholder="Select a debit item" options={creditAccountItem} onChange={(value) => {
                                setSelectedAccountItem(value)
                                setSelectedCreditItem(value)
                            }} />
                        </Form.Item>
                        {
                            creditAccountItem?.find((item: TAccountsItem) => item?.id === selectedAccountItemId)?.accountsItemName.toLowerCase() === "bank" &&
                            <Form.Item name={"creditBankId"}
                                rules={[{ required: true, message: 'Please select a debit item' }]}
                                style={{ width: "100%", margin: 0, padding: 0 }}
                            >
                                <Select placeholder="Select a debit item" options={allBanks} />
                            </Form.Item>
                        }
                    </div>
                    {/* Credit Item (required) */}
                    {/* <Form.Item
                        name="creditItem"
                        label="Select Credit Item"
                        rules={[{ required: true, message: 'Please select a credit item' }]}
                    >
                        <Select placeholder="Select a debit item" options={creditAccountItem} onChange={(value) => setSelectedCreditItem(value)} />
                    </Form.Item> */}

                    {/* Amount (required) */}
                    <Form.Item
                        name="amount"
                        label="Amount"
                        rules={[{ required: true, message: 'Please enter an amount' }]}
                    >
                        <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            placeholder="Enter amount"
                        />
                    </Form.Item>

                    {/* Narration (optional) */}
                    <Form.Item name="narration" label="Narration" className="md:col-span-3">
                        <Input.TextArea placeholder="Enter narration" rows={3} />
                    </Form.Item>
                </div>

                <div className='mt-4'>
                    <Form.Item className="text-right mt-4">
                        <Button type="primary" htmlType="submit" size='middle' loading={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit Entry"}
                        </Button>
                    </Form.Item>
                </div>
            </Form>
            <PostSubmitModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                voucherNo={voucherNo}
                onNewVoucher={handleNewVoucher}
            />
        </div>
    );
};
export default ContraVoucher;
