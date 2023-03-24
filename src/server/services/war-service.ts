/* eslint-disable @typescript-eslint/no-explicit-any */
import { PublicKey, Keypair } from "@solana/web3.js";
import type { Idl } from "@project-serum/anchor";
import { Program, AnchorProvider } from "@project-serum/anchor";
import warIdl from "idl/rudegolems_war.json";
import { connection } from "./onchain-service";
import bs58 from "bs58";
import { env } from "env/server.mjs";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";

const PayerKeyPair = Keypair.fromSecretKey(bs58.decode(env.ANCHOR_WALLET_KEYPAIR));

const WAR_PROGRAM_ID = new PublicKey(env.WAR_PROGRAM_ID);

// const TRAINING_SEED = Buffer.from(utils.bytes.utf8.encode("rude-training"));

const Provider = new AnchorProvider(
  connection,
  new NodeWallet(PayerKeyPair),
  AnchorProvider.defaultOptions()
);

const WarProgram = new Program(warIdl as Idl, WAR_PROGRAM_ID, Provider);

// export const getUserPDAKey = async (wallet: string) => {
//   const warProgramSettings = await getProgramSettings();
//   const userMemberAccount = await getMemberAccount(wallet);

//   if (warProgramSettings && userMemberAccount) {
//     const [player1pda] = await PublicKey.findProgramAddress(
//       [TRAINING_SEED, warProgramSettings.key.toBuffer(), userMemberAccount.key.toBuffer()],
//       WAR_PROGRAM_ID
//     );
//     return player1pda.toString();
//   } else {
//     return null;
//   }
// };

interface AccountSettings {
  key: PublicKey;
  [propName: string]: any;
}

const getProgramSettings = async (): Promise<AccountSettings | null> => {
  const { warSettingsAccount } = WarProgram?.account ?? {};

  if (!warSettingsAccount) {
    return null;
  }

  const [warInstance] = await warSettingsAccount.all([]);

  if (!warInstance) {
    return null;
  }

  return {
    key: warInstance.publicKey,
    ...warInstance.account,
  };
};

const getMemberAccount = async (wallet: string): Promise<AccountSettings | null> => {
  const walletPubkey = new PublicKey(wallet);
  const { memberAccount } = WarProgram?.account ?? {};
  if (!memberAccount) {
    return null;
  }
  const [memberAccountInstance] = await memberAccount.all([
    {
      memcmp: {
        offset: 8,
        bytes: walletPubkey.toBase58(),
      },
    },
  ]);

  if (!memberAccountInstance) {
    return null;
  }

  return {
    key: memberAccountInstance.publicKey,
    ...memberAccountInstance.account,
  };
};

export const getInTrainingNfts = async (wallet: string): Promise<AccountSettings[] | null> => {
  const walletPubkey = new PublicKey(wallet);
  const { trainingAccount } = WarProgram?.account ?? {};

  if (!trainingAccount) {
    console.log("TrainingAccount", WarProgram);
    return null;
  }

  const trainingAccountInstances = await trainingAccount.all([
    {
      memcmp: {
        offset: 8,
        bytes: walletPubkey.toBase58(),
      },
    },
  ]);

  const taccounts = trainingAccountInstances.map(({ publicKey, account }) => ({
    key: publicKey,
    ...account,
  }));
  return taccounts;
};
