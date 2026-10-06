/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../api/baseApi";

export interface ProductionRawMaterial {
    id?: number;
    rawId: number;
    quantity: number;
    unitPrice: number;
}

export interface ProductionExpense {
    id?: number;
    proExpencesItemId: number;
    unitRate: number;
    expDuration: number;
    amount: number;
}

export interface ProductionPackingMaterial {
    id?: number;
    packingMaterialId: number;
    unitPrice: number;
    Qty: number;
    perUnitQty: number;
    perUnitCost: number;
}

export interface Production {
    date: string;
    batchNo: string;
    productinfo: {
        productId: number;
        quantity?: number;
        unitPrice?: number;
    };
    rawMaterials?: ProductionRawMaterial[];
    productionExpenses?: ProductionExpense[];
    packingMaterials?: ProductionPackingMaterial[];
}

const productionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createProduction: builder.mutation({
            query: (data) => {
                return {
                    url: "/production",
                    method: "PATCH",
                    body: data
                }
            },
            invalidatesTags: ["production"]
        }),
        updateProduction: builder.mutation({
            query: ({ id, body }: { id?: number; body: any }) => {
                return {
                    url: id ? `/production/${id}` : "/production",
                    method: "PATCH",
                    body: body
                }
            },
            invalidatesTags: ["production"]
        }),
        getProductions: builder.query({
            query: (params?: any) => {
                return {
                    url: "/production",
                    method: "GET",
                    params: params
                }
            },
            providesTags: ["production"]
        }),

        getProductionById: builder.query({
            query: (id: number | string) => {
                return {
                    url: `/production/${id}`,
                    method: "GET"
                }
            },
            providesTags: ["production"]
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
    useUpdateProductionMutation,
    useGetProductionsQuery,
    useGetProductionByIdQuery,
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