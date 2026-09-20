/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, Input, Button, Select } from "antd";
import { useUpdateProductionIngredientMutation } from "../../../redux/features/productionIngredient/productionIngredient.api";
import { useGetRowMaterialsQuery } from "../../../redux/features/rowMaterials/rowMaterials.api";
import { getResponse } from "../../../utils/getResponse";
import { useEffect } from "react";

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

    const rawMaterialOptions = rawMaterialsData?.data?.map((rm: any) => ({
        label: `${rm.name} (${rm.unit?.name || "Unit"})`,
        value: rm.id,
    })) || [];

    useEffect(() => {
        if (item) {
            form.setFieldsValue({
                productionName: item.productionName,
                type: item.type || "SOAP",
                rawMaterialIds: item.rawMaterials?.map((rm: any) => rm.id) || [],
            });
        }
    }, [item, form]);

    const onFinish = async (values: any) => {
        const payload = {
            id: item.id,
            productionName: values.productionName,
            type: values.type,
            rawMaterialIds: values.rawMaterialIds || [],
        };
        const res = await updateIngredient(payload);
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
            onFinish={onFinish}
            className="p-2"
        >
            <Form.Item
                label="Ingredient / Formula Name"
                name="productionName"
                rules={[{ required: true, message: "Please enter formula/ingredient name" }]}
            >
                <Input placeholder="e.g. Lemon Soap Formula 500g" />
            </Form.Item>

            <Form.Item
                label="Production Type"
                name="type"
                rules={[{ required: true, message: "Please select a production type" }]}
            >
                <Select
                    options={[
                        { label: "Soap Creation", value: "SOAP" },
                        { label: "Detergent", value: "DETERGENT" },
                        { label: "Kitchen Bar", value: "KITCHENBAR" },
                    ]}
                />
            </Form.Item>

            <Form.Item
                label="Select Raw Materials"
                name="rawMaterialIds"
                rules={[{ required: true, message: "Please select at least one raw material" }]}
            >
                <Select
                    mode="multiple"
                    allowClear
                    placeholder="Choose raw materials"
                    options={rawMaterialOptions}
                    loading={isRawLoading}
                    filterOption={(input, option) =>
                        String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                />
            </Form.Item>

            <div className="flex justify-end gap-2 mt-4">
                <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={isLoading}>
                    Update Ingredient
                </Button>
            </div>
        </Form>
    );
};

export default EditProductionIngredientForm;
