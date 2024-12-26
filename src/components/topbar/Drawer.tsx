import Link from "next/link";
import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import classNames from "classnames";
import { Connect } from "./Connect";
import SVGIcon from "assets/svg/SVGIcon";
import { useRouter } from "next/router";
import MainButton from "components/common/MainButton";
import styled from "styled-components";

interface Props {
  children: JSX.Element;
}

export const Drawer = ({ children }: Props) => {
  const { connected } = useWallet();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const toggle = () => setDrawerOpen(!isDrawerOpen);
  const router = useRouter();

  const menuItems = [
    {
      name: "The Hub", children: [
        { name: "Home", path: "/", isPrivate: false },
        { name: "My Collection", path: "/list", isPrivate: true },
      ]
    },
    {
      name: "The Cartoon Clash", children: [
        { name: "Battle", path: "/battle", isPrivate: true },
        { name: "Leaderboard", path: "/leaderboard", isPrivate: false },
      ]
    },
    { name: "Toon of the Ladder", path: "/toon-of-ladder", isPrivate: false },
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

      <div className="drawer-content">
        <div className="flex py-6 px-32 justify-between items-center">
          <div className="flex items-center gap-4">
            <label htmlFor="main-drawer" className="cursor-pointer">
              <SVGIcon.menu />
            </label>
            <div className="hidden w-44 lg:block">
              <SVGIcon.giblatoons />
            </div>
          </div>
          <Link href={"/"}>
            {router.pathname === "/toon-of-ladder" ? <SVGIcon.toon_of_ladder /> : <SVGIcon.thehub />}
          </Link>
          <ConnectButton color={connected ? "blue" : "yellow"}>
            <Connect />
          </ConnectButton>
        </div>
        <div className="container m-auto">{children}</div>
      </div>

      <div className="drawer-side">
        <label htmlFor="main-drawer" className="drawer-overlay"></label>

        <ul className="
        bg-black 
        menu 
        flex 
        w-80 
        h-[80vh]
        flex-col 
        justify-start 
        p-4
        rounded-2xl
        border-b-4 
        border-[#fcec76]
        ">
          <div className="mx-auto my-10 w-56">
            <SVGIcon.giblatoons />
          </div>
          <div>
            {menuItems.map((item) => {
              const TheItem = ({ item }: {
                item: {
                  name: string;
                  path: string;
                  isPrivate: boolean
                }
              }) => (
                <li key={item.name}>
                  <Link
                    onClick={toggle}
                    href={item.path}
                    className={classNames(
                      "mt-4 text-2xl",
                      {
                        "bg-[#362f2e]": item.path == router.pathname,
                      },
                      {
                        "disabled pointer-events-none text-gray-500": !connected && item.isPrivate,
                      }
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              )
              return item.children ? (
                <li key={item.name}>
                  <details className="flex flex-col items-start">
                    <summary className="mt-4 text-2xl">{item.name}</summary>
                    <ul className="flex flex-col gap-2">
                      {item.children.map((child) => <TheItem key={item.name} item={child} />)}
                    </ul>
                  </details>
                </li>
              ) : <TheItem item={item} />;
            })}
          </div>
        </ul>
      </div>
    </div>
  );
};

const ConnectButton = styled(MainButton)`
  .wallet-adapter-button-trigger, .wallet-adapter-dropdown {
    height: 100%;
  }
  .wallet-adapter-button-trigger {
    padding: 0 1rem;
    &:hover {
      background-color: unset;
    }
  }
`;