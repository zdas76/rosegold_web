/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, Input, Select, Button, DatePicker, InputNumber } from 'antd';
import { useGetAccountItemQuery } from '../../../redux/features/transactions/transactons.api';
import { formateData } from '../../../utils/getFormateData';
import { useGetPartiesQuery } from '../../../redux/features/auth/authApi';
import { generateInvoiceNumber } from '../../../utils/generateRandomNumber';
import { useState } from 'react';
import { TAccountsItem } from '../../../types/types';
import { useGetBankQuery } from '../../../redux/features/bank/bank.api';
import { useAddJournalVoucherMutation } from '../../../redux/features/journal/journal.api';
import { getResponse } from '../../../utils/getResponse';
import PostSubmitModal from '../../../components/shared/PostSubmitModal';
import Loading from '../../../components/shared/Loading';

const ContraVoucher = () => {
    const [setSelectedDebitAccountItem, setSetSelectedDebitAccountItem] = useState()
    const [selectedAccountItemId, setSelectedAccountItem] = useState()
    const [addJournal, { isLoading: isSubmitting }] = useAddJournalVoucherMutation()
    const { data, isLoading: isAccountItemsLoading } = useGetAccountItemQuery({ accountMainPillerId: ["01", "04"] })
    const formatedValue = formateData(data?.data, "accountsItemName")
    const { data: banks, isLoading: isBanksLoading } = useGetBankQuery({})
    const allBanks = formateData(banks?.data, "bankName")
    const { data: party, isLoading: isPartyLoading } = useGetPartiesQuery({})
    const partyData = formateData(party?.data, "name")

    const [voucherNo, setVoucherNo] = useState(generateInvoiceNumber("JV"))
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    if (isAccountItemsLoading || isBanksLoading || isPartyLoading) {
        return <Loading tip="Loading Journal Voucher details..." />;
    }

    const onFinish = async (values: any) => {
        const data = {
            ...values,
            voucherNo,
        }
        const res = await addJournal(data)
        const result = getResponse(res)
        if (result?.success) {
            setIsModalOpen(true);
        }
    };

    const handleNewVoucher = () => {
        setVoucherNo(generateInvoiceNumber("JV"));
        form.resetFields();
        setIsModalOpen(false);
    };


    return (
        <div className='p-6 bg-white rounded-lg'>
            <h2 className="text-2xl font-semibold mb-6">Journal Voucher</h2>
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
                            <Select placeholder="Select a debit item" options={formatedValue} onChange={(value) => {
                                setSetSelectedDebitAccountItem(value)
                            }} />
                        </Form.Item>
                        {
                            formatedValue?.find((item: TAccountsItem) => item?.id === setSelectedDebitAccountItem)?.accountsItemName.toLowerCase() === "bank" &&
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
                            <Select placeholder="Select a debit item" options={formatedValue} onChange={(value) => {
                                setSelectedAccountItem(value)
                            }} />
                        </Form.Item>
                        {
                            formatedValue?.find((item: TAccountsItem) => item?.id === selectedAccountItemId)?.accountsItemName.toLowerCase() === "bank" &&
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
                        rules={[{ required: true, message: 'Please enter an amount' }]}>
                        <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            placeholder="Enter amount" />
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
