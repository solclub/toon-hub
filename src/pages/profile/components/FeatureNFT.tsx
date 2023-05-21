import { motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import type { PaymentOption, ProductOption } from "server/database/models/catalog.model";
import { ProductType } from "server/database/models/catalog.model";
import PaymentMethodSelector from "../../../components/common/PaymentMethodSelector";
import NftHidden from "assets/images/skin.png";
import FrameBox from "../../../components/common/FrameBox";
import type { UserNFT } from "server/database/models/user-nfts.model";
import { showPromisedToast } from "utils/toast-utils";
import { trpc } from "utils/trpc";
import type { RudeNFT } from "server/database/models/nft.model";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNFTManager } from "contexts/NFTManagerContext";
import { SigninMessage } from "utils/signin-message";
import { getCsrfToken } from "next-auth/react";
import bs58 from "bs58";

interface BuyProperties {
  title: string;
  featureOption: ProductOption;
  sourceImageUrl?: string;
  nft: RudeNFT & {
    user: UserNFT | undefined;
  };
}

const FeatureNFT: React.FC<BuyProperties> = ({ title, featureOption, sourceImageUrl, nft }) => {
  const { publicKey, signMessage, signTransaction } = useWallet();
  const { prepTransaction, notifyPayment } = useNFTManager();
  const toastRef = useRef("");
  const featureNft = trpc.featureNft.featureNFT.useMutation();
  const { isLoading, error, isError, isSuccess } = featureNft;
  const { paymentOptions } = featureOption ?? {};
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
      showPromisedToast(toastRef, error?.message || "unexpected error", true, "ERROR");
      console.error(error?.message);
    }

    if (isSuccess) {
      showPromisedToast(toastRef, "NFT Featured", true, "SUCCESS");
      notifyPayment(ProductType.NFT_FEATURE);
    }
  }, [error?.message, isError, isSuccess, notifyPayment]);

  const featureNFT = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    const csrf = await getCsrfToken();
    if (!publicKey || !csrf || !signMessage || !signTransaction || !paymentOption) return;
    try {
      showPromisedToast(toastRef, "Initating Feature: Sign message...", false);
      const signatureMessage = `Do you wish to feature your ${nft.name} NFT! Do you wish to continue?`;

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
        "Featuring NFT: Transaction sent, waiting for confirmation...",
        true
      );

      featureNft.mutate({
        nonce: csrf,
        serializedTx: serializedtx,
        signedMessage: signedMessage,
        stringMessage: stringMessage,
        mint: nft.mint,
        nftType: nft.type?.toString() ?? "",
      });
    } catch (error) {
      showPromisedToast(
        toastRef,
        "Error featuring the NFT, try again or contact support!",
        true,
        "ERROR"
      );
      console.error(error);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center">
      <div className="mt-10 mb-10 w-full ">
        <div className="mx-4 flex flex-wrap items-center justify-between">
          <div className="w-full lg:w-1/2">
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
          <div className="flex flex-wrap items-center lg:w-1/2">
            <div className="mb-5 w-full p-5 sm:p-0">
              <div className="w-full text-center sm:w-auto">
                <p className="titles-color textStroke mb-4 text-2xl">Current Feature Costs:</p>
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
            <div className="mx-auto flex w-full flex-wrap">
              {!isSuccess ? (
                <motion.button
                  className="btn-rude btn mx-auto mb-5"
                  onClick={featureNFT}
                  disabled={isLoading}
                >
                  Feature NFT
                </motion.button>
              ) : (
                <div className="text-stroke mx-auto text-2xl text-yellow-400">NFT Featured!!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureNFT;
