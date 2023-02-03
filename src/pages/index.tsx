import { type NextPage } from "next";
import Head from "next/head";
// import { signIn, signOut, useSession } from "next-auth/react";

// import { trpc } from "../utils/trpc";
import dynamic from "next/dynamic";

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

const Home: NextPage = () => {
  // const hello = trpc.example.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <Head>
        <title>Rude Dashboard</title>
        <meta name="description" content="Rude Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-gray-800 w-screen h-screen">
        <h1 className="text-4xl font-bold text-white">RUDE DASHBOARD</h1>
        <WalletMultiButtonDynamic/>
      </main>
    </>
  );
};

export default Home;
