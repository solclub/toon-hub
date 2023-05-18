import { motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import type { PaymentOption, ProductOption } from "server/database/models/catalog.model";
import { ProductType } from "server/database/models/catalog.model";
import PaymentMethodSelector from "components/common/PaymentMethodSelector";
import NftHidden from "assets/images/skin.png";
import Divider from "assets/images/divider.png";
import FrameBox from "components/common/FrameBox";
import type { DemonUpgrades, GolemUpgrades, UserNFT } from "server/database/models/user-nfts.model";
import { showSuccessToast, showErrorToast, showPromisedToast } from "utils/toast-utils";
import { trpc } from "utils/trpc";
import type { RudeNFT } from "server/database/models/nft.model";
import { NFTType } from "server/database/models/nft.model";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNFTManager } from "contexts/NFTManagerContext";
import { SigninMessage } from "utils/signin-message";
import { getCsrfToken } from "next-auth/react";
import bs58 from "bs58";
import Loader from "components/common/Loader";

interface BuyProperties {
  title: string;
  upgradeOption: ProductOption;
  sourceImageUrl?: string;
  targetImageUrl?: string;
  nft: RudeNFT & {
    upgrades: UserNFT | undefined;
  };
}

const SwapArtNFT: React.FC<BuyProperties> = ({
  title,
  upgradeOption,
  sourceImageUrl,
  targetImageUrl,
  nft,
}) => {
  const { publicKey, signMessage, signTransaction } = useWallet();
  const { prepTransaction, notifyPayment } = useNFTManager();
  const toastRef = useRef("");
  const swapArtMetadata = trpc.upgradeNft.swapArtMetadata.useMutation();
  const { isLoading, error, isError, isSuccess } = swapArtMetadata;
  const { paymentOptions } = upgradeOption ?? {};
  const [paymentOption, setpaymentOption] = useState<PaymentOption>();

  useEffect(() => {
    if (paymentOptions) {
      const [paymentOption] = paymentOptions;
      setpaymentOption(paymentOption);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isError) {
      showErrorToast(error?.message || "unexpected error");
      console.error(error?.message);
    }

    if (isSuccess) {
      showSuccessToast("Success Swap", 1000);
      notifyPayment(ProductType.NFT_ART_SWAP);
    }
  }, [error?.message, isError, isSuccess, notifyPayment]);

  const swapArtNFT = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    const csrf = await getCsrfToken();
    console.log(!publicKey, !csrf, !signMessage, !signTransaction, !paymentOption);
    if (!publicKey || !csrf || !signMessage || !signTransaction || !paymentOption) return;
    try {
      showPromisedToast(toastRef, "Initating Swap: Sign message...", false);
      const signatureMessage = `Do you wish to swap your ${nft.name} ART! This will approve the Swap of metadata but will not affect the Rarity of the NFT. Do you wish to continue?`;

      const message = new SigninMessage({
        domain: window.location.host,
        publicKey: publicKey.toBase58(),
        statement: signatureMessage,
        nonce: csrf,
      });

      const data = message.prepare();
      const signature = await signMessage(data);
      const signedMessage = bs58.encode(signature);
      const stringMessage = JSON.stringify(message);

      const serializedtx = await prepTransaction(publicKey, paymentOption, signTransaction);

      showPromisedToast(
        toastRef,
        "Swapping NFT: Transaction sent, waiting for confirmation...",
        true
      );

      swapArtMetadata.mutate({
        nonce: csrf,
        serializedTx: serializedtx,
        signedMessage: signedMessage,
        stringMessage: stringMessage,
        mint: nft.mint,
        upgradeType:
          nft.type == NFTType.GOLEM
            ? (upgradeOption.key as GolemUpgrades)
            : (upgradeOption.key as DemonUpgrades),
      });
    } catch (error) {
      showErrorToast("Error generating Preview, try again or contact support!");
      console.error(error);
    }
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
            <div>
              <Image
                className="w-full rounded-3xl object-fill p-5"
                src={Divider}
                alt={title}
              ></Image>
            </div>
            <div className="mx-auto flex w-full flex-wrap">
              {!isSuccess ? (
                <motion.button
                  className="btn-rude btn mx-auto"
                  onClick={swapArtNFT}
                  disabled={isLoading}
                >
                  SWAP NFT ART
                </motion.button>
              ) : (
                <div className="text-stroke mx-auto text-2xl text-yellow-400">Congrats!!</div>
              )}
            </div>
            <div>
              <Image
                className="w-full rounded-3xl object-fill p-5"
                src={Divider}
                alt={title}
              ></Image>
            </div>
          </div>
          <div className="w-full lg:w-2/6">
            <FrameBox className="relative">
              {isLoading && (
                <div className="absolute top-1/2 z-50 w-full">
                  <Loader></Loader>
                </div>
              )}
              <Image
                className="w-full rounded-3xl"
                src={targetImageUrl ?? NftHidden}
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
          <p className="titles-color textStroke mb-4 text-2xl">Current Swap Costs:</p>
          {paymentOptions && (
            <PaymentMethodSelector
              paymentOptions={paymentOptions}
              selected={paymentOption}
              onChange={(opt) => {
                setpaymentOption(opt);
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

export default SwapArtNFT;
