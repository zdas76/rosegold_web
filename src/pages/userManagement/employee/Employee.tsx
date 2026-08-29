/* eslint-disable @typescript-eslint/no-explicit-any */
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import AddEmployeeForm from "./AddEmployeeForm"
import { Button, Table, Tag } from 'antd';
import Column from "antd/es/table/Column";
import { useState } from "react";
import { TEmployee, TUser } from "../../../types/types";
import { useDeleteEmployeeMutation, useGetEmployeeQuery } from "../../../redux/features/auth/authApi";
import CommonModal from "../../../components/modals/CommonModal";
import { imageBaseUrl } from "../../../redux/api/imageBaseurl";
import EditEmployee from "./EditEmployeeForm";
import Swal from "sweetalert2";
import { getResponse } from "../../../utils/getResponse";

const Employee = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editEmployeeData, setEditEmployeeData] = useState<TEmployee | null>(null)
    const { data: employee, isFetching, isLoading } = useGetEmployeeQuery({})
    const [deleteEmployee] = useDeleteEmployeeMutation()
    const user = employee?.data?.data;

    const tableData = user?.map((item: TUser, idx: number) => {
        return {
            key: idx,
            photo: item?.employee?.photo,
            name: item?.employee?.name,
            address: item?.employee?.address,
            ...item
        }
    });

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
                const res = await deleteEmployee(id);
                getResponse(res);

            }
        });
    }
    return (
        <div>
            <div className="flex items-center justify-between">
                <div className="bg-white rounded-lg px-4 py-2">
                    <h1 className="font-bold text-lg md:text-xl m-0">Employee</h1>
                </div>
                <div>
                    <CommonModal title="Add Employee" btnClass="px-4 bg-slate-800 text-white py-2" isModalOpen={isModalOpen} btnText={
                        <span className="text-xs flex items-center gap-2">
                            <FaPlus size={10} />
                            Add Employee
                        </span>
                    } setIsModalOpen={setIsModalOpen}>
                        <AddEmployeeForm setIsModalOpen={setIsModalOpen} />
                    </CommonModal>
                </div>
            </div>
            {/* display employes */}
            <div className="mt-4 bg-white p-4 rounded-md shadow pb-1">
                <Table dataSource={tableData} loading={isFetching || isLoading} className="" size="small">
                    <Column title="Name" dataIndex="name" key="name" />
                    <Column title="Email" dataIndex="email" key="email" className="font-bold" />
                    <Column title="Role" dataIndex="role" key="role" render={(role) => <Tag>{role}</Tag>} />
                    <Column title="Address" dataIndex="address" key="address" />
                    <Column title="Mobile" dataIndex="mobile" key="Mobile" />
                    <Column title="Action" render={(item: TEmployee) => {
                        return <div className="space-x-2 text-lg flex gap-2 items-center">
                            {/* <button className="hover:text-lime-700 cursor-pointer"><FaEdit /></button> */}
                            <CommonModal btnText={<span className="flex gap-1 items-center"><FaEdit /> <small>Edit</small></span>} isModalOpen={editEmployeeData?.id === item?.id} setIsModalOpen={(state: any) => setEditEmployeeData(state ? item : null)} title="Edit Employee">
                                {
                                    editEmployeeData && <EditEmployee setOpenModal={setEditEmployeeData} employeeData={editEmployeeData} />
                                }
                            </CommonModal>
                            <Button onClick={() => handleDelete(item?.id)} className="hover:text-red-500 cursor-pointer flex gap-2 items-center border px-1"><FaTrash />Delete</Button>
                        </div>
                    }} />
                </Table>
            </div >
        </div>
    )
}

export default Employee