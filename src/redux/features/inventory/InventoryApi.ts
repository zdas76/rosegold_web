import { baseApi } from "../../api/baseApi";

const invertoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getInvertoryTotal: builder.query({
            query: () => {
                return {
                    url: "",
                    method: "GET"
                }
            }
        }),
        getUnit: builder.query({
            query: () => {
                return {
                    url: "/unit",
                    method: "GET"
                }
            }
        }),
        // get last rate of raw-material
        getLastRate: builder.query({
            query: (rawids: number[]) => ({
                url: "/inventory/lastRate",
                method: "GET",
                params: {
                    rawids: JSON.stringify(rawids),
                },
            }),
        }),
        getLastVoucherQty: builder.query({
            query: (rawid: number) => ({
                url: "/inventory/last_voucher_qty",
                method: "GET",
                params: { rawid }
            }),
        }),
    }),
})

export const { useGetInvertoryTotalQuery, useGetUnitQuery, useGetLastRateQuery, useLazyGetLastVoucherQtyQuery } = invertoryApi;