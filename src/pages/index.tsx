import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import twitterBg from "../assets/images/twiter_banner.png";
import gem from "../assets/images/sample_gem.png";
import warimage from "../assets/images/war_banner.png";
import rankImage from "../assets/images/rarity_banner.png";
import rewardsImage from "../assets/images/rewards_banner.png";
import Equipment, { EquipmentRarity } from "../components/common/Equipment";

const Home: NextPage = () => {
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
      url: gem,
      rarity: "COMMON",
    },
    {
      id: "2",
      url: gem,
      rarity: "LEGEND",
    },
    {
      id: "3",
      url: gem,
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
              <div className="overflow-hidde relative h-[500px] w-[65%]">
                <Image
                  className="absolute max-h-[500px] rounded-2xl object-cover p-3"
                  src={featuredNFT.url}
                  alt="Picture of the author"
                  width={560}
                  height={500}
                />
                <div className="absolute bottom-3 left-3 h-[60%] w-[93%] bg-gradient-to-t from-black to-transparent"></div>
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
            )}

            <div className="flex w-[35%] flex-wrap items-center align-middle">
              <div className="flex w-full flex-wrap items-center justify-center py-7">
                <div className="w-full py-5 text-center text-2xl text-slate-200">
                  Gems
                </div>
                {equipment &&
                  equipment.map((x) => (
                    <Equipment
                      className="h-32 rounded-3xl shadow-lg"
                      key={x.id}
                      url={x.url}
                      rarity={x.rarity as EquipmentRarity}
                    ></Equipment>
                  ))}
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
        <div className="panel ml-3 flex w-[35%] flex-wrap rounded-md">
          leaderbaords
        </div>
      </div>
    </div>
  );
};

export default Home;
