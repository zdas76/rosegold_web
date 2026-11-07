/* eslint-disable @typescript-eslint/no-explicit-any */
export const formateData = (data: [], name: string) => {
    const finaldata = data?.map((item: any) => {
        return {
            ...item,
            key: item?.id,
            label: item[name],
            value: item?.id
        }
    });
    return finaldata
}