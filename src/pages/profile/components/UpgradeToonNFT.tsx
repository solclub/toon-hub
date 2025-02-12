import { motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import type { PaymentOption, ProductOption } from "server/database/models/catalog.model";
import { ProductType } from "server/database/models/catalog.model";
import PaymentMethodSelector from "components/common/PaymentMethodSelector";
import DemonToonHidden from "assets/images/demon-toon-reveal.jpeg";
import GolemToonHidden from "assets/images/golem-toon-reveal.jpeg";
import FrameBox from "components/common/FrameBox";
import type { DemonUpgrades, GolemUpgrades } from "server/database/models/nft.model";
import type { UserNFT } from "server/database/models/user-nfts.model";
import { showSuccessToast, showErrorToast, showPromisedToast } from "utils/toast-utils";
import { trpc } from "utils/trpc";
import type { RudeNFT } from "server/database/models/nft.model";
import { NFTType } from "server/database/models/nft.model";
import Balance from "components/topbar/Balance";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useNFTManager } from "contexts/NFTManagerContext";
import { SigninMessage } from "utils/signin-message";
import { getCsrfToken } from "next-auth/react";
import bs58 from "bs58";
import Loader from "components/common/Loader";
import { getMintCost } from "utils/giblatoons";
import { confirmTransactionWithRetry } from "utils/txnRetryLogic";
import { ClippedToonCard, ClippedToonCardContainer } from "components/toon-of-ladder/WinnerCard";
import MainButton from "components/common/MainButton";

interface BuyProperties {
  title: string;
  upgradeOption: ProductOption;
  sourceImageUrl?: string;
  nft: RudeNFT & {
    user: UserNFT | undefined;
  };
}

