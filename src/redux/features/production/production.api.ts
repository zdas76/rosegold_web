/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../api/baseApi";

const productionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createProduction: builder.mutation({
            query: (data) => {
                return {
                    url: "/production",
                    method: "POST",
                    body: data
                }
            },
            invalidatesTags: ["production"]
        }),
        createSoapProduction: builder.mutation({
            query: (data) => {
                return {
                    url: "/production",
                    method: "POST",
                    body: data
                }
            },
            invalidatesTags: ["production"]
        }),
        createKitchenbarProduction: builder.mutation({
            query: (data) => {
                return {
                    url: "/production",
                    method: "POST",
                    body: data
                }
            },
            invalidatesTags: ["production"]
        }),
        createDetergentProduction: builder.mutation({
            query: (data) => {
                return {
                    url: "/production",
                    method: "POST",
                    body: data
                }
            },
            invalidatesTags: ["production"]
        }),
        getSoapProductions: builder.query({
            query: () => {
                return {
                    url: "/soap/production",
                    method: "GET"
                }
            },
            providesTags: ["production"]
        }),
        getDetergentProductions: builder.query({
            query: () => {
                return {
                    url: "/detergent/production",
                    method: "GET"
                }
            },
            providesTags: ["production"]
        }),
        getSoapProductionById: builder.query({
            query: (id: number) => {
                return {
                    url: `/soap/production/${id}`,
                    method: "GET"
                }
            },
            providesTags: ["production"]
        }),
        getDetergentProductionById: builder.query({
            query: (id: number) => {
                return {
                    url: `/detergent/production/${id}`,
                    method: "GET"
                }
            },
            providesTags: ["production"]
        }),
        updateSoapProduction: builder.mutation({
            query: (data: { id: number, body: any }) => {
                return {
                    url: `/soap/production/${data.id}`,
                    method: "PUT",
                    body: data.body
                }
            },
            invalidatesTags: ["production"]
        }),
        updateDetergentProduction: builder.mutation({
            query: (data: { id: number, body: any }) => {
                return {
                    url: `/detergent/production/${data.id}`,
                    method: "PUT",
                    body: data.body
                }
            },
            invalidatesTags: ["production"]
        }),
        deleteSoapProduction: builder.mutation({
            query: (id: number) => {
                return {
                    url: `/soap/production/${id}`,
                    method: "DELETE"
                }
            },
            invalidatesTags: ["production"]
        }),
        deleteDetergentProduction: builder.mutation({
            query: (id: number) => {
                return {
                    url: `/detergent/production/${id}`,
                    method: "DELETE"
                }
            },
            invalidatesTags: ["production"]
        }),
    })
})

export const {
    useCreateProductionMutation,
    useCreateSoapProductionMutation,
    useCreateKitchenbarProductionMutation,
    useCreateDetergentProductionMutation,
    useGetSoapProductionsQuery,
    useGetDetergentProductionsQuery,
    useGetSoapProductionByIdQuery,
    useGetDetergentProductionByIdQuery,
    useUpdateSoapProductionMutation,
    useUpdateDetergentProductionMutation,
    useDeleteSoapProductionMutation,
    useDeleteDetergentProductionMutation
} = productionApi