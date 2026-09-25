 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { toast } from "sonner";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getResponse = (res) => {
    if (_optionalChain([res, 'optionalAccess', _ => _.data, 'optionalAccess', _2 => _2.success])) {
        toast.success(_optionalChain([res, 'optionalAccess', _3 => _3.data, 'optionalAccess', _4 => _4.message]));
        return _optionalChain([res, 'optionalAccess', _5 => _5.data]);
    } else {
        toast.error(_optionalChain([res, 'optionalAccess', _6 => _6.error, 'optionalAccess', _7 => _7.error]) || _optionalChain([res, 'optionalAccess', _8 => _8.error, 'optionalAccess', _9 => _9.data, 'optionalAccess', _10 => _10.message]) || _optionalChain([res, 'optionalAccess', _11 => _11.error, 'optionalAccess', _12 => _12.errors]) || _optionalChain([res, 'optionalAccess', _13 => _13.error, 'optionalAccess', _14 => _14.data]) || _optionalChain([res, 'optionalAccess', _15 => _15.message]) || 'Something went wrong');
        return res
    }
}