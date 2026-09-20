 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { baseApi } from "../../api/baseApi";

const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        Login: builder.mutation({
            query: (info) => {
                return {
                    url: "/auth/login",
                    method: 'POST',
                    body: info
                }
            }
        }),
        // ---------------------------------- employee related ---------------------------------
        getEmployee: builder.query({
            query: () => {
                return {
                    url: `/employee`,
                    method: "GET"
                }
            },
            providesTags: ["employee"]
        }),
        createEmployee: builder.mutation({
            query: (formData) => {
                return {
                    url: `/employee/create-employee`,
                    method: 'POST',
                    body: formData
                }
            },
            invalidatesTags: ["employee"]
        }),
        deleteEmployee: builder.mutation({
            query: (id) => {
                return {
                    url: `/employee/${id}`,
                    method: 'DELETE',
                }
            },
            invalidatesTags: ["employee"]
        }),
        updateEmployee: builder.mutation({
            query: (info) => {
                return {
                    url: `/employee/${_optionalChain([info, 'optionalAccess', _ => _.id])}`,
                    method: 'PUT',
                    body: _optionalChain([info, 'optionalAccess', _2 => _2.data])
                }
            },
            invalidatesTags: ["employee"]
        }),
        //---------------------------------------- parties realted apis
        getParties: builder.query({
            query: (info) => {
                const params = new URLSearchParams()
                if (_optionalChain([info, 'optionalAccess', _3 => _3.partyType])) {
                    params.append("partyType", _optionalChain([info, 'optionalAccess', _4 => _4.partyType]))
                }
                if (_optionalChain([info, 'optionalAccess', _5 => _5.searchTerm])) {
                    params.append("searchTerm", info.searchTerm)
                }
                if (_optionalChain([info, 'optionalAccess', _6 => _6.sortBy])) {
                    params.append("sortBy", info.sortBy)
                }
                if (_optionalChain([info, 'optionalAccess', _7 => _7.sortOrder])) {
                    params.append("sortOrder", info.sortOrder)
                }
                if (_optionalChain([info, 'optionalAccess', _8 => _8.page])) {
                    params.append("page", info.page.toString())
                }
                if (_optionalChain([info, 'optionalAccess', _9 => _9.limit])) {
                    params.append("limit", info.limit.toString())
                }
                return {
                    url: "/party",
                    method: "GET",
                    params: params
                }
            },
            providesTags: ["party"]
        }),

        addParty: builder.mutation({
            query: (data) => {
                return {
                    url: "/party",
                    method: "POST",
                    body: data
                }
            },
            invalidatesTags: ["party"]
        }),
        deleteParty: builder.mutation({
            query: (id) => {
                return {
                    url: `/party/${id}`,
                    method: "DELETE"
                }
            },
            invalidatesTags: ["party"]
        }),
        updateParty: builder.mutation({
            query: (info) => {
                return {
                    url: `/party/${_optionalChain([info, 'optionalAccess', _10 => _10.id])}`,
                    method: "PUT",
                    body: _optionalChain([info, 'optionalAccess', _11 => _11.data])
                }
            },
            invalidatesTags: ["party"]
        }),
        // -------------------------------------- users related -------------------------------
        addUser: builder.mutation({
            query: (data) => {
                return {
                    url: "/user",
                    method: "POST",
                    body: data
                }
            },
            invalidatesTags: ["user"]
        }),
        getUsers: builder.query({
            query: () => {
                return {
                    url: "/user",
                    method: "GET",
                }
            },
            providesTags: ["user"]
        }),
        updateUser: builder.mutation({
            query: (info) => ({
                url: `/user/${info.id}`,
                method: "PUT",
                body: info,
            }),
            invalidatesTags: ["user"],
        }),
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/user/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: ["user"]
        }),

        // -------------------------------------- worker related -------------------------------
        addWorker: builder.mutation({
            query: (data) => {
                return {
                    url: "/worker",
                    method: "POST",
                    body: data
                }
            },
            invalidatesTags: ["worker"]
        }),
        getWorkers: builder.query({
            query: () => ({
                url: "/worker",
                method: "GET"
            }),
            providesTags: ["worker"]
        }),
        getWorker: builder.query({
            query: (id) => ({
                url: `/worker/${id}`,
                method: "GET"
            }),
            providesTags: ["worker"]
        }),
        updateWorker: builder.mutation({
            query: (info) => ({
                url: `/worker/${info.id}`,
                method: "PUT",
                body: info.data
            }),
            invalidatesTags: ["worker"]
        }),
        deleteWorker: builder.mutation({
            query: (id) => ({
                url: `/worker/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: ["worker"]
        }),
    })

})
export const {
    useLoginMutation,
    useGetEmployeeQuery,
    useCreateEmployeeMutation,
    useGetPartiesQuery,
    useAddPartyMutation,
    useDeletePartyMutation,
    useUpdatePartyMutation,
    useDeleteEmployeeMutation,
    useUpdateEmployeeMutation,
    useAddUserMutation,
    useGetUsersQuery,
    useAddWorkerMutation,
    useGetWorkersQuery,
    useGetWorkerQuery,
    useUpdateWorkerMutation,
    useDeleteWorkerMutation,
    useUpdateUserMutation,
    useDeleteUserMutation
} = authApi