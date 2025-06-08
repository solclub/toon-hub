import ToonCard from "components/common/ToonCard";
import React, { useMemo, useState } from "react";
import styled from "styled-components";
import bgImageUrl from "../assets/images/toon-of-ladder/card-bg.png";
import RegisteredUserIcon from "../assets/images/toon-of-ladder/registeredUserIcon.svg";
import ParticipantsIcon from "../assets/images/toon-of-ladder/participantsIcon.svg";
import PointIcon from "../assets/images/toon-of-ladder/pointIcon.svg";
import Image from "next/image";
import MainButton, { ButtonContainer, ButtonMixin } from "components/common/MainButton";
import { ClippedToonCard, Rank } from "components/toon-of-ladder/WinnerCard";
import { Table, type TableProps, type TableColumnsType } from "antd";
import { X } from "lucide-react";
import { trpc } from "utils/trpc";
import Notification from "components/toon-of-ladder/Notification";
import { useSession } from "next-auth/react";
import { useWallet } from "@solana/wallet-adapter-react";
import Loader from "components/common/Loader";
import type { RudeNFT } from "server/database/models/nft.model";
import { createPaymentTransaction } from "utils/payment-transactions";
import { Connection } from "@solana/web3.js";
import { env } from "env/client.mjs";
import { showPromisedToast } from "utils/toast-utils";
import { useRef } from "react";
import type { Id } from "react-toastify";

interface DataType {
  rank: number;
  userWallet: string;
  totalWins: number;
  totalPowerDealt: number;
  bestCharacter: string;
  lastBattle: Date;
}

interface Character extends RudeNFT {
  status: "idle" | "success" | "failure" | "attacking" | "loading";
  isSelected: boolean;
}

interface NotificationState {
  message: string;
  isSuccess: boolean;
}

