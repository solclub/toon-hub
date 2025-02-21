import type { WalletProviderProps } from "@solana/wallet-adapter-react";
import { WalletProvider } from "@solana/wallet-adapter-react";

import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { BackpackWalletAdapter } from "@solana/wallet-adapter-backpack";
import { GlowWalletAdapter } from "@solana/wallet-adapter-glow";

import { useMemo } from "react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

export function ClientWalletProvider(props: Omit<WalletProviderProps, "wallets">): JSX.Element {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new BackpackWalletAdapter(),
      new SolflareWalletAdapter(),
      new GlowWalletAdapter(),
    ],
    []
  );

  return (
    <WalletProvider wallets={wallets} {...props}>
      <WalletModalProvider {...props} />
    </WalletProvider>
  );
}

export default ClientWalletProvider;
