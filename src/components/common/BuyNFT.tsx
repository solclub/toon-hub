import SVGIcon from "assets/svg/SVGIcon";
import { motion } from "framer-motion";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import React from "react";

interface BuyProperties {
  title: string;
  description: string;
  price: number;
  priceUnit: string;
  previewImage: () => string | StaticImageData;
}

const BuyNFT: React.FC<BuyProperties> = ({
  title,
  description,
  price,
  priceUnit,
  previewImage,
}) => {
  return (
    <div className="flex flex-wrap rounded-xl border border-amber-800 bg-gray-900 py-10 px-7">
      <div className="relative lg:w-2/4">
        <Image
          className="items-center rounded-3xl border-solid bg-gray-600 object-cover"
          src={previewImage()}
          alt={title}
          width={500}
          height={500}
        ></Image>
      </div>
      <div className="mt-3 flex flex-grow flex-col items-center justify-between  pl-5 lg:mt-0 lg:w-2/4 lg:items-stretch">
        <h1 className="text-2xl font-bold ">{title}</h1>
        <p className="text-justify opacity-80 lg:text-left">{description}</p>

        <div className="divider lg:w-2/3"></div>
        <div className="flex text-center font-mono text-primary-focus lg:items-center lg:text-6xl">
          <span className="inline-block text-5xl font-extrabold">{price}</span>
          <span className="mx-3 flex items-center">{<SVGIcon.Sol size={45} />}</span>
        </div>

        <div className="mt-2 flex flex-wrap gap-3 font-sans lg:justify-between">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="btn-secondary btn w-full grow text-xl lg:w-2/5"
          >
            PREVIEW
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="btn-primary btn w-full text-xl  lg:w-2/5 lg:grow"
          >
            BUY NOW
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default BuyNFT;
