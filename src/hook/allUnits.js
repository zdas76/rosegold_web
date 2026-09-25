 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useGetUnitsQuery } from "../redux/features/unit/unit.api"


export const useAllUnits = () => {
  const { data: unit } = useGetUnitsQuery({})

  const allUnits = _optionalChain([unit, 'optionalAccess', _ => _.data, 'optionalAccess', _2 => _2.map, 'call', _3 => _3((item) => {
    return {
      key: _optionalChain([item, 'optionalAccess', _4 => _4.id]),
      label: _optionalChain([item, 'optionalAccess', _5 => _5.name]),
      value: _optionalChain([item, 'optionalAccess', _6 => _6.id]),
      ...item
    }
  })])

  return allUnits
}