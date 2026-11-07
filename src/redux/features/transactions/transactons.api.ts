/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../api/baseApi";

const transactionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPillers: builder.query({
            query: () => ({
                url: `/accounts_head`,
                method: "GET"
            })
        }),
        getAccountItem: builder.query({
            query: (data?: { accountMainPillerId?: string[] }) => {
                const params = new URLSearchParams();
                if (data?.accountMainPillerId?.length) {
                    params.append("ids", JSON.stringify(data.accountMainPillerId));
                }
                return {
                    url: `/accounts_item`,
                    method: "GET",
                    params: params
                }
            },
            providesTags: ["accounts_item"]
        }),
        createAccountItem: builder.mutation({
            query: (data: { accountsItemName: string; accountMainPillerId: string; accountsItemId: string }) => {
                return {
                    url: `/accounts_item`,
                    method: "POST",
                    body: data
                }
            },
            invalidatesTags: ["accounts_item"]
        }),
        createReceiveVoucher: builder.mutation({
            query: (data: any) => {
                return {
                    url: `/journal/received`,
                    method: "POST",
                    body: data
                }
            },
        }),
        createPaymentVoucher: builder.mutation({
            query: (data: any) => {
                return {
                    url: `/journal/payment`,
                    method: "POST",
                    body: data
                }
            },
        }),
        getTotalQuantityAndUnitPrice: builder.query({
            query: (query: { productId?: number; rawId?: string; packingMaterialId?: number; itemType: "product" | "raw" | "pmmaterial" }) => {
                const params = new URLSearchParams();
                params.append("itemType", `${query?.itemType}`)

                if (query?.itemType === "product") {
                    params.append("productId", `${query?.productId}`)
                } else if (query?.itemType === "raw") {
                    params.append("rawId", `${query?.rawId}`)
                } else {
                    params.append("packingMaterialId", `${query?.packingMaterialId}`)
                }

                return {
                    url: `/inventory/inventorytotal`,
                    method: "GET",
                    params
                }
            }
        }),
        // get all voucher list and report
        getVoucherReport: builder.query({
            query: (query: { startDate?: string; endDate?: string; type?: string; searchTerm?: string }) => {
                const params = new URLSearchParams();
                if (query?.startDate) params.append("startDate", query.startDate);
                if (query?.endDate) params.append("endDate", query.endDate);
                if (query?.type) params.append("voucherType", query.type);
                if (query?.searchTerm) params.append("searchTerm", query.searchTerm);

                return {
                    url: `/voucher`,
                    method: `GET`,
                    params: params
                }
            }
        }),
        // get report by voucherNo
        getReportByVoucherNo: builder.query({
            query: (voucherNo: string) => {
                return {
                    url: `/voucher/voucherNo/${voucherNo}`,
                    method: `GET`
                }
            }
        }),
        updateAccountItem: builder.mutation({
            query: (data: { id: number; accountsItemName: string; accountMainPillerId: string; accountsItemId: string }) => {
                return {
                    url: `/accounts_item/${data.id}`,
                    method: "PUT",
                    body: data
                }
            },
            invalidatesTags: ["accounts_item"]
        }),
        // get daily report
        getDailyReport: builder.query({
            query: (date?: any) => {
                console.log(date, "date")
                const params = new URLSearchParams();
                if (date) {
                    params.append("date", date?.date)
                } else {
                    params.append("date", new Date().toISOString())
                }
                return {
                    url: `voucher/dailyReport`,
                    method: `GET`,
                    params
                }
            }
        })
    })
})

export const { useGetPillersQuery, useGetAccountItemQuery, useCreateAccountItemMutation, useCreateReceiveVoucherMutation, useCreatePaymentVoucherMutation, useLazyGetTotalQuantityAndUnitPriceQuery, useGetVoucherReportQuery, useGetReportByVoucherNoQuery, useUpdateAccountItemMutation, useGetDailyReportQuery, useGetTotalQuantityAndUnitPriceQuery } = transactionApi;