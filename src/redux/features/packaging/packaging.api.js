import { baseApi } from "../../api/baseApi";

const packagingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPackaging: builder.mutation({
      query: (data) => {
        return {
          url: "/packaging",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["packaging"],
    }),
    getPackagings: builder.query({
      query: () => {
        return {
          url: "/packaging",
          method: "GET",
        };
      },
      providesTags: ["packaging"],
    }),
    getPackagingById: builder.query({
      query: (id) => {
        return {
          url: `/packaging/${id}`,
          method: "GET",
        };
      },
      providesTags: ["packaging"],
    }),
    updatePackaging: builder.mutation({
      query: (data) => {
        return {
          url: `/packaging/${data.id}`,
          method: "PUT",
          body: data.body,
        };
      },
      invalidatesTags: ["packaging"],
    }),
    deletePackaging: builder.mutation({
      query: (id) => {
        return {
          url: `/packaging/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["packaging"],
    }),
  }),
});

export const {
  useCreatePackagingMutation,
  useGetPackagingsQuery,
  useGetPackagingByIdQuery,
  useUpdatePackagingMutation,
  useDeletePackagingMutation,
} = packagingApi;
