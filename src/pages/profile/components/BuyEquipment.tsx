import WeaponChest from "assets/weapons/weapon-chest.png";
import classNames from "classnames";
import FrameBox from "components/common/FrameBox";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import type { WeaponRarity } from "server/database/models/weapon.model";

import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import CountdownTimer from "components/common/CountdownTimer";
import { Modal } from "components/common/Modal";
import PaymentMethodSelector from "components/common/PaymentMethodSelector";
import { useNFTManager } from "contexts/NFTManagerContext";
import { motion } from "framer-motion";
import { getCsrfToken } from "next-auth/react";
import { title } from "process";
import {
  ProductType,
  type PaymentOption,
  type ProductOption,
} from "server/database/models/catalog.model";
import type { ItemMetadata } from "server/database/models/equipped-weapon.model";
import type { RudeNFT } from "server/database/models/nft.model";
import type { UserNFT } from "server/database/models/user-nfts.model";
import { SigninMessage } from "utils/signin-message";
import { showPromisedToast } from "utils/toast-utils";
import { trpc } from "utils/trpc";

type NFTInfo = RudeNFT & {
  user: UserNFT | undefined;
};

type Props = {
  weaponMetadata: ItemMetadata | undefined;
  className?: string;
  width?: number;
  height?: number;
  profileView?: boolean;
  price?: string;
  product: ProductOption | undefined;
  nft: NFTInfo;
  revealed: boolean;
  updatedAt: Date | undefined;
};

const RarityColors: Record<WeaponRarity, string> = {
  NONE: "drop-shadow-none rounded-2xl border border-none border-[3px]",
  COMMON: "drop-shadow-common rounded-2xl border border-common border-[3px]",
  RARE: "drop-shadow-rare rounded-2xl border border-rare border-[3px]",
  EPIC: "drop-shadow-epic rounded-2xl border border-common border-[3px]",
  LEGENDARY: "drop-shadow-legendary rounded-2xl border border-legendary border-[3px]",
  MYTHIC: "drop-shadow-mythic rounded-2xl border border-mythic border-[3px]",
  SECRET: "drop-shadow-secret rounded-2xl border border-secret border-[3px]",
};

const TextRarityColors: Record<WeaponRarity, string> = {
  NONE: "text-none",
  COMMON: "text-common",
  RARE: "text-rare",
  EPIC: "text-epic",
  LEGENDARY: "text-legendary",
  MYTHIC: "text-mythic",
  SECRET: "text-secret",
};

export const EquipmentRarityLabels: Record<WeaponRarity, string> = {
  NONE: "None",
  COMMON: "Common",
  RARE: "Rare",
  EPIC: "Epic",
  LEGENDARY: "Legendary",
  MYTHIC: "Mythic",
  SECRET: "Secret",
};

const defaultRollTimes = [1, 86400, 172800, 43200];

