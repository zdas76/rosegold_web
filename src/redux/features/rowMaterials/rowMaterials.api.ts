import { baseApi } from "../../api/baseApi";

const rowMaterialsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createRowMaterial: builder.mutation({
            query: (data: { name: string }) => {
                return {
                    url: "/raw_material",
                    method: "POST",
                    body: data
                }
            },
            invalidatesTags: ["rowMaterials"]
        }),
        getRowMaterials: builder.query({
            query: () => {
                return {
                    url: "/raw_material",
                    method: "GET"
                }
            },
            providesTags: ["rowMaterials"]
        }),
        updateRowMaterial: builder.mutation({
            query: (data: { name: string, id: number }) => {
                return {
                    url: `/raw_material/${data.id}`,
                    method: "PUT",
                    body: data
                }
            },
            invalidatesTags: ["rowMaterials"]
        }),
        deleteRowMaterial: builder.mutation({
            query: (id: number) => {
                return {
                    url: `/raw_material/${id}`,
                    method: "DELETE"
                }
            },
            invalidatesTags: ["rowMaterials"]
        }),
        // get log to raw materials
         getLogToRaw: builder.query({
            query: () => {
                return {
                    url: "/raw_material",
                    method: "GET"
                }
            },
            providesTags: ["rowMaterials"]
         }),
        //  raw material stock report
        getRawMaterialStockReport: builder.query({
            query: ({ startDate, endDate }: { startDate: string, endDate: string }) => {
                const params = new URLSearchParams()
                if (startDate) {
                    params.append("startDate", startDate)
                }
                if (endDate) {
                    params.append("endDate", endDate)
                }
                return {
                    url: `/report/raw?${params.toString()}`,
                    method: "GET"
                }
            },
        }),
    })
})

export const {
    useCreateRowMaterialMutation, useGetRowMaterialsQuery, useUpdateRowMaterialMutation, useDeleteRowMaterialMutation, useGetRawMaterialStockReportQuery } = rowMaterialsApi