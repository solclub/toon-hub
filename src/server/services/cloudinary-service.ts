import type { UploadApiResponse } from "cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { env } from "env/server.mjs";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

type GolemTitle = {
  overlay: {
    font_family: string;
    font_size: string;
    text: string;
    text_align: string;
  };
  width: number;
  color: string;
  y: string;
  x: string;
  crop: string;
};

type NewGolemImage = {
  overlay: string;
  height: string;
  width: string;
  x: string;
  y: string;
};

export const uploadImageBuffer = async (
  imageData: Buffer,
  imageName: string,
  folderName: string
): Promise<string | null> => {
  try {
    console.log("cloudinary folder");
    const result = await uploadStream(imageData, imageName, folderName);
    return result.secure_url;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getUrlFile = (
  colletionName: string,
  upgradeType: string,
  trait: string,
  traitName: string
) => {
  const upgradeTypeName = upgradeType === "CARTOON" ? "toons_art" : upgradeType;
  return `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/collections/${colletionName}/art/${upgradeTypeName}/${trait}/${traitName}.png`;
};

const service = {
  uploadImageBuffer,
  getUrlFile,
};

export default service;

export const generateTwitterPostImage = (golem: string, wallet: string, mint: string) => {
  const golemTitle = getGolemTitle(golem);
  const subtitle = getsubTitle();
  const walletTitle = getWalletTitle(wallet);
  const golemImage = getNewGolemImage(mint);
  const url = cloudinary.url("rudeGolems/tweet/golemupgrade-tweet-base_jsrksd", {
    transformation: [golemTitle, subtitle, walletTitle, golemImage],
  });

  return url;
};

const uploadStream = async (
  buffer: Buffer,
  imageName: string,
  folderName: string
): Promise<UploadApiResponse> =>
  new Promise<UploadApiResponse>((res, rej) => {
    const theTransformStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        public_id: imageName,
        folder: folderName,
        overwrite: false,
      },
      (err, result) => {
        if (err) return rej(err);
        if (!result) return rej("empty response");

        res(result);
      }
    );
    const str = Readable.from(buffer);
    str.pipe(theTransformStream);
  });

const getGolemTitle = (golem: string): GolemTitle => {
  return {
    overlay: {
      font_family: "MedievalSharp",
      font_size: "64",
      text: golem,
      text_align: "center",
    },
    width: 400,
    color: "#ffffff",
    y: "-244",
    x: "-305",
    crop: "fit",
  };
};

type SubTitle = {
  overlay: {
    font_family: string;
    font_size: string;
    font_weight: string;
    text: string;
    text_align: string;
  };
  width: number;
  color: string;
  y: string;
  x: string;
  crop: string;
};

const getsubTitle = (): SubTitle => {
  return {
    overlay: {
      font_family: "Cormorant Garamond",
      font_size: "36",
      font_weight: "600",
      text: "just got butterflied by",
      text_align: "center",
    },
    width: 310,
    color: "#00FFF2",
    y: "-186",
    x: "-305",
    crop: "fit",
  };
};

type WalletTitle = {
  overlay: {
    font_family: string;
    font_size: string;
    font_weight: string;
    text: string;
    text_align: string;
  };
  width: number;
  color: string;
  y: string;
  x: string;
  crop: string;
};

const getWalletTitle = (wallet: string): WalletTitle => {
  return {
    overlay: {
      font_family: "Cormorant Garamond",
      font_size: "48",
      font_weight: "700",
      text: wallet,
      text_align: "center",
    },
    width: 310,
    color: "#FFFFFF",
    y: "-135",
    x: "-305",
    crop: "fit",
  };
};

const getNewGolemImage = (mint: string): NewGolemImage => ({
  overlay: `rudeGolems:golemUpgrades:${mint}`,
  height: "488",
  width: "488",
  x: "266",
  y: "-6",
});