const BuyEquipment = (equipment: Props) => {
  const { className, height, price, product, nft, weaponMetadata, revealed, updatedAt } = equipment;
  const { data: rollDays } = trpc.weapons.getSlotRollTimes.useQuery({});
  const { publicKey, signMessage, signTransaction } = useWallet();
  const { prepTransaction, notifyPayment } = useNFTManager();
  const toastRef = useRef("");
  const buyWeaponMutation = trpc.weapons.buyWeapon.useMutation();
  const { isLoading, error, isError, isSuccess, data } = buyWeaponMutation;

  const [paymentOption, setpaymentOption] = useState<PaymentOption>();
  const [isWeaponModalOpen, setWeaponModalOpen] = useState(false);
  const [targetRollDate, setTargetRollDate] = useState<Date | undefined>(undefined);
  const { paymentOptions } = product || {};

  useEffect(() => {
    if (paymentOptions) {
      const [paymentOption] = paymentOptions;
      setpaymentOption(paymentOption);
    }
    if (updatedAt) {
      const slotDays = (rollDays || defaultRollTimes)[(weaponMetadata?.slotNumber ?? 0) - 1] ?? 0;
      const targetDate = new Date(updatedAt.getTime() + slotDays * 1000);
      setTargetRollDate(targetDate);
    } else {
      setTargetRollDate(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedAt, paymentOptions]);

  useEffect(() => {
    if (isError) {
      showPromisedToast(toastRef, error?.message || "unexpected error", true, "ERROR");
      console.error(error?.message);
    }

    if (isSuccess) {
      showPromisedToast(toastRef, "Warrior Equipment updated", true, "SUCCESS");
      setWeaponModalOpen(false);
      notifyPayment(ProductType.WEAPON_SLOT, data?.image);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error?.message, isError, isSuccess]);

  const buyWeapon = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    console.log("started trans");
    const csrf = await getCsrfToken();
    if (!publicKey || !csrf || !signMessage || !signTransaction || !paymentOption) return;
    try {
      showPromisedToast(toastRef, "Initating Roll Weapon: Sign message...", false);
      const signatureMessage = `Do you wish to buy a weapon for your warrior? Do you wish to continue?`;

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

      buyWeaponMutation.mutate({
        nonce: csrf,
        serializedTx: serializedtx,
        signedMessage: signedMessage,
        stringMessage: stringMessage,
        mint: nft.mint,
        nftType: nft.type?.toString() ?? "",
        slot: weaponMetadata?.slotNumber ?? -1,
      });
    } catch (error) {
      showPromisedToast(
        toastRef,
        "Error buying the weapon, try again or contact support!",
        true,
        "ERROR"
      );
      console.error(error);
    }
  };

  return (
    <div
      className={classNames(RarityColors[weaponMetadata?.rarity ?? "NONE"], className, "w-full")}
    >
      <div className={classNames("card card-compact bg-base-100 font-medieval-sharp shadow-xl")}>
        <figure>
          <Image
            src={weaponMetadata?.image || WeaponChest}
            alt="weapon equiped"
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "100%", height: "auto" }}
          ></Image>
        </figure>
        <div className="card-body">
          <h3 className="card-title w-full overflow-hidden overflow-ellipsis whitespace-nowrap">
            <span className="inline-block w-full animate-scrollText">{weaponMetadata?.name}</span>
          </h3>

          {revealed && (
            <>
              <span>
                {"Power: "}
                {(weaponMetadata?.computedPowerValue??0) > 0 ? weaponMetadata?.computedPowerValue?.toFixed(2):
                `x ${weaponMetadata?.powerValue}`
                }
                
              </span>
              <span
                className={classNames(
                  TextRarityColors[weaponMetadata?.rarity ?? "NONE"],
                  "text-base font-bold"
                )}
              >
                {EquipmentRarityLabels[weaponMetadata?.rarity ?? "NONE"]}
              </span>
            </>
          )}

          <div className="card-actions w-full">
            {targetRollDate && targetRollDate > new Date() && (
              <>
                <div className="w-full text-xs text-accent ">Next Roll</div>
                <motion.button className="btn-success btn-md btn mx-0 w-full px-0">
                  <CountdownTimer targetDate={targetRollDate || new Date()}></CountdownTimer>
                </motion.button>
              </>
            )}
            {(!revealed || (updatedAt && targetRollDate && targetRollDate <= new Date())) &&
              nft?.user?.wallet == publicKey?.toBase58() && (
                <>
                  <motion.button
                    onClick={() => {
                      setWeaponModalOpen(!isWeaponModalOpen);
                    }}
                    className="btn-rude btn w-full"
                  >
                    Roll Now 🎲
                  </motion.button>
                  <div className={classNames("absolute top-4 left-0 mx-auto w-full", 
                      {"text-green-400":!revealed}, 
                      {"hidden":revealed} )
                  }>{price}</div>
                </>
              )}
          </div>
        </div>
      </div>

      <label
        htmlFor={weaponMetadata?.name}
        className="absolute top-0 left-0 z-50 block w-full cursor-pointer"
        style={{ height: height || 100 }}
      ></label>
      {/* </FrameBox> */}

      <Modal
        className={classNames({ "lg:w-full": true })}
        isOpen={isWeaponModalOpen}
        backdropDismiss={true}
        handleClose={() => setWeaponModalOpen(false)}
      >
        <div className="flex flex-wrap items-center justify-center">
          <div className="mt-10 mb-10 w-full ">
            <div className="mx-4 flex flex-wrap items-center justify-between">
              <div className="w-full lg:w-1/2">
                <FrameBox className="w-full">
                  <Image
                    className="w-full rounded-3xl"
                    src={weaponMetadata?.image ?? WeaponChest}
                    alt={title}
                    width={800}
                    height={800}
                  ></Image>
                </FrameBox>
              </div>
              <div className="flex flex-wrap items-center lg:w-1/2">
                <div className="mb-5 w-full p-5 sm:p-0">
                  <div className="w-full text-center sm:w-auto">
                    <p className="titles-color textStroke mb-4 text-2xl">Current Slot Price:</p>
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
                  <motion.button
                    className="btn-rude btn mx-auto mb-5"
                    onClick={buyWeapon}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Buy Weapon"}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default BuyEquipment;
