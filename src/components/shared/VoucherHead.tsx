import React from "react";

type VoucherHeaderProps = {
  partyName: string;
  date: string;
  address: string;
};
const logo = "/logo.png";
import dayjs from "dayjs";

const VoucherHeader: React.FC<VoucherHeaderProps> = ({
  partyName,
  date,
  address,
}) => {
  return (
    <div className="px-10 font-sans font-semibold w-full">
      <div className="flex items-center gap-8">
        <div className="w-fit">
          {/* <img src={logo} alt="Company Logo" className="max-w-[150px] mb-4" /> */}
        </div>
        <div className="flex-1">
          {/* Company Info */}
          <div className="w-fit">
            <h2 className="text-center text-xl sm:text-[22px] font-arial font-semibold uppercase text-amber-900">
              Golden Mart Industries
            </h2>
            <p className="text-center text-xs font-normal">
              Factory Office: Golden Mart Industrial Park, Shimulia, Rupganj,
              Narayanganj, Bangladesh.
            </p>
            <p className="text-center text-xs font-normal">
              Mobile: 01777-409140, 01959-112611, 01754-988440 &nbsp; | &nbsp;
              Phone: 02-57160735
            </p>
            <p className="text-center text-xs font-normal">
              E-mail: marketing@goldenmartindustries.com &nbsp; | &nbsp;
              www.goldenmartindustries.com
            </p>
          </div>
        </div>
      </div>
      {/* Voucher Info */}
      <div className="">
        <div className="flex justify-end text-sm">
          <div className="font-semibold flex gap-1 min-w-[180px]">
            <span className="">Date: </span>
            <span className="border-b w-full border-dotted">
              {" "}
              {date ? dayjs(date).format("DD-MMM-YYYY") : ""}
            </span>
          </div>
        </div>
        <div className="space-y-3 flex-1 text-sm">
          <div className="font-semibold flex w-full gap-1">
            <span className="">Name: </span>
            <span className="border-b w-full border-dotted -mb-0">
              <b className="ml-4">{partyName}</b>
            </span>
          </div>
          <div className="font-semibold flex w-full gap-1">
            <span className="">Address: </span>
            <div className="border-b w-full border-dotted -mb-0">
              <span className="ml-4"> {address} </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherHeader;
