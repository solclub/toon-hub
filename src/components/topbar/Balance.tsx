import React from "react";
import RudeTokenImg from "../../assets/images/rudetoken.png";
import Image from "next/image";
import SVGIcon from "assets/svg/SVGIcon";
import classNames from "classnames";
import { trpc } from "../../utils/trpc";

const Balance: React.FC<{ className?: string }> = ({ className }) => {
  const { isLoading, data } = trpc.nfts.getWalletBalance.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  return (
    <div
      className={classNames(
        `${
          className || "mr-3"
        }  flex items-center gap-3 rounded-2xl border border-[#ffe75c] py-2 px-4 font-medieval-sharp font-bold`,
        { "loading-effect": isLoading }
      )}
    >
      <p className="inline-flex items-center gap-x-2 text-sm lg:text-base">
        <span>🖍️</span>
        <span className={classNames({ "opacity-20": isLoading })}>
          {data?.get("CRAYON")?.toFixed(0) ?? "0"}
        </span>
      </p>
      <div className="divider mx-1 my-0 h-auto w-0.5 flex-col before:bg-[#ffe75c] after:bg-[#ffe75c]"></div>
      <p className="inline-flex items-center gap-x-2 text-xs lg:text-base">
        <span>🦋</span>
        <span className={classNames({ "opacity-20": isLoading })}>
          {data?.get("RGBF")?.toFixed(2) ?? "00"}
        </span>
      </p>
      <div className="divider mx-1 my-0 h-auto w-0.5 flex-col before:bg-[#ffe75c] after:bg-[#ffe75c]"></div>
      <p className="inline-flex items-center gap-x-2 text-xs lg:text-base">
        <span>{<Image width={20} height={20} src={RudeTokenImg} alt={"Rude token"}></Image>}</span>
        <span className={classNames({ "opacity-20": isLoading })}>
          {data?.get("RUDE")?.toFixed(2) ?? "00000"}
        </span>
      </p>
      <div className="divider mx-1 my-0 h-auto w-0.5 flex-col before:bg-[#ffe75c] after:bg-[#ffe75c]"></div>
      <p className="inline-flex items-center gap-x-2 text-xs lg:text-base">
        <span>
          <SVGIcon.Sol />
        </span>
        <span>
          {
            <span className={classNames({ "opacity-20": isLoading })}>
              {data?.get("SOL")?.toFixed(2) ?? "0000"}
            </span>
          }
        </span>
      </p>
    </div>
  );
};

export default Balance;
