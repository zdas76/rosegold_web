 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }/* eslint-disable @typescript-eslint/no-explicit-any */
export const formateData = (data, name) => {
    const finaldata = _optionalChain([data, 'optionalAccess', _ => _.map, 'call', _2 => _2((item) => {
        return {
            ...item,
            key: _optionalChain([item, 'optionalAccess', _3 => _3.id]),
            label: item[name],
            value: _optionalChain([item, 'optionalAccess', _4 => _4.id])
        }
    })]);
    return finaldata
}