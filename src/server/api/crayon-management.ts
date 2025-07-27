import { z } from "zod";
import { router, adminProcedure } from "./trpc/trpc-context";
import { TRPCError } from "@trpc/server";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata, createV1, TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import { 
  createInitializeMintInstruction, 
  createMintToInstruction, 
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { 
  Connection, 
  PublicKey, 
  SystemProgram, 
  Transaction,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";
import { createNoopSigner, percentAmount, publicKey, signerIdentity } from "@metaplex-foundation/umi";
import configurationModel from "../database/models/configuration.model";
import { env } from "env/server.mjs";
import logWithTimestamp from "utils/logs";

// Connection for Solana operations
const connection = new Connection(env.NEXT_PUBLIC_RPC_NODE, "confirmed");

interface CrayonTokenState {
  step: 1 | 2 | 3;
  tokenMint?: string;
  tokenAccount?: string;
  metadataUri?: string;
  totalMinted: number;
  createdAt?: string;
  updatedAt?: string;
}

export const crayonManagementRouter = router({
  // Get current crayon token state
  getCrayonState: adminProcedure.query(async () => {
    try {
      const Configuration = configurationModel();
      const config = await Configuration.findOne({ configName: "crayonToken" });
      
      if (!config) {
        // Initialize default state
        const defaultState: CrayonTokenState = {
          step: 1,
          totalMinted: 0,
          createdAt: new Date().toISOString(),
        };
        
        await Configuration.create({
          configName: "crayonToken",
          settings: defaultState,
          totalCrayons: 0
        });
        
        return defaultState;
      }
      
      return config.settings as CrayonTokenState;
    } catch (error) {
      logWithTimestamp(`Error getting crayon state: ${error}`);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get crayon token state",
      });
    }
  }),

  // Step 1: Create transaction for initializing SPL Token with decimal 0
  createInitializeTokenTransaction: adminProcedure
    .input(
      z.object({
        walletPublicKey: z.string(),
        mintKeypair: z.string(), // Base58 encoded keypair for the new mint
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const Configuration = configurationModel();
        const config = await Configuration.findOne({ configName: "crayonToken" });
        const currentState = (config?.settings as CrayonTokenState) || { step: 1, totalMinted: 0 };
        
        if (currentState.step !== 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Token initialization can only be performed in step 1",
          });
        }

        const payer = new PublicKey(input.walletPublicKey);
        const mintKeypair = JSON.parse(input.mintKeypair);
        const mint = new PublicKey(mintKeypair.publicKey);

        // Calculate rent exemption for mint account
        const rentExemption = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

        // Create transaction
        const transaction = new Transaction();

        // Create mint account
        transaction.add(
          SystemProgram.createAccount({
            fromPubkey: payer,
            newAccountPubkey: mint,
            space: MINT_SIZE,
            lamports: rentExemption,
            programId: TOKEN_PROGRAM_ID,
          })
        );

        // Initialize mint
        transaction.add(
          createInitializeMintInstruction(
            mint,
            0, // decimals = 0 for NFT-like tokens
            payer, // mint authority
            payer, // freeze authority
            TOKEN_PROGRAM_ID
          )
        );

        // Get recent blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = payer;

        // Serialize transaction
        const serializedTransaction = transaction.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        });

        logWithTimestamp(`Token initialization transaction created by admin: ${ctx.session.user.walletId} - Mint: ${mint.toBase58()}`);
        
        return {
          success: true,
          transaction: serializedTransaction.toString('base64'),
          mintPublicKey: mint.toBase58(),
          message: "Transaction created for SPL Token initialization",
        };
      } catch (error) {
        logWithTimestamp(`Error creating token initialization transaction: ${error}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to create initialization transaction",
        });
      }
    }),

  // Confirm token initialization after transaction is signed and sent
  confirmTokenInitialization: adminProcedure
    .input(
      z.object({
        signature: z.string(),
        tokenMint: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const Configuration = configurationModel();
        const config = await Configuration.findOne({ configName: "crayonToken" });
        const currentState = (config?.settings as CrayonTokenState) || { step: 1, totalMinted: 0 };
        
        if (currentState.step !== 1) {
          // Check if already completed - this might be a retry
          if (currentState.step > 1 && currentState.tokenMint === input.tokenMint) {
            logWithTimestamp(`Token initialization already confirmed: ${input.tokenMint}`);
            return {
              success: true,
              tokenMint: input.tokenMint,
              message: "SPL Token was already initialized successfully",
              nextStep: 2,
            };
          }
          
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Token initialization can only be confirmed in step 1",
          });
        }

        // Verify transaction was successful with retries
        let txInfo;
        let verificationAttempts = 0;
        const maxVerificationAttempts = 5;
        
        while (verificationAttempts < maxVerificationAttempts) {
          try {
            txInfo = await connection.getTransaction(input.signature, {
              commitment: "confirmed",
              maxSupportedTransactionVersion: 0,
            });
            
            if (txInfo && !txInfo.meta?.err) {
              break; // Success
            }
            
            verificationAttempts++;
            if (verificationAttempts < maxVerificationAttempts) {
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
            }
          } catch (error) {
            verificationAttempts++;
            if (verificationAttempts >= maxVerificationAttempts) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to verify transaction after multiple attempts",
              });
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        
        if (!txInfo || txInfo.meta?.err) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Transaction failed or not found",
          });
        }

        // Update state to step 2
        const newState: CrayonTokenState = {
          ...currentState,
          step: 2,
          tokenMint: input.tokenMint,
          updatedAt: new Date().toISOString(),
        };

        if (config) {
          await Configuration.findOneAndUpdate(
            { configName: "crayonToken" },
            { 
              settings: newState,
              updatedAt: new Date()
            }
          );
        } else {
          await Configuration.create({
            configName: "crayonToken",
            settings: newState,
            totalCrayons: 0
          });
        }

        logWithTimestamp(`SPL Token initialization confirmed by admin: ${ctx.session.user.walletId} - Mint: ${input.tokenMint}`);
        
        return {
          success: true,
          tokenMint: input.tokenMint,
          message: "SPL Token initialized successfully with 0 decimals",
          nextStep: 2,
        };
      } catch (error) {
        logWithTimestamp(`Error confirming token initialization: ${error}`);
        throw error instanceof TRPCError ? error : new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to confirm token initialization",
        });
      }
    }),

  // Step 2: Create transaction for attaching metadata to SPL token
  createMetadataTransaction: adminProcedure
    .input(
      z.object({
        walletPublicKey: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const Configuration = configurationModel();
        const config = await Configuration.findOne({ configName: "crayonToken" });
        const currentState = config?.settings as CrayonTokenState;
        
        if (!currentState || currentState.step !== 2) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Metadata can only be created in step 2. Please initialize token first.",
          });
        }

        if (!currentState.tokenMint) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Token mint not found. Please initialize token first.",
          });
        }

        const userPublicKey = input.walletPublicKey;
        const mintAddress = currentState.tokenMint;
        
        // Use the pre-uploaded Arweave metadata
        const metadataUri = "https://arweave.net/a0Jv6MRQG7Jc3-bnI_p0qsuLm_8_i7x9vF5utUVnLh8";

        // Setup UMI with NoopSigner for server-side transaction building
        const umi = createUmi(env.NEXT_PUBLIC_RPC_NODE)
          .use(mplTokenMetadata());
        
        // Create a noop signer for the user's wallet - this is the key difference!
        const userSigner = createNoopSigner(publicKey(userPublicKey));
        umi.use(signerIdentity(userSigner));

        // Build the metadata creation transaction using createV1
        const transactionBuilder = createV1(umi, {
          mint: publicKey(mintAddress),
          authority: umi.identity,
          payer: umi.identity,
          updateAuthority: umi.identity,
          name: "Crayon Token",
          symbol: "CRAYON",
          uri: metadataUri,
          sellerFeeBasisPoints: percentAmount(0), // 0% royalty for fungible tokens
          tokenStandard: TokenStandard.Fungible,
        });

        // Build with latest blockhash using versioned transactions
        const transaction = await transactionBuilder
          .useV0() // Use versioned transactions for better compatibility
          .buildWithLatestBlockhash(umi);

        // Serialize for transport to frontend
        const serializedTransaction = umi.transactions.serialize(transaction);
        const base64Transaction = Buffer.from(serializedTransaction).toString('base64');

        logWithTimestamp(`Metadata transaction created by admin: ${ctx.session.user.walletId} - Mint: ${mintAddress}`);
        
        return {
          success: true,
          transaction: base64Transaction,
          metadataUri,
          message: "Transaction created for metadata attachment",
        };
      } catch (error) {
        logWithTimestamp(`Error creating metadata transaction: ${error}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to create metadata transaction",
        });
      }
    }),

  // Confirm metadata creation after transaction is signed and sent
  confirmMetadataCreation: adminProcedure
    .input(
      z.object({
        signature: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const Configuration = configurationModel();
        const config = await Configuration.findOne({ configName: "crayonToken" });
        const currentState = config?.settings as CrayonTokenState;
        
        if (!currentState || currentState.step !== 2) {
          // Check if already completed - this might be a retry
          if (currentState && currentState.step > 2) {
            logWithTimestamp(`Metadata creation already confirmed`);
            return {
              success: true,
              metadataUri: currentState.metadataUri,
              message: "Metadata was already created successfully",
              nextStep: 3,
            };
          }
          
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Metadata creation can only be confirmed in step 2",
          });
        }

        // Verify transaction was successful with retries
        let txInfo;
        let verificationAttempts = 0;
        const maxVerificationAttempts = 5;
        
        while (verificationAttempts < maxVerificationAttempts) {
          try {
            txInfo = await connection.getTransaction(input.signature, {
              commitment: "confirmed",
              maxSupportedTransactionVersion: 0,
            });
            
            if (txInfo && !txInfo.meta?.err) {
              break; // Success
            }
            
            verificationAttempts++;
            if (verificationAttempts < maxVerificationAttempts) {
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
            }
          } catch (error) {
            verificationAttempts++;
            if (verificationAttempts >= maxVerificationAttempts) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to verify transaction after multiple attempts",
              });
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        
        if (!txInfo || txInfo.meta?.err) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Transaction failed or not found",
          });
        }

        // Use the pre-uploaded Arweave metadata
        const metadataUri = "https://arweave.net/a0Jv6MRQG7Jc3-bnI_p0qsuLm_8_i7x9vF5utUVnLh8";

        // Update state to step 3
        const newState: CrayonTokenState = {
          ...currentState,
          step: 3,
          metadataUri,
          updatedAt: new Date().toISOString(),
        };

        await Configuration.findOneAndUpdate(
          { configName: "crayonToken" },
          { 
            settings: newState,
            updatedAt: new Date()
          }
        );

        logWithTimestamp(`Metadata creation confirmed by admin: ${ctx.session.user.walletId} - URI: ${metadataUri}`);
        
        return {
          success: true,
          metadataUri,
          message: "Metadata attached to SPL token successfully",
          nextStep: 3,
        };
      } catch (error) {
        logWithTimestamp(`Error confirming metadata creation: ${error}`);
        throw error instanceof TRPCError ? error : new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to confirm metadata creation",
        });
      }
    }),

  // Step 3: Create transaction for minting tokens
  createMintTokensTransaction: adminProcedure
    .input(
      z.object({
        walletPublicKey: z.string(),
        amount: z.number().min(1).max(1000000),
        recipientWallet: z.string().optional(), // If not provided, mint to the wallet
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const Configuration = configurationModel();
        const config = await Configuration.findOne({ configName: "crayonToken" });
        const currentState = config?.settings as CrayonTokenState;
        
        if (!currentState || currentState.step !== 3) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Tokens can only be minted in step 3. Please complete previous steps first.",
          });
        }

        if (!currentState.tokenMint) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Token mint not found. Please complete initialization.",
          });
        }

        const payer = new PublicKey(input.walletPublicKey);
        const mint = new PublicKey(currentState.tokenMint);
        
        // Determine recipient
        const recipient = input.recipientWallet 
          ? new PublicKey(input.recipientWallet)
          : payer;

        // Get associated token account address
        const tokenAccount = await getAssociatedTokenAddress(
          mint,
          recipient
        );

        // Create transaction
        const transaction = new Transaction();

        // Check if token account exists, if not, create it
        try {
          await connection.getAccountInfo(tokenAccount);
        } catch (error) {
          // Account doesn't exist, add create instruction
          transaction.add(
            createAssociatedTokenAccountInstruction(
              payer, // payer
              tokenAccount, // associated token account
              recipient, // owner
              mint, // mint
              TOKEN_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
            )
          );
        }

        // Add mint instruction
        transaction.add(
          createMintToInstruction(
            mint,
            tokenAccount,
            payer, // mint authority (the connected wallet)
            input.amount // amount in base units (decimals = 0)
          )
        );

        // Get recent blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = payer;

        // Serialize transaction
        const serializedTransaction = transaction.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        });

        logWithTimestamp(`Token minting transaction created by admin: ${ctx.session.user.walletId} - Amount: ${input.amount} to ${recipient.toBase58()}`);
        
        return {
          success: true,
          transaction: serializedTransaction.toString('base64'),
          tokenAccount: tokenAccount.toBase58(),
          recipient: recipient.toBase58(),
          amount: input.amount,
          message: "Transaction created for token minting",
        };
      } catch (error) {
        logWithTimestamp(`Error creating mint tokens transaction: ${error}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to create mint transaction",
        });
      }
    }),

  // Confirm token minting after transaction is signed and sent
  confirmTokenMinting: adminProcedure
    .input(
      z.object({
        signature: z.string(),
        amount: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const Configuration = configurationModel();
        const config = await Configuration.findOne({ configName: "crayonToken" });
        const currentState = config?.settings as CrayonTokenState;
        
        if (!currentState || currentState.step !== 3) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Token minting can only be confirmed in step 3",
          });
        }

        // Verify transaction was successful with retries
        let txInfo;
        let verificationAttempts = 0;
        const maxVerificationAttempts = 5;
        
        while (verificationAttempts < maxVerificationAttempts) {
          try {
            txInfo = await connection.getTransaction(input.signature, {
              commitment: "confirmed",
              maxSupportedTransactionVersion: 0,
            });
            
            if (txInfo && !txInfo.meta?.err) {
              break; // Success
            }
            
            verificationAttempts++;
            if (verificationAttempts < maxVerificationAttempts) {
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
            }
          } catch (error) {
            verificationAttempts++;
            if (verificationAttempts >= maxVerificationAttempts) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to verify transaction after multiple attempts",
              });
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        
        if (!txInfo || txInfo.meta?.err) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Transaction failed or not found",
          });
        }

        // Update total minted
        const newState: CrayonTokenState = {
          ...currentState,
          totalMinted: currentState.totalMinted + input.amount,
          updatedAt: new Date().toISOString(),
        };

        await Configuration.findOneAndUpdate(
          { configName: "crayonToken" },
          { 
            settings: newState,
            totalCrayons: newState.totalMinted,
            updatedAt: new Date()
          }
        );

        logWithTimestamp(`Token minting confirmed by admin: ${ctx.session.user.walletId} - Amount: ${input.amount}`);
        
        return {
          success: true,
          amount: input.amount,
          totalMinted: newState.totalMinted,
          message: `Successfully minted ${input.amount} tokens`,
        };
      } catch (error) {
        logWithTimestamp(`Error confirming token minting: ${error}`);
        throw error instanceof TRPCError ? error : new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to confirm token minting",
        });
      }
    }),

  // Reset the entire process (admin only, for testing)
  resetCrayonProcess: adminProcedure.mutation(async ({ ctx }) => {
    try {
      const Configuration = configurationModel();
      
      const resetState: CrayonTokenState = {
        step: 1,
        totalMinted: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await Configuration.findOneAndUpdate(
        { configName: "crayonToken" },
        { 
          settings: resetState,
          totalCrayons: 0,
          updatedAt: new Date()
        },
        { upsert: true }
      );

      logWithTimestamp(`Crayon process reset by admin: ${ctx.session.user.walletId}`);
      
      return {
        success: true,
        message: "Crayon token process has been reset to step 1",
      };
    } catch (error) {
      logWithTimestamp(`Error resetting crayon process: ${error}`);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to reset crayon process",
      });
    }
  }),
});