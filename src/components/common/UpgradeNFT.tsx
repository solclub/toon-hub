import { motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import type { PaymentOption, ProductOption } from "types/catalog";
import PaymentMethodSelector from "./PaymentMethodSelector";
import NftHidden from "assets/images/skin.png";
import Divider from "assets/images/divider.png";
import FrameBox from "./FrameBox";
import type { DemonUpgrades, GolemUpgrades, UserNFT } from "server/database/models/user-nfts.model";
import { showSuccessToast, showErrorToast, showPromisedToast } from "utils/toast-utils";
import { trpc } from "utils/trpc";
import type { RudeNFT } from "server/database/models/nft.model";
import { NFTType } from "server/database/models/nft.model";
import Balance from "components/topbar/Balance";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNFTManager } from "contexts/NFTManagerContext";
import { SigninMessage } from "utils/signin-message";
import { getCsrfToken } from "next-auth/react";
import bs58 from "bs58";
import Loader from "./Loader";

interface BuyProperties {
  title: string;
  upgradeOption: ProductOption;
  sourceImageUrl?: string;
  nft: RudeNFT & {
    upgrades: UserNFT | undefined;
  };
}

const UpgradeNFT: React.FC<BuyProperties> = ({ title, upgradeOption, sourceImageUrl, nft }) => {
  const { publicKey, signMessage, signTransaction } = useWallet();
  const { prepTransaction, setTxState, txState } = useNFTManager();
  const toastRef = useRef("");
  const upgradeMetadata = trpc.upgradeNft.upgradeMetadata.useMutation();
  const { data: upgradeResult, isLoading, error, isError, isSuccess } = upgradeMetadata;
  const { paymentOptions } = upgradeOption;
  const [paymentOption, setpaymentOption] = useState<PaymentOption>();

  const buildImagePreview = trpc.upgradeNft.buildImagePreview.useMutation();
  const {
    data: prevResult,
    status,
    isLoading: isPreviewLoading,
    isSuccess: isSuccessPreview,
  } = buildImagePreview;

  useEffect(() => {
    setTxState("NONE");
    if (paymentOptions) {
      const [paymentOption] = paymentOptions;
      setpaymentOption(paymentOption);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status == "success") {
      showSuccessToast("Success Preview", 1000);
      setTxState("SUCCESS");
    }

    if (status == "error") {
      showErrorToast(error?.message || "unexpected error");
      setTxState("ERROR");
      console.error(error?.message);
    }
  }, [status, setTxState, error?.message]);

  useEffect(() => {
    if (isError) {
      showErrorToast(error?.message || "unexpected error");
      setTxState("ERROR");
      console.error(error?.message);
    }

    if (isSuccess) {
      showSuccessToast("Success Upgrade", 1000);
      setTxState("SUCCESS");
    }
  }, [error?.message, isError, isSuccess, setTxState]);

  const initiatePreview = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    setTxState("BEGIN");
    buildImagePreview.mutate({
      mint: nft.mint,
      upgradeType:
        nft.type == NFTType.GOLEM
          ? (upgradeOption.key as GolemUpgrades)
          : (upgradeOption.key as DemonUpgrades),
    });
  };

  const upgradeGolem = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    setTxState("BEGIN");
    const csrf = await getCsrfToken();
    console.log(!publicKey, !csrf, !signMessage, !signTransaction, !paymentOption);
    if (!publicKey || !csrf || !signMessage || !signTransaction || !paymentOption) return;
    try {
      showPromisedToast(toastRef, "Initating Upgrade: Sign message...", false);
      const signatureMessage = `Do you wish to upgrade your ${nft.name}! This will approve the upgrade of metadata but will not affect the Rarity of the NFT. Do you wish to continue?`;

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

      console.log(serializedtx);

      showPromisedToast(
        toastRef,
        "Upgrading NFT: Transaction sent, waiting for confirmation...",
        true
      );

      upgradeMetadata.mutate({
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

      setTxState("WAITING");
    } catch (error) {
      showErrorToast("Error generating Preview, try again or contact support!");
      setTxState("ERROR");
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
            <div className="mx-auto flex w-full flex-wrap">
              {!(isSuccess || isSuccessPreview) ? (
                <motion.button
                  className="btn-rude btn mx-auto"
                  onClick={initiatePreview}
                  disabled={isPreviewLoading}
                >
                  PREVIEW NFT
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
            <div className="mx-auto flex w-full flex-wrap">
              {!(isSuccess || isSuccessPreview) ? (
                <motion.button
                  className="btn-rude btn mx-auto"
                  onClick={upgradeGolem}
                  disabled={isLoading}
                >
                  UPGRADE NFT
                </motion.button>
              ) : (
                <div className="text-stroke mx-auto text-2xl text-yellow-400">NFT Upgraded!!</div>
              )}
            </div>
          </div>
          <div className="w-full lg:w-2/6">
            <FrameBox className="relative">
              {(isLoading || isPreviewLoading) && (
                <div className="absolute top-1/2 z-50 w-full">
                  <Loader></Loader>
                </div>
              )}
              <Image
                className="panel w-full items-center rounded-3xl"
                src={upgradeResult?.image ?? prevResult ?? NftHidden}
                alt={title}
                width={500}
                height={500}
                unoptimized
                priority
              ></Image>
            </FrameBox>
          </div>
        </div>
      </div>
      {txState != "SUCCESS" && (
        <div className="mb-5 w-1/2 p-5 sm:p-0">
          <div className="w-full text-center sm:w-auto">
            <Balance className="mx-auto mb-2 w-fit"></Balance>
            <p className="titles-color textStroke mb-4 text-2xl">Current Upgrade Costs:</p>
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
      )}

      <div className="z-10 w-full xl:pt-3">
        <div className="text-center"></div>
      </div>
    </div>
  );
};

export default UpgradeNFT;
