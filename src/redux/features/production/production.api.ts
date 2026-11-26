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
    status?: string;
    productinfo: {
        productId: number;
        quantityAdd?: number;
        unitPrice?: number;
    };
    rawMaterials?: ProductionRawMaterial[];
    productionExpenses?: ProductionExpense[];
    packingMaterials?: ProductionPackingMaterial[];
}

const productionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createProduction: builder.mutation({
            query: ({ data, id }) => {
                let url;
                if (id) {
                    url = `/production/${id}`;
                } else {
                    url = "/production";
                }
                return {
                    url: `${url}`,
                    method: "PUT",
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

    })
})

export const {
    useCreateProductionMutation,
    useUpdateProductionMutation,
    useGetProductionsQuery,
    useGetProductionByIdQuery,
} = productionApi