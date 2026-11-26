/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../api/baseApi";

const packingMaterialsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createPackingMaterial: builder.mutation({
            query: (data: any) => {
                return {
                    url: "/packing_material",
                    method: "POST",
                    body: data,
                };
            },
            invalidatesTags: ["packingMaterial"],
        }),
        getPackingMaterials: builder.query({
            query: (params?: any) => {
                return {
                    url: "/packing_material",
                    method: "GET",
                    params,
                };
            },
            providesTags: ["packingMaterial"],
        }),
        getPackingMaterialById: builder.query({
            query: (id: number) => {
                return {
                    url: `/packing_material/${id}`,
                    method: "GET",
                };
            },
            providesTags: ["packingMaterial"],
        }),
        updatePackingMaterial: builder.mutation({
            query: (data: { id: number; body: any }) => {
                return {
                    url: `/packing_material/${data.id}`,
                    method: "PUT",
                    body: data.body,
                };
            },
            invalidatesTags: ["packingMaterial"],
        }),
        deletePackingMaterial: builder.mutation({
            query: (id: number) => {
                return {
                    url: `/packing_material/${id}`,
                    method: "DELETE",
                };
            },
            invalidatesTags: ["packingMaterial"],
        }),
        getPackingMaterialStockReport: builder.query({
            query: (params?: { startDate?: string; endDate?: string }) => {
                const queryParams = new URLSearchParams();
                if (params?.startDate) {
                    queryParams.append("startDate", params.startDate);
                }
                if (params?.endDate) {
                    queryParams.append("endDate", params.endDate);
                }
                const queryString = queryParams.toString();
                return {
                    url: queryString ? `/report/packing-materials?${queryString}` : "/report/packing-materials",
                    method: "GET",
                };
            },
            providesTags: ["packingMaterial"],
        }),
        getPackingMaterialStockReportById: builder.query({
            query: (info: { id: number | string; startDate?: string; endDate?: string } | number | string) => {
                const id = typeof info === 'object' ? info.id : info;
                const startDate = typeof info === 'object' ? info.startDate : undefined;
                const endDate = typeof info === 'object' ? info.endDate : undefined;
                const params = new URLSearchParams();
                if (startDate) params.append("startDate", startDate);
                if (endDate) params.append("endDate", endDate);
                const queryString = params.toString();
                return {
                    url: queryString ? `/report/packing-materials/${id}?${queryString}` : `/report/packing-materials/${id}`,
                    method: "GET",
                };
            },
            providesTags: ["packingMaterial"],
        }),
    }),
});

export const {
    useCreatePackingMaterialMutation,
    useGetPackingMaterialsQuery,
    useGetPackingMaterialByIdQuery,
    useUpdatePackingMaterialMutation,
    useDeletePackingMaterialMutation,
    useGetPackingMaterialStockReportQuery,
    useGetPackingMaterialStockReportByIdQuery,
} = packingMaterialsApi;
