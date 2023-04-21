import paymentService from "./payment-service";
import type { FeaturedNFT } from "server/database/models/featured-nft.model";
import featuredModel from "server/database/models/featured-nft.model";

export interface FeatureNFTRequest {
  mintAddress: string;
  wallet: string;
  serializedTx: string;
  nftType: string;
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
    createdAt: new Date(),
    mint: req.mintAddress,
    wallet: req.wallet,
    nftType: req.nftType,
    featured: false,
  });
  return featured;
};

export const getRandomFeaturedNFT = async (): Promise<FeaturedNFT | null> => {
  try {
    const featuredNFTs = await featuredModel().find({ featured: false });

    if (!featuredNFTs) return null;

    // Calculate the weight of each record based on its age
    const now = Date.now();
    const weightedNFTs = featuredNFTs.map((nft) => {
      const age = now - nft.createdAt.getTime();
      const weight = Math.exp(-age / (24 * 60 * 60 * 1000)); // exponential function
      return { nft, weight };
    });

    // Create a probability distribution based on the weights
    const totalWeight = weightedNFTs.reduce((acc, { weight }) => acc + weight, 0);
    const probabilities = weightedNFTs.map(({ weight }) => weight / totalWeight);

    // Generate a random number within the probability distribution and select the corresponding record
    const randomWeight = Math.random();
    let weightSum = 0;
    for (let i = 0; i < probabilities.length; i++) {
      weightSum += probabilities[i] ?? 0;
      if (randomWeight <= weightSum) {
        const selectedNFT = weightedNFTs[i]?.nft;

        if (!selectedNFT) continue;
        selectedNFT.featured = true;
        selectedNFT.featuredDate = new Date();
        await selectedNFT.save();

        return selectedNFT;
      }
    }
  } catch (error) {
    console.error(error);
  }
  return null;
};

export const getLastFeaturedNFT = async (): Promise<FeaturedNFT | null> => {
  try {
    const featuredNFT = await featuredModel()
      .findOne({ featured: true })
      .sort({ featuredDate: -1 });
    return featuredNFT;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const service = { confirmAndSave, saveFeaturedNFT, getRandomFeaturedNFT, getLastFeaturedNFT };
export default service;
