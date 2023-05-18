import type { PipelineStage } from "mongoose";
import userModel from "server/database/models/user.model";

export interface Leaderboard {
  name: string;
  rank: number;
  mint: string;
  images: { [key: string]: string };
  twitterImage: string;
  current: string;
  owner: string;
  twitter: string;
  power: number;
  type: string;
}

export const getLeaderboard = async (
  skip: number,
  limit: number,
  type: "GOLEM" | "DEMON" | "ALL"
): Promise<Leaderboard[]> => {
  const pipeline: Array<PipelineStage> = [];

  pipeline.push(
    {
      $lookup: {
        from: "user_nfts",
        localField: "walletId",
        foreignField: "wallet",
        as: "nft",
      },
    },
    {
      $unwind: "$nft",
    },
    {
      $lookup: {
        from: "golems",
        localField: "nft.mint",
        foreignField: "mint",
        as: "golem",
      },
    },
    {
      $unwind: {
        path: "$golem",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "demons",
        localField: "nft.mint",
        foreignField: "mint",
        as: "demon",
      },
    },
    {
      $unwind: {
        path: "$demon",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        name: {
          $cond: {
            if: { $eq: ["$nft.type", "DEMON"] },
            then: "$demon.name",
            else: "$golem.name",
          },
        },
        mint: {
          $cond: {
            if: { $eq: ["$nft.type", "DEMON"] },
            then: "$demon.mint",
            else: "$golem.mint",
          },
        },
        rank: {
          $cond: {
            if: { $eq: ["$nft.type", "DEMON"] },
            then: "$demon.rudeRank",
            else: "$golem.rudeRank",
          },
        },
        images: "$nft.images",
        current: "$nft.current",
        owner: "$nft.wallet",
        twitter: "$twitterDetails.username",
        power: {
          $cond: {
            if: { $eq: ["$nft.type", "DEMON"] },
            then: "$demon.power",
            else: "$golem.power",
          },
        },
        type: "$nft.type",
      },
    }
  );

  if (type != "ALL") {
    pipeline.push({
      $match: {
        type,
      },
    });
  }

  pipeline.push({ $sort: { power: -1, rank: -1 } }, { $skip: skip }, { $limit: limit });

  const result = await userModel().aggregate<Leaderboard>(pipeline);

  return result;
};

export const getWalletLeaderboard = async (skip: number, limit: number): Promise<Leaderboard[]> => {
  const pipeline: Array<PipelineStage> = [];

  pipeline.push(
    {
      $lookup: {
        from: "user_nfts",
        localField: "walletId",
        foreignField: "wallet",
        as: "nfts",
      },
    },
    {
      $unwind: "$nfts",
    },
    {
      $lookup: {
        from: "golems",
        localField: "nfts.mint",
        foreignField: "mint",
        as: "golem",
      },
    },
    {
      $unwind: {
        path: "$golem",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "demons",
        localField: "nfts.mint",
        foreignField: "mint",
        as: "demon",
      },
    },
    {
      $unwind: {
        path: "$demon",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        $or: [
          { "nfts.type": "GOLEM", "golem.power": { $exists: true } },
          { "nfts.type": "DEMON", "demon.power": { $exists: true } },
        ],
      },
    },
    {
      $group: {
        _id: "$nfts.wallet",
        images: { $first: "$nfts.images" },
        current: { $first: "$nfts.current" },
        twitter: { $first: "$twitterDetails.username" },
        twitterImage: { $first: "$twitterDetails.image" },
        power: {
          $sum: {
            $cond: {
              if: { $eq: ["$nfts.type", "DEMON"] },
              then: "$demon.power",
              else: "$golem.power",
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        owner: "$_id",
        images: 1,
        twitterImage: 1,
        current: 1,
        twitter: 1,
        power: 1,
      },
    }
  );

  pipeline.push({ $sort: { power: -1 } }, { $skip: skip }, { $limit: limit });

  const result = await userModel().aggregate<Leaderboard>(pipeline);

  return result;
};

export const getItemPosition = async (mint: string): Promise<number> => {
  const leaderboard = await getLeaderboard(0, 8888, "ALL");

  const itemIndex = leaderboard.findIndex((item) => item.mint === mint);

  if (itemIndex === -1) {
    throw new Error(`Item with mint ${mint} not found in leaderboard`);
  }

  const itemPosition = itemIndex + 1;

  return itemPosition;
};

const service = { getLeaderboard, getWalletLeaderboard, getItemPosition };
export default service;
