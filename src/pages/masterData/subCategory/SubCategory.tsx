/* eslint-disable @typescript-eslint/no-explicit-any */
import { FaEdit, FaTrash } from "react-icons/fa";
import CommonModal from "../../../components/modals/CommonModal";
import { Button, Form, FormProps, Input, Select, Table } from 'antd';
import Column from "antd/es/table/Column";
import { useDeleteSubCategoryMutation, useGetCategoriesQuery, useGetsubCategoryQuery, useSub_categoryMutation } from "../../../redux/features/category/category.api";
import { getResponse } from "../../../utils/getResponse";
import { useState } from "react";
import { Tsubcategroy } from "../../../types/types";
import UpdateSubCategory from "./UpdateSubCategory";
import Swal from "sweetalert2";

const SubCategory = () => {
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditSubCategory, setIsEditSubCategoryModal] = useState<Tsubcategroy | null>();

    const [createSubCategory, { isLoading: isSubmitting }] = useSub_categoryMutation();
    const { data: category, isLoading } = useGetCategoriesQuery({});
    const { data: subCategory, isFetching, isLoading: subLoading } = useGetsubCategoryQuery({});
    const [deleteSubcategory] = useDeleteSubCategoryMutation();

    const onFinish: FormProps['onFinish'] = async (values) => {
        const res = await createSubCategory(values);
        const data = getResponse(res);
        if (data?.success) {
            setIsModalOpen(false);
            form.resetFields();
        }
    };

    const selectCategory = category?.data?.map((item: { id: number; categoryName: string }) => {
        return {
            value: item?.id,
            label: item?.categoryName
        };
    });

    const subCategoryarray = subCategory?.data?.map((item: Tsubcategroy, idx: number) => {
        return {
            ...item,
            key: idx + 1,
            category: item?.category?.categoryName,
            subCategoryName: item?.subCategoryName,
        };
    });

    const handleDelete = (id: number) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#C58D2F",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                const data = await deleteSubcategory(id);
                getResponse(data);
            }
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between">
                <div className="bg-white rounded-lg px-4 py-2">
                    <h1 className="font-bold text-lg md:text-xl m-0">Sub Category</h1>
                </div>
                <div>
                    <CommonModal title="Sub Category" btnClass="bg-white px-3 rounded" btnText="Create Sub_Category" isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
                        <Form
                            form={form}
                            layout="vertical"
                            className="flex flex-col gap-3"
                            name="basic"
                            initialValues={{ remember: true }}
                            onFinish={onFinish}
                            autoComplete="off">
                            <Form.Item label="Select Category"
                                name="categoryId"
                                style={{ width: "100%" }}
                                rules={[{ required: true, message: 'Select a Category!' }]}>
                                <Select
                                    disabled={isLoading}
                                    placeholder="Select parent category"
                                    className="w-full mb-3"
                                    options={selectCategory}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Sub_Category Name"
                                name="subCategoryName"
                                rules={[{ required: true, message: 'Please input sub-category name!' }]}>
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
            {/* display subcategories */}
            <div className="mt-3 bg-white p-3 pb-1 rounded-md shadow">
                <Table dataSource={subCategoryarray} loading={isFetching || subLoading} className="" size="small">
                    <Column title="No" dataIndex="key" key="categoryName" className="font-bold" />
                    <Column
                        title={<span className="font-bold">Sub Category Name</span>}
                        dataIndex="subCategoryName" className="font-semibold"
                    />
                    <Column
                        title={<span className="font-bold">Category Name</span>}
                        dataIndex="category"
                        key="categoryName"
                    />
                    <Column
                        title={<span className="font-bold">Action</span>}
                        render={(item) => {
                            return (
                                <div className="flex gap-4">
                                    <CommonModal
                                        btnText={<><FaEdit />Edit</>}
                                        isModalOpen={isEditSubCategory?.id === item?.id}
                                        setIsModalOpen={(state: any) => setIsEditSubCategoryModal(state ? item : null)}
                                        title="Edit Sub Category"
                                    >
                                        <div>
                                            <UpdateSubCategory item={item} setIsEditSubCategoryModal={setIsEditSubCategoryModal} />
                                        </div>
                                    </CommonModal>
                                    <button
                                        onClick={() => handleDelete(item?.id)}
                                        className="hover:text-white cursor-pointer flex items-center gap-1 bg-gray-300 p-1 px-2 rounded hover:bg-slate-500"
                                    >
                                        <FaTrash />Delete
                                    </button>
                                </div>
                            );
                        }}
                    />
                </Table>
            </div>
        </div>
    );
};

export default SubCategory;
