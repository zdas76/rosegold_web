/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../api/baseApi";

export const productionIngredientApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createProductionIngredient: builder.mutation({
            query: (data



) => ({
                url: "/product-ingradient",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["productIngradient", "rowMaterials"],
        }),
        getProductionIngredients: builder.query({
            query: (params) => ({
                url: "/product-ingradient",
                method: "GET",
                params,
            }),
            providesTags: ["productIngradient", "rowMaterials"],
        }),
        getProductIngredientById: builder.query({
            query: (id) => ({
                url: `/product-ingradient/${id}`,
                method: "GET",
            }),
            providesTags: ["productIngradient", "rowMaterials"],
        }),
        updateProductionIngredient: builder.mutation({
            query: ({ id, ...data }




) => ({
                url: `/product-ingradient/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["productIngradient", "rowMaterials"],
        }),
        deleteProductionIngredient: builder.mutation({
            query: (id) => ({
                url: `/product-ingradient/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["productIngradient", "rowMaterials"],
        }),
    }),
});

export const {
    useCreateProductionIngredientMutation,
    useGetProductionIngredientsQuery,
    useGetProductIngredientByIdQuery,
    useUpdateProductionIngredientMutation,
    useDeleteProductionIngredientMutation,
} = productionIngredientApi;
