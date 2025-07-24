import React from "react";
import Image from "next/image";
import styled from "styled-components";
import { X } from "lucide-react";
import ToonCard from "components/common/ToonCard";
import MainButton from "components/common/MainButton";
import Notification from "./Notification";
import type { RudeNFT } from "server/database/models/nft.model";

interface Character extends RudeNFT {
  status: "idle" | "loading" | "success" | "failure" | "attacking";
  isSelected?: boolean;
}

interface NotificationState {
  message: string;
  isSuccess: boolean;
}

interface Enemy {
  name: string;
  type: string;
  difficulty: string;
  image: string;
  currentHealth: number;
  maxHealth: number;
}

interface FightTabProps {
  enemy: Enemy;
  selectedCharacters: Character[];
  allCharacters: Character[];
  attackAnimation: boolean;
  notification: NotificationState | null;
  setNotification: (notification: NotificationState | null) => void;
  isSimpleFightMode: boolean;
  setIsSimpleFightMode: (mode: boolean) => void;
  currentAttackingIndex: number;
  setCurrentAttackingIndex: (index: number) => void;
  setSelectedCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  attackCurrentUnit: () => void;
  handleSimpleFight: () => void;
  handleBulkAttack: () => void;
  selectAll: () => void;
  unselectAll: () => void;
  toggleCharacter: (mint: string) => void;
  getCharacterBorderColor: (status: Character["status"]) => string;
  attackMutation: { isLoading: boolean };
  bgImageUrl: string;
}

const FightTab: React.FC<FightTabProps> = ({
  enemy,
  selectedCharacters,
  allCharacters,
  attackAnimation,
  notification,
  setNotification,
  isSimpleFightMode,
  setIsSimpleFightMode,
  currentAttackingIndex,
  setCurrentAttackingIndex,
  setSelectedCharacters,
  attackCurrentUnit,
  handleSimpleFight,
  handleBulkAttack,
  selectAll,
  unselectAll,
  toggleCharacter,
  getCharacterBorderColor,
  attackMutation,
  bgImageUrl,
}) => {
  return (
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
    </div>
  );
};

// Styled components
const HealthContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 1rem;
  border: 2px solid #334155;
`;

const HealthBar = styled.div<{ $percentage: number }>`
  width: 100%;
  height: 1.5rem;
  background-color: #374151;
  border-radius: 0.75rem;
  overflow: hidden;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({ $percentage }) => $percentage}%;
    background: linear-gradient(90deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
    transition: width 0.3s ease-in-out;
  }
`;

const ScrollContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border-radius: 0.5rem;
  padding: 0.5rem;
  background-color: rgba(15, 23, 42, 0.3);
`;

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  gap: 1rem;
`;

const Square = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
`;

export default FightTab;