import React from "react";
import styled from "styled-components";
import RegisteredUserIcon from "../../assets/images/toon-of-ladder/registeredUserIcon.svg";
import ParticipantsIcon from "../../assets/images/toon-of-ladder/participantsIcon.svg";
import PointIcon from "../../assets/images/toon-of-ladder/pointIcon.svg";

interface UserStats {
  totalBattles: number;
  totalWins: number;
  winRate: number;
}

interface MyStatsTabProps {
  userStats: UserStats | null;
  combatLog: string[];
}

const MyStatsTab: React.FC<MyStatsTabProps> = ({ userStats, combatLog }) => {
  return (
    <div className="flex w-full flex-col gap-32">
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

export default MyStatsTab;