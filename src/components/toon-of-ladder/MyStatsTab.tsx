import React from "react";
import styled from "styled-components";
import RegisteredUserIcon from "../../assets/images/toon-of-ladder/registeredUserIcon.svg";
import ParticipantsIcon from "../../assets/images/toon-of-ladder/participantsIcon.svg";
import PointIcon from "../../assets/images/toon-of-ladder/pointIcon.svg";
import PowerIcon from "../../assets/images/power_rating_icon.png";
import Image from "next/image";
import { trpc } from "utils/trpc";

interface BestWarrior {
  _id: string;
  totalDamage: number;
  characterName?: string;
  characterType?: "GOLEM" | "DEMON";
  battles: number;
}

interface UserStats {
  totalBattles: number;
  totalWins: number;
  winRate: number;
  totalPowerDealt: number;
  bestWarrior: BestWarrior | null;
}

interface MyStatsTabProps {
  userStats: UserStats | null;
  combatLog: string[];
  isWalletConnected: boolean;
}

const MyStatsTab: React.FC<MyStatsTabProps> = ({ userStats, combatLog, isWalletConnected }) => {
  const { data: bestWarriorNFT, isLoading: isLoadingNFT } = trpc.nfts.getUserNFTbyMint.useQuery({
    mint: userStats?.bestWarrior?._id || "",
  }, {
    enabled: !!userStats?.bestWarrior?._id,
  });

  const bestWarriorImageUrl = bestWarriorNFT?.images.get(bestWarriorNFT?.current) ?? bestWarriorNFT?.image;

  return (
    <div className="flex w-full flex-col gap-32">
      {/* User Stats */}
      {isWalletConnected && userStats && (
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

            <BestWarriorContainer>
              <div className="mb-4 flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold">
                    {userStats.bestWarrior?.totalDamage.toLocaleString() || "0"}
                  </span>
                  <span className="font-sans text-xs text-gray-300">Best Warrior DMG</span>
                </div>
                <div className="flex flex-col items-center">
                  {bestWarriorImageUrl ? (
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg border-2 border-yellow-400">
                      <Image 
                        src={bestWarriorImageUrl} 
                        alt={userStats.bestWarrior?.characterName || "Best Warrior"} 
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-yellow-400 bg-gray-700">
                      <Image 
                        src={PowerIcon} 
                        alt="Power Icon" 
                        width={24} 
                        height={24}
                        className="object-contain"
                      />
                    </div>
                  )}
                  <span className="mt-1 text-xs text-yellow-400 font-medium">
                    {userStats.bestWarrior?.characterName || "No Warrior"}
                  </span>
                </div>
              </div>
            </BestWarriorContainer>
          </div>
        </div>
      )}

      {/* Combat Log Section */}
      {isWalletConnected && (
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
      )}
    </div>
  );
};

// Styled components
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

const BestWarriorContainer = styled.div`
  max-width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  background-color: #0d0d10;
  border-radius: 1rem;
  border-bottom: 6px solid #313946;
  min-width: 200px;
`;

export default MyStatsTab;