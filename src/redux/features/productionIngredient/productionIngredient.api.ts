/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../api/baseApi";

export const productionIngredientApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createProductionIngredient: builder.mutation({
            query: (data: {
                productId: number;
                rawMaterials: number[];
                packingMaterials?: number[];
                ingredientExpneseItems?: number[];
            }) => ({
                url: "/product-ingradient",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["productIngradient", "rowMaterials"],
        }),
        getProductionIngredients: builder.query({
            query: (params?: any) => ({
                url: "/product-ingradient",
                method: "GET",
                params,
            }),
            providesTags: ["productIngradient", "rowMaterials"],
        }),
        getProductIngredientById: builder.query({
            query: (id: number) => ({
                url: `/product-ingradient/${id}`,
                method: "GET",
            }),
            providesTags: ["productIngradient", "rowMaterials"],
        }),
        updateProductionIngredient: builder.mutation({
            query: ({ id, ...data }: {
                id: number;
                productId?: number;
                rawMaterials?: number[];
                packingMaterials?: number[];
                ingredientExpneseItems?: number[];
            }) => ({
                url: `/product-ingradient/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["productIngradient", "rowMaterials"],
        }),
        deleteProductionIngredient: builder.mutation({
            query: (id: number) => ({
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
