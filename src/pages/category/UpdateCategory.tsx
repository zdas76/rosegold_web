/* eslint-disable @typescript-eslint/no-explicit-any */
import { useUpdateCategoryMutation } from '../../redux/features/category/category.api'
import { Button, Form, FormProps, Input } from 'antd';
import { getResponse } from '../../utils/getResponse';
import { TCategory } from '../../types/types';

const UpdateCategory = ({ item, setIsModalOpen }: { setIsModalOpen: any; item: TCategory }) => {
    const [updateCategory, { isLoading: isSubmitting }] = useUpdateCategoryMutation()

    const onFinish: FormProps['onFinish'] = async (values) => {
        const res = await updateCategory({ data: values, id: item.id })
        const data = getResponse(res)
        if (data?.success) {
            setIsModalOpen(false)
        }
    };
    return (
        <div>
            <Form
                layout="vertical"
                className="flex flex-col gap-3"
                name="basic"
                initialValues={item}
                onFinish={onFinish}
                autoComplete="off">

                <Form.Item
                    label="Category Name"
                    name="categoryName"
                    className=""
                    rules={[{ required: true, message: 'Please input category name!' }]}>
                    <Input />
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

export default UpdateCategory