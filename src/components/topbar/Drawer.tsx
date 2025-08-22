import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import classNames from "classnames";
import { Connect } from "./Connect";
import SVGIcon from "assets/svg/SVGIcon";
import { useRouter } from "next/router";
import styled from "styled-components";
import { ButtonContainerMixin, ButtonMixin } from "components/common/MainButton";

export const Drawer = ({ children }: { children: JSX.Element }) => {
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

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [router.pathname]);

  const menuItems = [
    {
      name: "The Hub",
      children: [
        { name: "Home", path: "/", isPrivate: false },
        { name: "My Collection", path: "/list", isPrivate: true },
      ],
      icon: <SVGIcon.the_hub_icon />,
    },
    {
      name: "The Cartoon Clash",
      children: [
        { name: "Training camp", path: "https://app.rudegolems.com/training", isPrivate: true },
        { name: "Battlefield", path: "https://app.rudegolems.com/war", isPrivate: true },
        {
          name: "Armor Upgrade",
          path: "https://app.rudegolems.com/armor-upgrade",
          isPrivate: true,
        },
      ],
      icon: <SVGIcon.the_cartoon_clash_icon />,
    },
    {
      name: "Toon of Ladder",
      path: "/toon-of-ladder",
      isPrivate: false,
      icon: <SVGIcon.the_toon_of_ladder_icon />,
    },
  ];

  return (
    <div className="drawer h-auto min-h-screen">
      <input
        id="main-drawer"
        type="checkbox"
        className="drawer-toggle"
        onChange={toggle}
        checked={isDrawerOpen}
        key={router.pathname} // Force re-render on route change
      />

      <div className="drawer-content">
        <Header>
          <div className="flex items-center gap-4">
            <label htmlFor="main-drawer" className="cursor-pointer">
              <SVGIcon.menu />
            </label>
            <div className={classNames("w-44 lg:block", { hidden: !isDrawerOpen })}>
              <SVGIcon.giblatoons />
            </div>
          </div>
          <div className="top-2 flex w-full justify-center lg:w-auto">
            <Link href={router.pathname === "/toon-of-ladder" ? "" : "/"}>
              {router.pathname === "/toon-of-ladder" ? (
                <SVGIcon.toon_of_ladder />
              ) : (
                <SVGIcon.thehub />
              )}
            </Link>
          </div>
          <ConnectButtonContainer
            $color={connected ? "blue" : "yellow"}
            className=" mx-auto my-0 mt-8 flex w-full justify-center lg:m-0 lg:w-auto"
          >
            <Connect />
          </ConnectButtonContainer>
        </Header>
        <div className="container m-auto p-4 pt-8" style={{ position: 'relative', zIndex: 1 }}>{children}</div>
      </div>

      <div className="drawer-side">
        <label htmlFor="main-drawer" className="drawer-overlay"></label>

        <Menu className="menu" $isOpen={isDrawerOpen}>
          <div>
            <div className="absolute right-4 top-4 cursor-pointer" onClick={toggle}>
              <SVGIcon.close_menu />
            </div>
            <div className="mx-auto my-10 w-56">
              <SVGIcon.giblatoons />
            </div>
            <ul>
              {menuItems.map((item) => {
                const TheItem = ({
                  item,
                  className,
                }: {
                  item: {
                    name: string;
                    path: string;
                    isPrivate: boolean;
                    icon?: JSX.Element;
                  };
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
                          {
                            "disabled pointer-events-none text-gray-500":
                              !connected && item.isPrivate,
                          },
                          { "text-lg": !item.icon },
                          "links"
                        )}
                      >
                        {item.name}
                      </Link>
                    </div>
                  </li>
                );
                return item.children ? (
                  <li key={item.name}>
                    <details className="flex flex-col items-start gap-2 p-0">
                      <summary className="flex items-center gap-1 text-xl">
                        <SVGIcon.arrowMarker className="arrow_marker" />
                        {item.icon}
                        <span>{item.name}</span>
                      </summary>
                      <ul className="sub-menu gap-2">
                        {item.children.map((child) => (
                          <TheItem key={child.name} item={child} />
                        ))}
                      </ul>
                    </details>
                  </li>
                ) : (
                  <TheItem key={item.name} item={item} className="pl-3" />
                );
              })}
            </ul>
          </div>
          <button className="w-full justify-self-end rounded-lg bg-[#ffe865] py-4 text-xl text-black">
            <a href="https://rudegolems.com/" target="_blank">
              Visit Website
            </a>
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
  border-bottom: 1px solid rgba(253, 209, 18, 0.3);
  z-index: 50;

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

  & *:active,
  & *:hover {
    background-color: unset;
    color: unset;
  }

  .arrow_marker,
  .arrow_marker path {
    transition: 0.2s;
  }

  details[open] .arrow_marker {
    transform: rotate(90deg);
    path {
      stroke: #fdd112;
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
    border-left: 1px solid #fdd112;
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
      transition: 0.2s;
    }

    &:hover::before {
      background-color: #fdd112;
    }
  }

  .links {
    transition: 0.5s;
    &:hover {
      color: #fdd112;
    }
  }
`;
