/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, Button, Select, Divider } from "antd";
import { useCreateProductionIngredientMutation } from "../../../redux/features/productionIngredient/productionIngredient.api";
import { useGetRowMaterialsQuery } from "../../../redux/features/rowMaterials/rowMaterials.api";
import { useGetPackingMaterialsQuery } from "../../../redux/features/packingMaterials/packingMaterials.api";
import { useGetProductsQuery } from "../../../redux/features/product/product.api";
import { getResponse } from "../../../utils/getResponse";

const AddProductionIngredientForm = ({
    setIsModalOpen,
    defaultProductId,
}: {
    setIsModalOpen: (open: boolean) => void;
    defaultProductId?: number;
}) => {
    const [form] = Form.useForm();
    const [createIngredient, { isLoading }] = useCreateProductionIngredientMutation();
    const { data: rawMaterialsData, isLoading: isRawLoading } = useGetRowMaterialsQuery({});
    const { data: packingMaterialsData, isLoading: isPackingLoading } = useGetPackingMaterialsQuery({});
    const { data: productsData, isLoading: isProductsLoading } = useGetProductsQuery({});

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

    const onFinish = async (values: any) => {
        const rawSelectedIds: number[] = values.rawMaterialIds || [];
        const packingSelectedIds: number[] = values.packingMaterialIds || [];

        const rawMaterialIds = rawSelectedIds.map((id: number) => ({
            rawId: Number(id),
            ingredienteQty: 0,
        }));

        const packingList = packingSelectedIds.map((id: number) => {
            const pmObj = packingMaterialsData?.data?.find((p: any) => p.id === id);
            return {
                id: Number(id),
                name: pmObj?.name || "",
                unitId: pmObj?.unitId || 1,
                ingredienteQty: 0,
            };
        });

        const payload = {
            productId: Number(values.productId),
            rawMaterialIds,
            rawMaterials: rawSelectedIds.map(Number),
            PackingMaterial: packingList,
            packingMaterials: packingList,
            packingMaterialIds: packingSelectedIds.map(Number),
        };

        const res = await createIngredient(payload);
        const response = getResponse(res);
        if (response?.success) {
            setIsModalOpen(false);
            form.resetFields();
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{
                productId: defaultProductId,
                rawMaterialIds: [],
                packingMaterialIds: [],
            }}
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
                name="rawMaterialIds"
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
                name="packingMaterialIds"
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

            <div className="flex justify-end gap-2 mt-6">
                <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                >
                    Add Product Ingredient
                </Button>
            </div>
        </Form>
    );
};

export default AddProductionIngredientForm;
