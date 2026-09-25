 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useGetLogsQuery } from "../redux/features/logAndGrade/LogAndGrade.api"
import { useGetRowMaterialsQuery } from "../redux/features/rowMaterials/rowMaterials.api"


export const useAllRowMaterials = () => {
  const { data: unit } = useGetRowMaterialsQuery({})

  const allRowMaterials = _optionalChain([unit, 'optionalAccess', _ => _.data, 'optionalAccess', _2 => _2.map, 'call', _3 => _3((item) => {
    return {
      key: _optionalChain([item, 'optionalAccess', _4 => _4.id]),
      label: _optionalChain([item, 'optionalAccess', _5 => _5.name]),
      value: _optionalChain([item, 'optionalAccess', _6 => _6.id])
    }
  })])
  return allRowMaterials
}


export const useAllLogCategory = () => {
  const { data: unit } = useGetLogsQuery({})

  const allLogCategory = _optionalChain([unit, 'optionalAccess', _7 => _7.data, 'optionalAccess', _8 => _8.map, 'call', _9 => _9((item) => {
    return {
      key: _optionalChain([item, 'optionalAccess', _10 => _10.id]),
      label: _optionalChain([item, 'optionalAccess', _11 => _11.name]),
      value: _optionalChain([item, 'optionalAccess', _12 => _12.id])
    }
  })])
  return allLogCategory
}