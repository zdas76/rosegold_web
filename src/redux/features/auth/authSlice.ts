import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../store';

interface TAuthInfo {
    user: { email: string; exp: number; iat: number; role: string, id: string, name: string; } | null;
    token: string | null
}
const initialState = { user: null, token: null } satisfies TAuthInfo as TAuthInfo

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        addUser: (state, action: PayloadAction<TAuthInfo>) => {
            state.user = action.payload?.user;
            state.token = action.payload.token;
        },
        logOut: (state) => {
            state.user = null;
            state.token = null;
        }
    },
})

export const { addUser, logOut } = authSlice.actions

export default authSlice.reducer

export const useCurrentUser = (state: RootState) => state.auth.user
export const selectCurrentUser = (state: RootState) => state.auth.token