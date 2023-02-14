import React from "react";
import dynamic from "next/dynamic";
// import { signIn, signOut, useSession } from "next-auth/react";
// import { trpc } from "../utils/trpc";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export const Connect = () => {
  return (
    <div>
      <WalletMultiButtonDynamic />
    </div>
  );
};