const UpgradeToonNFT: React.FC<BuyProperties> = ({ title, upgradeOption, sourceImageUrl, nft }) => {
  const { connection } = useConnection();
  const { publicKey, signMessage, signTransaction, wallet } = useWallet();
  const { prepTransaction, notifyPayment } = useNFTManager();
  const toastRef = useRef("");
  const upgradeMetadata = trpc.upgradeNft.upgradeMetadata.useMutation();
  const { data: upgradeResult, isLoading, error, isError, isSuccess } = upgradeMetadata;
  const { paymentOptions } = upgradeOption ?? {};
  const [paymentOption, setpaymentOption] = useState<PaymentOption>();

  const { data } = trpc.nfts.getWalletBalance.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (paymentOptions && paymentOptions[0] && paymentOptions[0].amounts[0]) {
      const overridePayment: PaymentOption = {
        ...paymentOptions[0],
        amounts: [
          {
            ...paymentOptions[0].amounts[0],
            amount: parseFloat(getMintCost(paymentOptions[0].amounts[0].amount).toFixed(3)),
          },
        ],
      };
      setpaymentOption(overridePayment);
    }
  }, [paymentOptions]);

  useEffect(() => {
    if (isLoading) {
      showPromisedToast(toastRef, "Confirming transaction & upgrading your warrior...", true);
    } else {
      if (error && !upgradeResult) {
        showPromisedToast(toastRef, error.message, true, "ERROR");
      } else {
        (async () => {
          console.log("upgradeResult", upgradeResult);
          if (signTransaction && upgradeResult && upgradeResult.crayonTx) {
            console.log("contains crayon txn..");
            showPromisedToast(
              toastRef,
              "Warrior successfully upgraded!, Wow, you found a Crayon, minting your Token...",
              true
            );
            //const signedTx = await signTransaction(upgradeResult.crayonTx);
            const swapTransactionBuf = Buffer.from(upgradeResult.crayonTx, "base64");
            const txid = await connection.sendRawTransaction(swapTransactionBuf, {
              skipPreflight: true,
            });
            console.log("sent tx", txid);
            try {
              await confirmTransactionWithRetry(connection, txid);
              showPromisedToast(toastRef, "You Crayon was minted", true, "SUCCESS");
            } catch (e) { }
          } else {
            showPromisedToast(toastRef, "Warrior successfully upgraded!", true, "SUCCESS");
          }
        })();
      }
    }
  }, [isLoading, error, upgradeResult, connection, signTransaction]);

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
    if (!publicKey || !csrf || !signMessage || !signTransaction || !paymentOption) return;
    const solBalance = data?.get("SOL") || 0;
    if (paymentOption.amounts[0]?.amount && solBalance < paymentOption.amounts[0]?.amount) {
      showErrorToast("Not enough balance");
      return;
    }
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
      showPromisedToast(toastRef, "Error upgrading, try again or contact support!", true, "ERROR");
      console.error(error);
    }
  };

  return (
    <div className="w-full flex flex-col items-center  p-4">
      <div className="mb-10 mt-10 w-full ">
        <div className="mx-4 flex flex-wrap items-center justify-between">
          <div className="w-full lg:w-2/6">
            <ClippedToonCardContainer className="w-full">
              <ClippedToonCard
                bgImageUrl={sourceImageUrl
                  ? sourceImageUrl
                  : nft.type === NFTType.DEMON
                    ? DemonToonHidden
                    : GolemToonHidden
                }
              />
            </ClippedToonCardContainer>
          </div>
          <div className="flex w-full items-center lg:w-2/6">
            <div className="mx-auto my-4 flex justify-center w-full flex-wrap">
              {!isSuccess ? (
                <MainButton
                  color="yellow"
                  className="font-sans font-bold"
                  onClick={upgradeGolem}
                  disabled={isLoading}
                >
                  GET TOONIFIED!
                </MainButton>
              ) : (
                <div className="text-stroke mx-auto text-2xl text-yellow-400">NFT TOONIFIED!!</div>
              )}
            </div>
          </div>
          <div className="w-full lg:w-2/6">
            <ClippedToonCardContainer className="w-full">
              {isLoading && (
                <div className="absolute top-1/2 z-50 w-full">
                  <Loader></Loader>
                </div>
              )}
              <ClippedToonCard
                bgImageUrl={
                  upgradeResult
                    ? upgradeResult.image
                    : nft.type === NFTType.DEMON
                      ? DemonToonHidden
                      : GolemToonHidden
                }
              />
            </ClippedToonCardContainer>
          </div>
        </div>
      </div>
      <div className="mb-5 p-5 sm:p-0 md:w-1/2">
        <div className="w-full text-center sm:w-auto">
          <Balance className="mb-2 w-fit md:mx-auto"></Balance>
          <p className="titles-color textStroke mb-4 text-2xl">Current Toonification Cost:</p>
          {paymentOptions && (
            <PaymentMethodSelector
              paymentOptions={paymentOptions}
              selected={paymentOption}
              onChange={(opt) => {
                setpaymentOption(opt);
              }}
              overridePaymentOption={paymentOption}
            ></PaymentMethodSelector>
          )}
        </div>
      </div>

      <div className="z-10 w-full max-w-max rounded-xl border border-[#ffe75c] p-4 font-sans text-sm">
        <div className="text-center">
          <ul>
            <li>
              The first <span className="text-[#ffe75c]">1111</span> will guarantee you a Crayon Token, each of them useful to reveal a &quot;new character&quot;
            </li>
            <li>
              The price will start at <span className="text-[#ffe75c]">0.01 $SOL</span> reducing every three days by
              <span className="text-[#ffe75c]"> 0.01</span> until it becomes free on day <span className="text-[#ffe75c]">30</span> (only cover trensaction fees)
            </li>
            <li>
              After the first <span className="text-[#ffe75c]">1111</span>, any new toonifications give you a
              <span className="text-[#ffe75c]"> 1/7</span> odd of getting a &quot;new character&quot;
            </li>
            <li>
              After <span className="text-[#ffe75c]">4</span> months since the start, all the remaining unrevealed <span className="text-[#ffe75c]">golems</span> or 
              <span className="text-[#ffe75c]"> demons</span> will be revealed, defeating the opportunity of getting a &quot;new character&quot;
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UpgradeToonNFT;
