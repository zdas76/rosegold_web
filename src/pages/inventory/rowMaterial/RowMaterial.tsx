/* eslint-disable @typescript-eslint/no-explicit-any */
import { FaEdit, FaTrash } from "react-icons/fa";
import { Table, Tabs } from 'antd';
import Column from "antd/es/table/Column";
import { useState } from "react";
import Swal from "sweetalert2";
import { TCategory, TUnit } from "../../../types/types";
import { getResponse } from "../../../utils/getResponse";
import CommonModal from "../../../components/modals/CommonModal";
import AddRowMaterialsForm from "./AddRowMaterialsFrom";
import { useDeleteRowMaterialMutation, useGetRowMaterialsQuery } from "../../../redux/features/rowMaterials/rowMaterials.api";
import { useDeletePackingMaterialMutation, useGetPackingMaterialsQuery } from "../../../redux/features/packingMaterials/packingMaterials.api";
import EditRowMaterials from "./EditMaterials";
import AddPackingMaterialsForm from "./AddPackingMaterialsForm";
import EditPackingMaterials from "./EditPackingMaterials";
import dayjs from "dayjs";

const RowMaterial = () => {
    const [activeTab, setActiveTab] = useState<string>("raw");
    const [isRawModalOpen, setIsRawModalOpen] = useState(false);
    const [isPackingModalOpen, setIsPackingModalOpen] = useState(false);

    // Raw Materials
    const [deleteRowMaterials] = useDeleteRowMaterialMutation();
    const { data: rowMaterials, isFetching: isRawFetching, isLoading: isRawLoading } = useGetRowMaterialsQuery({});
    const [isEditModal, setIsEditModal] = useState<TUnit | null>();

    // Packing Materials
    const [deletePackingMaterial] = useDeletePackingMaterialMutation();
    const { data: packingMaterials, isFetching: isPackFetching, isLoading: isPackLoading } = useGetPackingMaterialsQuery({});
    const [isEditPackingModal, setIsEditPackingModal] = useState<any>(null);

    const allMaterialsData = rowMaterials?.data?.map((item: TCategory, idx: number) => ({
        ...item,
        key: idx + 1
    })) || [];

    const allPackingData = packingMaterials?.data?.map((item: any, idx: number) => ({
        ...item,
        key: idx + 1
    })) || [];

    const handleDeleteRaw = (id: number) => {
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
                const data = await deleteRowMaterials(id);
                getResponse(data);
            }
        });
    };

    const handleDeletePacking = (id: number) => {
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

    const tabItems = [
        {
            key: "raw",
            label: "Raw Materials",
        },
        {
            key: "packing",
            label: "Packing Materials",
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm flex justify-between w-full items-center">
                    <h1 className="font-bold text-lg m-0">
                        {activeTab === "raw" ? "Raw Materials" : "Packing Materials"}
                    </h1>
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
                        {activeTab === "raw" ? (
                            <CommonModal
                                title="Add Raw Material"
                                btnClass="px-4 bg-slate-800 text-white py-2 whitespace-nowrap"
                                btnText="Add Raw Material"
                                isModalOpen={isRawModalOpen}
                                setIsModalOpen={setIsRawModalOpen}
                            >
                                <AddRowMaterialsForm setIsModalOpen={setIsRawModalOpen} />
                            </CommonModal>
                        ) : (
                            <CommonModal
                                title="Add Packing Material"
                                btnClass="px-4 bg-slate-800 text-white py-2"
                                btnText="Add Packing Material"
                                isModalOpen={isPackingModalOpen}
                                setIsModalOpen={setIsPackingModalOpen}
                            >
                                <AddPackingMaterialsForm setIsModalOpen={setIsPackingModalOpen} />
                            </CommonModal>
                        )}
                    </div>
                </div>

            </div>

            <div className="bg-white p-4 rounded-md shadow-md">
                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => setActiveTab(key)}
                    items={tabItems}
                />

                {activeTab === "raw" ? (
                    <Table
                        dataSource={allMaterialsData}
                        loading={isRawFetching || isRawLoading}
                        size="small"
                        bordered
                    >
                        <Column title={<span className="font-bold">No</span>} dataIndex="key" className="font-semibold" width={60} align="center" />
                        <Column title={<span className="font-bold">Name</span>} dataIndex="name" className="font-semibold" />
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
                            key="amount"
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
                            title={<span className="font-bold">Opening Date</span>}
                            dataIndex="openingDate"
                            render={(openingDate: string) => openingDate ? <span>{dayjs(openingDate).format('DD-MMM-YYYY')}</span> : '-'}
                        />
                        <Column
                            title={<span className="font-bold">Action</span>}
                            render={(item: any) => (
                                <div className="flex gap-2">
                                    <CommonModal
                                        btnText={<><FaEdit />Edit</>}
                                        isModalOpen={isEditModal?.id === item?.id}
                                        setIsModalOpen={(state: any) => setIsEditModal(state ? item : null)}
                                        title="Edit Raw Material"
                                    >
                                        <EditRowMaterials item={item} setIsEditModal={setIsEditModal} />
                                    </CommonModal>
                                    <button
                                        onClick={() => handleDeleteRaw(item?.id)}
                                        className="hover:text-white cursor-pointer flex items-center gap-1 bg-gray-300 p-1 px-2 rounded hover:bg-slate-500 text-xs"
                                    >
                                        <FaTrash />Delete
                                    </button>
                                </div>
                            )}
                        />
                    </Table>
                ) : (
                    <Table
                        dataSource={allPackingData}
                        loading={isPackFetching || isPackLoading}
                        size="small"
                        bordered
                    >
                        <Column title={<span className="font-bold">No</span>} dataIndex="key" className="font-semibold" width={60} align="center" />
                        <Column title={<span className="font-bold">Name</span>} dataIndex="name" className="font-semibold" />
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
                            key="amount"
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
                            title={<span className="font-bold">Opening Date</span>}
                            dataIndex="openingDate"
                            render={(openingDate: string) => openingDate ? <span>{dayjs(openingDate).format('DD-MMM-YYYY')}</span> : '-'}
                        />
                        <Column
                            title={<span className="font-bold">Action</span>}
                            render={(item: any) => (
                                <div className="flex gap-2">
                                    <CommonModal
                                        btnText={<><FaEdit />Edit</>}
                                        isModalOpen={isEditPackingModal?.id === item?.id}
                                        setIsModalOpen={(state: any) => setIsEditPackingModal(state ? item : null)}
                                        title="Edit Packing Material"
                                    >
                                        <EditPackingMaterials item={item} setIsEditModal={setIsEditPackingModal} />
                                    </CommonModal>
                                    <button
                                        onClick={() => handleDeletePacking(item?.id)}
                                        className="hover:text-white cursor-pointer flex items-center gap-1 bg-gray-300 p-1 px-2 rounded hover:bg-slate-500 text-xs"
                                    >
                                        <FaTrash />Delete
                                    </button>
                                </div>
                            )}
                        />
                    </Table>
                )}
            </div>
        </div>
    );
};

export default RowMaterial;
