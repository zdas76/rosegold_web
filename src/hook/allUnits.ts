import { useGetUnitsQuery } from "../redux/features/unit/unit.api"
import { TUnit } from "../types/types"

export const useAllUnits = () => {
  const { data: unit } = useGetUnitsQuery({})

  const allUnits = unit?.data?.map((item: TUnit) => {
    return {
      key: item?.id,
      label: item?.name,
      value: item?.id,
      ...item
    }
  })

  return allUnits
}