import { TGrade } from "../../../types/types";
import { baseApi } from "../../api/baseApi";

const logAndGrade = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createLog: builder.mutation({
            query: (data: { name: string }) => {
                return {
                    url: `/log`,
                    method: "POST",
                    body: data
                }
            },
            invalidatesTags: ["logs"]
        }),
        getLogs: builder.query({
            query: () => {
                return {
                    url: `/log`,
                    method: "GET",
                }
            },
            providesTags: ["logs"]
        }),
        // update logs
        updateLogs: builder.mutation({
            query: (info: { data: { name: string }; id: number }) => {
                return {
                    url: `/log/${info?.id}`,
                    method: "PUT",
                    body: info?.data
                }
            },
            invalidatesTags: ["logs"]
        }),
        // grade related
        createGrade: builder.mutation({
            query: (data: TGrade) => {
                return {
                    url: `/log-grades`,
                    method: "POST",
                    body: data
                }
            },
            invalidatesTags: ["grade"]
        }),
        getGrades: builder.query({
            query: () => {
                return {
                    url: `/log-grades`,
                    method: "GET",
                }
            },
            providesTags: ["grade"]
        }),
        // update logs
        updateGrade: builder.mutation({
            query: (info: { data: { name: string }; id: number }) => {
                return {
                    url: `/log-grades/${info?.id}`,
                    method: "PUT",
                    body: info?.data
                }
            },
            invalidatesTags: ["grade"]
        }),
        // create log order
        createLogOrder: builder.mutation({
            query: (data) => {
                return {
                    url: `/log-orders`,
                    method: "POST",
                    body: data
                }
            },
            invalidatesTags: ["logOrderVoucher"]
        }),
        getAllLogOrderVoucher: builder.query({
            query: (query: { startDate?: string; endDate?: string; partyId?: number; searchTerm?: string }) => {
                const params = new URLSearchParams();
                if (query?.startDate) params.append("startDate", query.startDate);
                if (query?.endDate) params.append("endDate", query.endDate);
                if (query?.searchTerm) params.append("searchTerm", query.searchTerm);

                return {
                    url: "/log-orders",
                    method: "GET",
                    params: params
                }
            },
            providesTags: ["logOrderVoucher"],
        }),
    })
})


export const { useCreateLogMutation, useGetLogsQuery, useCreateGradeMutation, useGetGradesQuery, useUpdateLogsMutation, useUpdateGradeMutation, useCreateLogOrderMutation, useGetAllLogOrderVoucherQuery } = logAndGrade;