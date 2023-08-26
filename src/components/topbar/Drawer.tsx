import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import classNames from "classnames";
import { Connect } from "./Connect";
import SVGIcon from "assets/svg/SVGIcon";
import { useRouter } from "next/router";
import warimage from "assets/images/war_banner_small.png";
import rankImage from "assets/images/rarity_banner_small.png";
import nftToysImage from "assets/images/nfttoys_banner_small.png";
import rewardsImage from "assets/images/rewards_banner_small.png";
import Image from "next/image";

type Props = {
  children: JSX.Element;
};

export const Drawer = ({ children }: Props) => {
  const { connected } = useWallet();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");
  const toggle = () => setDrawerOpen(!isDrawerOpen);
  const router = useRouter();

  useEffect(() => {
    setCurrentPath(router.pathname);
  }, [router.pathname]);

  const menuItems = [
    { name: "Home", path: "/", isPrivate: false },
    { name: "My Collection", path: "/list", isPrivate: true },
  ];

  return (
    <div className="drawer">
      <input
        id="main-drawer"
        type="checkbox"
        className="drawer-toggle"
        onChange={toggle}
        checked={isDrawerOpen}
      />

      <div className="drawer-content pt-7">
        <div className="relative flex flex-wrap">
          <div className="absolute flex h-4 w-full items-center justify-center lg:h-auto">
            <Link href={"/"}>
              <SVGIcon.thehub></SVGIcon.thehub>
            </Link>
          </div>
          <div className="flex justify-start pl-8 align-middle lg:w-1/2">
            <label htmlFor="main-drawer" className="drawer-button z-40 mr-4 inline cursor-pointer">
              <SVGIcon.menui></SVGIcon.menui>
            </label>
            <div className="hidden w-44 lg:block">
              <SVGIcon.rudeverse />
            </div>
          </div>
          <div className="mx-8 flex justify-end align-middle lg:mx-0 lg:w-1/2 lg:pr-8">
            <Connect></Connect>
          </div>
        </div>
        <div className="container m-auto lg:px-8">{children}</div>
      </div>

      <div className="drawer-side">
        <label htmlFor="main-drawer" className="drawer-overlay"></label>

        <ul className="panel menu flex w-80 flex-col justify-start p-4 text-base-content">
          <div className="mx-auto mt-4 w-56">
            <SVGIcon.rudeverse />
          </div>
          <div className="divider col-span-2"></div>
          <div className="">
            {menuItems.map((item) => {
              return (
                <li key={item.name} className="text-white">
                  <Link
                    onClick={toggle}
                    href={item.path}
                    className={classNames(
                      "mt-4 text-white",
                      {
                        "bg-[#362f2e]": item.path == currentPath,
                      },
                      {
                        "disabled pointer-events-none text-gray-500": !connected && item.isPrivate,
                      }
                    )}
                  >
                    <SVGIcon.hubRock />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </div>
          <div className="mt-auto grid grid-cols-2 gap-3 justify-self-end">
            <div className="divider col-span-2"></div>
            <a
              className="hover:scale-105 hover:transition-transform"
              href="https://app.rudegolems.com/connect"
              target={"_blank"}
              rel="noreferrer"
            >
              <Image alt="War staking app" src={warimage} />
            </a>
            <a
              className="hover:scale-105 hover:transition-transform"
              href="https://rudegolems.com/ranking/"
              target={"_blank"}
              rel="noreferrer"
            >
              <Image alt="Rarity tool" src={rankImage} />
            </a>
            <a
              className="hover:scale-105 hover:transition-transform"
              href="https://rewards.creadorestudios.io/"
              target={"_blank"}
              rel="noreferrer"
            >
              <Image alt="Rewards" src={rewardsImage} />
            </a>
            <a
              className="hover:scale-105 hover:transition-transform"
              href="https://nftoys.site/"
              target={"_blank"}
              rel="noreferrer"
            >
              <Image alt="NFT Toys" src={nftToysImage} />
            </a>
          </div>
        </ul>
      </div>
    </div>
  );
};
