import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { useDeleteUserMutation, useGetUsersQuery } from "../../../redux/features/auth/authApi"
import CommonModal from "../../../components/modals/CommonModal";
import { UserCreateForm } from "./UserCreateForm";
import { useState } from "react";
import { Button, Table } from "antd";
import Column from "antd/es/table/Column";
import { TStauffUser } from "../../../types/types";
import Swal from "sweetalert2";
import EditUser from "./EditUser";
import { getResponse } from "../../../utils/getResponse";

// import { v4 as uuidv4 } from "uuid";
export const User = () => {
  const [deleteUser] = useDeleteUserMutation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data, isLoading, isFetching } = useGetUsersQuery({})
  const [editUserData, setEditUserData] = useState<{ name: string; email: string; phone: string; id: string } | null>(null)
  const tableData = data?.data?.map((item: TStauffUser, idx: number) => {
    return {
      key: idx,
      ...item
    }
  })
  const handleDelete = (id: string) => {
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
        const res = await deleteUser(Number(id));
        getResponse(res);
      }
    });
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="bg-white rounded-lg px-4 py-2">
          <h1 className="font-bold text-lg md:text-xl m-0">User</h1>
        </div>
        <div>
          <CommonModal title="Add Employee" btnClass="px-4 bg-slate-800 text-white py-2" isModalOpen={isModalOpen} btnText={
            <span className="text-xs flex items-center gap-2">
              <FaPlus size={10} />
              Add Employee
            </span>}
            setIsModalOpen={setIsModalOpen}>
            <UserCreateForm setIsModalOpen={setIsModalOpen} />
          </CommonModal>
        </div>
      </div>
      {/* display employes */}
      <div className="mt-4 bg-white p-4 rounded-md shadow pb-1">
        <Table dataSource={tableData} loading={isFetching || isLoading} className="" size="small">
          <Column title="Name" dataIndex="name" key="name" />
          <Column title="Email" dataIndex="email" key="email" className="font-bold" />
          {/* <Column title="Role" dataIndex="role" key="role" render={(role) => <Tag>{role}</Tag>} /> */}
          <Column title="Mobile" dataIndex="phone" key="Mobile" />
          <Column title="Action" render={(item) => {
            return <div className="space-x-2 text-lg flex gap-2 items-center">
              <CommonModal btnText={<span className="flex gap-1 items-center"><FaEdit /> <small>Edit</small></span>} isModalOpen={editUserData?.id === item?.id} setIsModalOpen={(state: any) => setEditUserData(state ? item : null)} title="Edit User">
                {
                  editUserData && <EditUser setOpenModal={setEditUserData} userData={editUserData} />
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
