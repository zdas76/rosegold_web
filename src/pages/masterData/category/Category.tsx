/* eslint-disable @typescript-eslint/no-explicit-any */
import { FaEdit } from "react-icons/fa";
import CommonModal from "../../../components/modals/CommonModal";
import { Button, Form, FormProps, Input, Table } from 'antd';
import Column from "antd/es/table/Column";
import { useCreateCategoryMutation, useGetCategoriesQuery } from "../../../redux/features/category/category.api";
import { getResponse } from "../../../utils/getResponse";
import { useState } from "react";
import UpdateCategory from "./UpdateCategory";
import { TCategory } from "../../../types/types";

const Category = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: category, isFetching, isLoading } = useGetCategoriesQuery({});
    const [isOpentEditModal, setIsOpentEditModal] = useState<TCategory | null>();
    const [createCategory, { isLoading: isSubmitting }] = useCreateCategoryMutation();
    const categories = category?.data;

    const categoryData = categories?.map((item: TCategory, idx: number) => {
        return {
            ...item,
            key: idx + 1
        };
    });

    const onFinish: FormProps['onFinish'] = async (values) => {
        const res = await createCategory(values);
        const data = getResponse(res);
        if (data?.success) {
            setIsModalOpen(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between">
                <div className="bg-white rounded-lg px-4 py-2">
                    <h1 className="font-bold text-lg md:text-xl m-0">Category</h1>
                </div>
                <div>
                    <CommonModal title="" btnClass="bg-white" btnText="Add Category" isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
                        <Form
                            name="basic"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 16 }}
                            style={{ maxWidth: 600 }}
                            initialValues={{ remember: true }}
                            onFinish={onFinish}
                            autoComplete="off">
                            <Form.Item
                                label="Category Name"
                                name="categoryName"
                                rules={[{ required: true, message: 'Please input category name!' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item label={null}>
                                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : "Submit"}
                                </Button>
                            </Form.Item>
                        </Form>
                    </CommonModal>
                </div>
            </div>
            {/* display category */}
            <div className="mt-2 bg-white p-3 rounded-md shadow">
                <Table dataSource={categoryData} loading={isFetching || isLoading} className="" size="small">
                    <Column title="No" dataIndex="key" key="categoryName" className="font-bold" />
                    <Column title="Name" dataIndex="categoryName" key="categoryName" className="font-bold" />
                    <Column title="Create Date" dataIndex="createdAt" key="categoryName" render={(timestamp: string) => {
                        return <span>
                            {new Date(timestamp).toLocaleString()}
                        </span>
                    }} />
                    <Column title="Action" render={(item) => {
                        return <div className="flex gap-4">
                            <CommonModal btnText={<><FaEdit />Edit</>} isModalOpen={isOpentEditModal?.id === item?.id} setIsModalOpen={(state: any) => setIsOpentEditModal(state ? item : null)} title="Edit Category">
                                <UpdateCategory item={item} setIsModalOpen={setIsOpentEditModal} />
                            </CommonModal>
                        </div>
                    }} />
                </Table>
            </div>
        </div>
    );
};

export default Category;
