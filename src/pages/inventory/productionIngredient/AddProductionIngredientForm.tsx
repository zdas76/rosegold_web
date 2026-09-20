/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, Input, Button, Select } from "antd";
import { useCreateProductionIngredientMutation } from "../../../redux/features/productionIngredient/productionIngredient.api";
import { useGetRowMaterialsQuery } from "../../../redux/features/rowMaterials/rowMaterials.api";
import { getResponse } from "../../../utils/getResponse";

const AddProductionIngredientForm = ({
    setIsModalOpen,
    defaultType = "SOAP",
}: {
    setIsModalOpen: (open: boolean) => void;
    defaultType?: string;
}) => {
    const [form] = Form.useForm();
    const [createIngredient, { isLoading }] = useCreateProductionIngredientMutation();
    const { data: rawMaterialsData, isLoading: isRawLoading } = useGetRowMaterialsQuery({});

    const rawMaterialOptions = rawMaterialsData?.data?.map((rm: any) => ({
        label: `${rm.name} (${rm.unit?.name || "Unit"})`,
        value: rm.id,
    })) || [];

    const onFinish = async (values: any) => {
        const payload = {
            productionName: values.productionName,
            type: values.type || defaultType,
            rawMaterialIds: values.rawMaterialIds || [],
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
            initialValues={{ type: defaultType }}
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
                    Add Ingredient
                </Button>
            </div>
        </Form>
    );
};

export default AddProductionIngredientForm;
