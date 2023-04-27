import mongoose from "mongoose";
import rudeNFTModels from "../server/database/models/nft.model";

type Tier = {
  supply: number;
  power: number;
};

const golemTiers: Tier[] = [
  { supply: 10, power: 207 },
  { supply: 100, power: 66 },
  { supply: 500, power: 56 },
  { supply: 1390, power: 21 },
  { supply: 1000, power: 18 },
  { supply: 1000, power: 17 },
  { supply: 1000, power: 16 },
  { supply: 1441, power: 16 },
];

const demonTiers: Tier[] = [
  { supply: 5, power: 400 },
  { supply: 100, power: 60 },
  { supply: 500, power: 50 },
  { supply: 842, power: 49 },
  { supply: 1000, power: 30 },
];

const updateGolems = async () => {
  const golems = await rudeNFTModels.GolemModel().find().lean().exec();
  const bulkOps = golems.map((golem) => {
    const tier = golemTiers.find(
      (t, i) => golem.rudeRank <= t.supply || i === golemTiers.length - 1
    );
    if (!tier) throw "no tier";
    const tierIndex = golemTiers.indexOf(tier);
    const power = tier.power;

    return {
      updateOne: {
        filter: { _id: golem._id },
        update: { $set: { tier: tierIndex, power } },
      },
    };
  });
  const result = await rudeNFTModels.GolemModel().bulkWrite(bulkOps);
  console.log(`Updated ${result.modifiedCount} Golem documents.`);
};

const updateDemons = async () => {
  const demons = await rudeNFTModels.DemonModel().find().lean().exec();
  const bulkOps = demons.map((demon) => {
    const tier = demonTiers.find(
      (t, i) => demon.rudeRank <= t.supply || i === demonTiers.length - 1
    );

    if (!tier) throw "no tier";

    const tierIndex = demonTiers.indexOf(tier);
    const power = tier.power;

    return {
      updateOne: {
        filter: { _id: demon._id },
        update: { $set: { tier: tierIndex, power } },
      },
    };
  });
  const result = await rudeNFTModels.DemonModel().bulkWrite(bulkOps);
  console.log(`Updated ${result.modifiedCount} Demon documents.`);
};

const updateAllNFTs = async () => {
  try {
    await updateGolems();
    await updateDemons();
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
};

mongoose
  .connect("", {
    dbName: "",
  })
  .catch((err) => {
    console.error(err);
  });

mongoose.connection.once("open", async () => {
  console.log("Connected to database.");

  await updateAllNFTs();
});
