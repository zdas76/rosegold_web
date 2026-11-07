import { TUnit } from "../../../types/types";
import { baseApi } from "../../api/baseApi";

const unitApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUnits: builder.query({
            query: () => `/unit`,
            providesTags: ['unit'],
        }),
        createUnit: builder.mutation({
            query: (data) => ({
                url: `/unit`,
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['unit']
        }),
        updateUnit: builder.mutation({
            query: (info: { data: TUnit; id: string }) => ({
                url: `/unit/${info?.id}`,
                method: 'PUT',
                body: info?.data
            }),
            invalidatesTags: ['unit']
        }),
        deleteUnit: builder.mutation({
            query: (id: number) => ({
                url: `/unit/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['unit']
        }),
    }),
})

export const { useGetUnitsQuery, useCreateUnitMutation, useUpdateUnitMutation, useDeleteUnitMutation } = unitApi
export const unitApiEndPoints = unitApi.endpoints