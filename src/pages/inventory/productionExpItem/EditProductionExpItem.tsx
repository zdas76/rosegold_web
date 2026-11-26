/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, Input, InputNumber } from "antd";
import { useUpdateProductionExpItemMutation } from "../../../redux/features/productionExpItem/productionExpItem.api";
import { getResponse } from "../../../utils/getResponse";

const EditProductionExpItem = ({ item, setIsEditModal }: { setIsEditModal: any; item: any }) => {
    const [form] = Form.useForm();
    const [updateProductionExpItem, { isLoading }] = useUpdateProductionExpItemMutation();

    const onFinish = async (values: any) => {
        const payload = {
            id: item?.id,
            body: {
                expItemName: values.expItemName,
                unitRate: Number(values.unitRate) || 0,
            },
        };

        const res = await updateProductionExpItem(payload);
        const response = getResponse(res);
        if (response?.success) {
            setIsEditModal(false);
        }
    };

    const initialValues = {
        expItemName: item?.expItemName,
        unitRate: item?.unitRate,
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={onFinish}
            autoComplete="off"
            className="p-4"
        >
            <div className="grid grid-cols-1 gap-y-2">
                <Form.Item
                    label="Expense Item Name"
                    name="expItemName"
                    rules={[{ required: true, message: "Please enter expense item name" }]}
                >
                    <Input placeholder="Enter expense item name" />
                </Form.Item>

                <Form.Item
                    label="Unit Rate (BDT)"
                    name="unitRate"
                    rules={[{ required: true, message: "Please enter unit rate" }]}
                >
                    <InputNumber
                        type="number"
                        min={0}
                        step={0.01}
                        style={{ width: "100%" }}
                        placeholder="Unit rate"
                    />
                </Form.Item>
            </div>

            <Form.Item className="mt-4 mb-0">
                <Button type="primary" htmlType="submit" loading={isLoading} className="w-full">
                    {isLoading ? "Updating..." : "Update"}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default EditProductionExpItem;
