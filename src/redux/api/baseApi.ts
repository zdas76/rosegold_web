// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

const baseQuery = fetchBaseQuery({
  baseUrl: `http://201.18.208.104:5000/api/v1`,
  // baseUrl: `http://localhost:5000/api/v1`,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth?.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Define a service using a base URL and expected endpoints
export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQuery,
  tagTypes: [
    "employee",
    "category",
    "party",
    "unit",
    "product",
    "rowMaterials",
    "product",
    "accounts_item",
    "bank",
    "logs",
    "grade",
    "user",
    "logToRaw",
    "worker",
    "logOrderVoucher",
    "production",
    "packaging",
    "productIngradient",
    "packingMaterial",
    "productionExpItem",
  ],
  endpoints: () => ({}),
});
