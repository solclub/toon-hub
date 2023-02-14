import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import twitterBg from "../assets/images/twiter_banner.png";
import gem from "../assets/images/sample_gem.png";
import warimage from "../assets/images/war_banner.png";
import rankImage from "../assets/images/rarity_banner.png";
import rewardsImage from "../assets/images/rewards_banner.png";

const Home: NextPage = () => {
  const twitPhrase = "”I am my golem and my golem is me, we are Grrrr”";
  const NftImage =
    "https://arweave.net/0dVi8eroB4qtkWQ6_QiXHBw7lBUk1U-oKn-4IcF3EXY";
  const equipment = [
    {
      id: "1",
      url: gem,
    },
    {
      id: "2",
      url: gem,
    },
    {
      id: "3",
      url: gem,
    },
    {
      id: "4",
      url: gem,
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
          <div className="flex flex-wrap rounded-md bg-gray-900">
            <div className="w-[65%] overflow-hidden">
              <Image
                className="max-h-[500px] object-cover p-3"
                src={NftImage}
                alt="Picture of the author"
                width={560}
                height={500}
              />
            </div>
            <div className="flex w-[35%] flex-wrap items-center align-middle">
              <div className="flex w-full flex-wrap items-center justify-center py-7">
                {equipment &&
                  equipment.map((x) => (
                    <div key={x.id} className="gem aspect-square h-32 ">
                      <Image
                        className="fill"
                        src={x.url}
                        alt="Picture of the author"
                        width={100}
                        height={100}
                      ></Image>
                    </div>
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
        <div className="ml-3 flex w-[35%] flex-wrap rounded-md bg-gray-900">
          leaderbaords
        </div>
      </div>
    </div>
  );
};

export default Home;
