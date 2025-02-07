import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import classNames from "classnames";
import { Connect } from "./Connect";
import SVGIcon from "assets/svg/SVGIcon";
import { useRouter } from "next/router";
import styled from "styled-components";
import { ButtonContainerMixin, ButtonMixin } from "components/common/MainButton";

export const Drawer = ({ children }: { children: JSX.Element; }) => {
  const { connected } = useWallet();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const toggle = () => setDrawerOpen(!isDrawerOpen);
  const router = useRouter();

  useEffect(() => {
    isDrawerOpen && (document.body.style.overflow = "hidden");

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

  const menuItems = [
    {
      name: "The Hub", children: [
        { name: "Home", path: "/", isPrivate: false },
        { name: "My Collection", path: "/list", isPrivate: true },
      ],
      icon: <SVGIcon.the_hub_icon />
    },
    {
      name: "The Cartoon Clash", children: [
        { name: "Training camp", path: "https://app.rudegolems.com/training", isPrivate: true },
        { name: "Battlefield", path: "https://app.rudegolems.com/war", isPrivate: true },
      ],
      icon: <SVGIcon.the_cartoon_clash_icon />
    },
    { name: "Toon of the Ladder", path: "/toon-of-ladder", isPrivate: false, icon: <SVGIcon.the_toon_of_ladder_icon /> },
  ];

  return (
    <div className="drawer min-h-screen h-auto">
      <input
        id="main-drawer"
        type="checkbox"
        className="drawer-toggle"
        onChange={toggle}
        checked={isDrawerOpen}
      />

      <div className="drawer-content">
        <Header>
          <div className="flex items-center gap-4">
            <label htmlFor="main-drawer" className="cursor-pointer">
              <SVGIcon.menu />
            </label>
            <div className={classNames("w-44 lg:block", { "hidden": !isDrawerOpen })}>
              <SVGIcon.giblatoons />
            </div>
          </div>
          <div className="w-full lg:w-auto flex justify-center top-2">
            <Link href={router.pathname === "/toon-of-ladder" ? "" : "/"} >
              {router.pathname === "/toon-of-ladder" ? <SVGIcon.toon_of_ladder /> : <SVGIcon.thehub />}
            </Link>
          </div>
          <ConnectButtonContainer $color={connected ? "blue" : "yellow"} className=" my-0 mt-8 mx-auto lg:m-0 w-full lg:w-auto flex justify-center">
            <Connect />
          </ConnectButtonContainer>
        </Header>
        <div className="container m-auto p-4 pt-32">{children}</div>
      </div>

      <div className="drawer-side">
        <label htmlFor="main-drawer" className="drawer-overlay"></label>

        <Menu className="menu" $isOpen={isDrawerOpen}>
          <div>
            <div className="absolute top-4 right-4 cursor-pointer" onClick={toggle}>
              <SVGIcon.close_menu />
            </div>
            <div className="mx-auto my-10 w-56">
              <SVGIcon.giblatoons />
            </div>
            <ul>
              {menuItems.map((item) => {
                const TheItem = ({ item, className }: {
                  item: {
                    name: string;
                    path: string;
                    isPrivate: boolean;
                    icon?: JSX.Element;
                  },
                  className?: string;
                }) => (
                  <li className={(item.icon ? "" : "itemsMenu") + ` ${className}`}>
                    <div className="gap-1 p-0">
                      {item.icon}
                      <Link
                        onClick={toggle}
                        href={item.path}
                        target={item.path.includes("rude") ? "_blank" : ""}
                        className={classNames(
                          { "text-[#FDD112]": item.path == router.pathname },
                          { "text-xl": item.icon },
                          { "disabled pointer-events-none text-gray-500": !connected && item.isPrivate },
                          { "text-lg": !item.icon },
                          "links"
                        )}
                      >
                        {item.name}
                      </Link>
                    </div>
                  </li>
                )
                return item.children ? (
                  <li key={item.name}>
                    <details className="flex flex-col items-start p-0">
                      <summary className="text-xl flex items-center gap-1">
                        <SVGIcon.arrowMarker className="arrow_marker" />
                        {item.icon}
                        <span>{item.name}</span>
                      </summary>
                      <ul className="sub-menu">
                        {item.children.map((child) => <TheItem key={child.name} item={child} />)}
                      </ul>
                    </details>
                  </li>
                ) : <TheItem key={item.name} item={item} className="pl-3" />;
              })}
            </ul>
          </div>
          <button className="justify-self-end w-full py-4 text-xl bg-[#ffe865] rounded-lg text-black">
            <a href="https://rudegolems.com/" target="_blank">Visit Website</a>
          </button>
        </Menu>
      </div>
    </div>
  );
};

const Header = styled.div`
  position: relative;
  display: flex;
  padding: 1.5rem 1rem;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  border-bottom: 1px solid rgba(253, 209, 18, .3);

  @media screen and (min-width: 1024px) {
    padding: 1.5rem 2rem;
  }
`;

const ConnectButtonContainer = styled.div<{ $color: "yellow" | "blue" | "red" }>`
  & .wallet-adapter-dropdown {
    ${ButtonContainerMixin}
    width: fit-content;
  }
  & .wallet-adapter-button-trigger {
    ${ButtonMixin}
    &:hover {
      background-color: unset;
    }
  }
`;

const Menu = styled.div<{ $isOpen: boolean }>`
  background-color: black;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 4px solid #fcec76;
  
  @media screen and (min-width: 1024px) {
    width: 20rem;
    height: 80vh;
    border-radius: 1rem;
    ${({ $isOpen }) => $isOpen && "transform: translateX(2rem) translateY(2rem) !important;"};
  }

  & *:active, & *:hover {
    background-color: unset;
    color: unset
  }

  .arrow_marker, .arrow_marker path {
    transition: .2s;
  }

  details[open] .arrow_marker {
    transform: rotate(90deg);
    path {
      stroke: #FDD112;
    }
  }

  summary {
    &::marker {
      content: none;
    }
  }

  .sub-menu {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    font-size: 1.25rem;
    line-height: 1.75rem;
    margin-left: 2rem;
    margin-bottom: 1.5rem;
    border-left: 1px solid #FDD112;
  }

  .itemsMenu {
    flex-direction: row;
    align-items: center;
    margin-left: 1.25rem;

    &::before {
      content: "";
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      margin-right: 10px;
      background-color: white;
      transition: .2s;
    }

    &:hover::before {
      background-color: #FDD112;
    }
  }

  .links {
    transition: .5s;
    &:hover {
      color: #FDD112;
    }
  }
`;