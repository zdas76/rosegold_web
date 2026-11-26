/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../api/baseApi";

const Report = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getLedgerReport: builder.query({
            query: (info: { accountsItemId: string; startDate?: any; endDate?: any }) => {

                const params = new URLSearchParams();
                if (info?.accountsItemId) {
                    params.append("accountsItemId", info.accountsItemId);
                }
                if (info.startDate && info.endDate) {
                    params.append("startDate", info.startDate);
                    params.append("endDate", info.endDate);
                }
                return {
                    url: "/report/ledger",
                    method: "GET",
                    params: params
                }
            },
            // providesTags: [""]
        }),
        getPartyReport: builder.query({
            query: (info: { partyId: string; startDate?: any; endDate?: any; partyType: "PARTY" | "VENDOR" | "DISTRIBUTOR" | string }) => {

                const params = new URLSearchParams();
                if (info.startDate && info.endDate) {
                    params.append("startDate", info.startDate);
                    params.append("endDate", info.endDate);
                }
                params.append("partyType", info.partyType)
                return {
                    url: `/report/party/${info.partyId}`,
                    method: "GET",
                    params: params
                }
            },
            // providesTags: [""]
        }),
        // get raw materials report 
        getRawMaterialsReport: builder.query({
            query: (info: { startDate?: any; endDate?: any; id?: string }) => {

                const params = new URLSearchParams();
                if (info.startDate && info.endDate) {
                    params.append("startDate", info.startDate);
                    params.append("endDate", info.endDate);
                }
                return {
                    url: `/report/raw/${info.id}`,
                    method: "GET",
                    params: params
                }
            },
            // providesTags: [""]
        }),
        // get balance sheet
        getBalanceSheet: builder.query({
            query: (date?: string) => {
                const params = new URLSearchParams();
                if (date) {
                    params.append("date", date);
                }
                return {
                    url: `/report/balance-sheet`,
                    method: "GET",
                    params,
                }
            },
        }),
        // get daily report
        getDailyReport: builder.query({
            query: (date?: any) => {
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
        }),
    })
})

export const { useLazyGetLedgerReportQuery, useLazyGetPartyReportQuery, useGetRawMaterialsReportQuery, useGetBalanceSheetQuery, useGetDailyReportQuery } = Report