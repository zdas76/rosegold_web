/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../api/baseApi";

const productionExpItemApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createProductionExpItem: builder.mutation({
            query: (data: {
                expItemName: string;
                unitRate: number;
            }) => {
                return {
                    url: "/production-exp-item",
                    method: "POST",
                    body: data,
                };
            },
            invalidatesTags: ["productionExpItem"],
        }),
        getProductionExpItems: builder.query({
            query: () => {
                return {
                    url: "/production-exp-item",
                    method: "GET",
                };
            },

            providesTags: ["productionExpItem"],
        }),
        getProductionExpItemById: builder.query({
            query: (id: number | string) => {
                return {
                    url: `/production-exp-item/${id}`,
                    method: "GET",
                };
            },
            providesTags: ["productionExpItem"],
        }),
        updateProductionExpItem: builder.mutation({
            query: (data: {
                id: number | string;
                body: {
                    expItemName: string;
                    unitRate: number;
                };
            }) => {
                return {
                    url: `/production-exp-item/${data.id}`,
                    method: "PUT",
                    body: data.body,
                };
            },
            invalidatesTags: ["productionExpItem"],
        }),
        deleteProductionExpItem: builder.mutation({
            query: (id: number | string) => {
                return {
                    url: `/production-exp-item/${id}`,
                    method: "DELETE",
                };
            },
            invalidatesTags: ["productionExpItem"],
        }),
    }),
});

export const {
    useCreateProductionExpItemMutation,
    useGetProductionExpItemsQuery,
    useGetProductionExpItemByIdQuery,
    useUpdateProductionExpItemMutation,
    useDeleteProductionExpItemMutation,
} = productionExpItemApi;
