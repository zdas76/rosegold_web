/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table, Tag } from "antd"
import { useDeletePartyMutation, useGetPartiesQuery } from "../../../redux/features/auth/authApi"
import Column from "antd/es/table/Column"
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa"
import CommonModal from "../../../components/modals/CommonModal"
import { useState } from "react"
import AddVendorForm from "./AddSupplierForm"
import { TParty } from "../../../types/types"
import Swal from 'sweetalert2'
import EditVendorForm from "./EditSupplierForm"
import { getResponse } from "../../../utils/getResponse"
import dayjs from "dayjs"

const Supplier = () => {
  const [deleteparty] = useDeletePartyMutation()
  const { data, isLoading, isFetching } = useGetPartiesQuery({ partyType: "SUPPLIER" })
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editModalData, setEditModalData] = useState<TParty | null>(null)

  const tableData = data?.data?.map((item: TParty, idx: number) => ({
    key: idx,
    ...item
  }))
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
        const res = await deleteparty(id);
        getResponse(res);
      }
    });
  }

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="bg-white rounded-lg px-4 py-2 flex items-center justify-between w-full">
            <h1 className="font-bold text-lg md:text-xl m-0">Supplier</h1>
            <div>
              <CommonModal
                btnClass="px-4 bg-slate-800 text-white py-2"
                title="Add Supplier"
                isModalOpen={isAddModalOpen}
                setIsModalOpen={setIsAddModalOpen}
                btnText={
                  <span className="flex items-center gap-1 justify-center">
                    <FaPlus size={10} /> <small>Create Supplier</small>
                  </span>
                }>
                <AddVendorForm setIsModalOpen={setIsAddModalOpen} />
              </CommonModal>
            </div>
          </div>

        </div>
      </div>
      <div className="bg-white p-4 rounded-md shadow pb-1">
        <Table dataSource={tableData} loading={isFetching || isLoading} size="small">
          <Column title="Name" dataIndex="name" key="name" className="font-bold" />
          <Column title="Contact" dataIndex="contactNo" key="contact" />
          <Column title="Address" dataIndex="address" key="address" />
          <Column
            title="Vendor Type"
            dataIndex="partyType"
            key="Type"
            render={(type) => <Tag color="indigo">{type}</Tag>}
          />
          <Column
            title="Create Date"
            dataIndex="createdAt"
            key="categoryName"
            render={(timestamp: string) => (
              <span>{dayjs(timestamp).format("DD MMM YY")}</span>
            )}
          />
          <Column
            title="Action"
            render={(item: TParty) => (
              <div className="flex gap-4">
                {/* Edit Modal Trigger */}
                <CommonModal
                  title="Edit Vendor"
                  isModalOpen={editModalData?.id === item.id}
                  setIsModalOpen={(state: any) => setEditModalData(state ? item : null)}
                  btnText={
                    <span className="flex items-center gap-1 justify-center">
                      <FaEdit size={10} /> Edit
                    </span>
                  }>
                  {editModalData && <EditVendorForm item={editModalData} />}
                </CommonModal>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="hover:text-white cursor-pointer flex items-center gap-1 bg-gray-300 p-1 px-2 rounded hover:bg-slate-500"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            )}
          />
        </Table>
      </div>
    </div>
  )
}

export default Supplier
