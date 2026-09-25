/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../api/baseApi";

const packingMaterialsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createPackingMaterial: builder.mutation({
            query: (data) => {
                return {
                    url: "/packing_material",
                    method: "POST",
                    body: data,
                };
            },
            invalidatesTags: ["packingMaterial"],
        }),
        getPackingMaterials: builder.query({
            query: (params) => {
                return {
                    url: "/packing_material",
                    method: "GET",
                    params,
                };
            },
            providesTags: ["packingMaterial"],
        }),
        getPackingMaterialById: builder.query({
            query: (id) => {
                return {
                    url: `/packing_material/${id}`,
                    method: "GET",
                };
            },
            providesTags: ["packingMaterial"],
        }),
        updatePackingMaterial: builder.mutation({
            query: (data) => {
                return {
                    url: `/packing_material/${data.id}`,
                    method: "PUT",
                    body: data.body,
                };
            },
            invalidatesTags: ["packingMaterial"],
        }),
        deletePackingMaterial: builder.mutation({
            query: (id) => {
                return {
                    url: `/packing_material/${id}`,
                    method: "DELETE",
                };
            },
            invalidatesTags: ["packingMaterial"],
        }),
    }),
});

export const {
    useCreatePackingMaterialMutation,
    useGetPackingMaterialsQuery,
    useGetPackingMaterialByIdQuery,
    useUpdatePackingMaterialMutation,
    useDeletePackingMaterialMutation,
} = packingMaterialsApi;
