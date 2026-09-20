/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Table, Tabs, Tag, Modal } from "antd";
import Column from "antd/es/table/Column";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import CommonModal from "../../../components/modals/CommonModal";
import AddProductionIngredientForm from "./AddProductionIngredientForm";
import EditProductionIngredientForm from "./EditProductionIngredientForm";
import {
    useGetProductionIngredientsQuery,
    useDeleteProductionIngredientMutation,
} from "../../../redux/features/productionIngredient/productionIngredient.api";
import { getResponse } from "../../../utils/getResponse";

const ProductionIngredient = () => {
    const [activeTab, setActiveTab] = useState<string>("SOAP");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);

    const { data: ingredientsData, isLoading, isFetching } = useGetProductionIngredientsQuery(activeTab);
    const [deleteIngredient] = useDeleteProductionIngredientMutation();

    const items = ingredientsData?.data?.map((item: any, idx: number) => ({
        ...item,
        key: item.id || idx + 1,
        index: idx + 1,
    })) || [];

    const handleDelete = (id: number) => {
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
                const res = await deleteIngredient(id);
                getResponse(res);
            }
        });
    };

    const tabItems = [
        {
            key: "SOAP",
            label: "Soap Creation",
        },
        {
            key: "DETERGENT",
            label: "Detergent",
        },
        {
            key: "KITCHENBAR",
            label: "Kitchen Bar",
        },
    ];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="bg-white rounded-lg px-4 py-2">
                    <h1 className="font-bold text-lg md:text-xl m-0">Production Ingredient</h1>
                </div>
                <div>
                    <CommonModal
                        title={`Add Ingredient (${activeTab === "SOAP" ? "Soap Creation" : activeTab === "DETERGENT" ? "Detergent" : "Kitchen Bar"})`}
                        btnClass="bg-white"
                        btnText="Add Ingredient"
                        isModalOpen={isAddModalOpen}
                        setIsModalOpen={setIsAddModalOpen}
                    >
                        <AddProductionIngredientForm
                            defaultType={activeTab}
                            setIsModalOpen={setIsAddModalOpen}
                        />
                    </CommonModal>
                </div>
            </div>

            {/* 3 Tabs */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => setActiveTab(key)}
                    items={tabItems}
                />

                {/* Table */}
                <Table
                    loading={isLoading || isFetching}
                    dataSource={items}
                    pagination={{ pageSize: 10 }}
                    bordered
                    scroll={{ x: 600 }}
                >
                    <Column title="#" dataIndex="index" key="index" width={60} align="center" />
                    <Column
                        title="Formula / Ingredient Name"
                        dataIndex="productionName"
                        key="productionName"
                    />
                    <Column
                        title="Production Type"
                        dataIndex="type"
                        key="type"
                        render={(type: string) => {
                            let color = "blue";
                            let label = "Soap Creation";
                            if (type === "DETERGENT") {
                                color = "green";
                                label = "Detergent";
                            } else if (type === "KITCHENBAR") {
                                color = "orange";
                                label = "Kitchen Bar";
                            }
                            return <Tag color={color}>{label}</Tag>;
                        }}
                    />
                    <Column
                        title="Raw Materials"
                        dataIndex="rawMaterials"
                        key="rawMaterials"
                        render={(rawMaterials: any[]) => (
                            <div className="flex flex-wrap gap-1">
                                {rawMaterials && rawMaterials.length > 0 ? (
                                    rawMaterials.map((rm) => (
                                        <Tag key={rm.id} color="purple">
                                            {rm.name} {rm.unit?.name ? `(${rm.unit.name})` : ""}
                                        </Tag>
                                    ))
                                ) : (
                                    <span className="text-gray-400 text-xs">No raw materials</span>
                                )}
                            </div>
                        )}
                    />
                    <Column
                        title="Action"
                        key="action"
                        width={100}
                        align="center"
                        render={(_: any, record: any) => (
                            <div className="flex justify-center items-center gap-2">
                                <button
                                    onClick={() => setEditItem(record)}
                                    className="text-blue-500 hover:text-blue-700 p-1 cursor-pointer"
                                    title="Edit"
                                >
                                    <FaEdit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(record.id)}
                                    className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                                    title="Delete"
                                >
                                    <FaTrash size={16} />
                                </button>
                            </div>
                        )}
                    />
                </Table>
            </div>

            {/* Edit Modal */}
            <Modal
                title="Edit Production Ingredient"
                open={!!editItem}
                onCancel={() => setEditItem(null)}
                footer={null}
                destroyOnClose
            >
                {editItem && (
                    <EditProductionIngredientForm
                        item={editItem}
                        setIsModalOpen={(open) => {
                            if (!open) setEditItem(null);
                        }}
                    />
                )}
            </Modal>
        </div>
    );
};

export default ProductionIngredient;
