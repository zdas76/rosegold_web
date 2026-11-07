import { Form, Input, Button, Select } from "antd";

import { useUpdatePartyMutation } from "../../../redux/features/auth/authApi";
import { getResponse } from "../../../utils/getResponse";
import { TParty } from "../../../types/types";

const EditPartyForm = ({ item }: { item: TParty }) => {
    const [form] = Form.useForm();
    const [updateParty, { isLoading: isSubmitting }] = useUpdatePartyMutation();

    const onFinish = async (values: TParty) => {
        const response = await updateParty({ data: values, id: item?.id });
        const res = getResponse(response);
        if (res?.success) {
            window.location.reload();
        }
    };

    return (
        <div>
            <Form
                initialValues={item}
                form={form}
                layout="vertical"
                onFinish={onFinish}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item label="Name" name="name" rules={[{ required: true, message: "Name is required" }]}>
                        <Input placeholder="Enter name" />
                    </Form.Item>
                    <Form.Item
                        label="Contact Number"
                        name="contactNo"
                        rules={[
                            { required: true, message: "Contact Number is required" },
                            { len: 11, message: "Contact Number must be exactly 11 digits" },
                        ]}
                    >
                        <Input
                            placeholder="Enter Contact Number"
                            maxLength={11}
                            onKeyDown={(event) => {
                                if (
                                    ["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"].includes(event.key)
                                ) {
                                    return;
                                }
                                // Prevent letters (A-Z, a-z)
                                if (/[a-zA-Z]/.test(event.key)) {
                                    event.preventDefault();
                                }
                            }}
                        />
                    </Form.Item>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item label="Address" name="address" rules={[{ required: true, message: "Address is required" }]}>
                        <Input placeholder="Enter Address" />
                    </Form.Item>
                    <Form.Item label="Distributor Type" name="partyType" rules={[{ required: true, message: "Please select a type" }]}>
                        <Select
                            placeholder="Select Type"
                            disabled
                            options={[
                                { value: 'VENDOR', label: 'VENDOR' },
                                { value: 'CUSTOMER', label: 'CUSTOMER' },
                                { value: 'PARTY', label: 'PARTY' },
                                { value: 'DISTRIBUTOR', label: 'DISTRIBUTOR' },
                            ]} />
                    </Form.Item>
                </div>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default EditPartyForm;
