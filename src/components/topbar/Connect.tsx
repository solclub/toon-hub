import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import classNames from "classnames";
import { getCsrfToken, signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../../utils/trpc";
import bs58 from "bs58";
import { SigninMessage } from "../../utils/signin-message";
import SVGIcon from "assets/svg/SVGIcon";

const WalletMultiButtonDynamic = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const BalancePanel = dynamic(async () => (await import("./Balance")).default, { ssr: false });

export const Connect = () => {
  const { status, data: session } = useSession();
  const wallet = useWallet();
  const walletModal = useWalletModal();

  const { data: user } = trpc.users.getUserByWallet.useQuery({
    walletId: session?.user.id || "",
  });

  useEffect(() => {
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
        const data = message.prepare();
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

    if (wallet.connected && status === "unauthenticated") {
      handleSignIn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.connected]);

  useEffect(() => {
    if (wallet.disconnecting) {
      signOut({
        callbackUrl: `${window.location.origin}`,
      });
    }
  }, [wallet.disconnecting]);

  return (
    <>
      {status == "unauthenticated" && <WalletMultiButtonDynamic />}
      {status == "authenticated" && (
        <div className="dropdown dropdown-end">
          <div className="flex flex-wrap text-right ">
            <BalancePanel></BalancePanel>
            <div tabIndex={0} className="px-3">
              <div className="text-xs">Hello</div>

              <div className="indicator  text-[#BEA97E]">
                <span
                  className={classNames("badge-error badge badge-xs indicator-item", {
                    "mt-2 hidden": user?.twitterVerified || user?.discordVerified,
                  })}
                ></span>
                <span>{user?.twitterDetails?.username || "Connect"}</span>
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
                  <path d="M22.46 20L16.708 10.9998L11 20H22.46Z" fill="white" />
                </svg>

                <svg
                  className="swap-off"
                  width="34"
                  height="34"
                  viewBox="0 0 34 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="17" cy="17" r="16" stroke="#BEA97E" strokeWidth="2" />
                  <path d="M22.46 14L16.708 23.0002L11 14H22.46Z" fill="white" />
                </svg>
              </label>
            </div>
          </div>
          <ul
            tabIndex={0}
            className="panel dropdown-content menu mt-3 w-60 rounded-2xl p-2 pt-5 text-xs shadow"
          >
            <li>
              <label
                htmlFor="linkSocial"
                onClick={() => {
                  signIn("twitter");
                }}
              >
                <div className={"indicator"}>
                  {user?.twitterDetails?.username || "Link with Twitter"}
                </div>

                <SVGIcon.twitter></SVGIcon.twitter>
                <div className="grid grow place-content-end">
                  <span
                    className={classNames(
                      "badge badge-xs indicator-item mx-auto self-end align-middle",
                      {
                        "badge-success": user?.twitterVerified,
                        "badge-error": !user?.twitterVerified,
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
                  {user?.discordDetails?.username || "Link with Discord"}
                </div>
                <SVGIcon.discord></SVGIcon.discord>
                <div className="grid grow place-content-end">
                  <span
                    className={classNames("badge badge-xs indicator-item", {
                      "badge-success": user?.discordVerified,
                      "badge-error": !user?.discordVerified,
                    })}
                  ></span>
                </div>
              </label>
            </li>
            <li>
              <button
                className="w-full"
                onClick={() => {
                  wallet.disconnect();
                }}
              >
                Sign Out
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
