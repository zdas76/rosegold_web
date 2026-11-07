/* eslint-disable @typescript-eslint/no-explicit-any */
import CommonModal from "../../components/modals/CommonModal"
import { Button, DatePicker, Form, Input, InputNumber, Table } from 'antd';

import { getResponse } from "../../utils/getResponse";
import { useState } from "react";
import { useAdBankMutation, useGetBankQuery } from "../../redux/features/bank/bank.api";
import { FaEdit } from "react-icons/fa";
import { TBankAccount } from "../../types/types";
import EditBank from "./EditBank";

const BankAccount = () => {
    const { Column } = Table
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [eidtBank, setEditBank] = useState<TBankAccount | null>(null)
    const [form] = Form.useForm();
    const [addBank, { isLoading: isSubmitting }] = useAdBankMutation()
    const { data: bank, isFetching, isLoading } = useGetBankQuery({})

    const bankData = bank?.data?.map((item: TBankAccount, idx: number) => {
        return {
            key: idx,
            ...item,
        }
    })

    console.log(bankData)

    const onFinish = async (values: any) => {
        const res = await addBank(values)
        if (res?.data?.success) {
            setIsModalOpen(false)
        }
    };

    // delete bank
    // const handleDelete = (id: number) => {
    //     Swal.fire({
    //         title: "Are you sure?",
    //         text: "You won't be able to revert this!",
    //         icon: "warning",
    //         showCancelButton: true,
    //         confirmButtonColor: "#3085d6",
    //         cancelButtonColor: "#d33",
    //         confirmButtonText: "Yes, delete it!"
    //     }).then(async (result) => {
    //         if (result.isConfirmed) {
    //             const data = await deleteCategory(id)
    //             getResponse(data)
    //             console.log(data)
    //         }
    //     });
    // }

    return (
        <div>
            <div className="flex items-center justify-between border-slate-200 border-b pb-3">
                <div className="bg-white rounded-lg px-4 py-2">
                    <h1 className="font-bold text-lg md:text-xl m-0">Bank info</h1>
                </div>
                <div>
                    <CommonModal title="Add Bank info" btnText="Add Bank" btnClass="px-3 bg-white py-2 md:text-md" isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}>
                            <Form.Item
                                label="Bank Name"
                                name="bankName"
                                rules={[{ required: true, message: "Please enter the bank name" }]}>
                                <Input placeholder="Bank name" />
                            </Form.Item>
                            <Form.Item
                                label="Branch Name"
                                name="branceName"
                                rules={[{ required: true, message: "Please enter the branch name" }]}>
                                <Input placeholder="Branch name" />
                            </Form.Item>
                            <Form.Item
                                label="Account Number"
                                name="accountNumber"
                                rules={[{ required: true, message: "Please enter the account number" }]}>
                                <Input placeholder="Account Number" />
                            </Form.Item>

                            <Form.Item
                                label="Initial Amount"
                                name="initalAmount"
                                rules={[{ required: true, message: "Please enter the closing amount" }]}
                            >
                                <InputNumber style={{ width: "100%" }} placeholder="Provide initial balance" />
                            </Form.Item>

                            <Form.Item
                                label="Opening Balance Date"
                                name="date"
                                rules={[{ required: true, message: "Please select a date" }]}>
                                <DatePicker placeholder="Select Deposite date" format="YYYY-MM-DD" style={{ width: "100%" }} />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : "Submit"}
                                </Button>
                            </Form.Item>
                        </Form>
                    </CommonModal>
                </div>
            </div>
            {/* display employes */}
            <div className="mt-4 bg-white p-4 rounded-md shadow-md pb-1">
                <Table rowClassName={""} dataSource={bankData} loading={isFetching || isLoading} className="" size="small">
                    <Column title="Bank name" dataIndex="bankName" className="font-semibold" />
                    <Column title="Branch Name" dataIndex="branceName" className="" />
                    <Column title="Account No." dataIndex="accountNumber" className="" />
                    <Column title="Date No." dataIndex="createdAt" render={(timestamp: string) => {
                        return <span>
                            {new Date(timestamp).toLocaleString()}
                        </span>
                    }} />
                    <Column title="Action" render={(item) => {
                        return <div className="flex gap-4">
                            <CommonModal btnText={<><FaEdit />Edit</>} isModalOpen={eidtBank?.id === item?.id} setIsModalOpen={(state: any) => setEditBank(state ? item : null)} title="Edit Bank">
                                {
                                    eidtBank &&
                                    <EditBank item={item} setOpenModal={() => setEditBank(null)} />
                                }
                            </CommonModal>
                            {/* <button className="hover:text-white cursor-pointer flex items-center gap-1 bg-gray-300 p-1 px-2 rounded hover:bg-slate-500"><FaTrash />Delete</button> */}
                        </div>
                    }} />

                </Table>
            </div >
        </div >
    )
}

export default BankAccount