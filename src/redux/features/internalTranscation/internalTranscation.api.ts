/* eslint-disable @typescript-eslint/no-explicit-any */
import { TVoucherType } from "../../../types/types";
import { baseApi } from "../../api/baseApi";



export const internalTransactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRawRequest: builder.mutation({
      query: (data) => ({
        url: "/internal-transaction/raw-request",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["internalTransaction"],
    }),
    createProductTransferRequest: builder.mutation({
      query: (data: any) => ({
        url: "/internal-transaction/product-request",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["product-request", "internalTransaction"],
    }),
    getRequestAll: builder.query({
      query: (voucherType?: TVoucherType) => {
        const params = new URLSearchParams()
        if (voucherType) {
          params.append("voucherType", voucherType)
        }
        return {
          url: "/internal-transaction/request",
          method: "GET",
          params,
        }
      },
      providesTags: ["internalTransaction", "product-request"],
    }),
    // getRawRequests: builder.query({
    //   query: (params?: any) => ({
    //     url: "/internal-transaction/raw-request",
    //     method: "GET",
    //     params,
    //   }),
    //   providesTags: ["internalTransaction"],
    // }),
    getRequestById: builder.query({
      query: ({ id, voucherType }: { id: number | string; voucherType?: TVoucherType | string }) => {
        const params = new URLSearchParams()
        if (voucherType) {
          params.append("voucherType", voucherType)
        }
        return {
          url: `/internal-transaction/request/${id}`,
          method: "GET",
          params,
        }
      },
      providesTags: ["internalTransaction", "product-request"],
    }),

    approveRawRequest: builder.mutation({
      query: (data: any) => ({
        url: "/internal-transaction/raw-approve",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["internalTransaction"],
    }),

    approveProductRequest: builder.mutation({
      query: (data: any) => ({
        url: "/internal-transaction/prodcut-approve",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["internalTransaction", "product-request"],
    }),
    // rawApprove: builder.mutation({
    //   query: (data: any) => ({
    //     url: "/internal-transaction/raw-approve",
    //     method: "POST",
    //     body: data,
    //   }),
    //   invalidatesTags: ["internalTransaction"],
    // }),
  }),
});

export const {
  useCreateRawRequestMutation,
  useGetRequestAllQuery,
  useGetRequestByIdQuery,
  useLazyGetRequestByIdQuery,
  useApproveRawRequestMutation,
  useApproveProductRequestMutation,
  useCreateProductTransferRequestMutation,
  // useRawApproveMutation,
} = internalTransactionApi;
