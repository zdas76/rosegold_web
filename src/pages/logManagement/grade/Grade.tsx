/* eslint-disable @typescript-eslint/no-explicit-any */
import { FaEdit, FaTrash } from "react-icons/fa";
import CommonModal from "../../../components/modals/CommonModal"
import { Form, InputNumber, Button, FormProps, Table, Select } from 'antd';
import Column from "antd/es/table/Column";
import { getResponse } from "../../../utils/getResponse";
import { useState } from "react";
import { TGrade, TLogs, } from "../../../types/types";

import Swal from "sweetalert2";
import { useCreateGradeMutation, useGetGradesQuery, useGetLogsQuery, } from "../../../redux/features/logAndGrade/LogAndGrade.api";
import { toast } from "sonner";
import EditGrades from "./EditGrade";
const { Option } = Select;

const Grade = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: grade, isFetching, isLoading } = useGetGradesQuery({})
    const { data: log } = useGetLogsQuery({})
    const [isEditModal, setIsEditModal] = useState<TGrade | null>();
    const [createGrade, { isLoading: isSubmitting }] = useCreateGradeMutation()
    const grades = grade?.data;
    const [form] = Form.useForm()
    const allGrades = grades?.map((item: TGrade, idx: number) => {
        return {
            ...item,
            key: idx
        }
    })


    const onFinish: FormProps['onFinish'] = async (values) => {
        const res = await createGrade(values)
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
                    <h1 className="font-bold text-lg md:text-xl m-0">Grade</h1>
                </div>
                <div>
                    <CommonModal title="Create Grade" btnClass="px-4 bg-white py-2" btnText="Create Grade" isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}>
                            <Form.Item
                                label="Log Category ID"
                                name="categoryId"
                                rules={[{ required: true, message: 'Please enter Category ID' }]}>
                                <Select placeholder="Select Product" className="w-full">
                                    {
                                        log?.data?.map((item: TLogs) => (
                                            <Option value={item?.id} key={item?.id}>{item?.name}</Option>
                                        ))
                                    }
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="Grade Name"
                                name="gradeName"
                                rules={[{ required: true, message: 'Please select a Grade Name' }]}>
                                <Select className="w-full" placeholder="Select a grade">
                                    {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((grade) => (
                                        <Option key={grade} value={grade}>
                                            {grade}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Min Radius"
                                name="minRadius"
                                rules={[{ required: true, message: 'Please enter Min Radius' }]}
                            >
                                <InputNumber className="w-full" style={{ width: "100%" }} />
                            </Form.Item>

                            <Form.Item
                                label="Max Radius"
                                name="maxRadius"
                                rules={[
                                    { required: true, message: 'Please enter Max Radius' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const minRadius = getFieldValue("minRadius");
                                            if (value === undefined || minRadius === undefined) {
                                                return Promise.resolve(); // Let the required rule handle this
                                            } if (value > minRadius) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Max Radius must be greater than Min Radius'));
                                        }
                                    })
                                ]}
                            >
                                <InputNumber className="w-full" style={{ width: "100%" }} />
                            </Form.Item>

                            <Form.Item
                                label="Unit Price"
                                name="unitPrice"
                                rules={[{ required: true, message: 'Please enter Unit Price' }]}
                            >
                                <InputNumber className="w-full" style={{ width: "100%" }} />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="w-full" loading={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : "Submit"}
                                </Button>
                            </Form.Item>
                        </Form>
                    </CommonModal>
                </div>
            </div>
            {/* display employes */}
            <div className="mt-2 bg-white p-3 rounded-lg pb-1">
                <Table dataSource={allGrades} loading={isFetching || isLoading} className="" size="small">
                    <Column title="Category Name" dataIndex="logCategory" className="font-semibold"
                        render={(logCategory) => <span>{logCategory?.name}</span>}
                    />
                    <Column title="Grade Name" dataIndex="gradeName" className="font-semibold" />
                    <Column title="Min Radius" dataIndex="minRadius" className="font-semibold" />
                    <Column title="Max Radius" dataIndex="maxRadius" className="font-semibold" />
                    <Column title="Unit Price" dataIndex="unitPrice" className="font-semibold" />
                    <Column title="Create Date" dataIndex="createdAt" render={(timestamp: string) => {
                        return <span>
                            {new Date(timestamp).toLocaleString()}
                        </span>
                    }} />
                    <Column title="Action" render={(item) => {
                        return <div className="flex gap-4">
                            <CommonModal btnText={<><FaEdit />Edit</>} isModalOpen={isEditModal?.id === item?.id} setIsModalOpen={(state: any) => setIsEditModal(state ? item : null)} title="Edit Logs">
                                <EditGrades item={item} setIsEditModal={setIsEditModal} />
                            </CommonModal>
                            <button onClick={() => handleDelete(item?.id)} className="hover:text-white cursor-pointer flex items-center gap-1 bg-gray-300 p-1 px-2 rounded hover:bg-slate-500"><FaTrash />Delete</button>
                        </div>
                    }} />

                </Table>
            </div >
        </div >
    )
}

export default Grade