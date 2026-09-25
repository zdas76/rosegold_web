
import { baseApi } from "../../api/baseApi";

const bankapi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        adBank: builder.mutation({
            query: (data) => {
                return {
                    url: `/bank`,
                    method: "POST",
                    body: data
                }
            },
            invalidatesTags: ["bank"]
        }),
        getBank: builder.query({
            query: () => {
                return {
                    url: `/bank`,
                    method: "GET"
                }
            },
            providesTags: ["bank"]
        }),
        updateBank: builder.mutation({
            query: (info) => {
                console.log(info)
                return {
                    url: `/bank/${info.id}`,
                    method: "PUT",
                    body: info.data
                }
            },
            invalidatesTags: ["bank"]
        })
    })
})

export const { useAdBankMutation, useGetBankQuery, useUpdateBankMutation } = bankapi