import { baseApi } from "../../api/baseApi";

const categoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createCategory: builder.mutation({
            query: (data: { categoryName: string }) => {
                return {
                    url: "/category",
                    method: "POST",
                    body: data
                }
            },
            invalidatesTags: ["category"]
        }),
        getCategories: builder.query({
            query: () => {
                return {
                    url: "/category",
                    method: "GET"
                }
            },
            providesTags: ["category"]
        }),
        updateCategory: builder.mutation({
            query: ({ data, id }) => {
                return {
                    url: `/category/${id}`,
                    method: "PUT",
                    body: data
                }
            },
            invalidatesTags: ["category"]
        }),
        deleteCategory: builder.mutation({
            query: (id: number) => {    // id is the category id
                return {
                    url: `/category/${id}`,
                    method: "DELETE"
                }
            },
            invalidatesTags: ["category"]
        }),
        // sub category
        sub_category: builder.mutation({
            query: (data: { categorryId: number; subCategoryName: string }) => {
                return {
                    url: "/sub-category",
                    method: "POST",
                    body: data
                }
            },
            invalidatesTags: ["category"]
        }),

        getsubCategory: builder.query({
            query: () => {
                return {
                    url: "/sub-category",
                    method: "GET"
                }
            },
            providesTags: ["category"]
        }),

        updateSubCategory: builder.mutation({
            query: (info: { data: string, id: number }) => {
                return {
                    url: `/sub-category/${info?.id}`,
                    method: "PUT",
                    body: info?.data
                }
            },
            invalidatesTags: ["category"]
        }),
        deleteSubCategory: builder.mutation({
            query: (id: number) => {
                return {
                    url: `/sub-category/${id}`,
                    method: "DELETE"
                }
            },
            invalidatesTags: ["category"]
        }),
    })
})
export const { useCreateCategoryMutation, useSub_categoryMutation, useGetCategoriesQuery, useGetsubCategoryQuery, useUpdateCategoryMutation, useUpdateSubCategoryMutation, useDeleteCategoryMutation, useDeleteSubCategoryMutation } = categoryApi