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
            query: (ids: number[]) => ({
                url: "/inventory/lastRate",
                method: "GET",
                params: {
                    ids: JSON.stringify(ids),
                },
            }),
        }),
    }),

})

export const { useGetInvertoryTotalQuery, useGetUnitQuery, useGetLastRateQuery } = invertoryApi;