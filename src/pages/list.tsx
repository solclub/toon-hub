import React, { useState } from "react";
import Image from "next/image";
import classnames from "classnames";
import Link from "next/link";
import { trpc } from "../utils/trpc";
import FrameBox from "../components/common/FrameBox";
import Loader from "../components/common/Loader";
import { NFTType } from "server/database/models/nft.model";
import { toPascalCase } from "utils/string-utils";

const Profile = () => {
  const [selectedCollection, setSelectedCollection] = useState<NFTType | "ALL">("ALL");
  const { isLoading, data } = trpc.nfts.getUserNFTs.useQuery({ collection: selectedCollection });
  const utils = trpc.useContext();

  const handleRefresh = () => {
    utils.nfts.getUserNFTs.invalidate();
  };

  const handleCollectionChange = (collection: NFTType | "ALL") => {
    setSelectedCollection(collection);
  };

  return (
    <div className="mt-8 flex flex-wrap">
      <div className="w-full text-2xl">
        <div className="mb-4 flex justify-between">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center">My Collection</div>
            <div className="flex items-center">
              <div className="dropdown">
                <label tabIndex={0} className="btn m-1">
                  {selectedCollection === "ALL"
                    ? "All collections"
                    : `Rude ${toPascalCase(selectedCollection)}s`}
                </label>

                <ul
                  tabIndex={0}
                  className="dropdown-content menu rounded-box w-52 bg-base-100 p-2 shadow"
                >
                  <li
                    className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleCollectionChange("ALL")}
                  >
                    All collections
                  </li>
                  {Object.keys(NFTType).map((collection) => (
                    <li
                      key={collection}
                      className={`cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        selectedCollection === collection ? "bg-gray-100 dark:bg-gray-700" : ""
                      }`}
                      onClick={() => handleCollectionChange(collection.toUpperCase() as NFTType)}
                    >
                      {`Rude ${toPascalCase(collection)}s`}
                    </li>
                  ))}
                </ul>
              </div>
              <button className="btn-square btn" onClick={handleRefresh}>
                <svg
                  className="p-1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  id="redo"
                  fill="orange"
                >
                  fill
                  <path d="M21,11a1,1,0,0,0-1,1,8.05,8.05,0,1,1-2.22-5.5h-2.4a1,1,0,0,0,0,2h4.53a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4.77A10,10,0,1,0,22,12,1,1,0,0,0,21,11Z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full pt-3 font-thin">Select the characters to customize</div>

      <div className="flex w-full flex-wrap justify-center gap-y-6 gap-x-4 pt-8 pb-20">
        {isLoading && (
          <div>
            <Loader></Loader>
          </div>
        )}
        {(data ?? []).length == 0 && <>No data</>}
        {(data ?? []).map((x, i) => (
          <FrameBox key={x.mint} index={i + 1}>
            <div
              className={classnames(
                "relative h-full transition duration-200 ease-in-out hover:-translate-y-1 hover:scale-110"
              )}
            >
              <Link href={"/profile/" + x.mint}>
                <Image
                  className="octagon rounded-3xl border-solid "
                  src={x.image}
                  alt="Picture of the author"
                  width={300}
                  height={300}
                ></Image>
                <div className="to-transparen absolute bottom-0 h-3/4 w-full bg-gradient-to-t from-black"></div>
                <div className="absolute bottom-5 w-full items-center text-center text-2xl ">
                  {x.name}
                </div>
              </Link>
            </div>
          </FrameBox>
        ))}
      </div>
    </div>
  );
};

export default Profile;
