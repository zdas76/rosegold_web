 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import dayjs from "dayjs";

export const generateInvoiceNumber = (preCode) => {
  const random = Math.floor(Math.random() * 1000); // 3 random digits
  return `${_nullishCoalesce(preCode, () => ( "PRV"))}-${dayjs().format("YYYYMMDD-HHmmss")}-${random}`;
};
