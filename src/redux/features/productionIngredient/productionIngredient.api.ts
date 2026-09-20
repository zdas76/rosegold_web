import { baseApi } from "../../api/baseApi";

export const productionIngredientApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createProductionIngredient: builder.mutation({
            query: (data: { productionName: string; type?: string; rawMaterialIds?: number[] }) => ({
                url: "/production-ingredient",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["rowMaterials"],
        }),
        getProductionIngredients: builder.query({
            query: (type?: string) => ({
                url: type ? `/production-ingredient?type=${type}` : "/production-ingredient",
                method: "GET",
            }),
            providesTags: ["rowMaterials"],
        }),
        updateProductionIngredient: builder.mutation({
            query: ({ id, ...data }: { id: number; productionName?: string; type?: string; rawMaterialIds?: number[] }) => ({
                url: `/production-ingredient/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["rowMaterials"],
        }),
        deleteProductionIngredient: builder.mutation({
            query: (id: number) => ({
                url: `/production-ingredient/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["rowMaterials"],
        }),
    }),
});

export const {
    useCreateProductionIngredientMutation,
    useGetProductionIngredientsQuery,
    useUpdateProductionIngredientMutation,
    useDeleteProductionIngredientMutation,
} = productionIngredientApi;
