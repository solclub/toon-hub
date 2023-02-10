import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { trpc } from "../utils/trpc";
import { ConnectionProvider } from "@solana/wallet-adapter-react";

import "@solana/wallet-adapter-react-ui/styles.css";
import "../styles/globals.scss";

import ClientWalletProvider from "../contexts/ClientWalletProvider";
import { useMemo } from "react";
import "react-toastify/dist/ReactToastify.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_RPC_NODE || "", []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <ClientWalletProvider>
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      </ClientWalletProvider>
    </ConnectionProvider>
  );
};

export default trpc.withTRPC(MyApp);
