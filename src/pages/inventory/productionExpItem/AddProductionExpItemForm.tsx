/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, Input, Button, InputNumber } from "antd";
import { useCreateProductionExpItemMutation } from "../../../redux/features/productionExpItem/productionExpItem.api";
import { getResponse } from "../../../utils/getResponse";

const AddProductionExpItemForm = ({ setIsModalOpen }: { setIsModalOpen: any }) => {
    const [form] = Form.useForm();
    const [createProductionExpItem, { isLoading: isSubmitting }] = useCreateProductionExpItemMutation();

    const onFinish = async (values: any) => {
        const payload = {
            expItemName: values.expItemName,
            unitRate: Number(values.unitRate) || 0,
        };

        const res = await createProductionExpItem(payload);
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
            className="p-4 rounded">
            <div className="grid grid-cols-1 gap-y-2">
                {/* Expense Item Name */}
                <Form.Item
                    label="Expense Item Name"
                    name="expItemName"
                    rules={[{ required: true, message: "Please enter expense item name" }]}>
                    <Input placeholder="e.g. Electricity Cost" />
                </Form.Item>

                {/* Unit Rate */}
                <Form.Item
                    label="Unit Rate (BDT)"
                    name="unitRate"
                    rules={[{ required: true, message: "Please enter unit rate" }]}>
                    <InputNumber
                        type="number"
                        min={0}
                        step={0.01}
                        style={{ width: "100%" }}
                        placeholder="e.g. 120.00"
                    />
                </Form.Item>
            </div>

            {/* Submit Button */}
            <Form.Item className="mt-4 mb-0">
                <Button type="primary" htmlType="submit" loading={isSubmitting} className="w-full">
                    {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default AddProductionExpItemForm;
