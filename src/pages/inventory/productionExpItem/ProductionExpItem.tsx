/* eslint-disable @typescript-eslint/no-explicit-any */
import { FaEdit, FaTrash } from "react-icons/fa";
import { Table, Input } from "antd";
import Column from "antd/es/table/Column";
import { useState, useMemo } from "react";
import Swal from "sweetalert2";
import { SearchOutlined } from "@ant-design/icons";
import { getResponse } from "../../../utils/getResponse";
import CommonModal from "../../../components/modals/CommonModal";
import AddProductionExpItemForm from "./AddProductionExpItemForm";
import EditProductionExpItem from "./EditProductionExpItem";
import {
    useDeleteProductionExpItemMutation,
    useGetProductionExpItemsQuery,
} from "../../../redux/features/productionExpItem/productionExpItem.api";

const ProductionExpItem = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModal, setIsEditModal] = useState<any>(null);
    const [searchText, setSearchText] = useState("");

    const [deleteProductionExpItem] = useDeleteProductionExpItemMutation();
    const { data: expItemsResponse, isFetching, isLoading } = useGetProductionExpItemsQuery({});

    console.log(expItemsResponse, "expItemsResponse")

    const allExpData = useMemo(() => {
        const list = Array.isArray(expItemsResponse?.data)
            ? expItemsResponse.data
            : Array.isArray(expItemsResponse)
                ? expItemsResponse
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
                    item.expItemName?.toLowerCase().includes(search)
                );
            });
    }, [expItemsResponse, searchText]);

    const handleDelete = (id: number | string) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#C58D2F",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const data = await deleteProductionExpItem(id);
                getResponse(data);
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm flex justify-between w-full items-center">
                    <h1 className="font-bold text-lg m-0">Production Expense Items</h1>
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
                        <Input
                            placeholder="Search expense item..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            className="w-full sm:w-60"
                        />
                        <CommonModal
                            title="Add Production Expense Item"
                            btnClass="px-4 bg-slate-800 text-white py-2 whitespace-nowrap"
                            btnText="Add Expense Item"
                            isModalOpen={isModalOpen}
                            setIsModalOpen={setIsModalOpen}
                        >
                            <AddProductionExpItemForm setIsModalOpen={setIsModalOpen} />
                        </CommonModal>
                    </div>
                </div>

            </div>

            <div className="bg-white p-4 rounded-md shadow-md">
                <Table
                    dataSource={allExpData}
                    loading={isFetching || isLoading}
                    size="small"
                    bordered
                    scroll={{ x: 700 }}
                >
                    <Column
                        title={<span className="font-bold">No</span>}
                        dataIndex="index"
                        key="index"
                        width={60}
                        align="center"
                    />
                    <Column
                        title={<span className="font-bold">Expense Item Name</span>}
                        dataIndex="expItemName"
                        key="expItemName"
                        className="font-semibold"
                    />
                    <Column
                        title={<span className="font-bold">Unit Rate (BDT)</span>}
                        dataIndex="unitRate"
                        key="unitRate"
                        className="font-semibold"
                        render={(rate: number) => <span>{rate !== undefined && rate !== null ? Number(rate).toFixed(2) : "-"}</span>}
                    />
                    <Column
                        title={<span className="font-bold">Action</span>}
                        key="action"
                        width={150}
                        render={(item: any) => (
                            <div className="flex gap-2">
                                <CommonModal
                                    btnText={
                                        <>
                                            <FaEdit />
                                            Edit
                                        </>
                                    }
                                    isModalOpen={isEditModal?.id === item?.id}
                                    setIsModalOpen={(state: any) => setIsEditModal(state ? item : null)}
                                    title="Edit Production Expense Item"
                                >
                                    <EditProductionExpItem item={item} setIsEditModal={setIsEditModal} />
                                </CommonModal>
                                <button
                                    onClick={() => handleDelete(item?.id)}
                                    className="hover:text-white cursor-pointer flex items-center gap-1 bg-gray-300 p-1 px-2 rounded hover:bg-slate-500 text-xs"
                                >
                                    <FaTrash />
                                    Delete
                                </button>
                            </div>
                        )}
                    />
                </Table>
            </div>
        </div>
    );
};

export default ProductionExpItem;
