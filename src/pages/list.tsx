import React from "react";
import Image from "next/image";
import classnames from "classnames";
import Link from "next/link";
import { trpc } from "../utils/trpc";

const Profile = () => {
  const nfts = trpc.nfts.getUserNFTs.useQuery().data;

  return (
    <div className="mt-8 flex flex-wrap">
      <div className="w-full text-2xl">My Collection</div>
      <div className="w-full pt-3 font-thin">
        Select the characters to customize
      </div>
      <div className="flex w-full flex-wrap justify-center gap-y-6 gap-x-4 pt-8 pb-20">
        {nfts &&
          nfts.map((x) => (
            <div
              key={x.mint}
              className="aspect-square w-1/5 rounded-3xl border-2 border-solid border-[#ae9970]"
            >
              <div className={classnames("relative h-full")}>
                <Image
                  className="octagon rounded-3xl border-solid"
                  src={x.image}
                  alt="Picture of the author"
                  width={900}
                  height={900}
                ></Image>
                <Link
                  href={"/profile/" + x.mint}
                  className="btn-rude absolute left-16 -bottom-5 z-40 items-center"
                >
                  Customize
                </Link>
                <div className="absolute bottom-0 h-3/4 w-full rounded-3xl bg-gradient-to-t from-black to-transparent "></div>
                <div className="absolute bottom-12 w-full items-center text-center text-2xl">
                  {x.name}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Profile;
