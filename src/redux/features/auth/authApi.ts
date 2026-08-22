/* eslint-disable @typescript-eslint/no-explicit-any */
import { TParty, TWorker } from "../../../types/types";
import { baseApi } from "../../api/baseApi";

const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        Login: builder.mutation({
            query: (info: { email: string; password: string }) => {
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
            query: (id: number) => {
                return {
                    url: `/employee/${id}`,
                    method: 'DELETE',
                }
            },
            invalidatesTags: ["employee"]
        }),
        updateEmployee: builder.mutation({
            query: (info: { data: any; id: number }) => {
                return {
                    url: `/employee/${info?.id}`,
                    method: 'PUT',
                    body: info?.data
                }
            },
            invalidatesTags: ["employee"]
        }),
        //---------------------------------------- parties realted apis
        getParties: builder.query({
            query: (info: { partyType?: string; searchTerm?: string; sortBy?: string; sortOrder?: string; page?: number; limit?: number }) => {
                const params = new URLSearchParams()
                if (info?.partyType) {
                    params.append("partyType", info?.partyType)
                }
                if (info?.searchTerm) {
                    params.append("searchTerm", info.searchTerm)
                }
                if (info?.sortBy) {
                    params.append("sortBy", info.sortBy)
                }
                if (info?.sortOrder) {
                    params.append("sortOrder", info.sortOrder)
                }
                if (info?.page) {
                    params.append("page", info.page.toString())
                }
                if (info?.limit) {
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
            query: (data: { name: string; contactNo: string; address: string; partyType: string }) => {
                return {
                    url: "/party",
                    method: "POST",
                    body: data
                }
            },
            invalidatesTags: ["party"]
        }),
        deleteParty: builder.mutation({
            query: (id: number) => {
                return {
                    url: `/party/${id}`,
                    method: "DELETE"
                }
            },
            invalidatesTags: ["party"]
        }),
        updateParty: builder.mutation({
            query: (info: { data: TParty; id: number }) => {
                return {
                    url: `/party/${info?.id}`,
                    method: "PUT",
                    body: info?.data
                }
            },
            invalidatesTags: ["party"]
        }),
        // -------------------------------------- users related -------------------------------
        addUser: builder.mutation({
            query: (data: { name: string; password?: string; phone: number; email: string }) => {
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
            query: (info: { name?: string; phone?: string; email?: string; id: number }) => ({
                url: `/user/${info.id}`,
                method: "PUT",
                body: info,
            }),
            invalidatesTags: ["user"],
        }),
        deleteUser: builder.mutation({
            query: (id: number) => ({
                url: `/user/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: ["user"]
        }),

        // -------------------------------------- worker related -------------------------------
        addWorker: builder.mutation({
            query: (data: TWorker) => {
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
            query: (id?: number) => ({
                url: `/worker/${id}`,
                method: "GET"
            }),
            providesTags: ["worker"]
        }),
        updateWorker: builder.mutation({
            query: (info: { data: any; id: number }) => ({
                url: `/worker/${info.id}`,
                method: "PUT",
                body: info.data
            }),
            invalidatesTags: ["worker"]
        }),
        deleteWorker: builder.mutation({
            query: (id: number) => ({
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