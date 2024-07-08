import React, { useEffect, useState } from "react";
import FrameBox, { FrameType } from "components/common/FrameBox";
import classNames from "classnames";
import Image from "next/image";
import GiblatoonLogo from "assets/images/giblatoons-logo.jpg";
import { Modal } from "components/common/Modal";
import { motion } from "framer-motion";
import type { UserNFT } from "server/database/models/user-nfts.model";
import UpgradeNFT from "./UpgradeNFT";
import { ProductType } from "server/database/models/catalog.model";
import { NFTType } from "server/database/models/nft.model";
import type { DemonUpgrades, GolemUpgrades } from "server/database/models/nft.model";
import type { RudeNFT } from "server/database/models/nft.model";
import SwapArtNFT from "./SwapArtNFT";
import { useNFTManager } from "contexts/NFTManagerContext";
import type { ProductOption } from "server/database/models/catalog.model";
import GiblatoonsUpgradeModal from "./GiblatoonsUpgradeModal";
import { CountDown } from "components/common/CountDown";
import { giblatoonsLiveDate, isGiblatoonsLiveOpen } from "utils/giblatoons";
import { env } from "env/client.mjs";

const GiblatoonBanner: React.FC<{
  upgradeOpt?: ProductOption;
  nft?: RudeNFT & {
    user: UserNFT | undefined;
  };
}> = ({ upgradeOpt, nft }) => {
  const { paymentChannel } = useNFTManager();
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [isSwapArtModalOpen, setSwapArtModalOpen] = useState(false);

  const upgradeType =
    nft?.type == NFTType.GOLEM
      ? (upgradeOpt?.key as GolemUpgrades)
      : (upgradeOpt?.key as DemonUpgrades);

  const getPriceSingleText = (opt: ProductOption) => {
    if (!opt.paymentOptions) return "Loading...";
    const [po] = opt.paymentOptions;
    const price = po?.amounts.map((x) => `${x.amount} ${x.token}`);
    return price?.join(" + ");
  };

  useEffect(() => {
    paymentChannel.on("payment_success", handlePaymentSuccess);
    return () => {
      paymentChannel.removeListener("payment_success", handlePaymentSuccess);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePaymentSuccess = (type: ProductType) => {
    switch (type) {
      case ProductType.NFT_ART_SWAP:
        setSwapArtModalOpen(false);
        break;
      case ProductType.NFT_UPGRADE:
        setUpgradeModalOpen(false);
        break;
    }
  };

  return (
    <div className="w-full text-center lg:w-[25%]">
      {upgradeOpt && nft && (
        <>
          {!isGiblatoonsLiveOpen ? (
            <div className="mb-2">
              <p className="text-[#BFA97F]">{upgradeOpt?.name} opens in</p>
              <CountDown date={giblatoonsLiveDate} isLongForm />
            </div>
          ) : (
            <p className="mb-2 text-[#BFA97F]">{upgradeOpt?.name} now OPEN!</p>
          )}
          <FrameBox
            frameType={() => {
              if (nft?.images?.get(upgradeType) && nft?.current == upgradeOpt.key)
                return FrameType.default;
              if (nft?.current != upgradeType && nft?.images?.get(upgradeType))
                return FrameType.gray;
              return FrameType.green;
            }}
          >
            <div
              className={classNames("clip-css relative h-full text-center ", {
                "relative transition duration-200 ease-in-out hover:-translate-y-1 hover:scale-110":
                  nft?.images?.get(upgradeType) == undefined,
              })}
            >
              <Image src={GiblatoonLogo} alt="Giblatoon upgrade" width={900} height={900}></Image>

              {/* {nft?.images?.get(upgradeType) == undefined && (
                <div className="absolute top-4 w-full font-medieval-sharp text-green-400">
                  {getPriceSingleText(upgradeOpt)}
                </div>
              )} */}

              <motion.button
                className="absolute left-0 top-0 h-full w-full cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  isGiblatoonsLiveOpen ? setUpgradeModalOpen(!isUpgradeModalOpen) : undefined;
                }}
              ></motion.button>
            </div>
          </FrameBox>
          <div className="relative -top-5 z-50 w-full items-center">
            <button
              onClick={() => {
                isGiblatoonsLiveOpen ? setUpgradeModalOpen(!isUpgradeModalOpen) : undefined;
              }}
              className={classNames(
                "hover:shadow-lg hover:shadow-slate-400",
                "rounded-full px-3 py-1",
                { "bg-[#6F5B38]": nft?.current == upgradeType },
                {
                  "bg-gray-600":
                    nft?.current != upgradeType && nft?.images?.get(upgradeType) != undefined,
                },
                {
                  "bg-green-400 text-black": nft?.images?.get(upgradeType) == undefined,
                }
              )}
            >
              {nft?.current == upgradeType
                ? "Used"
                : nft?.current != upgradeType && nft?.images?.get(upgradeType) != undefined
                ? "Select"
                : "Portal"}
            </button>
          </div>
          <GiblatoonsUpgradeModal
            isModalOpen={isUpgradeModalOpen}
            setModalOpen={setUpgradeModalOpen}
            upgradeOpt={upgradeOpt}
            nft={nft}
          />
        </>
      )}
    </div>
  );
};
export default GiblatoonBanner;
