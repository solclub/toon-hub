import { motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { PaymentOption, ProductOption, ProductType } from "types/catalog";
import PaymentMethodSelector from "components/common/PaymentMethodSelector";
import NftHidden from "assets/images/skin.png";
import FrameBox from "components/common/FrameBox";
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
import Loader from "components/common/Loader";

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
  const { prepTransaction, notifyPayment } = useNFTManager();
  const toastRef = useRef("");
  const upgradeMetadata = trpc.upgradeNft.upgradeMetadata.useMutation();
  const { data: upgradeResult, isLoading, error, isError, isSuccess } = upgradeMetadata;
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
      showSuccessToast("Success Upgrade", 1000);
      notifyPayment(ProductType.NFT_UPGRADE);
    }
  }, [error?.message, isError, isSuccess, notifyPayment]);

  const upgradeGolem = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
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
            <div className="mx-auto flex w-full flex-wrap">
              {!isSuccess ? (
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
              {isLoading && (
                <div className="absolute top-1/2 z-50 w-full">
                  <Loader></Loader>
                </div>
              )}
              <Image
                className="panel w-full items-center rounded-3xl"
                src={upgradeResult ?? NftHidden}
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

      <div className="z-10 w-full xl:pt-3">
        <div className="text-center"></div>
      </div>
    </div>
  );
};

export default UpgradeNFT;
