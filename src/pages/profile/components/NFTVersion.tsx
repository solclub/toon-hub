import React, { useState } from "react";
import FrameBox, { FrameType } from "components/common/FrameBox";
import classNames from "classnames";
import Image from "next/image";
import NftHidden from "assets/images/skin.png";
import { Modal } from "components/common/Modal";
import { motion } from "framer-motion";
import type { DemonUpgrades, UserNFT } from "server/database/models/user-nfts.model";
import UpgradeNFT from "./UpgradeNFT";
import type { ProductOption } from "types/catalog";
import type { GolemUpgrades } from "server/database/models/user-nfts.model";
import { NFTType } from "server/database/models/nft.model";
import type { RudeNFT } from "server/database/models/nft.model";
import SwapArtNFT from "./SwapArtNFT";

const NftVersion: React.FC<{
  upgradeOpt?: ProductOption;
  swapArtOpt?: ProductOption | undefined;
  nft?: RudeNFT & {
    upgrades: UserNFT | undefined;
  };
}> = ({ upgradeOpt, swapArtOpt, nft }) => {
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [isSwapArtModalOpen, setSwapArtModalOpen] = useState(false);
  const userNft = nft?.upgrades;
  const upgradeType =
    userNft?.type == NFTType.GOLEM
      ? (upgradeOpt?.key as GolemUpgrades)
      : (upgradeOpt?.key as DemonUpgrades);

  const getPriceSingleText = (opt: ProductOption) => {
    if (!opt.paymentOptions) return "Loading...";
    const [po] = opt.paymentOptions;
    const price = po?.amounts.map((x) => `${x.amount} ${x.token}`);
    return price?.join(" + ");
  };

  return (
    <div className=" w-[25%] text-center">
      {upgradeOpt && userNft && (
        <>
          <h3
            className={classNames("pb-3", {
              "text-[#BFA97F]": userNft.current == upgradeOpt.key,
            })}
          >
            {upgradeOpt?.name}
          </h3>
          <FrameBox
            frameType={() => {
              if (userNft?.images?.get(upgradeType) && userNft?.current == upgradeOpt.key)
                return FrameType.default;
              if (userNft?.current != upgradeType && userNft?.images?.get(upgradeType))
                return FrameType.gray;
              return FrameType.green;
            }}
          >
            <div
              className={classNames("clip-css relative h-full text-center", {
                "relative h-full transition duration-200 ease-in-out hover:-translate-y-1 hover:scale-110":
                  userNft?.images?.get(upgradeType) == undefined,
              })}
            >
              <Image
                src={userNft?.images?.get(upgradeType) ?? NftHidden}
                alt="Picture of the author"
                width={900}
                height={900}
              ></Image>

              {userNft?.images?.get(upgradeType) == undefined && (
                <div className="absolute top-4 w-full font-medieval-sharp text-green-400">
                  {getPriceSingleText(upgradeOpt)}
                </div>
              )}
              <div className="absolute bottom-0 h-3/4 w-full bg-gradient-to-t from-black to-transparent "></div>

              <motion.button
                className="absolute top-0 left-0 h-full w-full cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setUpgradeModalOpen(!isUpgradeModalOpen)}
              ></motion.button>
            </div>
          </FrameBox>
          <div className="relative -top-5 z-50 w-full items-center">
            <button
              onClick={() => {
                if (
                  userNft?.current != upgradeType &&
                  userNft?.images?.get(upgradeType) != undefined
                ) {
                  setSwapArtModalOpen(!isUpgradeModalOpen);
                }
              }}
              className={classNames(
                "hover:shadow-lg hover:shadow-slate-400",
                "rounded-full px-3 py-1",
                { "bg-[#6F5B38]": userNft?.current == upgradeType },
                {
                  "bg-gray-600":
                    userNft?.current != upgradeType &&
                    userNft?.images?.get(upgradeType) != undefined,
                },
                {
                  "bg-green-400 text-black": userNft?.images?.get(upgradeType) == undefined,
                }
              )}
            >
              {userNft?.current == upgradeType
                ? "Used"
                : userNft?.current != upgradeType && userNft?.images?.get(upgradeType) != undefined
                ? "Select"
                : "Reveal"}
            </button>
          </div>

          <Modal
            className={classNames({ "lg:w-2/3": upgradeOpt.isAvailable })}
            isOpen={isUpgradeModalOpen}
            backdropDismiss={true}
            handleClose={() => setUpgradeModalOpen(false)}
          >
            {upgradeOpt.isAvailable && !userNft?.images.has(upgradeOpt.key) ? (
              <UpgradeNFT
                nft={nft}
                title={upgradeOpt.name}
                upgradeOption={upgradeOpt}
                sourceImageUrl={userNft?.images?.get(userNft.current)}
              ></UpgradeNFT>
            ) : (
              <Image
                className="items-center rounded-3xl border-solid bg-gray-600 object-cover"
                src={userNft?.images.get(upgradeOpt.key) ?? NftHidden}
                alt={"Golem Image"}
                width={800}
                height={800}
              ></Image>
            )}
          </Modal>

          <Modal
            className={classNames({ "lg:w-2/3": true })}
            isOpen={isSwapArtModalOpen}
            backdropDismiss={true}
            handleClose={() => setSwapArtModalOpen(false)}
          >
            {swapArtOpt?.isAvailable && (
              <SwapArtNFT
                nft={nft}
                title={swapArtOpt.name}
                upgradeOption={swapArtOpt}
                sourceImageUrl={userNft?.images?.get(userNft.current)}
                targetImageUrl={userNft?.images?.get(swapArtOpt.key)}
              ></SwapArtNFT>
            )}
          </Modal>
        </>
      )}
    </div>
  );
};
export default NftVersion;
