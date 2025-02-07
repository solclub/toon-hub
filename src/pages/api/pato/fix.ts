import type { NextApiRequest, NextApiResponse } from "next";
import rudeNFTModels from "server/database/models/nft.model";
import { getAndUpdatePatoArmor } from "server/services/nfts-service";

const mintkeys = ["8h4hpLhufCSykPPgZpHGbpc9kyxgqH9FzKZQVHMXxYy8"];
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await getAndUpdatePatoArmor(rudeNFTModels.DemonModel(), mintkeys);
  res.status(200).json({ msg: "fixed" });
}
