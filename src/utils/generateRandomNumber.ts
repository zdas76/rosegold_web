import dayjs from "dayjs";

export const generateInvoiceNumber = (preCode?: string) => {
  const random = Math.floor(Math.random() * 1000); // 3 random digits
  return `${preCode ?? "PRV"}-${dayjs().format("YYYYMMDD-HHmmss")}-${random}`;
};
