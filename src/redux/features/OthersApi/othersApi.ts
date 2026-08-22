/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../api/baseApi";

const othersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTotalLogCategory: builder.query({
      query: (info: { logCategoryId: number; date: string }) => {
        return {
          url: "/log-orders/categoryTotal",
          method: "GET",
          params: {
            logCategoryId: info.logCategoryId,
            date: info.date,
          },
        };
      },
    }),
    logToRowMaterial: builder.mutation({
      query: (data) => {
        return {
          url: "/log-to-raw",
          method: "POST",
          body: data
        }
      },
      invalidatesTags: ["logToRaw"]
    }),
    getLogToRowMaterial: builder.query({
      query: () => {
        return {
          url: "/log-to-raw",
          method: "GET",
        }
      },
      providesTags: ["logToRaw"]
    }),
    accountsItemTotal: builder.query({
      query: (accountsItemId: number) => {
        const params = new URLSearchParams()
        if (accountsItemId) {
          params.append("accountsItemId", `${accountsItemId}`)
          params.append("date", `2025-06-01`)
        }
        return {
          url: "/journal/ledgerTotal",
          method: "GET",
          params
        }
      }
    }),
    getCustomerByPhone: builder.query({
      query: (phone: string) => {
        const params = new URLSearchParams()

        if (phone) {
          params.append("contact", `${phone}`)
        }
        return {
          url: "/customer",
          method: "GET",
          params
        }
      }
    })
  }),
});

export const { useLazyGetTotalLogCategoryQuery, useLogToRowMaterialMutation, useLazyAccountsItemTotalQuery, useGetLogToRowMaterialQuery, useLazyGetCustomerByPhoneQuery } = othersApi;
