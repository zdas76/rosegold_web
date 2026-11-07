/* eslint-disable @typescript-eslint/no-explicit-any */
import { TPurchaseVaouchar } from "../../../types/types";
import { baseApi } from "../../api/baseApi";

const journalApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        addPurchaseReceive: builder.mutation({
            query: (data) => ({
                url: '/journal/purchase',
                method: 'POST',
                body: data,
            }),
        }),
        createSalesVoucher: builder.mutation({
            query: (data: any) => {
                return {
                    url: `/journal/sales`,
                    method: "POST",
                    body: data
                }
            }
        }),
        createMaterialSalesVoucher: builder.mutation({
            query: (data: any) => {
                return {
                    url: `/journal/material-sale`,
                    method: "POST",
                    body: data
                }
            }
        }),
        createReceiveVoucher: builder.mutation({
            query: (data: any) => {
                return {
                    url: `/journal/received`,
                    method: "POST",
                    body: data
                }
            }
        }),
        addContraVoucher: builder.mutation({
            query: (data: any) => {
                return {
                    url: `/journal/contra`,
                    method: "POST",
                    body: data
                }
            }
        }),
        addJournalVoucher: builder.mutation({
            query: (data: any) => {
                return {
                    url: `/journal/journal`,
                    method: "POST",
                    body: data
                }
            }
        }),
        addPurchaseOrder: builder.mutation({
            query: (data: any) => ({
                url: '/purchase-order',
                method: 'POST',
                body: data,
            }),
        }),
        getPurchaseOrders: builder.query({
            query: (params: any) => ({
                url: '/purchase-order',
                method: 'GET',
                params,
            }),
        }),
        getPurchaseOrderById: builder.query({
            query: (id: number) => ({
                url: `/purchase-order/${id}`,
                method: 'GET',
            }),
        }),
        getPurchaseOrderByOrderNo: builder.query({
            query: (orderNo: string) => ({
                url: `/purchase-order/requisition/${encodeURIComponent(orderNo)}`,
                method: 'GET',
            }),
        }),
        // update purchase order
        updatePurchaseOrder: builder.mutation({
            query: ({ id, data }: { id: number; data: any }) => ({
                url: `/purchase-order/${id}`,
                method: 'PATCH',
                body: data,
            }),
        }),
    })
})

export const {
    useAddPurchaseReceiveMutation,
    useCreateSalesVoucherMutation,
    useCreateReceiveVoucherMutation,
    useAddContraVoucherMutation,
    useAddJournalVoucherMutation,
    useCreateMaterialSalesVoucherMutation,
    useAddPurchaseOrderMutation,
    useGetPurchaseOrdersQuery,
    useGetPurchaseOrderByIdQuery,
    useGetPurchaseOrderByOrderNoQuery,
    useLazyGetPurchaseOrderByOrderNoQuery,
    useUpdatePurchaseOrderMutation,
} = journalApi;