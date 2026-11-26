/* eslint-disable @typescript-eslint/no-explicit-any */
import { FaEdit, FaTrash } from "react-icons/fa";
import CommonModal from "../../../components/modals/CommonModal"
import { Table } from 'antd';
import Column from "antd/es/table/Column";
import { getResponse } from "../../../utils/getResponse";
import { useState } from "react";
import { TCategory, TUnit } from "../../../types/types";
import Swal from "sweetalert2";
import AddProduct from "./AddProduct";
import { useDeleteProductMutation, useGetProductsQuery } from "../../../redux/features/product/product.api";
import EdiitProduct from "./EditProductModal";
import dayjs from "dayjs";

const Product = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteProduct] = useDeleteProductMutation()
    const { data: products, isFetching, isLoading } = useGetProductsQuery({})
    const [isEditModal, setIsEditModal] = useState<TUnit | null>();
    const allproduct = products?.data;

    const allproductData = allproduct?.map((item: TCategory, idx: number) => {
        return {
            ...item,
            key: idx + 1
        }
    });

    // console.log(allproductData);
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
                const data = await deleteProduct(id)
                getResponse(data)
            }
        });
    }
    return (
        <div className="">
            <div className="flex items-center justify-between">
                <div className="bg-white rounded-lg px-4 py-2">
                    <h1 className="font-bold text-lg md:text-xl m-0">Products</h1>
                </div>
                <div>
                    <CommonModal title="Add Product" btnClass="px-4 bg-slate-800 text-white py-2" btnText="Add Products" isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
                        <AddProduct setIsModalOpen={setIsModalOpen} />
                    </CommonModal>
                </div>
            </div>
            {/* display employes */}
            <div className="mt-4 bg-white p-4 rounded-md shadow">
                <Table dataSource={allproductData} loading={isFetching || isLoading} className="" size="small">
                    <Column title="No" dataIndex="key" className="" />
                    <Column title="Name" dataIndex="name" className="" />
                    {/* <Column title="Min price" dataIndex="minPrice" className="" /> */}
                    <Column title="Size" dataIndex="size" className="" />
                    <Column title="Opening Date" dataIndex="openingDate" render={(timestamp: string) => {
                        return <span>
                            {dayjs(timestamp).format("DD-MMM-YY")}
                        </span>
                    }} />
                    <Column title="Opening Quantity" dataIndex="quantity" className="" />
                    <Column title="Alert Qty" dataIndex="alertQuantity" render={(val: any) => val ?? '-'} />
                    <Column title="Opening Amount" dataIndex="amount" className="" />
                    <Column title="Status" dataIndex="status" className="" />

                    <Column title="Action" render={(item) => {
                        return <div className="flex gap-4">
                            <CommonModal btnText={<><FaEdit />Edit</>} isModalOpen={isEditModal?.id === item?.id} setIsModalOpen={(state: any) => setIsEditModal(state ? item : null)} title="Edit Product">
                                <EdiitProduct item={item} setIsEditModal={setIsEditModal} />
                            </CommonModal>
                            <button onClick={() => handleDelete(item?.id)} className="hover:text-white cursor-pointer flex items-center gap-1 bg-gray-300 p-1 px-2 rounded hover:bg-slate-500"><FaTrash />Delete</button>
                        </div>
                    }} />

                </Table>
            </div >
        </div >
    )
}

export default Product