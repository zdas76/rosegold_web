import { toast } from "sonner";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getResponse = (res: any) => {
    if (res?.data?.success) {
        toast.success(res?.data?.message);
        return res?.data;
    } else {
        toast.error(res?.error?.error || res?.error?.data?.message || res?.error?.errors || res?.error?.data || res?.message || 'Something went wrong');
        return res
    }
}