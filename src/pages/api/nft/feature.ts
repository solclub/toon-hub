import type { NextApiRequest, NextApiResponse } from "next";
import { getRandomFeaturedNFT } from "server/services/feature-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const featured = await getRandomFeaturedNFT();
  res.status(200).json(featured);
}
