 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


const baseQuery = fetchBaseQuery({
  // baseUrl: `https://rosegoldbd.vercel.app/api/v1`,
  baseUrl: `http://localhost:5000/api/v1`,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = _optionalChain([(getState() ), 'access', _ => _.auth, 'optionalAccess', _2 => _2.token]);
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
