import { Connection } from "@solana/web3.js";
import { env } from "env/client.mjs";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

export const connection = new Connection(env.NEXT_PUBLIC_RPC_NODE, "confirmed");
export const umi = createUmi(env.NEXT_PUBLIC_RPC_NODE).use(mplTokenMetadata());
