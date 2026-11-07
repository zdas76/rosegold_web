/* eslint-disable @typescript-eslint/no-explicit-any */
import { FaEdit, FaTrash } from "react-icons/fa";
import CommonModal from "../../../components/modals/CommonModal"
import { Button, Form, FormProps, Input, Table } from 'antd';
import Column from "antd/es/table/Column";
import { getResponse } from "../../../utils/getResponse";
import { useState } from "react";
import { TCategory, TUnit } from "../../../types/types";
import EditUnit from "./EditLogs";
import Swal from "sweetalert2";
import { useCreateLogMutation, useGetLogsQuery } from "../../../redux/features/logAndGrade/LogAndGrade.api";
import { toast } from "sonner";

const LogCategory = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: log, isFetching, isLoading } = useGetLogsQuery({})
    const [isEditModal, setIsEditModal] = useState<TUnit | null>();
    const [createLog, { isLoading: isSubmitting }] = useCreateLogMutation()

    const [form] = Form.useForm()

    const allLogs = log?.data?.map((item: TCategory, idx: number) => {
        return {
            ...item,
            key: idx
        }
    })
    const onFinish: FormProps['onFinish'] = async (values) => {
        const res = await createLog(values)
        const data = getResponse(res)
        if (data?.success) {
            form.resetFields()
            setIsModalOpen(false)
        }
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#C58D2F",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                toast.error(`${id} delete is not implemented`)
            }
        });
    }
    return (
        <div className="">
            <div className="flex items-center justify-between">
                <div className="bg-white rounded-lg px-4 py-2">
                    <h1 className="font-bold text-lg md:text-xl m-0">Logs</h1>
                </div>
                <div>
                    <CommonModal title="Create Logs" btnClass="px-4 bg-white py-2" btnText="Create Logs" isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
                        <Form
                            name="basic"
                            layout="vertical"
                            // labelCol={{ span: 24 }}
                            wrapperCol={{ span: 18 }}
                            // style={{ maxWidth: 600 }}
                            initialValues={{ remember: true }}
                            onFinish={onFinish}>
                            <Form.Item
                                label="Logs Name"
                                name="name"
                                rules={[{ required: true, message: 'Please input your username!' }]}>
                                <Input placeholder="Logs name" />
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
            <div className="bg-white p-4 pb-1 rounded mt-2">
                <Table dataSource={allLogs} loading={isFetching || isLoading} className="" size="small">
                    <Column title="Log Name" dataIndex="name" className="font-semibold" />
                    <Column title="Create Date" dataIndex="createdAt" render={(timestamp: string) => {
                        return <span>
                            {new Date(timestamp).toLocaleString()}
                        </span>
                    }} />
                    <Column title="Action" render={(item) => {
                        return <div className="flex gap-4">
                            <CommonModal btnText={<><FaEdit />Edit</>} isModalOpen={isEditModal?.id === item?.id} setIsModalOpen={(state: any) => setIsEditModal(state ? item : null)} title="Edit Logs">
                                <EditUnit item={item} setIsEditModal={setIsEditModal} />
                            </CommonModal>
                            <button onClick={() => handleDelete(item?.id)} className="hover:text-white cursor-pointer flex items-center gap-1 bg-gray-300 p-1 px-2 rounded hover:bg-slate-500"><FaTrash />Delete</button>
                        </div>
                    }} />

                </Table>
            </div >
        </div >
    )
}

export default LogCategory