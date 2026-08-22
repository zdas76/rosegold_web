/* eslint-disable @typescript-eslint/no-explicit-any */
import { TPurchaseVaouchar } from "../../../types/types";
import { baseApi } from "../../api/baseApi";

const journalApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        addPurchaseReceive: builder.mutation<void, TPurchaseVaouchar>({
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
    })
})

export const { useAddPurchaseReceiveMutation, useCreateSalesVoucherMutation, useCreateReceiveVoucherMutation, useAddContraVoucherMutation, useAddJournalVoucherMutation, useCreateMaterialSalesVoucherMutation } = journalApi