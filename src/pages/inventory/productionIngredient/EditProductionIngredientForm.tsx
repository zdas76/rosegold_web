/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo } from "react";
import { Form, Button, Select, Divider, InputNumber } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useUpdateProductionIngredientMutation } from "../../../redux/features/productionIngredient/productionIngredient.api";
import { useGetRowMaterialsQuery } from "../../../redux/features/rowMaterials/rowMaterials.api";
import { useGetPackingMaterialsQuery } from "../../../redux/features/packingMaterials/packingMaterials.api";
import { useGetProductsQuery } from "../../../redux/features/product/product.api";
import { useGetProductionExpItemsQuery } from "../../../redux/features/productionExpItem/productionExpItem.api";
import { getResponse } from "../../../utils/getResponse";

const EditProductionIngredientForm = ({
    item,
    setIsModalOpen,
}: {
    item: any;
    setIsModalOpen: (open: boolean) => void;
}) => {
    const [form] = Form.useForm();
    const [updateIngredient, { isLoading }] = useUpdateProductionIngredientMutation();
    const { data: rawMaterialsData, isLoading: isRawLoading } = useGetRowMaterialsQuery({});
    const { data: packingMaterialsData, isLoading: isPackingLoading } = useGetPackingMaterialsQuery({});
    const { data: productsData, isLoading: isProductsLoading } = useGetProductsQuery({});
    const { data: expItemsData, isLoading: isExpLoading } = useGetProductionExpItemsQuery({});

    const productOptions = productsData?.data?.map((p: any) => ({
        label: p.name,
        value: p.id,
    })) || [];

    const rawMaterialOptions = rawMaterialsData?.data?.map((rm: any) => ({
        label: `${rm.name} (${rm.unit?.name || "Unit"})`,
        value: rm.id,
    })) || [];

    const packingMaterialOptions = packingMaterialsData?.data?.map((pm: any) => ({
        label: `${pm.name} (${pm.unit?.name || "Unit"})`,
        value: pm.id,
    })) || [];

    const expItemOptions = useMemo(() => {
        return (expItemsData?.data || []).map((exp: any) => ({
            label: `${exp.expItemName} (Rate: ${exp.unitRate || 0} ৳)`,
            value: exp.id,
            unitRate: exp.unitRate || 0,
            expItemName: exp.expItemName,
        }));
    }, [expItemsData]);

    useEffect(() => {
        if (item) {
            const rawMaterials = (item.rawMaterials || []).map((rm: any) => rm.id ?? rm.rawId);
            const packingMaterials = (item.packingMaterials || []).map((pm: any) => pm.id ?? pm.packingMaterialId);
            const rawExpItems = item.ingredientExpneseItems || item.expenseItems || [];
            const ingredientExpneseItems = rawExpItems.length > 0
                ? rawExpItems.map((exp: any) => ({
                    productionExpenssItemId: exp.productionExpenssItemId ?? exp.productionExpenseItem?.id ?? exp.id,
                    quantity: exp.quantity ?? exp.qty ?? exp.expDuration ?? 1,
                }))
                : [{ productionExpenssItemId: undefined, quantity: undefined }];

            form.setFieldsValue({
                productId: item.productId || item.product?.id,
                rawMaterials,
                packingMaterials,
                ingredientExpneseItems,
            });
        }
    }, [item, form]);

    const onFinish = async (values: any) => {
        const formattedExpItems = (values.ingredientExpneseItems || [])
            .filter((exp: any) => exp?.productionExpenssItemId)
            .map((exp: any) => {
                const matched = expItemOptions.find((opt: any) => opt.value === exp.productionExpenssItemId);
                return {
                    productionExpenssItemId: Number(exp.productionExpenssItemId),
                    quantity: Number(exp.quantity || exp.qty || 0),
                    qty: Number(exp.quantity || exp.qty || 0),
                    unitRate: matched?.unitRate || 0,
                };
            });

        const payload = {
            id: item.id,
            productId: Number(values.productId),
            rawMaterials: (values.rawMaterials || []).map(Number),
            packingMaterials: (values.packingMaterials || []).map(Number),
            ingredientExpneseItems: formattedExpItems,
        };

        const res = await updateIngredient(payload);
        const response = getResponse(res);
        if (response?.success) {
            setIsModalOpen(false);
            form.resetFields();
        }
    };

    const watchedExpItems = Form.useWatch("ingredientExpneseItems", form) || [];

    const totalExpenseAmount = useMemo(() => {
        return (watchedExpItems || []).reduce((acc: number, curr: any) => {
            if (!curr?.productionExpenssItemId) return acc;
            const matched = expItemOptions.find((opt: any) => opt.value === curr.productionExpenssItemId);
            const rate = matched?.unitRate || 0;
            const q = Number(curr.quantity || curr.qty) || 0;
            return acc + rate * q;
        }, 0);
    }, [watchedExpItems, expItemOptions]);

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="p-1 max-h-[80vh] overflow-y-auto"
        >
            <Form.Item
                label="Select Product"
                name="productId"
                rules={[{ required: true, message: "Please select a product" }]}
            >
                <Select
                    showSearch
                    placeholder="Choose product"
                    options={productOptions}
                    loading={isProductsLoading}
                    filterOption={(input, option) =>
                        String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                />
            </Form.Item>

            <Divider className="my-3 font-semibold text-sm">Raw Materials</Divider>

            <Form.Item
                label="Select Raw Materials (Multi-Select)"
                name="rawMaterials"
                rules={[{ required: true, message: "Please select at least one raw material" }]}
            >
                <Select
                    mode="multiple"
                    allowClear
                    placeholder="Search & choose raw materials..."
                    options={rawMaterialOptions}
                    loading={isRawLoading}
                    filterOption={(input, option) =>
                        String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    style={{ width: "100%" }}
                />
            </Form.Item>

            <Divider className="my-3 font-semibold text-sm">Packing Materials (Optional)</Divider>

            <Form.Item
                label="Select Packing Materials (Multi-Select)"
                name="packingMaterials"
            >
                <Select
                    mode="multiple"
                    allowClear
                    placeholder="Search & choose packing materials..."
                    options={packingMaterialOptions}
                    loading={isPackingLoading}
                    filterOption={(input, option) =>
                        String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    style={{ width: "100%" }}
                />
            </Form.Item>

            <Divider className="my-3 font-semibold text-sm">Production Expense Items (Optional)</Divider>

            <Form.List name="ingredientExpneseItems">
                {(fields, { add, remove }) => (
                    <div className="space-y-2">
                        {/* Table Header for Desktop */}
                        <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-3 py-2 bg-slate-100 rounded-md text-xs font-bold text-slate-700 items-center">
                            <div className="sm:col-span-5">Select Production Expense Item</div>
                            <div className="sm:col-span-2 text-center">Unit Rate (৳)</div>
                            <div className="sm:col-span-2 text-center">Quantity</div>
                            <div className="sm:col-span-2 text-center">Total (৳)</div>
                            <div className="sm:col-span-1 text-center">Action</div>
                        </div>

                        {fields.map(({ key, name, ...restField }) => {
                            const currentItem = watchedExpItems[name] || {};
                            const matched = expItemOptions.find((opt: any) => opt.value === currentItem.productionExpenssItemId);
                            const rate = matched?.unitRate || 0;
                            const qty = Number(currentItem.quantity || currentItem.qty) || 0;
                            const rowTotal = Number((rate * qty).toFixed(2));

                            return (
                                <div key={key} className="p-2 sm:px-3 sm:py-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-slate-300 transition-colors">
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                                        <div className="sm:col-span-5">
                                            <span className="sm:hidden text-xs font-semibold text-gray-600 block mb-1">Production Expense:</span>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "productionExpenssItemId"]}
                                                className="mb-0"
                                            >
                                                <Select
                                                    showSearch
                                                    allowClear
                                                    placeholder="Select production expense..."
                                                    options={expItemOptions}
                                                    loading={isExpLoading}
                                                    filterOption={(input, option) =>
                                                        String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                                    }
                                                    style={{ width: "100%" }}
                                                />
                                            </Form.Item>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <span className="sm:hidden text-xs font-semibold text-gray-600 block mb-1">Unit Rate (৳):</span>
                                            <InputNumber
                                                value={rate}
                                                disabled
                                                precision={2}
                                                style={{ width: "100%" }}
                                                className="bg-gray-100 font-semibold text-gray-700 text-center"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <span className="sm:hidden text-xs font-semibold text-gray-600 block mb-1">Quantity:</span>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "quantity"]}
                                                className="mb-0"
                                            >
                                                <InputNumber
                                                    min={0}
                                                    step={1}
                                                    placeholder="0.00"
                                                    style={{ width: "100%" }}
                                                    className="text-center"
                                                />
                                            </Form.Item>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <span className="sm:hidden text-xs font-semibold text-gray-600 block mb-1">Total (৳):</span>
                                            <InputNumber
                                                value={rowTotal}
                                                disabled
                                                precision={2}
                                                style={{ width: "100%" }}
                                                className="bg-amber-50 font-bold text-amber-800 text-center"
                                            />
                                        </div>

                                        <div className="sm:col-span-1 flex justify-center items-center">
                                            {fields.length > 1 ? (
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => remove(name)}
                                                    title="Remove item"
                                                />
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                            <Button
                                type="dashed"
                                onClick={() => add()}
                                icon={<PlusOutlined />}
                                className="w-full sm:w-auto"
                            >
                                Add Production Exp
                            </Button>

                            <div className="bg-amber-50 px-4 py-2 rounded-lg border border-amber-200 flex items-center justify-between w-full sm:w-auto gap-4">
                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Expense:</span>
                                <span className="text-base font-extrabold text-amber-800">
                                    {totalExpenseAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ৳
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </Form.List>

            <div className="flex justify-end gap-2 mt-6">
                <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                >
                    Update Product Ingredient
                </Button>
            </div>
        </Form>
    );
};

export default EditProductionIngredientForm;
