import { useState } from "react";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Keypair, Transaction, VersionedTransaction } from "@solana/web3.js";
import Panel from "../../../components/common/Panel";
import MainButton from "../../../components/common/MainButton";
import Link from "next/link";
import { trpc } from "utils/trpc";
import { toast } from "react-toastify";

const CrayonManagement: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Form state for minting step

  const [mintForm, setMintForm] = useState({
    amount: 1000,
    recipientWallet: "",
  });

  const { publicKey, signTransaction } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  // tRPC queries and mutations
  const {
    data: crayonState,
    refetch: refetchState,
    isLoading,
  } = trpc.crayonManagement.getCrayonState.useQuery();
  const createInitTxMutation = trpc.crayonManagement.createInitializeTokenTransaction.useMutation();
  const confirmInitMutation = trpc.crayonManagement.confirmTokenInitialization.useMutation();
  const createMetadataTxMutation = trpc.crayonManagement.createMetadataTransaction.useMutation();
  const confirmMetadataMutation = trpc.crayonManagement.confirmMetadataCreation.useMutation();
  const createMintTxMutation = trpc.crayonManagement.createMintTokensTransaction.useMutation();
  const confirmMintMutation = trpc.crayonManagement.confirmTokenMinting.useMutation();
  const resetProcessMutation = trpc.crayonManagement.resetCrayonProcess.useMutation();

  // Auth check
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-[#ffe75c]"></div>
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    router.push("/admin");
    return null;
  }

  const handleInitializeToken = async () => {
    if (!publicKey || !signTransaction) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsProcessing(true);
      
      // Generate a new keypair for the mint
      const mintKeypair = Keypair.generate();
      
      // Create the transaction
      const result = await createInitTxMutation.mutateAsync({
        walletPublicKey: publicKey.toBase58(),
        mintKeypair: JSON.stringify({
          publicKey: mintKeypair.publicKey.toBase58(),
          secretKey: Array.from(mintKeypair.secretKey),
        }),
      });

      // Deserialize and sign the transaction
      const transaction = Transaction.from(Buffer.from(result.transaction, 'base64'));
      
      // Add the mint keypair as a signer
      transaction.partialSign(mintKeypair);
      
      // Sign with wallet
      const signedTransaction = await signTransaction(transaction);
      
      // Send the transaction
      const { Connection } = await import("@solana/web3.js");
      const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_NODE || "https://api.devnet.solana.com";
      const connection = new Connection(rpcEndpoint, "confirmed");
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Wait for confirmation with timeout
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      }, "confirmed");
      
      // Add a small delay to ensure transaction is fully confirmed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Confirm initialization - retry on session errors
      let confirmationSuccess = false;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (!confirmationSuccess && retryCount < maxRetries) {
        try {
          await confirmInitMutation.mutateAsync({
            signature,
            tokenMint: result.mintPublicKey,
          });
          confirmationSuccess = true;
        } catch (confirmError) {
          retryCount++;
          console.warn(`Confirmation attempt ${retryCount} failed:`, confirmError);
          
          if (retryCount < maxRetries) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            // Final attempt failed, but transaction was successful
            console.error("Final confirmation attempt failed:", confirmError);
            toast.warning(`Token initialized successfully (signature: ${signature.slice(0, 8)}...), but failed to update database. Please refresh the page.`);
            return;
          }
        }
      }
      
      toast.success("SPL Token initialized successfully!");
      refetchState();
    } catch (error) {
      console.error("Token initialization error:", error);
      if (error instanceof Error && error.message.includes("User rejected")) {
        toast.error("Transaction cancelled by user");
      } else {
        toast.error("Failed to initialize token");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateMetadata = async () => {
    if (!publicKey || !signTransaction) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create the metadata transaction
      const result = await createMetadataTxMutation.mutateAsync({
        walletPublicKey: publicKey.toBase58(),
      });

      // Deserialize the transaction
      const serializedTransaction = Buffer.from(result.transaction, 'base64');
      
      // Convert to VersionedTransaction and sign
      const versionedTransaction = VersionedTransaction.deserialize(serializedTransaction);
      const signedTransaction = await signTransaction(versionedTransaction);
      
      // Send the transaction
      const { Connection } = await import("@solana/web3.js");
      const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_NODE || "https://api.devnet.solana.com";
      const connection = new Connection(rpcEndpoint, "confirmed");
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Wait for confirmation with timeout
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      }, "confirmed");
      
      // Add a small delay to ensure transaction is fully confirmed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Confirm metadata creation - retry on session errors
      let confirmationSuccess = false;
      let retryCount = 0;
      const maxRetries = 5;
      
      while (!confirmationSuccess && retryCount < maxRetries) {
        try {
          await confirmMetadataMutation.mutateAsync({
            signature,
          });
          confirmationSuccess = true;
        } catch (confirmError) {
          retryCount++;
          console.warn(`Confirmation attempt ${retryCount} failed:`, confirmError);
          
          // Check if it's a NextAuth session error
          const isSessionError = confirmError instanceof Error && 
            (confirmError.message.includes("CLIENT_FETCH_ERROR") || 
             confirmError.message.includes("<!DOCTYPE") ||
             confirmError.message.includes("CSRF"));
          
          if (retryCount < maxRetries && isSessionError) {
            // For session errors, wait longer and try to refresh session
            console.log(`Detected session error, waiting longer before retry ${retryCount}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, 3000 + (retryCount * 1000)));
            
            // Try to refresh the session by refetching
            try {
              await refetchState();
            } catch (refreshError) {
              console.warn("Failed to refresh session:", refreshError);
            }
          } else if (retryCount < maxRetries) {
            // For other errors, shorter wait
            await new Promise(resolve => setTimeout(resolve, 1500));
          } else {
            // Final attempt failed, but transaction was successful
            console.error("Final confirmation attempt failed:", confirmError);
            
            if (isSessionError) {
              toast.warning(
                <div>
                  <div>Metadata attached successfully! Transaction confirmed: {signature.slice(0, 8)}...</div>
                  <div className="mt-2">
                    <a 
                      href={`https://solscan.io/tx/${signature}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      View transaction on Solscan
                    </a>
                  </div>
                  <div className="text-sm mt-1">Session issue updating database. Please refresh the page.</div>
                </div>
              );
            } else {
              toast.warning(
                <div>
                  <div>Metadata created successfully: {signature.slice(0, 8)}...</div>
                  <div className="mt-2">
                    <a 
                      href={`https://solscan.io/tx/${signature}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      View transaction on Solscan
                    </a>
                  </div>
                  <div className="text-sm mt-1">Failed to update database. Please refresh the page.</div>
                </div>
              );
            }
            return;
          }
        }
      }
      
      toast.success(`Metadata attached to SPL token successfully! Transaction: ${signature.slice(0, 8)}...`);
      refetchState();
    } catch (error) {
      console.error("Metadata creation error:", error);
      if (error instanceof Error && error.message.includes("User rejected")) {
        toast.error("Transaction cancelled by user");
      } else {
        toast.error("Failed to create metadata");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMintTokens = async () => {
    if (!publicKey || !signTransaction) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create the mint transaction
      const result = await createMintTxMutation.mutateAsync({
        walletPublicKey: publicKey.toBase58(),
        amount: mintForm.amount,
        recipientWallet: mintForm.recipientWallet || undefined,
      });

      // Deserialize and sign the transaction
      const transaction = Transaction.from(Buffer.from(result.transaction, 'base64'));
      const signedTransaction = await signTransaction(transaction);
      
      // Send the transaction
      const { Connection } = await import("@solana/web3.js");
      const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_NODE || "https://api.devnet.solana.com";
      const connection = new Connection(rpcEndpoint, "confirmed");
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Wait for confirmation with timeout
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      }, "confirmed");
      
      // Add a small delay to ensure transaction is fully confirmed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Confirm minting - retry on session errors
      let confirmationSuccess = false;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (!confirmationSuccess && retryCount < maxRetries) {
        try {
          await confirmMintMutation.mutateAsync({
            signature,
            amount: mintForm.amount,
          });
          confirmationSuccess = true;
        } catch (confirmError) {
          retryCount++;
          console.warn(`Confirmation attempt ${retryCount} failed:`, confirmError);
          
          if (retryCount < maxRetries) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            // Final attempt failed, but transaction was successful
            console.error("Final confirmation attempt failed:", confirmError);
            toast.warning(`Tokens minted successfully (signature: ${signature.slice(0, 8)}...), but failed to update database. Please refresh the page.`);
            return;
          }
        }
      }
      
      toast.success(`Successfully minted ${mintForm.amount} tokens!`);
      refetchState();
      // Reset mint form
      setMintForm({ amount: 1000, recipientWallet: "" });
    } catch (error) {
      console.error("Token minting error:", error);
      if (error instanceof Error && error.message.includes("User rejected")) {
        toast.error("Transaction cancelled by user");
      } else {
        toast.error("Failed to mint tokens");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetProcess = async () => {
    if (
      !confirm(
        "Are you sure you want to reset the entire crayon token process? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      const result = await resetProcessMutation.mutateAsync();
      toast.success(result.message);
      refetchState();
    } catch (error) {
      toast.error("Failed to reset process");
    }
  };


  if (isLoading || !crayonState) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-[#ffe75c]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin" className="text-[#ffe75c] hover:text-yellow-400">
          ← Back to Admin Dashboard
        </Link>
      </div>

      <Panel>
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-bold text-[#ffe75c]">Crayon Token Management</h1>
            <div className="flex items-center gap-4">
              <WalletMultiButton className="!bg-[#ffe75c] !text-black hover:!bg-yellow-400" />
              <MainButton
                color="red"
                onClick={handleResetProcess}
                disabled={resetProcessMutation.isLoading}
                className="text-sm"
              >
                {resetProcessMutation.isLoading ? "Resetting..." : "Reset Process"}
              </MainButton>
            </div>
          </div>

          {/* Wallet Connection Notice */}
          {!publicKey && (
            <div className="mb-6 rounded-lg border border-yellow-500 bg-yellow-900/20 p-4">
              <p className="text-yellow-400">
                ⚠️ Please connect your Solana wallet to create and mint tokens. The connected wallet will be the mint authority.
              </p>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full font-bold text-white ${
                      step < crayonState.step
                        ? "bg-green-500"
                        : step === crayonState.step
                        ? "bg-[#ffe75c] text-black"
                        : "bg-gray-600"
                    }`}
                  >
                    {step < crayonState.step ? "✓" : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`h-1 w-16 ${
                        step < crayonState.step ? "bg-green-500" : "bg-gray-600"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between text-sm text-gray-400">
              <span>Initialize Token</span>
              <span>Attach Metadata</span>
              <span>Mint Tokens</span>
            </div>
          </div>

          {/* Current State Info */}
          <div className="mb-8 rounded-lg border border-gray-600 bg-gray-800 p-4">
            <h3 className="mb-2 text-lg font-bold text-[#ffe75c]">Current State</h3>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div>
                <span className="text-gray-400">Current Step:</span>
                <span className="ml-2 text-white">{crayonState.step}/3</span>
              </div>
              <div>
                <span className="text-gray-400">Total Minted:</span>
                <span className="ml-2 text-white">{crayonState.totalMinted} tokens</span>
              </div>
              {crayonState.tokenMint && (
                <div className="md:col-span-2">
                  <span className="text-gray-400">Token Mint:</span>
                  <span className="ml-2 break-all font-mono text-xs text-white">
                    {crayonState.tokenMint}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Step 1: Initialize Token */}
          <div className="mb-8">
            <div
              className={`rounded-lg border p-6 ${
                crayonState.step === 1
                  ? "border-[#ffe75c] bg-yellow-900/20"
                  : crayonState.step > 1
                  ? "border-green-500 bg-green-900/20"
                  : "border-gray-600 bg-gray-800"
              }`}
            >
              <h2 className="mb-4 text-2xl font-bold text-white">Step 1: Initialize SPL Token</h2>
              <p className="mb-4 text-gray-300">
                Create a new SPL token with 0 decimals for NFT-like behavior.
              </p>

              {crayonState.step === 1 ? (
                <MainButton
                  color="yellow"
                  onClick={handleInitializeToken}
                  disabled={!publicKey || isProcessing || createInitTxMutation.isLoading || confirmInitMutation.isLoading}
                >
                  {isProcessing ? "Creating Transaction..." : createInitTxMutation.isLoading ? "Preparing..." : confirmInitMutation.isLoading ? "Confirming..." : "Initialize Token"}
                </MainButton>
              ) : crayonState.step > 1 ? (
                <div className="flex items-center text-green-400">
                  <span className="mr-2">✓</span>
                  <span>Token initialized successfully</span>
                </div>
              ) : (
                <div className="text-gray-500">Complete previous steps first</div>
              )}
            </div>
          </div>

          {/* Step 2: Use Arweave Metadata */}
          <div className="mb-8">
            <div
              className={`rounded-lg border p-6 ${
                crayonState.step === 2
                  ? "border-[#ffe75c] bg-yellow-900/20"
                  : crayonState.step > 2
                  ? "border-green-500 bg-green-900/20"
                  : "border-gray-600 bg-gray-800"
              }`}
            >
              <h2 className="mb-4 text-2xl font-bold text-white">Step 2: Attach Metadata to SPL Token</h2>
              <p className="mb-4 text-gray-300">
                Create and attach metadata to your SPL token using Metaplex. This will make your token visible in wallets and explorers.
              </p>

              {crayonState.step === 2 ? (
                <div className="space-y-4">
                  {/* Metadata Preview */}
                  <div className="rounded-lg border border-gray-600 bg-gray-800 p-4">
                    <h3 className="mb-3 text-lg font-bold text-[#ffe75c]">Metadata Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Name:</span>
                        <span className="text-white">Crayon Token</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Symbol:</span>
                        <span className="text-white">CRAYON</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Metadata URI:</span>
                        <a 
                          href="https://arweave.net/a0Jv6MRQG7Jc3-bnI_p0qsuLm_8_i7x9vF5utUVnLh8"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 break-all text-xs"
                        >
                          https://arweave.net/a0Jv6MRQG7Jc3-bnI_p0qsuLm_8_i7x9vF5utUVnLh8
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Storage:</span>
                        <span className="text-green-400">Arweave (Permanent)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Royalties:</span>
                        <span className="text-white">0%</span>
                      </div>
                    </div>
                  </div>

                  <MainButton
                    color="yellow"
                    onClick={handleCreateMetadata}
                    disabled={!publicKey || isProcessing || createMetadataTxMutation.isLoading || confirmMetadataMutation.isLoading}
                  >
                    {isProcessing ? "Creating Transaction..." : createMetadataTxMutation.isLoading ? "Preparing..." : confirmMetadataMutation.isLoading ? "Confirming..." : "Attach Metadata"}
                  </MainButton>
                </div>
              ) : crayonState.step > 2 ? (
                <div className="space-y-2">
                  <div className="flex items-center text-green-400">
                    <span className="mr-2">✓</span>
                    <span>Metadata attached to SPL token successfully</span>
                  </div>
                  {crayonState.metadataUri && (
                    <div className="text-xs text-gray-400">
                      <span>URI: </span>
                      <a 
                        href={crayonState.metadataUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {crayonState.metadataUri}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">Complete previous steps first</div>
              )}
            </div>
          </div>

          {/* Step 3: Mint Tokens */}
          <div className="mb-8">
            <div
              className={`rounded-lg border p-6 ${
                crayonState.step === 3
                  ? "border-[#ffe75c] bg-yellow-900/20"
                  : "border-gray-600 bg-gray-800"
              }`}
            >
              <h2 className="mb-4 text-2xl font-bold text-white">Step 3: Mint Tokens</h2>
              <p className="mb-4 text-gray-300">
                Mint crayon tokens to specified wallet addresses. Leave recipient empty to mint to
                server wallet.
              </p>

              {crayonState.step === 3 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-white">Amount to Mint</label>
                      <input
                        type="number"
                        value={mintForm.amount}
                        onChange={(e) =>
                          setMintForm({ ...mintForm, amount: parseInt(e.target.value) || 1 })
                        }
                        className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
                        min="1"
                        max="1000000"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-white">Recipient Wallet (optional)</label>
                      <input
                        type="text"
                        value={mintForm.recipientWallet}
                        onChange={(e) =>
                          setMintForm({ ...mintForm, recipientWallet: e.target.value })
                        }
                        className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
                        placeholder="Leave empty for server wallet"
                      />
                    </div>
                  </div>

                  <MainButton
                    color="yellow"
                    onClick={handleMintTokens}
                    disabled={!publicKey || isProcessing || createMintTxMutation.isLoading || confirmMintMutation.isLoading || mintForm.amount < 1}
                  >
                    {isProcessing ? "Creating Transaction..." : createMintTxMutation.isLoading ? "Preparing..." : confirmMintMutation.isLoading ? "Confirming..." : `Mint ${mintForm.amount} Tokens`}
                  </MainButton>
                </div>
              ) : (
                <div className="text-gray-500">Complete previous steps first</div>
              )}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
};

export default CrayonManagement;
