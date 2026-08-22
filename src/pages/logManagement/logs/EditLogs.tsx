/* eslint-disable @typescript-eslint/no-explicit-any */
import { TUnit } from '../../../types/types'
import { Button, Form, FormProps, Input } from 'antd';
import { getResponse } from '../../../utils/getResponse';
import { useUpdateLogsMutation } from '../../../redux/features/logAndGrade/LogAndGrade.api';

const EditLogs = ({ item, setIsEditModal }: { item: TUnit, setIsEditModal: any }) => {
    const [form] = Form.useForm()
    const [updateLogs, { isLoading: isSubmitting }] = useUpdateLogsMutation()
    const onFinish: FormProps['onFinish'] = async (values) => {
        const res = await updateLogs({ data: values, id: item.id })
        const data = getResponse(res)
        if (data?.success) {
            setIsEditModal(false)
            form.resetFields()
        }
    };
    return (
        <div>
            <Form
                // form={form}
                name="basic"
                layout="vertical"
                // labelCol={{ span: 24 }}
                wrapperCol={{ span: 18 }}
                // style={{ maxWidth: 600 }}
                initialValues={item}
                onFinish={onFinish}>
                <Form.Item
                    label="Logs Name"
                    name="name"
                    rules={[{ required: true, message: 'Please input your Log name!' }]}>
                    <Input placeholder="Log name" />
                </Form.Item>
                <Form.Item label={null}>
                    <Button type="primary" htmlType="submit" loading={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default EditLogs