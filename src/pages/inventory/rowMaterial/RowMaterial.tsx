import { FaEdit, FaTrash } from "react-icons/fa";
import { Table } from 'antd';
import Column from "antd/es/table/Column";
import { useState } from "react";
import Swal from "sweetalert2";
import { TCategory, TUnit } from "../../../types/types";
import { getResponse } from "../../../utils/getResponse";
import CommonModal from "../../../components/modals/CommonModal";
import AddRowMaterialsForm from "./AddRowMaterialsFrom";
import { useDeleteRowMaterialMutation, useGetRowMaterialsQuery } from "../../../redux/features/rowMaterials/rowMaterials.api";
import EditRowMaterials from "./EditMaterials";
import dayjs from "dayjs";

const RowMaterial = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteRowMaterials] = useDeleteRowMaterialMutation()
    const { data: rowMaterials, isFetching, isLoading } = useGetRowMaterialsQuery({})
    const [isEditModal, setIsEditModal] = useState<TUnit | null>();
    const allrowMaterials = rowMaterials?.data;


    const allMaterialsData = allrowMaterials?.map((item: TCategory, idx: number) => {
        return {
            ...item,
            key: idx + 1
        }
    })
    const handleDelete = (id: number) => {
        console.log(id)
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
                const data = await deleteRowMaterials(id)
                getResponse(data)
            }
        });
    }
    return (
        <div className="">
            <div className="flex items-center justify-between">
                <div className="bg-white rounded-lg px-4 py-2">
                    <h1 className="font-bold text-lg md:text-xl m-0">Row Materials</h1>
                </div>
                <div>
                    <CommonModal title="Add Row Materials" btnClass="px-4 bg-slate-800 text-white py-2" btnText="Add Row Materials" isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
                        <AddRowMaterialsForm setIsModalOpen={setIsModalOpen} />
                    </CommonModal>
                </div>
            </div>
            {/* display employes */}
            <div className="mt-4 bg-white p-4 rounded-md shadow-md">
                <Table dataSource={allMaterialsData} loading={isFetching || isLoading} className="" size="small">
                    <Column title={<span className="font-bold">No</span>} dataIndex="key" className="font-semibold" />
                    <Column title={<span className="font-bold">Name</span>} dataIndex="name" className="font-semibold" />
                    <Column
                        title={<span className="font-bold">Unit</span>}
                        key="unit"
                        className="font-semibold"
                        render={(_, record) => <span>{record.unit?.name || '-'}</span>}
                    />
                    <Column
                        title={<span className="font-bold">Unit Price</span>}
                        key="unit"
                        className="font-semibold"
                        dataIndex="unitPrice"
                    />
                    <Column
                        title={<span className="font-bold">Opening Balance</span>}
                        key="unit"
                        className="font-semibold"
                        dataIndex="amount"
                    />
                    <Column
                        title={<span className="font-bold">Quantity</span>}
                        key="unit"
                        className="font-semibold"
                        dataIndex="quantity"
                    />
                    {/* <Column title={<span className="font-bold">Status</span>} dataIndex="status" className="font-semibold" /> */}
                    <Column title={<span className="font-bold">Opening Date</span>} dataIndex="openingDate" render={(openingDate: string) => {
                        return <span>
                            {dayjs(openingDate).format('DD-MMM-YYYY')}
                        </span>
                    }} />

                    <Column title={<span className="font-bold">Action</span>} render={(item) => {
                        return <div className="flex gap-4">
                            <CommonModal btnText={<><FaEdit />Edit</>} isModalOpen={isEditModal?.id === item?.id} setIsModalOpen={(state: any) => setIsEditModal(state ? item : null)} title="Edit Category">
                                <EditRowMaterials item={item} setIsEditModal={setIsEditModal} />
                            </CommonModal>
                            <button onClick={() => handleDelete(item?.id)} className="hover:text-white cursor-pointer flex items-center gap-1 bg-gray-300 p-1 px-2 rounded hover:bg-slate-500"><FaTrash />Delete</button>
                        </div>
                    }} />

                </Table>
            </div >
        </div >
    )
}

export default RowMaterial