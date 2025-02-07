const GolemTiers = {
  TIER_0: 10,
  TIER_1: 110,
  TIER_2: 610,
  TIER_3: 2000,
  TIER_4: 3000,
  TIER_5: 4000,
  TIER_6: 5000,
  TIER_7: 6442,
};

const DemonTiers = {
  TIER_0: 5,
  TIER_1: 105,
  TIER_2: 605,
  TIER_3: 1447,
  TIER_4: 2447,
};

const selectGolemTier = (rank: number): string => {
  if (rank <= GolemTiers.TIER_0) {
    return "0";
  }
  if (rank <= GolemTiers.TIER_1) {
    return "1";
  }
  if (rank <= GolemTiers.TIER_2) {
    return "2";
  }
  if (rank <= GolemTiers.TIER_3) {
    return "3";
  }
  if (rank <= GolemTiers.TIER_4) {
    return "4";
  }
  if (rank <= GolemTiers.TIER_5) {
    return "5";
  }
  if (rank <= GolemTiers.TIER_6) {
    return "6";
  }
  if (rank <= GolemTiers.TIER_7) {
    return "7";
  }
  return "";
};

const selectDemonTier = (rank: number): string => {
  if (rank <= DemonTiers.TIER_0) {
    return "0";
  }
  if (rank <= DemonTiers.TIER_1) {
    return "1";
  }
  if (rank <= DemonTiers.TIER_2) {
    return "2";
  }
  if (rank <= DemonTiers.TIER_3) {
    return "3";
  }
  if (rank <= DemonTiers.TIER_4) {
    return "4";
  }
  return "";
};
const nftTierSelector = (rank: number, collection: string): string => {
  if (collection == "golems") {
    return selectGolemTier(rank);
  }
  if (collection == "demons") {
    return selectDemonTier(rank);
  }
  throw new Error("Invalid collection");
};
export default nftTierSelector;

export const getRudeNftName = (fullName: string | undefined): string | undefined => {
  if (!fullName || !fullName.includes("#")) return fullName;
  return fullName.split("#")[1];
};
