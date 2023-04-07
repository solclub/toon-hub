import { Metaplex, bundlrStorage, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { env } from "env/server.mjs";

const updateAutorityKeyPair = Keypair.fromSecretKey(bs58.decode(env.UPDATE_AUTHORITY_KEYPAIR));
export const connection = new Connection(env.NEXT_PUBLIC_RPC_NODE, "confirmed");

export const metaplex = new Metaplex(connection);
export const metaplexWithAuthority = Metaplex.make(connection)
  .use(keypairIdentity(updateAutorityKeyPair))
  .use(
    bundlrStorage()
    //     {
    //     address: 'https://devnet.bundlr.network',
    //     providerUrl: 'https://api.devnet.solana.com',
    //     timeout: 60000,
    // }
  );
