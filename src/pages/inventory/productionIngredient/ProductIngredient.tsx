/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { Table, Tag, Modal, Input, Select } from "antd";
import Column from "antd/es/table/Column";
import { FaEdit, FaTrash } from "react-icons/fa";
import { SearchOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import CommonModal from "../../../components/modals/CommonModal";
import AddProductionIngredientForm from "./AddProductionIngredientForm";
import EditProductionIngredientForm from "./EditProductionIngredientForm";
import {
    useGetProductionIngredientsQuery,
    useDeleteProductionIngredientMutation,
} from "../../../redux/features/productionIngredient/productionIngredient.api";
import { useGetProductsQuery } from "../../../redux/features/product/product.api";
import { getResponse } from "../../../utils/getResponse";

const ProductIngredient = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [searchText, setSearchText] = useState("");
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

    const { data: ingredientsData, isLoading, isFetching } = useGetProductionIngredientsQuery(
        selectedProductId ? { productId: selectedProductId } : {}
    );
    const { data: productsData, isLoading: isProductsLoading } = useGetProductsQuery({});
    const [deleteIngredient] = useDeleteProductionIngredientMutation();

    const productOptions = useMemo(() => {
        return productsData?.data?.map((p: any) => ({
            label: p.name,
            value: p.id,
        })) || [];
    }, [productsData]);

    const productMap = useMemo(() => {
        const map = new Map<number, string>();
        productsData?.data?.forEach((p: any) => {
            map.set(p.id, p.name);
        });
        return map;
    }, [productsData]);

    const items = useMemo(() => {
        const rawList = Array.isArray(ingredientsData?.data)
            ? ingredientsData.data
            : Array.isArray((ingredientsData as any)?.data?.data)
                ? (ingredientsData as any).data.data
                : [];

        return rawList
            .map((item: any, idx: number) => ({
                ...item,
                key: item.id || idx + 1,
                index: idx + 1,
                productName: item.product?.name || productMap.get(item.productId) || `Product #${item.productId}`,
            }))
            .filter((item: any) => {
                if (selectedProductId && item.productId !== selectedProductId) {
                    return false;
                }
                if (!searchText.trim()) return true;
                const search = searchText.toLowerCase();
                const matchProduct = item.productName?.toLowerCase().includes(search);

                const rawList = item.ingredientRawMaterials || item.rawMaterials || [];
                const matchRaw = rawList.some((rm: any) => {
                    const name = rm.rawMaterials?.name || rm.name;
                    return name?.toLowerCase().includes(search);
                });

                const packList = item.ingredientPackingMaterial || item.packingMaterials || item.ingredientPackingMaterials || [];
                const matchPacking = packList.some((pm: any) => {
                    const name = pm.packingMaterial?.name || pm.name;
                    return name?.toLowerCase().includes(search);
                });

                const expList = item.ingredientExpneseItems || item.expenseItems || [];
                const matchExp = expList.some((exp: any) => {
                    const name = exp.productionExpenseItem?.expItemName || exp.expItemName;
                    return name?.toLowerCase().includes(search);
                });

                return matchProduct || matchRaw || matchPacking || matchExp;
            });
    }, [ingredientsData, productMap, searchText, selectedProductId]);

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

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                <div className="bg-white rounded-lg px-4 py-1 shadow-sm flex justify-between w-full">
                    <h1 className="font-bold text-lg m-0">Product Ingredient</h1>
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
                        <Select
                            showSearch
                            allowClear
                            placeholder="Select Product"
                            value={selectedProductId}
                            onChange={(val) => setSelectedProductId(val || null)}
                            options={productOptions}
                            loading={isProductsLoading}
                            filterOption={(input, option) =>
                                String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                            }
                            className="w-full sm:w-60"
                        />
                        {/* <Input
                            placeholder="Search material..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            className="w-full sm:w-56"
                        /> */}
                        <CommonModal
                            title="Add Product Ingredient"
                            btnClass="bg-[#C58D2F] hover:bg-[#b07d28] text-white whitespace-nowrap font-medium"
                            btnText="Add Ingredient"
                            isModalOpen={isAddModalOpen}
                            setIsModalOpen={setIsAddModalOpen}
                            modalWidth="850px"
                            footer={null}
                        >
                            <AddProductionIngredientForm
                                defaultProductId={selectedProductId || undefined}
                                setIsModalOpen={setIsAddModalOpen}
                            />
                        </CommonModal>
                    </div>
                </div>

            </div>

            {/* Table */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
                <Table
                    loading={isLoading || isFetching}
                    dataSource={items}
                    pagination={{ pageSize: 10 }}
                    bordered
                    scroll={{ x: 700 }}
                >
                    <Column title="#" dataIndex="index" key="index" width={60} align="center" />
                    <Column
                        title="Product Name"
                        dataIndex="productName"
                        key="productName"
                        render={(name: string) => <span className="font-semibold text-gray-800">{name}</span>}
                    />
                    <Column
                        title="Raw Materials"
                        key="rawMaterials"
                        render={(_: any, record: any) => {
                            const rawMaterials = record.ingredientRawMaterials || record.rawMaterials || [];
                            return (
                                <div className="flex flex-wrap gap-1">
                                    {rawMaterials && rawMaterials.length > 0 ? (
                                        rawMaterials.map((rm: any, idx: number) => {
                                            const name = rm.rawMaterials?.name || rm.name;
                                            return (
                                                <Tag key={rm.id || idx} color="purple">
                                                    {name}
                                                </Tag>
                                            );
                                        })
                                    ) : (
                                        <span className="text-gray-400 text-xs">No raw materials</span>
                                    )}
                                </div>
                            );
                        }}
                    />
                    <Column
                        title="Packing Materials"
                        key="packingMaterials"
                        render={(_: any, record: any) => {
                            const packingMaterials =
                                record.ingredientPackingMaterial ||
                                record.packingMaterials ||
                                record.ingredientPackingMaterials ||
                                [];
                            return (
                                <div className="flex flex-wrap gap-1">
                                    {packingMaterials && packingMaterials.length > 0 ? (
                                        packingMaterials.map((pm: any, idx: number) => {
                                            const name = pm.packingMaterial?.name || pm.name;
                                            return (
                                                <Tag key={pm.id || idx} color="cyan">
                                                    {name}
                                                </Tag>
                                            );
                                        })
                                    ) : (
                                        <span className="text-gray-400 text-xs">No packing materials</span>
                                    )}
                                </div>
                            );
                        }}
                    />
                    <Column
                        title="Production Expenses"
                        dataIndex="ingredientExpneseItems"
                        key="ingredientExpneseItems"
                        render={(expItems: any[], record: any) => {
                            const list = expItems || record.expenseItems || [];
                            return (
                                <div className="flex flex-wrap gap-1">
                                    {list && list.length > 0 ? (
                                        list.map((exp: any, idx: number) => {
                                            const name =
                                                exp.productionExpenseItem?.expItemName ||
                                                exp.expItemName ||
                                                `Expense #${exp.productionExpenssItemId || exp.id}`;
                                            const rate = exp.productionExpenseItem?.unitRate ?? exp.unitRate;

                                            return (
                                                <Tag key={exp.id || idx} color="orange">
                                                    {name} {rate ? `(${rate}৳)` : ""}
                                                </Tag>
                                            );
                                        })
                                    ) : (
                                        <span className="text-gray-400 text-xs">No expense items</span>
                                    )}
                                </div>
                            );
                        }}
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
                title="Edit Product Ingredient"
                open={!!editItem}
                onCancel={() => setEditItem(null)}
                footer={null}
                destroyOnClose
                width={850}
                centered
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

export default ProductIngredient;
