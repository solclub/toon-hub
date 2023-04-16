import paymentService from "./payment-service";
import type { FeaturedNFT } from "server/database/models/featured-nft.model";
import featuredModel from "server/database/models/featured-nft.model";

export interface FeatureNFTRequest {
  mintAddress: string;
  wallet: string;
  serializedTx: string;
}

export const confirmAndSave = async (req: FeatureNFTRequest) => {
  const result = paymentService.proccessPayment<FeaturedNFT>(
    {
      mint: req.mintAddress,
      serializedTx: req.serializedTx,
      wallet: req.wallet,
    },
    async () => {
      return await saveFeaturedNFT(req);
    }
  );

  return result;
};

export const saveFeaturedNFT = async (req: FeatureNFTRequest) => {
  const featured = await featuredModel().create({
    lastFeatured: new Date(),
    mint: req.mintAddress,
    wallet: req.wallet,
  });
  return featured;
};

const service = { confirmAndSave, saveFeaturedNFT };
export default service;
