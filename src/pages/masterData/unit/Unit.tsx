/* eslint-disable @typescript-eslint/no-explicit-any */
import { FaEdit, FaTrash } from "react-icons/fa";
import CommonModal from "../../../components/modals/CommonModal";
import { Button, Form, FormProps, Input, Table } from 'antd';
import Column from "antd/es/table/Column";
import { getResponse } from "../../../utils/getResponse";
import { useState } from "react";
import { TCategory, TUnit } from "../../../types/types";
import { useCreateUnitMutation, useDeleteUnitMutation, useGetUnitsQuery } from "../../../redux/features/unit/unit.api";
import EditUnit from "./EditUnit";
import Swal from "sweetalert2";

const Unit = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteUnit] = useDeleteUnitMutation();
    const { data: units, isFetching, isLoading } = useGetUnitsQuery({});
    const [isEditModal, setIsEditModal] = useState<TUnit | null>();
    const [createUnit, { isLoading: isSubmitting }] = useCreateUnitMutation();
    const unit = units?.data;
    const [form] = Form.useForm();

    const unitData = unit?.map((item: TCategory, idx: number) => {
        return {
            ...item,
            key: idx + 1
        };
    });

    const onFinish: FormProps['onFinish'] = async (values) => {
        const res = await createUnit(values);
        const data = getResponse(res);
        if (data?.success) {
            form.resetFields();
            setIsModalOpen(false);
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
                const data = await deleteUnit(id);
                getResponse(data);
            }
        });
    };

    return (
        <div className="">
            <div className="flex items-center justify-between">
                <div className="bg-white rounded-lg px-4 py-2">
                    <h1 className="font-bold text-lg md:text-xl m-0">Unit</h1>
                </div>
                <div>
                    <CommonModal title="Add Unit" btnClass="px-4 bg-white py-2" btnText="Add a Unit" isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
                        <Form
                            form={form}
                            name="basic"
                            layout="vertical"
                            wrapperCol={{ span: 18 }}
                            initialValues={{ remember: true }}
                            onFinish={onFinish}>
                            <Form.Item
                                label="Unit Name"
                                name="name"
                                rules={[{ required: true, message: 'Please input unit name!' }]}>
                                <Input placeholder="Unit name" />
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
            {/* display units */}
            <div className="mt-4 bg-white p-4 rounded-md shadow-md pb-1">
                <Table dataSource={unitData} loading={isFetching || isLoading} className="" size="small">
                    <Column title="No" dataIndex="key" key="key" className="font-bold" width={60} />
                    <Column title="Unit Name" dataIndex="name" key="name" className="font-semibold" />
                    <Column title="Create Date" dataIndex="createdAt" key="createdAt" render={(timestamp: string) => {
                        return <span>
                            {new Date(timestamp).toLocaleString()}
                        </span>
                    }} />
                    <Column title="Action" render={(item) => {
                        return <div className="flex gap-4">
                            <CommonModal btnText={<><FaEdit />Edit</>} isModalOpen={isEditModal?.id === item?.id} setIsModalOpen={(state: any) => setIsEditModal(state ? item : null)} title="Edit Unit">
                                <EditUnit item={item} setIsEditModal={setIsEditModal} />
                            </CommonModal>
                            <button onClick={() => handleDelete(item?.id)} className="hover:text-white cursor-pointer flex items-center gap-1 bg-gray-300 p-1 px-2 rounded hover:bg-slate-500"><FaTrash />Delete</button>
                        </div>
                    }} />
                </Table>
            </div>
        </div>
    );
};

export default Unit;
