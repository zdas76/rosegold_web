/* eslint-disable @typescript-eslint/no-explicit-any */
import { TLogs, TUnit } from '../../../types/types'
import { Button, Form, FormProps, InputNumber, Select } from 'antd';
import { getResponse } from '../../../utils/getResponse';
import { useGetLogsQuery, useUpdateGradeMutation } from '../../../redux/features/logAndGrade/LogAndGrade.api';
const { Option } = Select;
const EditGrades = ({ item, setIsEditModal }: { item: TUnit, setIsEditModal: any }) => {

    const [form] = Form.useForm()
    const { data: log } = useGetLogsQuery({})

    const [updateUnit, { isLoading: isSubmitting }] = useUpdateGradeMutation()

    const onFinish: FormProps['onFinish'] = async (values) => {
        const res = await updateUnit({ data: values, id: item.id })
        const data = getResponse(res)
        if (data?.success) {
            setIsEditModal(false)
            form.resetFields()
        }
    };
    return (
        <div>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={item}>
                <Form.Item
                    label="Log Category ID"
                    name="categoryId"
                    rules={[{ required: true, message: 'Please enter Category ID' }]}>
                    <Select placeholder="Select Product" className="w-full">
                        {
                            log?.data?.map((item: TLogs) => (
                                <Option value={item?.id} key={item?.id}>{item?.name}</Option>
                            ))
                        }
                    </Select>
                </Form.Item>
                <Form.Item
                    label="Grade Name"
                    name="gradeName"
                    rules={[{ required: true, message: 'Please select a Grade Name' }]}
                >
                    <Select className="w-full" placeholder="Select a grade">
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((grade) => (
                            <Option key={grade} value={grade}>
                                {grade}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Min Radius"
                    name="minRadius"
                    rules={[{ required: true, message: 'Please enter Min Radius' }]}
                >
                    <InputNumber className="w-full" style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                    label="Max Radius"
                    name="maxRadius"
                    rules={[{ required: true, message: 'Please enter Max Radius' },
                        ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const minRadius = getFieldValue("minRadius");
                                            if (value === undefined || minRadius === undefined) {
                                                return Promise.resolve(); // Let the required rule handle this
                                            } if (value > minRadius) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Max Radius must be greater than Min Radius'));
                                        }
                                    })
                    ]}
                >
                    <InputNumber className="w-full" style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                    label="Unit Price"
                    name="unitPrice"
                    rules={[{ required: true, message: 'Please enter Unit Price' }]}
                >
                    <InputNumber className="w-full" style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" className="w-full" loading={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default EditGrades