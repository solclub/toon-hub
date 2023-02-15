import { useState, useEffect } from "react";
import React from "react";
import sampleData from "./sample-data/rankItems.json";
import Image from "next/image";
import classnames from "classnames";

type NFTItem = {
  id: string;
  name: string;
  mint: string;
  image: string;
  owner: string;
  twitter: string;
  points: number;
};

const Profile = () => {
  const [nfts, setNFTs] = useState<NFTItem[]>([]);

  useEffect(() => {
    setNFTs(sampleData);
  }, []);
  return (
    <div className="mt-8 flex flex-wrap">
      <div className="w-full text-2xl">My Collection</div>
      <div className="w-full pt-3 font-thin">
        Select the characters to customize
      </div>
      <div className="flex w-full flex-wrap justify-center gap-y-6 gap-x-4 pt-8">
        {nfts &&
          nfts.map((x) => (
            <div
              key={x.mint}
              className="aspect-square w-1/5 rounded-3xl border-2 border-solid border-[#ae9970]"
            >
              <div className={classnames("relative h-full")}>
                <Image
                  className="rounded-3xl border-solid"
                  src={x.image}
                  alt="Picture of the author"
                  width={900}
                  height={900}
                ></Image>
                <button className="btn-rude absolute left-16 -bottom-5 z-40 items-center">
                  Customize
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Profile;
