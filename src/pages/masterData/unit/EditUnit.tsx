/* eslint-disable @typescript-eslint/no-explicit-any */
import { TUnit } from '../../../types/types';
import { Button, Form, FormProps, Input } from 'antd';
import { useUpdateUnitMutation } from '../../../redux/features/unit/unit.api';
import { getResponse } from '../../../utils/getResponse';

const EditUnit = ({ item, setIsEditModal }: { item: TUnit, setIsEditModal: any }) => {
    const [form] = Form.useForm();
    const [updateUnit, { isLoading: isSubmitting }] = useUpdateUnitMutation();
    const onFinish: FormProps['onFinish'] = async (values) => {
        const res = await updateUnit({ data: values, id: item.id.toString() });
        const data = getResponse(res);
        if (data?.success) {
            setIsEditModal(false);
            form.resetFields();
        }
    };
    return (
        <div>
            <Form
                name="basic"
                layout="vertical"
                wrapperCol={{ span: 18 }}
                initialValues={item}
                onFinish={onFinish}>
                <Form.Item
                    label="Unit Name"
                    name="name"
                    rules={[{ required: true, message: 'Please input unit name!' }]}>
                    <Input placeholder="Unit name" />
                </Form.Item>
                <Form.Item label={null}>
                    <Button type="primary" htmlType="submit" loading={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default EditUnit;
