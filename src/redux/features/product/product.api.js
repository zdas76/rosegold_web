 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import { baseApi } from "../../api/baseApi";

const productApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getProducts: build.query({
            query: () => "/product",
            providesTags: ["product"],
        }),
        addProduct: build.mutation({
            query: (data) => ({
                url: "/product",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["product"],
        }),
        updateProduct: build.mutation({
            query: (info) => ({
                url: `/product/${info.id}`,
                method: "PUT",
                body: _optionalChain([info, 'optionalAccess', _ => _.data]),
            }),
            invalidatesTags: ["product"],
        }),
        deleteProduct: build.mutation({
            query: (id) => ({
                url: `/product/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["product"],
        }),
        // convert product
        convertProduct: build.mutation({
            query: (data) => {
                return {
                    url: `/create-product`,
                    method: "POST",
                    body: data,
                }
            }
        }),
        // product report
        getProductStockReport: build.query({
            query: (data) => {
                const params = {
                    startDate: _optionalChain([data, 'optionalAccess', _2 => _2.startDate]),
                    endDate: _optionalChain([data, 'optionalAccess', _3 => _3.endDate]),
                }
                return {
                    url: `/report/product`,
                    method: "GET",
                    params,
                }
            }
        }),
        getProductStockReportById: build.query({
            query: (id) => {
                return {
                    url: `/report/product/${id}`,
                    method: "GET",
                }
            }
        }),

    }),
})
export const { useGetProductsQuery, useAddProductMutation, useUpdateProductMutation, useDeleteProductMutation, useConvertProductMutation, useGetProductStockReportQuery, useGetProductStockReportByIdQuery } = productApi;