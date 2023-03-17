/// call web 3 part to get NFTs in wallet and staking merged
export const getUserNFTs = async () => {
  await sleep(500);
  return {
    mints: [
      "EbJSj8shr2p1mJ63xBSiztSfm5Fe9DBcHbPgT75uQAQ2",
      "6Y1acNMPb9YNwvp147CaU2zwCU8tcMaA1MEaqvE3fcrB",
      "3nqiw6wo6AVgPgFySFGt2qXrepwge9WyuaYFjQW5Nip8",
      "CrggDKE3gT7zwqWgjwisMiiVzTfUtZkcnUtf5thAyK3v",
      "BTqhvzFPM7TVa3ZKN7u1Qwj6rXShnUMkdU8jJdoDRwWD",
      "4z4wpfbdf2nwn1mr3HFCFri6KSrhzqHghaPYZBAR1Hfc",
      "51Vymw3ppoqDQMVypR4LFmnKHdomzbFaEgpGNWe2vDcN",
      "61kQifZYzYT4HVCXnyJQJzo2FUbTHT6iBJ4F4uqX1qj5",
      "VgK5eh8N34g4xYaaNbSgVx73HaG85oU5e9cC9rSZWfZ",
      "7uyaSx4UgL1Wi5o3SH3CRmXPGz8rab245AQXmpYE7uUj",
      "6dNMfhrpAYNiKMk3uCyVgNxFK5hpVYuyB8MybEQPhLAb",
      "B7ZfA2AKfkRxKggimY4jDsCcJK9bD9HpbeoN7vynRMha",
      "GrYBEppxc1uBGj4mGznptbWxzB8subDavcBUiKnTP5Ks",
      "Gi4L7yzZCrSh7uJQ1EC8YorrshrCfmVkMcSQH9BLGbEU",
      "5sP5DbvNpopLinw86rixLhYuiunHoH6X8G7zeKxUhQgG",
      "EmUEeqLa4QipmBVZ7BpPj8g5rrBuKN8TNppMkCMBnAfV",
      "GVSLs3SGoJhB1UQ6ySZV4vW4Dd6QfLz3dKfYooJQKbt9",
      "FjFo2ESWt2jRmVpbkT1pMPvHtYjpsuyQRm7eETTTc8Za",
      "CDprN11k8GHipxN37ezr9Z4SSjPxJMpi1rnAsRxCnSym",
      "9UYNS82nH69RRHS8a9RzuWDoBy1G6VZGm5g9BzdNMLXH",
    ],
    ids: [
      "523",
      "2741",
      "3905",
      "2869",
      "8191",
      "6130",
      "2685",
      "1133",
      "378",
      "4584",
      "6928",
      "1068",
      "4316",
      "2266",
      "4508",
      "2033",
      "3508",
      "7506",
      "6266",
      "83",
    ],
  };
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
