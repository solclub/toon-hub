import { useState, useEffect } from "react";
import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import twitterBg from "../assets/images/twiter_banner.png";
import gem from "../assets/images/sample_gem.png";
import warimage from "../assets/images/war_banner.png";
import rankImage from "../assets/images/rarity_banner.png";
import rewardsImage from "../assets/images/rewards_banner.png";
import type { EquipmentRarity } from "../components/common/Equipment";
import Equipment from "../components/common/Equipment";
import classNames from "classnames";
import sampleData from "./sample-data/rankItems.json";

type RankItem = {
  id: string;
  name: string;
  mint: string;
  image: string;
  owner: string;
  twitter: string;
  points: number;
};

const Home: NextPage = () => {
  const [rankingData, setRankingData] = useState<RankItem[]>([]);

  useEffect(() => {
    setRankingData(sampleData);
  }, []);

  const twitPhrase = "”I am my golem and my golem is me, we are Grrrr”";
  const featuredNFT = {
    url: "https://arweave.net/0dVi8eroB4qtkWQ6_QiXHBw7lBUk1U-oKn-4IcF3EXY",
    name: "Demon #23",
    wallet: "2fAeFrv7iXDBpoHh2EUP6KfG9mm26Szqk9c4hA1oyRSP",
    twitter: "@Nereos",
    discord: "@Nereos",
  };
  const equipment = [
    {
      id: "1",
      url: "https://cdn.discordapp.com/attachments/970702970704510976/1075386628509532231/9.png",
      rarity: "COMMON",
    },
    {
      id: "2",
      url: gem,
      rarity: "LEGEND",
    },
    {
      id: "3",
      url: "https://cdn.discordapp.com/attachments/970702970704510976/1075386628509532231/9.png",
      rarity: "ULTRA_LEGEND",
    },
    {
      id: "4",
      url: gem,
      rarity: "SECRET",
    },
  ];
  return (
    <div>
      <div className="mx-auto mt-5">
        <div className="mx-auto w-5/12">
          <div className="relative grid h-16 justify-center justify-items-center">
            <Image
              className="absolute self-center"
              src={twitterBg}
              alt="Twit Phrase"
            />
            <Link
              className="absolute mt-5 block h-full w-full text-center text-xl italic text-white"
              href={
                "https://twitter.com/intent/tweet?text=" +
                twitPhrase.replace("”", "")
              }
              target="_blank"
            >
              {twitPhrase}
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-7 flex flex-wrap  align-middle">
        <div className="w-[60%]">
          <div className="panel flex flex-wrap rounded-md ">
            {featuredNFT && (
              <div className="overflow-hidde w-[63%] p-3">
                <div className=" relative h-[500px] w-full">
                  <Image
                    className="absolute max-h-[500px] rounded-2xl object-cover "
                    src={featuredNFT.url}
                    alt="Picture of the author"
                    fill
                  />
                  <div className="absolute bottom-0 h-[60%] w-full rounded-xl bg-gradient-to-t from-black to-transparent"></div>
                  <div className="absolute bottom-10 left-10  h-[60%] w-[50%] ">
                    <div className="absolute bottom-0">
                      <div className=" text-2xl font-bold">
                        {featuredNFT?.name || "Unknow"}
                      </div>
                      <div className="mt-2 text-xl font-normal">
                        {featuredNFT?.twitter.toLowerCase() || "Unknow"}
                      </div>
                      <div className="mt-2 w-20 overflow-hidden overflow-ellipsis text-xs font-thin">
                        {featuredNFT?.wallet || "Unknow"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              // <div className="overflow-hidde relative h-[500px] w-[65%]">
              //   <Image
              //     className="absolute max-h-[500px] rounded-2xl object-cover p-3"
              //     src={featuredNFT.url}
              //     alt="Picture of the author"
              //     width={560}
              //     height={500}
              //   />

              //   <div className="absolute bottom-3 left-3 h-[60%] w-[93%] bg-gradient-to-t from-black to-transparent"></div>
              //   <div className="absolute bottom-10 left-10  h-[60%] w-[50%] ">
              //     <div className="absolute bottom-0">
              //       <div className=" text-2xl font-bold">
              //         {featuredNFT?.name || "Unknow"}
              //       </div>
              //       <div className="mt-2 text-xl font-normal">
              //         {featuredNFT?.twitter.toLowerCase() || "Unknow"}
              //       </div>
              //       <div className="mt-2 w-20 overflow-hidden overflow-ellipsis text-xs font-thin">
              //         {featuredNFT?.wallet || "Unknow"}
              //       </div>
              //     </div>
              //   </div>
              // </div>
            )}

            <div className="flex w-[35%] flex-wrap items-center align-middle">
              <div className="flex w-full flex-wrap items-center justify-center gap-6">
                <div className="w-full pb-3 text-center text-2xl text-slate-200">
                  Equipment
                </div>
                {equipment &&
                  equipment.map((x) => (
                    <Equipment
                      className=""
                      key={x.id}
                      url={x.url}
                      rarity={x.rarity as EquipmentRarity}
                      revealed={true}
                      profileView={false}
                    ></Equipment>
                  ))}
                <button className="btn-rude text-center text-xl">
                  Customize
                </button>
              </div>
            </div>
          </div>
          <div className="mt-5 flex w-full flex-wrap items-center align-middle">
            <a
              className="w-1/3 hover:scale-105 hover:transition-transform"
              href="https://app.rudegolems.com/connect"
              target={"_blank"}
              rel="noreferrer"
            >
              <Image alt="War staking app" src={warimage} />
            </a>
            <a
              className="w-1/3 hover:scale-105 hover:transition-transform"
              href="https://rudegolems.com/ranking/"
              target={"_blank"}
              rel="noreferrer"
            >
              <Image alt="Rarity tool" src={rankImage} />
            </a>
            <a
              className="w-1/3 hover:scale-105 hover:transition-transform"
              href="https://rewards.creadorestudios.io/"
              target={"_blank"}
              rel="noreferrer"
            >
              <Image alt="Rewards" src={rewardsImage} />
            </a>
          </div>
        </div>
        <LeaderBoard data={rankingData}></LeaderBoard>
      </div>
    </div>
  );
};

type LeaderTable = {
  data: RankItem[];
};

const LeaderBoard = ({ data }: LeaderTable) => {
  const [tabActive, setTabActive] = useState(0);
  const changeTab = (id: number) => {
    setTabActive(id);
  };
  return (
    <div className="panel ml-3 flex w-[35%] flex-wrap items-start justify-center rounded-md">
      <div className="tabs mt-3 w-10/12 justify-center p-3">
        <a
          onClick={() => {
            changeTab(0);
          }}
          className={classNames("tab tab-bordered", {
            "tab-active": tabActive == 0,
          })}
        >
          Golems
        </a>
        <a
          onClick={() => {
            changeTab(1);
          }}
          className={classNames("tab tab-bordered", {
            "tab-active": tabActive == 1,
          })}
        >
          Demons
        </a>
        <a
          onClick={() => {
            changeTab(2);
          }}
          className={classNames("tab tab-bordered", {
            "tab-active": tabActive == 2,
          })}
        >
          All
        </a>
        <a
          onClick={() => {
            changeTab(3);
          }}
          className={classNames("tab tab-bordered", {
            "tab-active": tabActive == 3,
          })}
        >
          By Wallet
        </a>
      </div>
      <div className="mr-2 h-[550px] w-full overflow-y-scroll">
        {data.map(({ mint, image, name, points, twitter, owner }, i) => (
          <div
            key={mint}
            className={classNames(
              "m-3 flex flex-wrap items-center rounded-xl border-2 border-slate-500 p-3",
              { "border-orange-500": i == 0 },
              { "border-purple-500": i == 1 },
              { "border-blue-500": i == 2 }
            )}
          >
            <span className="rounded-full p-2 text-center">{i + 1}</span>
            <Image
              className="mr-2 rounded-2xl"
              alt="War staking app"
              src={image}
              width={64}
              height={64}
            />
            <div className="w-2/4">
              <div className=" overflow-hidden overflow-ellipsis">
                {(tabActive == 3 ? owner : twitter.toLowerCase()) || "unknow"}
              </div>
              <div className="text-xs font-thin ">{name}</div>
            </div>
            <div className="grow text-end text-amber-100 shadow-red-400 drop-shadow-lg">
              {points}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
