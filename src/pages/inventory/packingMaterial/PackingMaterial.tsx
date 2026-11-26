/* eslint-disable @typescript-eslint/no-explicit-any */
import { FaEdit, FaTrash } from "react-icons/fa";
import { Table, Input } from 'antd';
import Column from "antd/es/table/Column";
import { useState, useMemo } from "react";
import Swal from "sweetalert2";
import { SearchOutlined } from "@ant-design/icons";
import { getResponse } from "../../../utils/getResponse";
import CommonModal from "../../../components/modals/CommonModal";
import AddPackingMaterialsForm from "../rowMaterial/AddPackingMaterialsForm";
import EditPackingMaterials from "../rowMaterial/EditPackingMaterials";
import {
    useDeletePackingMaterialMutation,
    useGetPackingMaterialsQuery
} from "../../../redux/features/packingMaterials/packingMaterials.api";
import dayjs from "dayjs";

const PackingMaterial = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModal, setIsEditModal] = useState<any>(null);
    const [searchText, setSearchText] = useState("");

    const [deletePackingMaterial] = useDeletePackingMaterialMutation();
    const { data: packingMaterials, isFetching, isLoading } = useGetPackingMaterialsQuery({});

    const allPackingData = useMemo(() => {
        const list = Array.isArray(packingMaterials?.data)
            ? packingMaterials.data
            : [];

        return list
            .map((item: any, idx: number) => ({
                ...item,
                key: item.id || idx + 1,
                index: idx + 1,
            }))
            .filter((item: any) => {
                if (!searchText.trim()) return true;
                const search = searchText.toLowerCase();
                return (
                    item.name?.toLowerCase().includes(search) ||
                    item.unit?.name?.toLowerCase().includes(search)
                );
            });
    }, [packingMaterials, searchText]);

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
                const data = await deletePackingMaterial(id);
                getResponse(data);
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm flex w-full flex-row items-start sm:items-center justify-between">
                    <h1 className="font-bold text-lg md:text-xl m-0">Packing Materials</h1>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Input
                            placeholder="Search packing material..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            className="w-full sm:w-60"
                        />
                        <CommonModal
                            title="Add Packing Material"
                            btnClass="px-4 bg-slate-800 text-white py-2 whitespace-nowrap"
                            btnText="Add Packing Material"
                            isModalOpen={isModalOpen}
                            setIsModalOpen={setIsModalOpen}
                        >
                            <AddPackingMaterialsForm setIsModalOpen={setIsModalOpen} />
                        </CommonModal>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-md shadow-md">
                <Table
                    dataSource={allPackingData}
                    loading={isFetching || isLoading}
                    size="small"
                    bordered
                    scroll={{ x: 700 }}>
                    <Column title={<span className="font-bold">No</span>} dataIndex="index" key="index" width={60} align="center" />
                    <Column title={<span className="font-bold">Name</span>} dataIndex="name" key="name" className="font-semibold" />
                    <Column
                        title={<span className="font-bold">Unit</span>}
                        key="unit"
                        className="font-semibold"
                        render={(_, record: any) => <span>{record.unit?.name || '-'}</span>}
                    />
                    <Column
                        title={<span className="font-bold">Unit Price</span>}
                        key="unitPrice"
                        className="font-semibold"
                        dataIndex="unitPrice"
                    />
                    <Column
                        title={<span className="font-bold">Opening Balance</span>}
                        key="openingAmount"
                        className="font-semibold"
                        dataIndex="openingAmount"
                        render={(val, record: any) => val ?? record.amount ?? '-'}
                    />
                    <Column
                        title={<span className="font-bold">Quantity</span>}
                        key="quantity"
                        className="font-semibold"
                        dataIndex="quantity"
                    />
                    <Column
                        title={<span className="font-bold">Alert Qty</span>}
                        key="alertQuantity"
                        className="font-semibold"
                        dataIndex="alertQuantity"
                        render={(val: any) => val ?? '-'}
                    />
                    <Column
                        title={<span className="font-bold">Opening Date</span>}
                        dataIndex="openingDate"
                        key="openingDate"
                        render={(openingDate: string) => openingDate ? <span>{dayjs(openingDate).format('DD-MMM-YYYY')}</span> : '-'}
                    />
                    <Column
                        title={<span className="font-bold">Action</span>}
                        key="action"
                        width={150}
                        render={(item: any) => (
                            <div className="flex gap-2">
                                <CommonModal
                                    btnText={<><FaEdit />Edit</>}
                                    isModalOpen={isEditModal?.id === item?.id}
                                    setIsModalOpen={(state: any) => setIsEditModal(state ? item : null)}
                                    title="Edit Packing Material"
                                >
                                    <EditPackingMaterials item={item} setIsEditModal={setIsEditModal} />
                                </CommonModal>
                                <button
                                    onClick={() => handleDelete(item?.id)}
                                    className="hover:text-white cursor-pointer flex items-center gap-1 bg-gray-300 p-1 px-2 rounded hover:bg-slate-500 text-xs"
                                >
                                    <FaTrash />Delete
                                </button>
                            </div>
                        )}
                    />
                </Table>
            </div>
        </div>
    );
};

export default PackingMaterial;
