import { useGetLogsQuery } from "../redux/features/logAndGrade/LogAndGrade.api"
import { useGetRowMaterialsQuery } from "../redux/features/rowMaterials/rowMaterials.api"
import { TLogs, TrowMaterials,  } from "../types/types"

export const useAllRowMaterials = () => {
  const { data: unit } = useGetRowMaterialsQuery({})

  const allRowMaterials = unit?.data?.map((item: TrowMaterials) => {
    return {
      key: item?.id,
      label: item?.name,
      value: item?.id
    }
  })
  return allRowMaterials
}


export const useAllLogCategory = () => {
  const { data: unit } = useGetLogsQuery({})

  const allLogCategory = unit?.data?.map((item: TLogs) => {
    return {
      key: item?.id,
      label: item?.name,
      value: item?.id
    }
  })
  return allLogCategory
}