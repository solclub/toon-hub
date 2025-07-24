import React from "react";
import styled from "styled-components";
import { Table, type TableColumnsType } from "antd";
import MainButton, { ButtonContainer, ButtonMixin } from "components/common/MainButton";
import RegisteredUserIcon from "../../assets/images/toon-of-ladder/registeredUserIcon.svg";
import ParticipantsIcon from "../../assets/images/toon-of-ladder/participantsIcon.svg";

interface DataType {
  rank: number;
  userWallet: string;
  totalWins: number;
  totalPowerDealt: number;
  bestCharacter: string;
  lastBattle: Date;
}

interface GameData {
  session?: {
    stats?: {
      totalParticipants: number;
      totalBattles: number;
      totalPower: number;
    };
  };
}

interface Enemy {
  currentHealth: number;
  maxHealth: number;
}

interface LeaderboardTabProps {
  gameData: GameData | null;
  enemy: Enemy;
  leaderboard: DataType[];
  columns: TableColumnsType<DataType>;
}

const LeaderboardTab: React.FC<LeaderboardTabProps> = ({
  gameData,
  enemy,
  leaderboard,
  columns,
}) => {
  return (
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
          columns={columns as any}
          dataSource={leaderboard as any}
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

const TableStyled = styled(Table)`
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
    text-align: center !important;
    margin-top: 2rem !important;
  }

  .ant-pagination-item {
    background: transparent !important;
    border: none !important;
  }

  .ant-pagination-item a {
    color: white !important;
  }

  .ant-pagination-item-active {
    background: #ffe75c !important;
  }

  .ant-pagination-item-active a {
    color: black !important;
  }

  .ant-table-empty {
    .ant-table-tbody tr {
      background: transparent !important;
    }
  }

  @media (max-width: 768px) {
    .ant-table-tbody > tr > td {
      font-size: 0.875rem !important;
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

export default LeaderboardTab;