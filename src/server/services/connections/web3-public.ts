import { Metaplex } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";
import { env } from "env/client.mjs";

export const connection = new Connection(env.NEXT_PUBLIC_RPC_NODE, "confirmed");
export const metaplex = new Metaplex(connection);
