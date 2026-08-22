import { TBankForm } from "../../../types/types";
import { baseApi } from "../../api/baseApi";

const bankapi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        adBank: builder.mutation({
            query: (data: TBankForm) => {
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
            query: (info: { data: TBankForm, id: number }) => {
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