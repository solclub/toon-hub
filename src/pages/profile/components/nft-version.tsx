import React, { useState } from "react";
import FrameBox, { FrameType } from "components/common/FrameBox";
import type { NFTUpgrade } from "../types";
import classNames from "classnames";
import Image from "next/image";
import NftHidden from "assets/images/nft-hidden.png";
import { Modal } from "components/common/Modal";
import { motion } from "framer-motion";
import type { UserNFT } from "server/database/models/user-nfts.model";
import BuyNFT from "components/common/BuyNFT";

const NftVersion: React.FC<{ upgrade: NFTUpgrade; userNft?: UserNFT }> = ({ upgrade, userNft }) => {
  const [isOpen, setOpen] = useState(false);
  const { name, price, type } = upgrade;

  return (
    <div className=" w-[25%] text-center">
      <h3
        className={classNames("pb-3", {
          "text-[#BFA97F]": userNft?.current == type,
        })}
      >
        {name}
      </h3>
      <FrameBox
        frameType={() => {
          if (userNft?.images?.get(type) && userNft?.current == type) return FrameType.default;
          if (userNft?.current != type && userNft?.images?.get(type)) return FrameType.gray;
          return FrameType.green;
        }}
      >
        <div
          className={classNames("clip-css relative h-full text-center", {
            "relative h-full transition duration-200 ease-in-out hover:-translate-y-1 hover:scale-110":
              userNft?.images?.get(type) == undefined,
          })}
        >
          <Image
            src={userNft?.images?.get(type) ?? NftHidden}
            alt="Picture of the author"
            width={900}
            height={900}
          ></Image>

          {userNft?.images?.get(type) == undefined && (
            <div className="absolute top-4 w-full text-green-400">{price}</div>
          )}
          <div className="absolute bottom-0 h-3/4 w-full bg-gradient-to-t from-black to-transparent "></div>

          <motion.button
            className="absolute top-0 left-0 h-full w-full cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(!isOpen)}
          ></motion.button>
        </div>
      </FrameBox>
      <div className="relative -top-5 z-50 w-full items-center">
        <button
          onClick={() => {
            // onBuyArtEvent(x);
          }}
          className={classNames(
            "hover:shadow-lg hover:shadow-slate-400",
            "rounded-full px-3 py-1",
            { "bg-[#6F5B38]": userNft?.current == type },
            {
              "bg-gray-600": userNft?.current != type && userNft?.images?.get(type) != undefined,
            },
            {
              "bg-green-400 text-black": userNft?.images?.get(type) == undefined,
            }
          )}
        >
          {userNft?.current == type
            ? "Used"
            : userNft?.current != type && userNft?.images?.get(type) != undefined
            ? "Select"
            : "Reveal"}
        </button>
      </div>

      <Modal isOpen={isOpen} backdropDismiss={true} handleClose={() => setOpen(false)}>
        <div className="lg:w-[1000px]">
          <BuyNFT
            description="Lorem ipsum dolor sit amet consectetur adipiscing, elit ad scelerisque senectus habitasse Lorem ipsum dolor sit amet consectetur adipiscing, elit ad scelerisque senectus habitasse"
            price={upgrade.price}
            title={upgrade.name}
            previewImage={() => {
              return userNft?.images?.get(type) ?? NftHidden;
            }}
            priceUnit={upgrade.priceUnit.toString()}
          ></BuyNFT>
        </div>
      </Modal>
    </div>
  );
};
export default NftVersion;
