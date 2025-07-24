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
import { X, Sword, BarChart3, Trophy } from "lucide-react";
import { trpc } from "utils/trpc";
import Notification from "components/toon-of-ladder/Notification";
import FightTab from "components/toon-of-ladder/FightTab";
import MyStatsTab from "components/toon-of-ladder/MyStatsTab";
import LeaderboardTab from "components/toon-of-ladder/LeaderboardTab";
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
  isSelected?: boolean;
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
  const [activeTab, setActiveTab] = useState<"fight" | "stats" | "leaderboard">("fight");
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
      const serializedTransaction = signedTransaction.serialize().toString("base64");

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
      const serializedTransaction = signedTransaction.serialize().toString("base64");

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

  const renderFightTab = () => (
    <FightTab
      enemy={enemy}
      selectedCharacters={selectedCharacters}
      allCharacters={allCharacters}
      attackAnimation={attackAnimation}
      notification={notification}
      setNotification={setNotification}
      isSimpleFightMode={isSimpleFightMode}
      setIsSimpleFightMode={setIsSimpleFightMode}
      currentAttackingIndex={currentAttackingIndex}
      setCurrentAttackingIndex={setCurrentAttackingIndex}
      setSelectedCharacters={setSelectedCharacters}
      attackCurrentUnit={attackCurrentUnit}
      handleSimpleFight={handleSimpleFight}
      handleBulkAttack={handleBulkAttack}
      selectAll={selectAll}
      unselectAll={unselectAll}
      toggleCharacter={toggleCharacter}
      getCharacterBorderColor={getCharacterBorderColor}
      attackMutation={attackMutation}
      bgImageUrl={bgImageUrl}
    />
  );

  const renderStatsTab = () => (
    <MyStatsTab userStats={userStats} combatLog={combatLog} />
  );

  const renderLeaderboardTab = () => (
    <LeaderboardTab
      gameData={gameData}
      enemy={enemy}
      leaderboard={leaderboard || []}
      columns={columns}
    />
  );

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
      <div className="flex w-full flex-col">
        {/* Tab Navigation */}
        <TabNavigation>
          <TabButton $isActive={activeTab === "fight"} onClick={() => setActiveTab("fight")}>
            <Sword size={20} />
            Fight
          </TabButton>
          <TabButton $isActive={activeTab === "stats"} onClick={() => setActiveTab("stats")}>
            <BarChart3 size={20} />
            My Stats
          </TabButton>
          <TabButton
            $isActive={activeTab === "leaderboard"}
            onClick={() => setActiveTab("leaderboard")}
          >
            <Trophy size={20} />
            Leaderboard
          </TabButton>
        </TabNavigation>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === "fight" && renderFightTab()}
          {activeTab === "stats" && renderStatsTab()}
          {activeTab === "leaderboard" && renderLeaderboardTab()}
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

const TabNavigation = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
`;

const TabButton = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: ${({ $isActive }) => ($isActive ? "#ffe75c" : "#2c2918")};
  color: ${({ $isActive }) => ($isActive ? "black" : "white")};
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  font-family: "Clarence Pro", sans-serif;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border-bottom: ${({ $isActive }) => ($isActive ? "4px solid #d4a853" : "4px solid transparent")};

  &:hover {
    background-color: ${({ $isActive }) => ($isActive ? "#ffe75c" : "#3f3827")};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    flex-shrink: 0;
  }
`;
