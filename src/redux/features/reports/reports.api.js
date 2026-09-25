 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../api/baseApi";

const Report = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getLedgerReport: builder.query({
            query: (info) => {

                const params = new URLSearchParams();
                if (_optionalChain([info, 'optionalAccess', _ => _.accountsItemId])) {
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
            query: (info) => {

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
            query: (info) => {

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
            query: (date) => {
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
            query: (date) => {
                const params = new URLSearchParams();
                if (date) {
                    params.append("date", _optionalChain([date, 'optionalAccess', _2 => _2.date]))
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