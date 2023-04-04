import { motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import type { ProductOption } from "types/catalog";
import PaymentMethodSelector from "./PaymentMethodSelector";
import Loader from "./Loader";
import NftHidden from "assets/images/nft-hidden.png";
import Divider from "assets/images/divider.png";
import FrameBox from "./FrameBox";
import type { DemonUpgrades, GolemUpgrades, UserNFT } from "server/database/models/user-nfts.model";
import { showSuccessToast, showErrorToast } from "utils/toastUtils";
import { trpc } from "utils/trpc";
import { NFTType } from "server/database/models/nft.model";

interface BuyProperties {
  title: string;
  upgradeOption: ProductOption;
  imageUrl?: string;
  sourceImageUrl?: string;
  nft: UserNFT;
}

const UpgradeNFT: React.FC<BuyProperties> = ({
  title,
  upgradeOption,
  imageUrl,
  sourceImageUrl,
  nft,
}) => {
  const previewMutation = trpc.upgradeNft.buildNFTUpgradeImage.useMutation();
  const { data, isLoading, error, isError, isSuccess } = previewMutation;
  const { paymentOptions } = upgradeOption;

  const initiatePreview = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    try {
      previewMutation.mutate({
        mint: nft.mint,
        upgradeType:
          nft.type == NFTType.GOLEM
            ? (upgradeOption.key as GolemUpgrades)
            : (upgradeOption.key as DemonUpgrades),
      });
      showSuccessToast("Preview Generated", 1000);
    } catch (error) {
      showErrorToast("Error generating Preview, try again or contact support!");
      console.error(error);
    }
  };

  useEffect(() => {
    if (isError) {
      showErrorToast(error?.message || "unexpected error");
      console.error(error?.message);
    }

    if (isSuccess) {
      showSuccessToast("Preview Generated", 1000);
    }
  }, [error?.message, isError, isSuccess]);

  const upgradeGolem = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
  };

  return (
    <div className="flex flex-wrap items-center justify-center">
      <div className="mt-10 mb-10 w-full ">
        <div className="mx-4 flex flex-wrap items-center justify-between">
          <div className="w-full lg:w-2/6">
            <FrameBox className="w-full">
              <Image
                className="w-full rounded-3xl"
                src={sourceImageUrl ?? NftHidden}
                alt={title}
                width={500}
                height={500}
              ></Image>
            </FrameBox>
          </div>
          <div className="flex w-full flex-wrap items-center lg:w-2/6">
            <div className="mx-auto flex w-full flex-wrap">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="btn-rude btn mx-auto"
                onClick={initiatePreview}
                disabled={isLoading}
              >
                PREVIEW NFT
              </motion.button>
            </div>
            <div>
              <Image
                className="w-full rounded-3xl object-fill p-5"
                src={Divider}
                alt={title}
              ></Image>
            </div>
            <div className="mx-auto flex w-full flex-wrap">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="btn-rude btn mx-auto"
                onClick={upgradeGolem}
                disabled={isLoading}
              >
                UPGRADE NFT
              </motion.button>
            </div>
          </div>
          <div className="w-full lg:w-2/6">
            <FrameBox className="w-full">
              <Image
                className="panel w-full items-center rounded-3xl"
                src={(data as string) ?? NftHidden}
                alt={title}
                width={500}
                height={500}
              ></Image>
            </FrameBox>
          </div>
        </div>
      </div>
      <div className="mb-5 w-1/2 p-5 sm:p-0">
        <div className="w-full text-center sm:w-auto">
          <p className="titles-color textStroke mb-4 text-2xl">Current Golem Upgrade Costs:</p>
          {paymentOptions && (
            <PaymentMethodSelector
              paymentOptions={paymentOptions}
              onChange={(opt) => {
                console.log(opt);
              }}
            ></PaymentMethodSelector>
          )}
        </div>
      </div>
      <div className="z-10 w-full xl:pt-3">
        <div className="text-center"></div>
      </div>
    </div>
  );
};

export default UpgradeNFT;