const ToonOfLadderPage = () => {
  const { data: session } = useSession();
  const wallet = useWallet();
  const { connected } = wallet;
  const connection = new Connection(env.NEXT_PUBLIC_RPC_NODE, "confirmed");
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [attackAnimation, setAttackAnimation] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [currentAttackingIndex, setCurrentAttackingIndex] = useState<number>(-1);
  const [isSimpleFightMode, setIsSimpleFightMode] = useState(false);
  const toastId = useRef<Id>(0);

  console.log("session", session);
  // Fetch user's NFTs
  const { data: userNFTs, isLoading: nftsLoading } = trpc.nfts.getUserNFTs.useQuery(
    { collection: "ALL" },
    { enabled: !!session?.user?.walletId }
  );

  // Fetch current active game
  const {
    data: gameData,
    isLoading: gameLoading,
    error: gameError,
    refetch: refetchGame,
  } = trpc.conquest.getCurrentActiveGame.useQuery();

  // Fetch user battle stats
  const { data: userStats, refetch: refetchUserStats } = trpc.conquest.getUserBattleStats.useQuery(
    undefined,
    { enabled: !!session?.user?.walletId }
  );

  // Fetch game leaderboard
  const { data: leaderboard, refetch: refetchLeaderboard } =
    trpc.conquest.getGameLeaderboard.useQuery({ limit: 20 });

  // Attack mutation
  const attackMutation = trpc.conquest.attackEnemy.useMutation({
    onSuccess: async (result) => {
      // Show success toast
      showPromisedToast(
        toastId,
        `Attack complete! ${result.totalDamageDealt} damage dealt`,
        true,
        "SUCCESS"
      );

      setAttackAnimation(true);
      await Promise.all([refetchGame(), refetchUserStats(), refetchLeaderboard()]);
      setAttackAnimation(false);

      setCombatLog((prevLog) => [...result.combatLog, ...prevLog].slice(0, 10));

      if (isSimpleFightMode) {
        // Handle simple fight mode progression
        setSelectedCharacters((prev) =>
          prev.map((char, index) => {
            const outcome = result.battleOutcomes.find((r) => r.characterMint === char.mint);
            if (outcome) {
              return { ...char, status: outcome.success ? "success" : "failure" };
            } else if (index === currentAttackingIndex + 1) {
              // Set next character as attacking
              return { ...char, status: "attacking" };
            }
            return char;
          })
        );

        // Move to next character or end simple fight mode
        if (currentAttackingIndex + 1 < selectedCharacters.length) {
          setCurrentAttackingIndex(currentAttackingIndex + 1);
        } else {
          setIsSimpleFightMode(false);
          setCurrentAttackingIndex(-1);
        }
      } else {
        // Handle bulk attack mode
        setSelectedCharacters((prev) =>
          prev.map((char) => {
            const outcome = result.battleOutcomes.find((r) => r.characterMint === char.mint);
            if (outcome) {
              return { ...char, status: outcome.success ? "success" : "failure" };
            }
            return char;
          })
        );
      }

      if (result.totalDamageDealt > 0) {
        setNotification({
          message: `${result.totalDamageDealt} Dmg (${result.totalPowerDealt} Power)`,
          isSuccess: true,
        });
      } else {
        setNotification({
          message: `Attack failed!`,
          isSuccess: false,
        });
      }

      if (result.gameEnded) {
        showPromisedToast(toastId, "🎉 Enemy Defeated! Victory!", true, "SUCCESS");
        setNotification({
          message: "🎉 Enemy Defeated! Victory!",
          isSuccess: true,
        });
        setIsSimpleFightMode(false);
        setCurrentAttackingIndex(-1);
      }
    },
    onError: (error) => {
      showPromisedToast(toastId, `Attack failed: ${error.message}`, true, "ERROR");

      setNotification({
        message: `Error: ${error.message}`,
        isSuccess: false,
      });

      if (isSimpleFightMode) {
        // On error, mark current attacking character as failed and continue
        setSelectedCharacters((prev) =>
          prev.map((char, index) => {
            if (index === currentAttackingIndex) {
              return { ...char, status: "failure" };
            } else if (index === currentAttackingIndex + 1) {
              return { ...char, status: "attacking" };
            }
            return char;
          })
        );

        if (currentAttackingIndex + 1 < selectedCharacters.length) {
          setCurrentAttackingIndex(currentAttackingIndex + 1);
        } else {
          setIsSimpleFightMode(false);
          setCurrentAttackingIndex(-1);
        }
      }
    },
  });

  // Transform user NFTs to character format
  const allCharacters: Character[] = useMemo(() => {
    if (!userNFTs || userNFTs.length === 0) return [];

    return userNFTs.map((nft) => ({
      ...nft,
      status: "idle" as const,
      isSelected: false,
    }));
  }, [userNFTs]);

  // Leaderboard table columns - moved before early returns
  const columns: TableColumnsType<DataType> = useMemo(
    () => [
      {
        title: "Rank",
        key: "rank",
        dataIndex: "rank",
        render: (value: number) => (
          <Rank className="rank h-10 w-10 text-base filter-none">{value}</Rank>
        ),
      },
      {
        title: "Wallet",
        key: "userWallet",
        dataIndex: "userWallet",
        render: (value: string) => (
          <div className="flex items-center gap-4">
            <ClippedToonCard className="w-14" bgImageUrl={bgImageUrl} />
            <div className="flex flex-col">
              <span className="font-mono text-sm">
                {value.slice(0, 4)}...{value.slice(-4)}
              </span>
            </div>
          </div>
        ),
      },
      {
        title: "Total Wins",
        key: "totalWins",
        dataIndex: "totalWins",
      },
      {
        title: "Power Dealt",
        key: "totalPowerDealt",
        dataIndex: "totalPowerDealt",
        render: (value: number) => (
          <div className="flex items-center gap-2">
            <PointIcon />
            <span>{value.toLocaleString()}</span>
          </div>
        ),
      },
      {
        title: "Best Character",
        key: "bestCharacter",
        dataIndex: "bestCharacter",
      },
    ],
    []
  );

  const toggleCharacter = (mint: string) => {
    setSelectedCharacters((prev) => {
      const isAlreadySelected = prev.find((char) => char.mint === mint);

      if (isAlreadySelected) {
        return prev.filter((char) => char.mint !== mint);
      } else {
        const character = allCharacters.find((char) => char.mint === mint);
        if (character) {
          return [...prev, { ...character, isSelected: true }];
        }
      }
      return prev;
    });
  };

  const selectAll = () => {
    setSelectedCharacters(allCharacters.map((char) => ({ ...char, isSelected: true })));
  };

  const unselectAll = () => {
    setSelectedCharacters([]);
  };

  const handleSimpleFight = () => {
    if (!gameData?.enemy || selectedCharacters.length === 0 || attackMutation.isLoading) return;

    setIsSimpleFightMode(true);
    setCurrentAttackingIndex(0);

    // Set first character as attacking
    setSelectedCharacters((prev) =>
      prev.map((char, index) => ({
        ...char,
        status: index === 0 ? "attacking" : "idle",
      }))
    );
  };

  const attackCurrentUnit = async () => {
    if (
      !gameData?.enemy ||
      currentAttackingIndex === -1 ||
      attackMutation.isLoading ||
      !wallet.publicKey ||
      !wallet.signTransaction
    )
      return;

    const currentCharacter = selectedCharacters[currentAttackingIndex];
    if (!currentCharacter) return;

    try {
      // Show initial toast
      showPromisedToast(toastId, "Creating payment transaction...", false);

      // Create payment transaction for simple fight (100 RUDE)
      const { transaction } = await createPaymentTransaction({
        userWallet: wallet.publicKey,
        isBulkAttack: false,
        connection,
      });

      // Set current attacking unit to loading status
      setSelectedCharacters((prev) =>
        prev.map((char, index) => ({
          ...char,
          status: index === currentAttackingIndex ? "loading" : char.status,
        }))
      );

      // Update toast for signing
      showPromisedToast(toastId, "Please sign the transaction (100 RUDE)...", true);

      // Sign and serialize the transaction
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey!;
      
      const signedTransaction = await wallet.signTransaction!(transaction);
      const serializedTransaction = signedTransaction.serialize().toString('base64');

      // Update toast for processing
      showPromisedToast(toastId, "Processing attack...", true);

      attackMutation.mutate({
        enemyId: gameData.enemy._id.toString(),
        characterMints: [currentCharacter.mint],
        isBulkAttack: false,
        serializedTransaction,
      });
    } catch (error) {
      showPromisedToast(
        toastId,
        `Payment failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        true,
        "ERROR"
      );

      setNotification({
        message: `Payment failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        isSuccess: false,
      });

      // Reset loading state on error
      setSelectedCharacters((prev) =>
        prev.map((char, index) => ({
          ...char,
          status: index === currentAttackingIndex ? "idle" : char.status,
        }))
      );
    }
  };

  const handleBulkAttack = async () => {
    if (
      !gameData?.enemy ||
      selectedCharacters.length === 0 ||
      attackMutation.isLoading ||
      !wallet.publicKey ||
      !wallet.signTransaction
    )
      return;

    try {
      // Show initial toast
      showPromisedToast(toastId, "Creating bulk payment transaction...", false);

      // Create payment transaction for bulk fight (0.01 SOL)
      const { transaction } = await createPaymentTransaction({
        userWallet: wallet.publicKey,
        isBulkAttack: true,
        connection,
      });

      setIsSimpleFightMode(false);
      setCurrentAttackingIndex(-1);

      // Set all selected characters to loading status
      setSelectedCharacters((prev) => prev.map((char) => ({ ...char, status: "loading" })));

      // Update toast for signing
      showPromisedToast(toastId, "Please sign the transaction (0.01 SOL)...", true);

      // Sign and serialize the transaction
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey!;
      
      const signedTransaction = await wallet.signTransaction!(transaction);
      const serializedTransaction = signedTransaction.serialize().toString('base64');

      // Update toast for processing
      showPromisedToast(toastId, "Processing bulk attack...", true);

      attackMutation.mutate({
        enemyId: gameData.enemy._id.toString(),
        characterMints: selectedCharacters.map((char) => char.mint),
        isBulkAttack: true,
        serializedTransaction,
      });
    } catch (error) {
      showPromisedToast(
        toastId,
        `Payment failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        true,
        "ERROR"
      );

      setNotification({
        message: `Payment failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        isSuccess: false,
      });

      // Reset loading state on error
      setSelectedCharacters((prev) => prev.map((char) => ({ ...char, status: "idle" })));
    }
  };

  const getCharacterBorderColor = (status: Character["status"]) => {
    switch (status) {
      case "success":
        return "ring-2 ring-green-500";
      case "failure":
        return "ring-2 ring-red-500";
      case "attacking":
        return "ring-2 ring-yellow-500";
      case "loading":
        return "ring-2 ring-yellow-500 animate-pulse";
      default:
        return "";
    }
  };

  // Show loading state - only show loading if game is loading, or NFTs are loading when user is connected
  if (gameLoading || (nftsLoading && session?.user?.walletId)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="text-center text-white">
          <Loader />
          <p className="mt-4">Loading game data...</p>
          {gameError && <p className="mt-2 text-sm text-red-500">Error: {gameError.message}</p>}
        </div>
      </div>
    );
  }

  // Show wallet connection prompt
  if (!connected || !session?.user?.walletId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="text-center text-white">
          <h2 className="mb-4 text-3xl">Connect Your Wallet</h2>
          <p className="mb-8 text-lg text-gray-300">
            Please connect your wallet to participate in Toon of Ladder battles.
          </p>
          <MainButton color="yellow" className="px-8 py-3">
            Connect Wallet
          </MainButton>
        </div>
      </div>
    );
  }

  // Show no active game message
  if (!gameData?.hasActiveGame) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="text-center text-white">
          <h2 className="mb-4 text-3xl">No Active Game</h2>
          <p className="mb-8 text-lg text-gray-300">
            There is currently no active Toon of Ladder battle. Check back later!
          </p>
        </div>
      </div>
    );
  }

  // Show no NFTs message
  if (allCharacters.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="text-center text-white">
          <h2 className="mb-4 text-3xl">No Characters Found</h2>
          <p className="mb-8 text-lg text-gray-300">
            You need to own Golem or Demon NFTs to participate in battles.
          </p>
        </div>
      </div>
    );
  }

  const enemy = gameData?.enemy;

  if (!enemy) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="text-center text-white">
          <h2 className="mb-4 text-3xl">Enemy Data Missing</h2>
          <p className="mb-8 text-lg text-gray-300">
            Unable to load enemy information. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
      <div className="flex w-full flex-col gap-32">
        {/* Main Battle Interface */}
        <div className="flex w-full flex-col justify-center gap-8 lg:flex-row">
          <ToonCard bgImageUrl={bgImageUrl} className="w-full border-b-8 lg:w-2/5">
            <div className="flex h-full w-full flex-col items-center justify-between py-3">
              <h2 className="text-center text-3xl">
                Enemy: {enemy.name} ({enemy.type} - {enemy.difficulty})
              </h2>
              <div
                className={`relative aspect-square w-3/4 overflow-hidden rounded-xl bg-slate-800 ${
                  attackAnimation ? "animate-shake" : ""
                }`}
              >
                <Image src={enemy.image} alt="Enemy" fill className="object-cover" />
                {notification && (
                  <Notification
                    message={notification.message}
                    isSuccess={notification.isSuccess}
                    onHide={() => setNotification(null)}
                  />
                )}
              </div>
              <div className="flex h-1/3 w-full flex-col items-center justify-around">
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedCharacters.map((char) => (
                    <div
                      key={char.mint}
                      className={`relative flex aspect-square w-12 items-center justify-center overflow-hidden rounded-lg bg-slate-700 p-1 ${getCharacterBorderColor(
                        char.status
                      )}`}
                    >
                      <Image
                        src={char.image}
                        alt={char.name || `Character`}
                        fill
                        className="object-cover"
                      />
                      {char.status === "failure" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <X className="text-red-500" size={20} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <h4 className="text-xl">Selected Attackers ({selectedCharacters.length})</h4>
              </div>
            </div>
          </ToonCard>

          {/* Controls and Characters */}
          <div className="flex w-full flex-col justify-between gap-8 lg:w-2/5">
            <HealthContainer>
              <div className="flex justify-between">
                <h3 className="text-3xl">Enemy Health</h3>
                <span className="text-lg text-red-600">
                  {enemy.currentHealth} / {enemy.maxHealth}
                </span>
              </div>
              <HealthBar $percentage={(enemy.currentHealth / enemy.maxHealth) * 100} />
              <div className="flex w-full justify-between gap-4">
                <MainButton
                  color="yellow"
                  className="w-1/2 font-sans font-bold"
                  onClick={isSimpleFightMode ? attackCurrentUnit : handleSimpleFight}
                  disabled={selectedCharacters.length === 0 || attackMutation.isLoading}
                >
                  {isSimpleFightMode
                    ? currentAttackingIndex >= 0 &&
                      currentAttackingIndex < selectedCharacters.length
                      ? `ATTACK (${currentAttackingIndex + 1}/${
                          selectedCharacters.length
                        }) - 100 RUDE`
                      : "SIMPLE FIGHT"
                    : "SIMPLE FIGHT - 100 RUDE"}
                </MainButton>
                <MainButton
                  color="yellow"
                  className="w-1/2 font-sans font-bold"
                  onClick={handleBulkAttack}
                  disabled={selectedCharacters.length === 0 || attackMutation.isLoading}
                >
                  BULK FIGHT - 0.01 SOL
                </MainButton>
              </div>
              {isSimpleFightMode && (
                <div className="text-center">
                  <MainButton
                    color="red"
                    className="px-4 py-2 font-sans text-sm font-bold"
                    onClick={() => {
                      setIsSimpleFightMode(false);
                      setCurrentAttackingIndex(-1);
                      setSelectedCharacters((prev) =>
                        prev.map((char) => ({ ...char, status: "idle" }))
                      );
                    }}
                  >
                    CANCEL SIMPLE FIGHT
                  </MainButton>
                </div>
              )}
            </HealthContainer>

            {/* Character Selection Controls */}
            {!isSimpleFightMode && (
              <div className="flex w-full justify-between">
                <MainButton
                  color="yellow"
                  buttonClassName="w-fit px-4 font-sans font-bold"
                  onClick={selectAll}
                >
                  SELECT ALL UNITS
                </MainButton>
                <MainButton
                  color="red"
                  buttonClassName="w-fit px-4 font-sans font-bold"
                  onClick={unselectAll}
                >
                  DESELECT ALL
                </MainButton>
              </div>
            )}

            {/* Characters Grid */}
            <ScrollContainer>
              <CardsContainer>
                {allCharacters.map((char) => {
                  const selectedChar = selectedCharacters.find((c) => c.mint === char.mint);
                  const isSelected = !!selectedChar;
                  const status = selectedChar?.status || "idle";

                  return (
                    <div
                      key={char.mint}
                      className={`h-32 w-32 cursor-pointer rounded-md p-1 ${
                        isSelected ? "ring-2 ring-blue-500" : ""
                      } ${getCharacterBorderColor(status)}`}
                      onClick={() => !isSimpleFightMode && toggleCharacter(char.mint)}
                    >
                      <ToonCard
                        bgImageUrl={char.image}
                        className="relative h-full w-full rounded-md"
                      >
                        <>
                          <div className="flex h-full w-full flex-col items-start justify-between">
                            <Square className="text-xs">
                              {char.name?.slice(0, 8) || "Character"}
                            </Square>
                            <div className="flex w-full items-center justify-around">
                              <Square className="font-sans text-xs font-bold">
                                P: {char.power || char.rudeScore || 100}
                              </Square>
                              <Square className="font-sans text-xs font-bold">{char.type}</Square>
                            </div>
                          </div>

                          {status === "loading" && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black bg-opacity-60">
                              <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
                            </div>
                          )}
                        </>
                      </ToonCard>
                    </div>
                  );
                })}
              </CardsContainer>
            </ScrollContainer>
          </div>
        </div>

        {/* User Stats */}
        {userStats && (
          <div className="w-full">
            <h2 className="mb-8 text-center text-3xl lg:text-left">Your Battle Stats</h2>
            <div className="flex justify-center gap-4 lg:justify-start">
              <DataRankingContainer>
                <div className="mb-4 flex gap-8 lg:gap-32">
                  <span className="text-3xl">{userStats.totalBattles}</span>
                  <div className="w-fit rounded-full bg-[#ffe75c] p-2">
                    <ParticipantsIcon />
                  </div>
                </div>
                <span className="font-sans text-xs text-gray-300">Total Battles</span>
              </DataRankingContainer>

              <DataRankingContainer>
                <div className="mb-4 flex gap-8 lg:gap-32">
                  <span className="text-3xl">{userStats.totalWins}</span>
                  <div className="w-fit rounded-full bg-[#ffe75c] p-2">
                    <PointIcon />
                  </div>
                </div>
                <span className="font-sans text-xs text-gray-300">Total Wins</span>
              </DataRankingContainer>

              <DataRankingContainer>
                <div className="mb-4 flex gap-8 lg:gap-32">
                  <span className="text-3xl">{Math.round(userStats.winRate * 100)}%</span>
                  <div className="w-fit rounded-full bg-[#ffe75c] p-2">
                    <RegisteredUserIcon />
                  </div>
                </div>
                <span className="font-sans text-xs text-gray-300">Win Rate</span>
              </DataRankingContainer>
            </div>
          </div>
        )}

        {/* Combat Log Section */}
        <div className="w-full">
          <div className="rounded-xl bg-slate-800 p-6">
            <h3 className="mb-4 text-2xl font-bold text-slate-200">Combat Log</h3>
            <div className="max-h-40 overflow-y-auto">
              {combatLog.length > 0 ? (
                combatLog.map((log, index) => (
                  <p key={index} className="mb-2 text-sm text-slate-300">
                    {log}
                  </p>
                ))
              ) : (
                <p className="text-sm italic text-slate-400">No combat activity yet...</p>
              )}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="w-full">
          <h1 className="mb-16 text-center text-4xl lg:text-left">Current Game Leaderboard</h1>

          {/* Game Stats */}
          <div className="m-auto mb-8 flex w-full flex-row flex-wrap justify-between gap-4 lg:flex-nowrap">
            <DataRankingContainer>
              <div className="mb-4 flex gap-8 lg:gap-32">
                <span className="text-3xl">{gameData?.session?.stats?.totalParticipants || 0}</span>
                <div className="w-fit rounded-full bg-[#ffe75c] p-2">
                  <RegisteredUserIcon />
                </div>
              </div>
              <span className="font-sans text-xs text-gray-300">Total Participants</span>
            </DataRankingContainer>

            <DataRankingContainer>
              <div className="mb-4 flex gap-8 lg:gap-32">
                <span className="text-3xl">{gameData?.session?.stats?.totalBattles || 0}</span>
                <div className="w-fit rounded-full bg-[#ffe75c] p-2">
                  <ParticipantsIcon />
                </div>
              </div>
              <span className="font-sans text-xs text-gray-300">Total Battles</span>
            </DataRankingContainer>

            <DataRankingContainer className="flex-grow gap-4">
              <span className="text-3xl">
                {enemy.currentHealth > 0 ? "Battle in Progress" : "Victory Achieved!"}
              </span>
              <div className="flex justify-between gap-4">
                <p className="w-3/5 font-sans text-xs text-gray-300">
                  Total power dealt:{" "}
                  <span className="text-[#ffe75c]">
                    {gameData?.session?.stats?.totalPower || 0}
                  </span>
                  <br />
                  Damage progress:{" "}
                  <span className="text-[#ffe75c]">
                    {Math.round(((enemy.maxHealth - enemy.currentHealth) / enemy.maxHealth) * 100)}%
                  </span>
                </p>
              </div>
            </DataRankingContainer>
          </div>

          {/* Leaderboard Table */}
          <div className="w-full rounded-2xl bg-[#0d0d10] p-4 lg:p-16">
            <h1 className="mb-16 text-center text-4xl lg:text-left">Global Ranking</h1>
            <TableStyled
              rowKey="rank"
              bordered
              columns={columns}
              dataSource={leaderboard || []}
              scroll={{ x: "max-content" }}
              pagination={{
                pageSize: 20,
                itemRender(_page, type, element) {
                  return ["prev", "next"].includes(type) ? (
                    <ButtonContainerStyled $color="yellow">{element}</ButtonContainerStyled>
                  ) : (
                    <MainButton color="black" className="w-8">
                      {element}
                    </MainButton>
                  );
                },
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ToonOfLadderPage;

// Styled components (reused from original)
const HealthContainer = styled.div`
  background-color: #18181b;
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  border-bottom: 8px solid #313946;
`;

const HealthBar = styled.div<{ $percentage: number }>`
  background-color: #34171f;
  border-radius: 0.5rem;
  width: 100%;
  height: 2rem;

  &::before {
    content: "";
    background-color: #ff1037;
    border-radius: 0.5rem;
    width: ${({ $percentage }) => $percentage}%;
    height: 100%;
    display: block;
  }
`;

const ScrollContainer = styled.div`
  width: 100%;
  height: auto;
  min-height: 180px;
  overflow-x: scroll;
  padding-bottom: 0.5rem;
  display: flex;
  align-items: center;

  &::-webkit-scrollbar {
    height: 12px;
  }

  &::-webkit-scrollbar-track {
    background: #2c2918;
    border-radius: 20px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ffe75c;
    border-radius: 20px;
    border: 3px solid #2c2918;
  }
`;

const CardsContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: max-content;
  height: 100%;
  gap: 1rem;
  align-items: center;
  justify-content: flex-start;
  padding: 0.5rem;
`;

const Square = styled.div`
  width: 22%;
  background-color: #ffe75c;
  border-radius: 0.125rem;
  aspect-ratio: 1/1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;
  line-height: 1;
  font-size: 10px;
  padding: 2px;
  text-align: center;
`;

const DataRankingContainer = styled.div`
  max-width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  background-color: #0d0d10;
  border-radius: 1rem;
  border-bottom: 6px solid #313946;
`;

const TableStyled = styled(Table)<TableProps<DataType>>`
  * :not(.rank, .ant-pagination *) {
    background-color: transparent !important;
    border-color: gray !important;
  }

  thead * {
    color: #9ca3af !important;
  }

  th,
  tbody td {
    border-inline-end: none !important;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody td {
    color: white !important;
    font-family: "Clarence Pro", sans-serif;
    font-size: 18px;
  }

  .ant-table-container {
    border: 1px solid;
    border-radius: 1rem;
  }

  .ant-pagination {
    @media screen and (max-width: 1024px) {
      flex-wrap: nowrap;
      justify-content: center;
    }

    li {
      background-color: unset;
      border: none;
    }

    * {
      color: white !important;
      font-weight: bold !important;
    }
  }
`;

const ButtonContainerStyled = styled(ButtonContainer)`
  & .ant-pagination-item-link {
    ${ButtonMixin}
    width: 100% !important;
    height: 35px !important;
    border-radius: 10px !important;
  }
`;
