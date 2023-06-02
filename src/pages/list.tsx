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
  const featuredItems = trpc.featureNft.userFeaturedNfts.useQuery();
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
        <div className="flex justify-between">
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
                  fill="#AB9F3A"
                >
                  <path d="M21,11a1,1,0,0,0-1,1,8.05,8.05,0,1,1-2.22-5.5h-2.4a1,1,0,0,0,0,2h4.53a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4.77A10,10,0,1,0,22,12,1,1,0,0,0,21,11Z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full font-thin">Select the characters to customize</div>

      <div className="flex w-full flex-wrap justify-center gap-y-6 gap-x-4 pt-8 pb-20">
        {isLoading && (
          <div>
            <Loader></Loader>
          </div>
        )}
        {(data ?? []).length == 0 && !isLoading && "You don't have NFTs"}
        {(data ?? []).map((x, i) => (
          <div className="relative" key={x.mint}>
            <FrameBox index={i + 1}>
              <div
                className={classnames(
                  "relative h-full transition duration-200 ease-in-out hover:-translate-y-1 hover:scale-110"
                )}
              >
                <Link href={"/profile/" + x.mint}>
                  <Image
                    className="octagon rounded-3xl border-solid "
                    src={x?.images?.get(x.current) ?? x.image}
                    alt="current nft image"
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
            {featuredItems.data &&
              featuredItems.data.featuredNFTs.find((f) => f.mint == x.mint) && (
                <div
                  className="tooltip btn-sm btn-circle btn absolute top-4 right-8 border-[#AB9F3A] p-1"
                  data-tip="in featuring queue"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="rocket">
                    <path
                      fill="#AB9F3A"
                      d="M22.601 2.062a1 1 0 0 0-.713-.713A11.252 11.252 0 0 0 10.47 4.972L9.354 6.296 6.75 5.668a2.777 2.777 0 0 0-3.387 1.357l-2.2 3.9a1 1 0 0 0 .661 1.469l3.073.659a13.42 13.42 0 0 0-.555 2.434 1 1 0 0 0 .284.836l3.1 3.1a1 1 0 0 0 .708.293c.028 0 .057-.001.086-.004a12.169 12.169 0 0 0 2.492-.49l.644 3.004a1 1 0 0 0 1.469.661l3.905-2.202a3.035 3.035 0 0 0 1.375-3.304l-.668-2.76 1.237-1.137A11.204 11.204 0 0 0 22.6 2.062ZM3.572 10.723l1.556-2.76a.826.826 0 0 1 1.07-.375l1.718.416-.65.772a13.095 13.095 0 0 0-1.59 2.398Zm12.47 8.222-2.715 1.532-.43-2.005a11.34 11.34 0 0 0 2.414-1.62l.743-.683.404 1.664a1.041 1.041 0 0 1-.416 1.112Zm1.615-6.965-3.685 3.386a9.773 9.773 0 0 1-5.17 2.304l-2.405-2.404a10.932 10.932 0 0 1 2.401-5.206l1.679-1.993a.964.964 0 0 0 .078-.092L11.99 6.27a9.278 9.278 0 0 1 8.81-3.12 9.218 9.218 0 0 1-3.143 8.829Zm-.923-6.164a1.5 1.5 0 1 0 1.5 1.5 1.5 1.5 0 0 0-1.5-1.5Z"
                    ></path>
                  </svg>
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
