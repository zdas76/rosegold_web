import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../store';
import { Department } from '../../../pages/store RMPM/productTransfer/types';

interface TAuthInfo {
    user: { email: string; exp: number; iat: number; role: string, id: string, name: string; } | null;
    token: string | null;
    department: "PRODUCTION" | "FG_STORE" | "RMPM" | null
}
const initialState = { user: null, token: null, department: null } satisfies TAuthInfo as TAuthInfo

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        addUser: (state, action: PayloadAction<TAuthInfo>) => {
            state.user = action.payload?.user;
            state.token = action.payload.token;
            state.department = action.payload.department;
        },
        logOut: (state) => {
            state.user = null;
            state.token = null;
            state.department = null;
        }
    },
})

export const { addUser, logOut } = authSlice.actions

export default authSlice.reducer

export const useCurrentUser = (state: RootState) => state.auth.user
export const selectCurrentUser = (state: RootState) => state.auth.token