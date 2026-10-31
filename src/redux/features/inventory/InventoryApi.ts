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
            query: (info: { rawid?: number; rawId?: number; pmMaterialId?: number } | number) => {
                const params: {
                    rawId?: number;
                    pmMaterialId?: number;
                } = {};
                if (typeof info === 'number') {
                    params.rawId = info;
                } else if (info) {
                    if (info.rawid !== undefined || info.rawId !== undefined) {
                        params.rawId = info.rawId ?? info.rawid;
                    }

                    if (info.pmMaterialId !== undefined) {
                        params.pmMaterialId = info.pmMaterialId;
                    }
                }
                return {
                    url: "/inventory/last_voucher_qty",
                    method: "GET",
                    params: params
                };
            },
        }),
    }),
})


export const { useGetInvertoryTotalQuery, useGetUnitQuery, useGetLastRateQuery, useLazyGetLastVoucherQtyQuery } = invertoryApi;
