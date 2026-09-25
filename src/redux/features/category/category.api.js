 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { baseApi } from "../../api/baseApi";

const categoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createCategory: builder.mutation({
            query: (data) => {
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
            query: (id) => {    // id is the category id
                return {
                    url: `/category/${id}`,
                    method: "DELETE"
                }
            },
            invalidatesTags: ["category"]
        }),
        // sub category
        sub_category: builder.mutation({
            query: (data) => {
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
            query: (info) => {
                return {
                    url: `/sub-category/${_optionalChain([info, 'optionalAccess', _ => _.id])}`,
                    method: "PUT",
                    body: _optionalChain([info, 'optionalAccess', _2 => _2.data])
                }
            },
            invalidatesTags: ["category"]
        }),
        deleteSubCategory: builder.mutation({
            query: (id) => {
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