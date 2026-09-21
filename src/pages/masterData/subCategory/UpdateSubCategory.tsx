/* eslint-disable @typescript-eslint/no-explicit-any */
import { useUpdateSubCategoryMutation } from '../../../redux/features/category/category.api';
import { Button, Form, FormProps, Input } from 'antd';
import { getResponse } from '../../../utils/getResponse';
import { TCategory } from '../../../types/types';

const UpdateSubCategory = ({ item, setIsEditSubCategoryModal }: { setIsEditSubCategoryModal: any; item: TCategory }) => {
    const [updateCategory, { isLoading: isSubmitting }] = useUpdateSubCategoryMutation();
    const onFinish: FormProps['onFinish'] = async (values) => {
        const res = await updateCategory({ data: values, id: item?.id });
        const data = getResponse(res);
        if (data?.success) {
            setIsEditSubCategoryModal(false);
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
                    label="Sub Category Name"
                    name="subCategoryName"
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
    );
};

export default UpdateSubCategory;
