 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
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
            query: (info) => ({
                url: `/unit/${_optionalChain([info, 'optionalAccess', _ => _.id])}`,
                method: 'PUT',
                body: _optionalChain([info, 'optionalAccess', _2 => _2.data])
            }),
            invalidatesTags: ['unit']
        }),
        deleteUnit: builder.mutation({
            query: (id) => ({
                url: `/unit/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['unit']
        }),
    }),
})

export const { useGetUnitsQuery, useCreateUnitMutation, useUpdateUnitMutation, useDeleteUnitMutation } = unitApi
export const unitApiEndPoints = unitApi.endpoints