 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { createSlice } from '@reduxjs/toolkit'







const initialState = { user: null, token: null } 

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        addUser: (state, action) => {
            state.user = _optionalChain([action, 'access', _ => _.payload, 'optionalAccess', _2 => _2.user]);
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

export const useCurrentUser = (state) => state.auth.user
export const selectCurrentUser = (state) => state.auth.token