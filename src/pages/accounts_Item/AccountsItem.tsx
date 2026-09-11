/* eslint-disable @typescript-eslint/no-explicit-any */

import { FaEdit, FaTrash } from "react-icons/fa";
import CommonModal from "../../components/modals/CommonModal"
import { Button, Form, FormProps, Input, Select, Table } from 'antd';
import Column from "antd/es/table/Column";
import { useDeleteCategoryMutation } from "../../redux/features/category/category.api";
import { getResponse } from "../../utils/getResponse";
import { useState } from "react";
import { TAccountsItem, TPiller } from "../../types/types";
import Swal from "sweetalert2";
import { useCreateAccountItemMutation, useGetAccountItemQuery, useGetPillersQuery } from "../../redux/features/transactions/transactons.api";
import EditAccountsItem from "./EditAccountsItem";


const AccountsItem = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Removed unused state declaration
    const { data: accountite, isFetching, isLoading } = useGetAccountItemQuery({})
    const [isEditAccountitem, setIsEditAccountitem] = useState<TAccountsItem | null>(null);
    const [form] = Form.useForm();
    const accountItem = accountite?.data?.map((item: TAccountsItem) => {
        return {
            key: item?.id,
            ...item
        }
    })
    const { data } = useGetPillersQuery({})
    const ledger = data?.data;
    const ledgerHead = ledger?.map((piller: TPiller) => {
        return {
            key: piller?.id,
            value: piller?.headId,
            label: piller?.headName
        }
    })
    const [createAccountItem, { isLoading: isSubmitting }] = useCreateAccountItemMutation()
    // const [deleteCategory] = useDeleteCategoryMutation()


    const onFinish: FormProps['onFinish'] = async (values) => {
        const res = await createAccountItem(values)
        const data = getResponse(res)
        if (data?.success) {
            form.resetFields();         // ✅ Reset before closing
            setIsModalOpen(false);
        }
    };

  
    return (
        <div>
            <div className="flex items-center justify-between">
                <div className="bg-white rounded-lg px-4 py-2">
                    <h1 className="font-bold text-lg md:text-xl m-0">Accounts Items</h1>
                </div>
                <div>
                    <CommonModal title="Add Accounts Item" btnText="Add Accounts Item" isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} btnClass="bg-white py-1">
                        <Form
                            form={form}
                            name="basic"
                            layout="vertical"
                            // labelCol={{ span:  }}
                            wrapperCol={{ span: 24 }}
                            style={{ maxWidth: 600 }}
                            onFinish={onFinish}
                            autoComplete="off">
                            <Form.Item
                                label="Accounts Item Name"
                                name="accountsItemName"
                                rules={[{ required: true, message: 'Please account item name' }]}>
                                <Input placeholder="Accounts Item Name" />
                            </Form.Item>
                            <Form.Item
                                label="Account Head"
                                name="accountHeadId"
                                rules={[{ required: true, message: 'Please a Account head' }]}>
                                <Select options={ledgerHead} placeholder="Select Accounts Head" />
                            </Form.Item>
                            <Form.Item
                                label="Accounts Item Id"
                                name="accountsItemId"
                                rules={[{ required: true, message: 'Please input a Account Item id!' }]}>
                                <Input placeholder="Accounts Item Name" />
                            </Form.Item>
                            <Form.Item label={null}>
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
                <Table dataSource={accountItem} loading={isFetching || isLoading} className="" size="small">
                    <Column title="A.Item name" dataIndex="accountsItemName" className="font-bold" />
                    <Column
                        title="Account Head"
                        dataIndex="accountHead"
                        className="font-semibold"
                        render={(_, record) => record.accountHead?.headName} />
                    <Column
                        title="Account Item"
                        dataIndex="accountsItemId"
                        className="font-semibold" />
                    <Column title="Create Date" dataIndex="createdAt" render={(timestamp: string) => {
                        return <span>
                            {new Date(timestamp).toLocaleString()}
                        </span>
                    }} />
                    <Column title="Action" render={(item) => {
                        return <div className="flex gap-4">
                            <CommonModal btnText={<><FaEdit />Edit</>} isModalOpen={isEditAccountitem?.id === item?.id} setIsModalOpen={(state: any) => setIsEditAccountitem(state ? item : null)} title="Edit Accounts Item">
                                <EditAccountsItem item={item} setModalOpen={setIsEditAccountitem} />
                            </CommonModal>
                            {/* <button onClick={() => handleDelete(item?.id)} className="hover:text-white cursor-pointer flex items-center gap-1 bg-gray-300 p-1 px-2 rounded hover:bg-slate-500"><FaTrash />Delete</button> */}
                        </div>
                    }} />
                </Table>
            </div >
        </div >
    )
}

export default AccountsItem