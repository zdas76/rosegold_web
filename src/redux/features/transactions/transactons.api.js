 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }/* eslint-disable @typescript-eslint/no-explicit-any */
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
            query: (data) => {
                const params = new URLSearchParams();
                if (_optionalChain([data, 'optionalAccess', _ => _.accountMainPillerId, 'optionalAccess', _2 => _2.length])) {
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
            query: (data) => {
                return {
                    url: `/accounts_item`,
                    method: "POST",
                    body: data
                }
            },
            invalidatesTags: ["accounts_item"]
        }),
        createReceiveVoucher: builder.mutation({
            query: (data) => {
                return {
                    url: `/journal/received`,
                    method: "POST",
                    body: data
                }
            },
        }),
        createPaymentVoucher: builder.mutation({
            query: (data) => {
                return {
                    url: `/journal/payment`,
                    method: "POST",
                    body: data
                }
            },
        }),
        getTotalQuantityAndUnitPrice: builder.query({
            query: (query) => {
                const params = new URLSearchParams();
                params.append("itemType", `${_optionalChain([query, 'optionalAccess', _3 => _3.itemType])}`)

                if (_optionalChain([query, 'optionalAccess', _4 => _4.itemType]) === "product") {
                    params.append("productId", `${_optionalChain([query, 'optionalAccess', _5 => _5.productId])}`)
                } else {
                    params.append("rawId", `${_optionalChain([query, 'optionalAccess', _6 => _6.rawId])}`)
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
            query: (query) => {
                const params = new URLSearchParams();
                if (_optionalChain([query, 'optionalAccess', _7 => _7.startDate])) params.append("startDate", query.startDate);
                if (_optionalChain([query, 'optionalAccess', _8 => _8.endDate])) params.append("endDate", query.endDate);
                if (_optionalChain([query, 'optionalAccess', _9 => _9.type])) params.append("voucherType", query.type);
                if (_optionalChain([query, 'optionalAccess', _10 => _10.searchTerm])) params.append("searchTerm", query.searchTerm);

                return {
                    url: `/voucher`,
                    method: `GET`,
                    params: params
                }
            }
        }),
        // get report by voucherNo
        getReportByVoucherNo: builder.query({
            query: (voucherNo) => {
                return {
                    url: `/voucher/voucherNo/${voucherNo}`,
                    method: `GET`
                }
            }
        }),
        updateAccountItem: builder.mutation({
            query: (data) => {
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
            query: (date) => {
                console.log(date, "date")
                const params = new URLSearchParams();
                if (date) {
                    params.append("date", _optionalChain([date, 'optionalAccess', _11 => _11.date]))
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

export const { useGetPillersQuery, useGetAccountItemQuery, useCreateAccountItemMutation, useCreateReceiveVoucherMutation, useCreatePaymentVoucherMutation, useLazyGetTotalQuantityAndUnitPriceQuery, useGetVoucherReportQuery, useGetReportByVoucherNoQuery, useUpdateAccountItemMutation, useGetDailyReportQuery } = transactionApi;