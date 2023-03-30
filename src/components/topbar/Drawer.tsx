import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import classNames from "classnames";
import { Connect } from "./Connect";
import SVGIcon from "assets/svg/SVGIcon";
import { useRouter } from "next/router";

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
          <div className="absolute flex w-full items-center justify-center">
            <div>
              <Link href={"/"}>
                <SVGIcon.thehub />
              </Link>
            </div>
          </div>
          <div className="flex w-1/2 justify-start pl-8 align-middle">
            <label htmlFor="main-drawer" className="drawer-button z-40 mr-4 inline cursor-pointer">
              <SVGIcon.menui></SVGIcon.menui>
            </label>
            <div className="w-44">
              <SVGIcon.rudeverse />
            </div>
          </div>
          <div className="flex w-1/2 justify-end  pr-8 align-middle">
            <Connect></Connect>
          </div>
        </div>
        <div className="container m-auto">{children}</div>
      </div>

      <div className="drawer-side">
        <label htmlFor="main-drawer" className="drawer-overlay"></label>

        <ul className="panel menu w-80 p-4 text-base-content ">
          <div className="mx-auto mt-4 w-56">
            <SVGIcon.rudeverse />
          </div>
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
                  <SVGIcon.menuitem />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
