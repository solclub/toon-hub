import { useState, useEffect, useCallback } from "react";
import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import twitterBg from "../assets/images/twiter_banner.png";
import warimage from "../assets/images/war_banner.png";
import rankImage from "../assets/images/rarity_banner.png";
import nftToysImage from "../assets/images/nfttoys_banner.png";
import rewardsImage from "../assets/images/rewards_banner.png";
import Equipment from "../components/common/Equipment";
import classNames from "classnames";
import phrases from "./sample-data/phrases.json";
import ImgTwitterBlue from "../assets/images/twitter_blue.png";
import ImgPowerRating from "../assets/images/power_rating_icon.png";
import NftHidden from "assets/images/skin.png";

import ImgSolScan from "../assets/images/solscan.png";
import Panel from "../components/common/Panel";
import { trpc } from "utils/trpc";
import Loader from "components/common/Loader";

const Home: NextPage = () => {
  const featured = trpc.featureNft.latest.useQuery();

  const [twitPhrase, setTwitPhrasePhrase] = useState("My Golem is me and I am my Golem");
  useEffect(() => {
    const currentDate: Date = new Date();
    const dayOfYear: number = Math.floor(
      (currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    setTwitPhrasePhrase(`\"${phrases[dayOfYear % phrases.length]}\"`);
  }, []);

  const featuredNFT = featured.data;

  // const equipment = [
  //   {
  //     id: "1",
  //     url: EmptyWeaponImage,
  //     rarity: "NONE",
  //   },
  //   {
  //     id: "2",
  //     rarity: "NONE",
  //     url: EmptyWeaponImage,
  //   },
  //   {
  //     id: "3",
  //     url: EmptyWeaponImage,
  //     rarity: "NONE",
  //   },
  //   {
  //     url: EmptyWeaponImage,
  //     id: "4",
  //     rarity: "NONE",
  //   },
  // ];

  return (
    <div className="relative mb-8">
      <div className="flex flex-wrap lg:pb-3 lg:pt-5">
        <div className="mx-auto h-[100px] lg:w-6/12">
          <div className="relative grid h-full w-full items-start  justify-center">
            <div className="z-20 mt-2 h-fit w-full">
              <Image className="mx-auto " src={ImgTwitterBlue} alt="twit icon" />
            </div>
            <Image
              className="absolute top-0 left-0 hidden lg:block"
              src={twitterBg}
              alt="Twit Phrase"
              height={100}
              width={800}
            ></Image>
            <Link
              className="z-20 row-span-3 w-full text-center"
              href={
                "https://twitter.com/intent/tweet?text=" +
                (twitPhrase ?? "My Golem is me and I am my Golem").replaceAll('"', "") +
                "%0a@rudegolems %23rudequote"
              }
              target="_blank"
            >
              <span className="text-sm italic leading-none text-white hover:underline">
                {twitPhrase ?? "My Golem is me and I am my Golem"}
              </span>
              <span className="block text-xs text-[#ba6556]">Click here to tweet</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-7 flex flex-wrap align-middle">
        <div className="w-full lg:w-[60%]">
          <Panel className="panel flex flex-wrap rounded-md ">
            <div className="overflow-hidde w-full p-3 lg:w-[63%]">
              <div className=" relative h-[500px] w-full">
                <Image
                  className="absolute max-h-[500px] rounded-2xl object-cover"
                  src={featuredNFT?.nft?.images?.get(featuredNFT?.nft?.current) ?? NftHidden}
                  alt="Picture of the author"
                  fill
                />
                <div className="absolute bottom-0 h-[60%] w-full rounded-xl bg-gradient-to-t from-black to-transparent"></div>
                <div className="absolute bottom-10 left-10  h-[60%] w-[50%] ">
                  <div className="absolute bottom-0">
                    <div className=" text-2xl font-bold">{featuredNFT?.nft?.name || ""}</div>
                    <div className="mt-2 text-xl font-normal">
                      <Image
                        className="inline"
                        src={ImgTwitterBlue}
                        alt="Twitter Image"
                        width={15}
                        height={15}
                      />
                      {(
                        <Link
                          className="ml-2"
                          href={
                            "https://twitter.com/" +
                            featuredNFT?.user?.twitterDetails?.username.replace("@", "")
                          }
                          target="_blank"
                        >
                          {featuredNFT?.user?.twitterDetails?.username
                            .replace("@", "")
                            .toLowerCase() ?? "Unknow"}
                        </Link>
                      ) || "Unknow"}
                    </div>
                    <div className="mt-2 overflow-hidden overflow-ellipsis text-xs font-thin">
                      <Image
                        className="inline"
                        src={ImgSolScan}
                        alt="Twitter Image"
                        width={15}
                        height={15}
                      />
                      <span className="ml-2 inline-block w-20">
                        <Link
                          className="ml-2"
                          href={`https://solscan.io/token/${featuredNFT?.nft?.mint}`}
                          target="_blank"
                        >
                          {"..." + (featuredNFT?.user?.walletId?.substring(5, 15) || "") + "..."}
                        </Link>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="absolute right-1 top-1">
                  <div className="dropdown">
                    <label tabIndex={0} className="m-1 cursor-pointer">
                      <svg
                        className="inline-block h-6 align-middle"
                        id="info-circle"
                        data-name="Layer 1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="#3A3DAB"
                          d="M12,2A10,10,0,1,0,22,12,10.01114,10.01114,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8.00917,8.00917,0,0,1,12,20Zm0-8.5a1,1,0,0,0-1,1v3a1,1,0,0,0,2,0v-3A1,1,0,0,0,12,11.5Zm0-4a1.25,1.25,0,1,0,1.25,1.25A1.25,1.25,0,0,0,12,7.5Z"
                        ></path>
                      </svg>
                    </label>
                    <div
                      tabIndex={0}
                      className="card dropdown-content card-compact w-72 bg-black bg-opacity-30 backdrop-blur-sm backdrop-filter"
                    >
                      <div className="card-body">
                        <h3 className="card-title">Want to Feature your NFT?</h3>
                        <p>
                          Make your NFT shine on your NFT profile. Log in and feature your
                          masterpiece now!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-wrap items-center pb-8 align-middle lg:w-[35%]">
              <div className="flex w-full flex-wrap items-center justify-center gap-6">
                <div className="w-full pb-3 text-center text-2xl text-slate-200">Equipment</div>
                {featuredNFT?.slots?.map((x, i) => {
                  if (x) {
                    return (
                      <Equipment
                        className=""
                        key={x?.slotNumber}
                        url={x?.image}
                        rarity={x?.rarity}
                        name={x?.name}
                      ></Equipment>
                    );
                  } else {
                    return (
                      <Equipment className="" key={i} rarity={"NONE"} name={"EMPTY"}></Equipment>
                    );
                  }
                })}
              </div>
            </div>
          </Panel>
          <LinksItems className="hidden lg:flex"></LinksItems>
        </div>
        <LeaderBoard></LeaderBoard>
        <LinksItems className="flex lg:hidden"></LinksItems>
      </div>
    </div>
  );
};

const LeaderBoard = () => {
  const queryLimit = 10;
  const [nftTypeTab, setNftTypeTab] = useState<"GOLEM" | "DEMON" | "ALL" | "WALLET">("GOLEM");
  const { data, fetchNextPage, isLoading } = trpc.leaderboard.get.useInfiniteQuery(
    {
      limit: queryLimit,
      nftType: nftTypeTab,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const [tabActive, setTabActive] = useState(0);
  const [page, setPage] = useState<{ [key: string]: number }>({
    GOLEM: 0,
    DEMON: 0,
    ALL: 0,
    WALLET: 0,
  });

  const handleFetchNextPage = useCallback(() => {
    setPage((prev) => {
      const nftTypeTabPrev = prev[nftTypeTab] ?? 0;
      return { ...prev, [nftTypeTab]: nftTypeTabPrev + 1 };
    });
    fetchNextPage();
  }, [fetchNextPage, nftTypeTab]);

  const handleFetchPreviousPage = useCallback(() => {
    setPage((prev) => {
      const nftTypeTabPrev = prev[nftTypeTab] ?? 0;
      const newPage = Math.max(nftTypeTabPrev - 1, 0);
      return { ...prev, [nftTypeTab]: newPage };
    });
  }, [nftTypeTab]);

  const changeTab = (id: number) => {
    setTabActive(id);
    if (id === 0) setNftTypeTab("GOLEM");
    if (id === 1) setNftTypeTab("DEMON");
    if (id === 2) setNftTypeTab("ALL");
    if (id === 3) setNftTypeTab("WALLET");
  };

  return (
    <Panel className="panel ml-0 mt-3 flex w-full flex-col flex-wrap rounded-md align-top lg:mt-0 lg:ml-3 lg:w-[35%]">
      <div className="tabs mx-auto mt-3 h-fit w-10/12 justify-center self-start p-3">
        {["Golems", "Demons", "All", "By Wallet"].map((tab, index) => (
          <a
            key={index}
            onClick={() => {
              changeTab(index);
            }}
            className={classNames("tab tab-bordered", {
              "tab-active": tabActive === index,
            })}
          >
            {tab}
          </a>
        ))}
      </div>
      <div className="mr-2 flex h-fit max-h-[600px] w-full flex-wrap items-start justify-start self-start overflow-y-scroll">
        {isLoading && <Loader></Loader>}
        {data?.pages?.[page[nftTypeTab] ?? 0]?.items.map(
          ({ mint, images, name, power, twitter, current, owner, twitterImage }, i) => {
            const index = i + (page[nftTypeTab] ?? 0) * queryLimit;
            const borderColors = [
              "border-amber-500",
              "border-amber-600",
              "border-amber-900",
              "border-slate-500",
            ];
            const borderColor =
              borderColors[index < borderColors.length ? index : borderColors.length - 1];
            const hasSvg = index <= 2;
            const rank = index + 1;
            const twitterImageBig = twitterImage?.replace("_normal", "_bigger");
            return (
              <Panel
                key={`${nftTypeTab}_${mint ?? ""}_${owner ?? ""}`}
                index={i}
                className={classNames(
                  "m-1 mx-4 flex h-24 w-full flex-wrap items-center overflow-hidden rounded-xl border-2 p-2",
                  borderColor
                )}
              >
                <div className="relative mr-3 aspect-square w-20 overflow-hidden rounded-2xl">
                  <Image alt="profile image" src={twitterImageBig ?? images[current] ?? ""} fill />
                  <div className="absolute -bottom-3 -left-3 aspect-square h-12 rounded-full bg-[rgba(0,0,0,.7)] bg-black text-right text-white"></div>
                  {hasSvg ? (
                    <svg
                      className="absolute left-1 bottom-1"
                      height={25}
                      width={25}
                      viewBox="0 0 100 100"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_1376_12029)">
                        <path
                          d="M95.7 77.4004C94.2 75.7004 92.7 73.9004 91.2 72.1004C90.4 71.2004 89.3 68.8004 88.2 68.6004C87.8 68.6004 87.3 68.6004 87 68.3004C85.6 66.8004 84.5 64.5004 83.1 62.8004C81.4 60.8004 79.6 58.8004 77.9 56.8004C77.7001 56.6004 76.6 55.1004 75.4 53.7004C75.5 53.7004 75.7001 53.6004 75.8 53.5004C78.5 52.2004 81.2001 50.8004 83.8 49.5004C84 49.5004 83.8 47.4004 83.8 47.2004C83.8 45.7004 84.3 43.2004 83.4 42.0004C83.1 41.6004 82.9 41.1004 83.2 40.8004C83.3 40.7004 83.5 40.6004 83.6 40.5004C84 40.3004 84 39.7004 83.9 39.3004C83.8 38.9004 83.6 38.5004 83.4 38.1004C83.1 37.1004 83.6 36.2004 83.7 35.3004C83.9 34.1004 83.7 32.8004 83.7 31.5004V17.1004C77.8 14.2004 71.9 11.2004 65.9 8.40036C65.7001 8.40036 65.4 8.20036 65.3 8.00036C65.3 7.90036 65.2 7.70036 65.1 7.50036C65 7.30036 64.7001 7.20036 64.4 7.10036C61 6.10036 57.8 4.20036 54.6 2.60036C54.1 2.30036 50.4001 0.000357807 49.9001 0.300358C48.5 1.00036 47 1.70036 45.6 2.50036C44.6 3.00036 43.3001 3.30036 42.4001 3.80036C42.2001 3.90036 42.1001 4.10036 41.9001 4.20036C41.7001 4.30036 41.5 4.40036 41.3 4.50036C40.2001 5.00036 39.1 5.80036 38.3 6.80036C38.3 6.80036 38.1 7.00036 38 7.00036C37.7001 7.10036 37.4 6.90036 37.1 6.80036C36.6 6.60036 36 6.90036 35.6 7.30036C34.1 8.50036 32 9.20036 30.2001 10.1004C26 12.2004 21.5 14.2004 17.5 16.4004C14.6 18.0004 16.1 24.2004 16.1 27.1004V49.5004C16.1 50.1004 23 52.9004 23.6 53.2004C23.8001 53.2004 24 53.4004 24.2001 53.5004C21.7001 56.4004 18.3 60.8004 18 61.4004C18 61.7004 17.8001 61.9004 17.7001 62.2004C17.5 62.5004 17.1 62.6004 16.9 62.7004C15 63.6004 13.6 66.0004 12.4 67.7004C10.6 70.0004 8.60005 72.2004 6.70005 74.4004L-0.199951 82.4004C0.200049 81.9004 3.10005 81.9004 3.70005 81.8004C6.20005 81.4004 9.80005 81.6004 12.1 80.5004C12.7 80.2004 13.4 80.1004 13.8 80.6004C14 80.8004 14 81.2004 14.2 81.4004C14.5 81.6004 14.9 81.6004 15.2 81.4004C15.5 81.2004 15.7001 81.0004 16.1 80.8004C16.6 80.6004 17.1 80.8004 17.7001 80.7004C18.2001 80.7004 23.5 77.8004 24 78.8004C24.8 80.8004 25.8001 82.7004 26.6 84.7004C27.4 86.7004 27.6 88.8004 28.3 90.9004C28.8 92.5004 30 93.8004 30.6 95.4004C30.8001 96.0004 32.2001 98.4004 32 99.0004C33.6 93.8004 35.8 88.6004 35.8 83.3004C35.8 83.0004 35.8 82.7004 36 82.5004C36.2001 82.4004 36.4 82.3004 36.6 82.2004C36.9 82.0004 37 81.7004 37.2001 81.4004C39.7001 75.4004 41.3 68.8004 43.1 62.4004C43.8 62.7004 44.5 63.5004 45.2001 63.8004C46.1001 64.3004 47 64.7004 47.9001 65.2004C48.7001 65.6004 49.4001 65.9004 50.2001 66.3004C50.5 66.5004 52.9001 65.0004 53.2001 64.8004C54.6001 64.1004 55.9001 63.5004 57.2001 62.9004C57.6001 64.3004 58 65.5004 58.1 65.7004C58.7 67.5004 59.2001 69.4004 59.9001 71.1004C60.6001 72.9004 60.7001 74.8004 61.3 76.7004C63.9 84.0004 65.9 91.5004 68.2 98.9004C67.9 98.0004 69.8 95.0004 70.1 94.2004C71.2 91.5004 72.6 89.1004 72.6 86.2004C72.6 85.3004 73 84.3004 73.8 84.1004C74 84.1004 74.2001 84.1004 74.4 83.9004C75.4 83.1004 75.8 80.0004 76.3 78.7004C76.3 78.5004 86.5 79.9004 87.2 80.2004C87.4 80.2004 87.6001 80.4004 87.8 80.4004C88.1001 80.4004 88.4 80.3004 88.7 80.2004C89.6 80.2004 91.3 80.9004 92.3 81.0004C93.7001 81.2004 95.1 81.4004 96.5 81.6004C97.1 81.6004 99.9 81.6004 100.3 82.2004C98.9 80.5004 97.4 78.9004 96 77.2004L95.7 77.4004ZM31.5 86.8004L27.7001 77.3004L26.5 74.4004L23.4 74.9004L10 76.9004L28 56.0004L39.1 61.3004L31.4 86.9004L31.5 86.8004ZM51.3 60.1004L51 60.3004C50.9001 60.3004 50.6 60.5004 50.3 60.7004L47.7001 59.4004C47.7001 59.4004 47.6 59.3004 47.5 59.2004C46.8 58.6004 45.7001 57.8004 44.2001 57.4004C43.8 57.4004 43.4001 57.2004 43 57.2004C42.1 56.2004 41 55.8004 40.6 55.6004C37.2 54.3004 33.9001 52.6004 30.5 50.8004C29.1 50.1004 27.7 49.4004 26.3 48.7004C26.1 48.7004 25.6 48.4004 25 48.1004C23.6 47.5004 22.4 47.0004 21.6 46.6004V27.0004C21.6 26.1004 21.6 25.1004 21.4 24.1004C21.4 23.1004 21.1 21.3004 21.2001 20.3004C23.6 19.0004 26.3 17.7004 28.8 16.5004C30.2 15.9004 31.5 15.2004 32.8 14.5004C33.2001 14.3004 33.7001 14.1004 34.2001 13.9004C35.4001 13.4004 36.7001 12.8004 37.9001 12.0004C38 12.0004 38.1001 12.0004 38.2001 12.0004C39 12.0004 39.7001 11.8004 40.4001 11.5004C41.5 11.0004 42.2001 10.3004 42.4001 10.0004C42.8001 9.50036 43.3 9.20036 43.8 9.00036C44.2001 8.80036 44.7001 8.60036 45.3 8.20036C45.3 8.20036 45.5 8.10036 45.5 8.00036C45.7001 8.00036 46 7.80036 46.2001 7.70036C46.8 7.50036 47.5 7.20036 48.1 6.90036L50.4001 5.80036C50.9001 6.10036 51.3 6.40036 51.6 6.50036C52.1 6.80036 52.5 7.10036 52.7001 7.10036C53.5 7.50036 54.2001 7.90036 55 8.30036C57.1 9.40036 59.5 10.7004 62 11.5004C62.8 12.4004 63.7 12.8004 64.1 12.9004C69 15.1004 73.9 17.6004 78.7 20.0004H79V31.5004C79 32.0004 79 32.5004 79 32.9004C79 33.5004 79 34.2004 79 34.5004C79 34.5004 79 34.6004 79 34.7004C78.8 35.5004 78.4 37.0004 78.7 38.7004C77.9 40.4004 78.1 42.4004 79.1 44.2004C79.1 44.6004 79.1 45.1004 79.1 45.5004C79.1 45.8004 79.1 46.0004 79.1 46.3004L66.1 52.8004C64.9 53.4004 63.7 54.0004 62.6 54.6004C62 55.0004 61.4001 55.4004 61 55.8004C59.7001 55.9004 58.5 56.5004 57.7001 57.4004C55.4001 58.1004 53.4001 59.1004 51.5 60.1004H51.3ZM76.7 74.8004L73.6 74.3004L72.4 77.2004L68.6 86.7004L60.9001 61.1004L61.8 60.7004C62.1 60.7004 62.5 60.7004 62.8 60.7004C63.2001 60.5004 63.7 60.1004 64.1 59.6004L72.1 55.8004L90.1 76.7004L76.7 74.7004V74.8004Z"
                          fill="#F59E0B"
                        />
                        {i == 0 && (
                          <path
                            d="M57.6 35.1L65.5 27.5L54.6 25.9L49.7 16L44.9 25.9L34 27.5L41.8 35.1L40 46L49.7 40.8L59.5 46L57.6 35.1Z"
                            fill="#F59E0B"
                          />
                        )}
                        {i == 1 && (
                          <>
                            <path
                              d="M61.4 41.4992L64.4 35.8992L70 32.7992L64.4 29.6992L61.4 24.1992L58.2999 29.6992L52.7 32.7992L58.2999 35.8992L61.4 41.4992Z"
                              fill="#F59E0B"
                            />
                            <path
                              d="M38 24.1992L35 29.6992L29.4 32.7992L35 35.8992L38 41.4992L41.1 35.8992L46.7 32.7992L41.1 29.6992L38 24.1992Z"
                              fill="#F59E0B"
                            />
                          </>
                        )}
                        {i == 2 && (
                          <>
                            <path
                              d="M61.4 44.4055L64.4 38.4135L70 35.0965L64.4 31.7795L61.4 25.8945L58.2999 31.7795L52.7 35.0965L58.2999 38.4135L61.4 44.4055Z"
                              fill="#F59E0B"
                            />
                            <path
                              d="M38 25.8945L35 31.7795L29.4 35.0965L35 38.4135L38 44.4055L41.1 38.4135L46.7 35.0965L41.1 31.7795L38 25.8945Z"
                              fill="#F59E0B"
                            />
                            <path
                              d="M49.6 13L46.6 18.5L41 21.6L46.6 24.7L49.6 30.3L52.7 24.7L58.3 21.6L52.7 18.5L49.6 13Z"
                              fill="#F59E0B"
                            />
                          </>
                        )}
                      </g>
                      <defs>
                        <clipPath id="clip0_1376_12029">
                          <rect width="100" height="100" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  ) : (
                    <span className="absolute bottom-0 left-1 rounded-full p-2">{rank}</span>
                  )}
                </div>

                <div className="w-2/4 ">
                  <div className="overflow-hidden overflow-ellipsis pb-2">
                    <Image
                      className="inline"
                      src={ImgTwitterBlue}
                      alt="Twitter icon"
                      width={15}
                      height={15}
                    />
                    {twitter ? (
                      <Link
                        className=""
                        href={"https://twitter.com/" + twitter.replace("@", "")}
                        target="_blank"
                      >
                        {twitter.replace("@", " ").toLowerCase()}
                      </Link>
                    ) : (
                      "Unknown"
                    )}
                  </div>
                  <WalletLink name={name} wallet={owner} tabActive={tabActive}></WalletLink>
                </div>
                <div className="mr-2 grow text-end text-amber-100 shadow-red-400 drop-shadow-lg">
                  <Image
                    className="inline"
                    src={ImgPowerRating}
                    alt="Power rating icon"
                    width={18}
                    height={18}
                  />
                  {power}
                </div>
              </Panel>
            );
          }
        )}
      </div>
      <div className="btn-group-horizontal btn-group mx-auto self-start pb-2 font-medieval-sharp">
        <button
          className="btn-sm btn  "
          disabled={page[nftTypeTab] == 0}
          onClick={handleFetchPreviousPage}
        >
          «
        </button>
        <button className="btn-sm btn ">Page {(page[nftTypeTab] ?? 0) + 1}</button>

        <button
          className=" btn-sm  btn "
          disabled={(data?.pages[page[nftTypeTab] ?? 0]?.items?.length ?? 0) < queryLimit}
          onClick={handleFetchNextPage}
        >
          »
        </button>
      </div>
    </Panel>
  );
};

const WalletLink = ({
  wallet,
  name,
  tabActive,
}: {
  wallet: string;
  name: string;
  tabActive: number;
}) => {
  const shortWallet = `${wallet.substring(0, 8)}...${wallet.substring(wallet.length - 8)}`;
  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="text-xs font-thin">
      {tabActive === 3 ? (
        <div className="flex items-center">
          <a
            href={`https://solscan.io/address/${wallet}`}
            target="_blank"
            rel="noopener noreferrer"
            title={wallet}
            className="mr-2 truncate"
          >
            {shortWallet}
          </a>

          <button className="w-5" title="copy to clipboard" onClick={() => copyToClipboard(wallet)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="copy">
              <path
                fill="#AB9F3A"
                d="M21,8.94a1.31,1.31,0,0,0-.06-.27l0-.09a1.07,1.07,0,0,0-.19-.28h0l-6-6h0a1.07,1.07,0,0,0-.28-.19.32.32,0,0,0-.09,0A.88.88,0,0,0,14.05,2H10A3,3,0,0,0,7,5V6H6A3,3,0,0,0,3,9V19a3,3,0,0,0,3,3h8a3,3,0,0,0,3-3V18h1a3,3,0,0,0,3-3V9S21,9,21,8.94ZM15,5.41,17.59,8H16a1,1,0,0,1-1-1ZM15,19a1,1,0,0,1-1,1H6a1,1,0,0,1-1-1V9A1,1,0,0,1,6,8H7v7a3,3,0,0,0,3,3h5Zm4-4a1,1,0,0,1-1,1H10a1,1,0,0,1-1-1V5a1,1,0,0,1,1-1h3V7a3,3,0,0,0,3,3h3Z"
              ></path>
            </svg>
          </button>
        </div>
      ) : (
        <div className="truncate">{name}</div>
      )}
    </div>
  );
};

const LinksItems = ({ className }: { className?: string }) => (
  <Panel
    className={
      (className ?? " ") + " mt-5 flex w-full flex-grow flex-wrap items-center justify-between"
    }
  >
    <a
      className="w-full p-1 hover:scale-105 hover:transition-transform lg:w-1/4"
      href="https://app.rudegolems.com/connect"
      target={"_blank"}
      rel="noreferrer"
    >
      <Image alt="War staking app" src={warimage} />
    </a>
    <a
      className="w-full p-1 hover:scale-105 hover:transition-transform lg:w-1/4"
      href="https://rudegolems.com/ranking/"
      target={"_blank"}
      rel="noreferrer"
    >
      <Image alt="Rarity tool" src={rankImage} />
    </a>
    <a
      className="w-full p-1 hover:scale-105 hover:transition-transform lg:w-1/4"
      href="https://rewards.creadorestudios.io/"
      target={"_blank"}
      rel="noreferrer"
    >
      <Image alt="Rewards" src={rewardsImage} />
    </a>
    <a
      className="w-full p-1 hover:scale-105 hover:transition-transform lg:w-1/4"
      href="https://nftoys.site/"
      target={"_blank"}
      rel="noreferrer"
    >
      <Image alt="NFT Toys" src={nftToysImage} />
    </a>
  </Panel>
);

export default Home;
