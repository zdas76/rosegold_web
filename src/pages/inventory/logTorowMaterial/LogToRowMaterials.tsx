/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Swal from "sweetalert2";
import { TCategory } from "../../../types/types";
import { getResponse } from "../../../utils/getResponse";
import CommonModal from "../../../components/modals/CommonModal";
import { useDeleteRowMaterialMutation } from "../../../redux/features/rowMaterials/rowMaterials.api";
import ConvertForm from "./CovertRowmateialsForm";
import { useGetLogToRowMaterialQuery } from "../../../redux/features/OthersApi/othersApi";
import { Table } from "antd";
import Column from "antd/es/table/Column";
import { FaEdit, FaTrash } from "react-icons/fa";
import EditRowMaterials from "../rowMaterial/EditMaterials";


const LogToRowMaterials = () => {
    const [isEditModal, setIsEditModal] = useState<any>()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteRowMaterials] = useDeleteRowMaterialMutation()
    const { data: rowMaterials, isFetching, isLoading } = useGetLogToRowMaterialQuery({})
    const allrowMaterials = rowMaterials?.data;

    const allMaterialsData = allrowMaterials?.map((item: TCategory, idx: number) => {
        return {
            ...item,
            key: idx + 1
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
                const data = await deleteRowMaterials(id)
                getResponse(data)
            }
        });
    }
    return (
        <div className="">
            <div className="flex items-center justify-between">
                <div className="bg-white rounded-lg px-4 py-2">
                    <h1 className="font-bold text-lg md:text-xl m-0">Row Materials Product</h1>
                </div>
                <div>
                    <CommonModal modalWidth="70%" title="Convert Log To Row Materials" btnClass="px-4 bg-slate-800 text-white py-2" btnText="Convert Row Materials" isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
                        <ConvertForm setIsModalOpen={setIsModalOpen} />
                    </CommonModal>
                </div>
            </div>
            {/* display employes */}
            <div className="mt-4 bg-white p-4 rounded-md shadow-md">
                <Table dataSource={allMaterialsData} loading={isFetching || isLoading} className="" size="small">
                    <Column title={<span className="font-bold">No</span>} dataIndex="key" className="font-semibold" />
                    <Column title={<span className="font-bold">Voucher No</span>} dataIndex="voucherNo" className="font-semibold border-x border-slate-200" />
                    <Column title={<span className="font-bold border-x border-slate-200">Date</span>} dataIndex="date" render={(timestamp: string) => {
                        return <span>
                            {new Date(timestamp).toLocaleString()}
                        </span>
                    }} />
                    <Column title={<span className="font-bold">Status</span>} dataIndex="status" className="font-semibold" />
                    
                    {/* <Column title={<span className="font-bold">Action</span>} render={(item) => {
                        return <div className="flex gap-4">
                            <CommonModal btnText={<><FaEdit />Edit</>} isModalOpen={isEditModal?.id === item?.id} setIsModalOpen={(state: any) => setIsEditModal(state ? item : null)} title="Edit Category">
                                <EditRowMaterials item={item} setIsEditModal={setIsEditModal} />
                            </CommonModal>
                            <button onClick={() => handleDelete(item?.id)} className="hover:text-white cursor-pointer flex items-center gap-1 bg-gray-300 p-1 px-2 rounded hover:bg-slate-500"><FaTrash />Delete</button>
                        </div>
                    }} /> */}

                </Table>

            </div>
        </div>
    )
}

export default LogToRowMaterials