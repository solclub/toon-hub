import { motion } from "framer-motion";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import React from "react";
import type { ProductOption } from "types/catalog";
import PaymentMethodSelector from "./PaymentMethodSelector";
import Loader from "./Loader";

interface BuyProperties {
  title: string;
  description: string;
  upgradeOption: ProductOption;
  previewImage: () => string | StaticImageData;
}

const BuyNFT: React.FC<BuyProperties> = ({ title, description, upgradeOption, previewImage }) => {
  const { key, name, paymentOptions } = upgradeOption;

  return (
    <div className="panel flex flex-wrap rounded-xl py-3 px-3">
      {!paymentOptions && <Loader />}
      {paymentOptions && (
        <>
          <div className="relative mx-auto lg:w-2/4">
            <Image
              className="w-full items-center rounded-3xl border-solid bg-gray-600"
              src={previewImage()}
              alt={title}
            ></Image>
          </div>
          <div className="mt-3 flex flex-col pl-5 lg:mt-0 lg:w-2/4 lg:items-stretch">
            <h1 className="text-2xl font-bold ">{title}</h1>
            <p className="text-justify opacity-80 lg:text-left">{description}</p>

            <div className="py-5 lg:w-2/3"></div>
            <p className="pb-5 text-justify font-inknut-antiqua text-amber-600 lg:text-left">
              Current Golem Upgrade Costs:
            </p>
            <PaymentMethodSelector
              paymentOptions={paymentOptions}
              onChange={(opt) => {
                console.log(JSON.stringify(opt));
              }}
            ></PaymentMethodSelector>
            <div className="mt-2 flex flex-wrap gap-3 font-sans lg:mt-5 lg:justify-evenly lg:gap-0">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="btn-rude btn w-full bg-opacity-25 lg:w-1/3"
              >
                PREVIEW
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="btn-rude btn w-full lg:w-1/3"
              >
                UPGRADE NFT
              </motion.button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BuyNFT;
