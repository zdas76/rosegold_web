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
        })
    })
})

export const { useGetInvertoryTotalQuery, useGetUnitQuery } = invertoryApi;