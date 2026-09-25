 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import { baseApi } from "../../api/baseApi";

const logAndGrade = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createLog: builder.mutation({
            query: (data) => {
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
            query: (info) => {
                return {
                    url: `/log/${_optionalChain([info, 'optionalAccess', _ => _.id])}`,
                    method: "PUT",
                    body: _optionalChain([info, 'optionalAccess', _2 => _2.data])
                }
            },
            invalidatesTags: ["logs"]
        }),
        // grade related
        createGrade: builder.mutation({
            query: (data) => {
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
            query: (info) => {
                return {
                    url: `/log-grades/${_optionalChain([info, 'optionalAccess', _3 => _3.id])}`,
                    method: "PUT",
                    body: _optionalChain([info, 'optionalAccess', _4 => _4.data])
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
            query: (query) => {
                const params = new URLSearchParams();
                if (_optionalChain([query, 'optionalAccess', _5 => _5.startDate])) params.append("startDate", query.startDate);
                if (_optionalChain([query, 'optionalAccess', _6 => _6.endDate])) params.append("endDate", query.endDate);
                if (_optionalChain([query, 'optionalAccess', _7 => _7.searchTerm])) params.append("searchTerm", query.searchTerm);

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