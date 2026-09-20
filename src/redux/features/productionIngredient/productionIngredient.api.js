import { baseApi } from "../../api/baseApi";

export const productionIngredientApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createProductionIngredient: builder.mutation({
            query: (data) => ({
                url: "/production-ingredient",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["rowMaterials"],
        }),
        getProductionIngredients: builder.query({
            query: (type) => ({
                url: type ? `/production-ingredient?type=${type}` : "/production-ingredient",
                method: "GET",
            }),
            providesTags: ["rowMaterials"],
        }),
        updateProductionIngredient: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/production-ingredient/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["rowMaterials"],
        }),
        deleteProductionIngredient: builder.mutation({
            query: (id) => ({
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
