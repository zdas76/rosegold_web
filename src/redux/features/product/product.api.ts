import { TProduct } from "../../../types/types";
import { baseApi } from "../../api/baseApi";

const productApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getProducts: build.query({
            query: () => "/product",
            providesTags: ["product"],
        }),
        addProduct: build.mutation({
            query: (data) => ({
                url: "/product",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["product"],
        }),
        updateProduct: build.mutation({
            query: (info: { data: TProduct; id: number }) => ({
                url: `/product/${info.id}`,
                method: "PUT",
                body: info?.data,
            }),
            invalidatesTags: ["product"],
        }),
        deleteProduct: build.mutation({
            query: (id: number) => ({
                url: `/product/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["product"],
        }),
        // convert product
        convertProduct: build.mutation({
            query: (data) => {
                return {
                    url: `/create-product`,
                    method: "POST",
                    body: data,
                }
            }
        }),
        // product report
        getProductStockReport: build.query({
            query: (data) => {
                const params = {
                    startDate: data?.startDate,
                    endDate: data?.endDate,
                }
                return {
                    url: `/report/product`,
                    method: "GET",
                    params,
                }
            }
        }),
        getProductStockReportById: build.query({
            query: (id: number) => {
                return {
                    url: `/report/product/${id}`,
                    method: "GET",
                }
            }
        }),

    }),
})
export const { useGetProductsQuery, useAddProductMutation, useUpdateProductMutation, useDeleteProductMutation, useConvertProductMutation, useGetProductStockReportQuery, useGetProductStockReportByIdQuery } = productApi;