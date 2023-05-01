import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import "@solana/wallet-adapter-react-ui/styles.css";
import ClientWalletProvider from "../contexts/ClientWalletProvider";
import { useMemo } from "react";
import "react-toastify/dist/ReactToastify.css";
import Layout from "../components/Layout";
import "../styles/globals.scss";
import "../styles/styles.scss";
import { NFTManagerProvider } from "contexts/NFTManagerContext";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_RPC_NODE || "", []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <ClientWalletProvider autoConnect>
        <SessionProvider session={session} refetchInterval={0}>
          <Layout>
            <NFTManagerProvider>
              <Component {...pageProps} />
            </NFTManagerProvider>
          </Layout>
        </SessionProvider>
      </ClientWalletProvider>
    </ConnectionProvider>
  );
};

export default trpc.withTRPC(MyApp);
