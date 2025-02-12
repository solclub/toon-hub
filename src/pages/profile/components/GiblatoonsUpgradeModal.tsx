import { Modal } from "components/common/Modal";
import React, { useEffect, useState } from "react";
import UpgradeNFT from "./UpgradeNFT";
import Image from "next/image";
import GiblatoonLogo from "assets/images/giblatoons-logo.jpg";
import type { RudeNFT } from "server/database/models/nft.model";
import type { UserNFT } from "server/database/models/user-nfts.model";
import type { ProductOption } from "server/database/models/catalog.model";
import { getDaysSinceStart, getTotalCrayonSupply } from "utils/giblatoons";
import UpgradeToonNFT from "./UpgradeToonNFT";
import { useConnection } from "@solana/wallet-adapter-react";

interface GiblatoonsUpgradeModalProps {
  isModalOpen: boolean;
  setModalOpen: (value: boolean) => void;
  upgradeOpt: ProductOption;
  nft: RudeNFT & {
    user: UserNFT | undefined;
  };
}
export default function GiblatoonsUpgradeModal({
  isModalOpen,
  setModalOpen,
  upgradeOpt,
  nft,
}: GiblatoonsUpgradeModalProps) {
  const { connection } = useConnection();
  const [totalCrayonSupply, setTotalCrayonSupply] = useState(0);

  useEffect(() => {
    (async () => {
      const supply = await getTotalCrayonSupply(connection);
      setTotalCrayonSupply(supply);
    })();
  }, [connection]);

  return (
    <Modal
      isOpen={isModalOpen}
      backdropDismiss={true}
      handleClose={() => setModalOpen(false)}
    >
      <div className="w-full flex flex-col justify-between items-center lg:flex-row">
        <div>
          {!nft?.images.has(upgradeOpt.key) ? (
            <p className="mb-4 text-center text-3xl font-bold md:text-left">
              Move to the <span className="text-[#ffe75c]">NEW WORLD!</span>
            </p>
          ) : (
            <p className="mb-4 text-center text-3xl font-bold md:text-left">
              Welcome to the <span className="text-[#ffe75c]">NEW WORLD!</span>
            </p>
          )}
        </div>
        {!nft?.images.has(upgradeOpt.key) && (
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2 text-sm">
            <div className="flex max-w-max items-center gap-3 rounded-2xl border border-b-2 border-[#ffe75c] px-4 py-2 font-sans font-bold">
              {totalCrayonSupply <= 1111 ? (
                <p>🖍️ CRAYONS LEFT: {totalCrayonSupply}/1111</p>
              ) : (
                <p>🖍️ CRAYONS LEFT: {totalCrayonSupply}/2222</p>
              )}
            </div>
            <div className="flex max-w-max items-center gap-3 rounded-2xl border border-b-2 border-[#db455d] px-4 py-2 font-sans font-bold">
              {getDaysSinceStart() <= 30 ? (
                <p>PORTAL OPEN: {getDaysSinceStart()}/30 Days</p>
              ) : (
                <p>PORTAL OPEN FOR ALL!</p>
              )}
            </div>
          </div>
        )}
      </div>
      {!nft?.images.has(upgradeOpt.key) ? (
        <UpgradeToonNFT
          nft={nft}
          title={upgradeOpt.name}
          upgradeOption={upgradeOpt}
          sourceImageUrl={nft?.images?.get(nft.current)}
        ></UpgradeToonNFT>
      ) : (
        <Image
          className="items-center rounded-3xl border-solid bg-gray-600 object-cover"
          src={nft?.images.get(upgradeOpt.key) ?? GiblatoonLogo}
          alt={"Golem Image"}
          width={800}
          height={800}
        ></Image>
      )}
    </Modal>
  );
}
