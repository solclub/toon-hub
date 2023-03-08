import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import classNames from "classnames";
import { getCsrfToken, signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../../utils/trpc";
import bs58 from "bs58";
import { SigninMessage } from "../../utils/SigninMessage";
import { Modal } from "../common/Modal";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export const Connect = () => {
  const { status } = useSession();

  // const result = trpc.example.hello.useQuery({ text: "jhonny" });
  const ses = trpc.auth.getSession.useQuery().data;
  // const ses2 = trpc.auth.getSecretMessage.useQuery().data;

  const wallet = useWallet();
  const walletModal = useWalletModal();

  useEffect(() => {
    if (wallet.connected && status === "unauthenticated") {
      handleSignIn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.connected]);

  const handleSignIn = async () => {
    try {
      if (!wallet.connected) {
        walletModal.setVisible(true);
      }

      const csrf = await getCsrfToken();
      if (!wallet.publicKey || !csrf || !wallet.signMessage) return;

      const message = new SigninMessage({
        domain: window.location.host,
        publicKey: wallet.publicKey?.toBase58(),
        statement: `Sign this message to sign in to the app.`,
        nonce: csrf,
      });

      const data = new TextEncoder().encode(message.prepare());
      const signature = await wallet.signMessage(data);
      const serializedSignature = bs58.encode(signature);

      signIn("credentials", {
        message: JSON.stringify(message),
        redirect: false,
        signature: serializedSignature,
        id: wallet.publicKey,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const [user, setUser] = useState({
    name: "@Nereos",
    discord: "@Nereos",
    twitter: "",
  });

  return (
    <>
      {status == "unauthenticated" && <WalletMultiButtonDynamic />}
      {status == "authenticated" && (
        <div className="dropdown-end dropdown">
          {/* {JSON.stringify(ses2)} */}
          <div tabIndex={0} className=" flex flex-wrap text-right ">
            <div className="flex items-center gap-4 rounded-2xl border border-gray-600 py-2 px-4 text-white">
              <p className="inline-flex items-center gap-2">
                <span>🦋</span>
                <span>0</span>
              </p>
              <p className="inline-flex items-center gap-2">
                <span>🦋</span>
                <span>87423.74</span>
              </p>
              <p className="inline-flex items-center gap-2">
                <span>🦋</span> <span>8.14</span>
              </p>
            </div>
            <div className="px-3">
              <div className="text-xs">Hello</div>

              <div className="indicator  text-[#BEA97E]">
                <span
                  className={classNames(
                    "badge-error badge badge-xs indicator-item",
                    {
                      "mt-2 hidden": user.name !== "",
                    }
                  )}
                ></span>
                <span>{user.name || "Connect"}</span>
              </div>
            </div>
            <div>
              <label className="swap-rotate swap ">
                <input type="checkbox" />
                <svg
                  className="swap-on"
                  width="34"
                  height="34"
                  viewBox="0 0 34 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="17"
                    cy="17"
                    r="16"
                    transform="matrix(1 0 0 -1 0 34)"
                    stroke="#BEA97E"
                    strokeWidth="2"
                  />
                  <path
                    d="M22.46 20L16.708 10.9998L11 20H22.46Z"
                    fill="white"
                  />
                </svg>

                <svg
                  className="swap-off"
                  width="34"
                  height="34"
                  viewBox="0 0 34 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="17"
                    cy="17"
                    r="16"
                    stroke="#BEA97E"
                    strokeWidth="2"
                  />
                  <path
                    d="M22.46 14L16.708 23.0002L11 14H22.46Z"
                    fill="white"
                  />
                </svg>
              </label>
            </div>
          </div>
          <ul
            tabIndex={0}
            className="panel dropdown-content menu w-60 rounded-2xl p-2 pt-5 text-xs shadow"
          >
            <li>
              <label
                htmlFor="linkSocial"
                onClick={() => {
                  signIn("twitter");
                }}
              >
                <div className={"indicator"}>
                  {user.twitter || "Link with Twitter"}
                </div>

                <svg
                  width="16"
                  height="14"
                  viewBox="0 0 16 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_1241_12842)">
                    <path
                      d="M15.9845 2.15796C16.0321 2.09181 15.9618 2.00641 15.8858 2.03583C15.3455 2.24493 14.7808 2.386 14.2047 2.45553C14.8461 2.07298 15.341 1.49065 15.6155 0.801217C15.6434 0.730984 15.5666 0.668265 15.5004 0.704801C14.9042 1.03347 14.2613 1.27014 13.5935 1.40645C13.5656 1.41215 13.5367 1.40265 13.5171 1.38197C13.0159 0.854024 12.3562 0.502506 11.6371 0.381034C10.9028 0.25701 10.148 0.379811 9.49118 0.730179C8.83433 1.08055 8.31254 1.63866 8.00765 2.31699C7.71775 2.96196 7.63953 3.68091 7.78251 4.37138C7.79361 4.42496 7.7516 4.47554 7.69691 4.47214C6.39754 4.39157 5.12797 4.04653 3.96644 3.4578C2.80786 2.87056 1.78191 2.05362 0.951061 1.05735C0.914187 1.01314 0.8443 1.01886 0.817434 1.06976C0.558904 1.55954 0.423544 2.10544 0.423912 2.66026C0.422862 3.21254 0.558617 3.75651 0.819089 4.24373C1.07956 4.73096 1.45667 5.14633 1.91683 5.45285C1.42882 5.43959 0.950329 5.31914 0.515167 5.10076C0.459087 5.07262 0.391817 5.11269 0.394734 5.17529C0.428668 5.90352 0.696453 6.63461 1.15997 7.19552C1.65322 7.79242 2.33785 8.20091 3.09804 8.35189C2.80541 8.4408 2.50159 8.48768 2.19573 8.49111C2.02926 8.48917 1.86312 8.4769 1.69825 8.4544C1.63713 8.44606 1.58722 8.50403 1.60861 8.5618C1.83535 9.17395 2.23592 9.70809 2.76261 10.098C3.32569 10.5149 4.00493 10.7461 4.7058 10.7596C3.5223 11.6893 2.06111 12.1967 0.555158 12.2009C0.400416 12.2014 0.245743 12.1964 0.0914349 12.1859C0.00447805 12.18 -0.0355149 12.2957 0.0394391 12.3401C1.50674 13.2094 3.18384 13.6689 4.89447 13.6668C6.15746 13.6799 7.4104 13.4416 8.58011 12.9659C9.74982 12.4901 10.8128 11.7864 11.7071 10.8959C12.6014 10.0054 13.3089 8.94594 13.7885 7.77937C14.268 6.61281 14.5099 5.36254 14.5 4.1016V3.70864C14.5 3.68279 14.5123 3.65848 14.5329 3.6429C15.0893 3.22348 15.5786 2.72275 15.9845 2.15796Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1241_12842">
                      <rect
                        width="16"
                        height="13.3333"
                        fill="white"
                        transform="translate(0 0.333984)"
                      />
                    </clipPath>
                  </defs>
                </svg>
                <div className="grid grow place-content-end">
                  <span
                    className={classNames(
                      "badge-error badge badge-xs indicator-item mx-auto self-end align-middle",
                      {
                        "badge-success": user.twitter !== "",
                        "badge-error": user.twitter === "",
                      }
                    )}
                  ></span>
                </div>
              </label>
            </li>
            <li>
              <label
                htmlFor="linkSocial"
                onClick={() => {
                  signIn("discord");
                }}
                className="w-full"
              >
                <div className={"indicator"}>
                  {user.discord || "Link with Discord"}
                </div>
                <svg
                  width="16"
                  height="12"
                  viewBox="0 0 16 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_1241_12844)">
                    <path
                      d="M13.5535 1.005C12.5178 0.5355 11.4104 0.194289 10.2526 0C10.1104 0.249071 9.94429 0.584077 9.82976 0.850574C8.599 0.671245 7.37956 0.671245 6.17144 0.850574C6.05693 0.584077 5.88704 0.249071 5.74357 0C4.58454 0.194289 3.47584 0.536754 2.44013 1.00748C0.351095 4.06602 -0.215207 7.04858 0.0679444 9.98879C1.4535 10.9913 2.79627 11.6003 4.11638 11.9988C4.44233 11.5641 4.73302 11.1021 4.98345 10.6152C4.5065 10.4396 4.04969 10.2229 3.61805 9.97137C3.73256 9.88917 3.84457 9.80324 3.95279 9.71482C6.58546 10.9079 9.44593 10.9079 12.0472 9.71482C12.1566 9.80324 12.2686 9.88917 12.3819 9.97137C11.949 10.2242 11.4909 10.4408 11.014 10.6165C11.2644 11.1021 11.5538 11.5654 11.881 12C13.2024 11.6015 14.5464 10.9925 15.932 9.98879C16.2642 6.58034 15.3644 3.62516 13.5535 1.005ZM5.34212 8.18059C4.55181 8.18059 3.9037 7.46576 3.9037 6.59528C3.9037 5.72479 4.53797 5.00873 5.34212 5.00873C6.14628 5.00873 6.79437 5.72354 6.78053 6.59528C6.78178 7.46576 6.14628 8.18059 5.34212 8.18059ZM10.6578 8.18059C9.86752 8.18059 9.21941 7.46576 9.21941 6.59528C9.21941 5.72479 9.85366 5.00873 10.6578 5.00873C11.462 5.00873 12.1101 5.72354 12.0962 6.59528C12.0962 7.46576 11.462 8.18059 10.6578 8.18059Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1241_12844">
                      <rect width="16" height="12" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <div className="grid grow place-content-end">
                  <span
                    className={classNames("badge badge-xs indicator-item", {
                      "badge-success": user.discord !== "",
                      "badge-error": user.discord === "",
                    })}
                  ></span>
                </div>
              </label>
            </li>
            <li>
              <button
                className="w-full"
                onClick={() => {
                  signOut();
                }}
              >
                SignOut
              </button>
            </li>
            <li>
              <WalletMultiButtonDynamic />
            </li>
          </ul>
        </div>
      )}
    </>
  );
};
