import React, { useState } from "react";
import Image from "next/image";
import styled from "styled-components";
import { X, Plus, Zap } from "lucide-react";
import ToonCard from "components/common/ToonCard";
import MainButton from "components/common/MainButton";
import Notification from "./Notification";
import type { RudeNFT } from "server/database/models/nft.model";
import { getEnemyImageSrc } from "../../utils/enemy-images";

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
  const [isWarriorSheetOpen, setIsWarriorSheetOpen] = useState(false);

  const getDifficultyZaps = (difficulty: string) => {
    const zapCount = difficulty === "EASY" ? 1 : difficulty === "MEDIUM" ? 2 : 3;
    return Array.from({ length: zapCount }, (_, i) => (
      <Zap key={i} size={20} className="fill-yellow-400 text-yellow-400" />
    ));
  };

  // Use centralized enemy image utility
  const getEnemyImage = (enemyImage: string) => {
    return getEnemyImageSrc(enemyImage);
  };
  return (
    <>
      <style jsx>{`
        @keyframes attack-hit {
          0% {
            transform: scale(1);
          }
          20% {
            transform: scale(1.02) rotate(1deg);
          }
          40% {
            transform: scale(0.98) rotate(-1deg);
          }
          60% {
            transform: scale(1.01) rotate(0.5deg);
          }
          80% {
            transform: scale(0.99) rotate(-0.5deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes health-flash {
          0%,
          100% {
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          50% {
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 20px rgba(239, 68, 68, 0.8);
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0.3) translateY(-20px);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) translateY(-10px);
            opacity: 1;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes shake-notification {
          0%,
          100% {
            transform: translateX(0) scale(1);
          }
          25% {
            transform: translateX(-3px) scale(1.05);
          }
          75% {
            transform: translateX(3px) scale(1.05);
          }
        }

        .animate-attack-hit {
          animation: attack-hit 0.6s ease-in-out;
        }

        .animate-health-flash {
          animation: health-flash 0.8s ease-in-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }

        .animate-shake-notification {
          animation: shake-notification 0.5s ease-in-out;
        }
      `}</style>
      <div className="relative flex w-full flex-col">
        {/* Main Battle Interface - Enemy Dominates */}
        <div className="flex w-full flex-col items-center">
          {/* Enemy Section - Large and Dominating */}
          <div className="w-full">
            <div className={`relative w-full ${attackAnimation ? "animate-shake" : ""}`}>
              {/* Enemy Image - Full width and very large */}
              <div className="relative h-[80vh] w-full overflow-hidden rounded-2xl">
                {/* Background - Blurred and scaled version of enemy image */}
                <div className="absolute inset-0">
                  <Image
                    src={getEnemyImage(enemy.image)}
                    alt="Enemy Background"
                    fill
                    className="scale-110 object-cover opacity-40 blur-md"
                  />
                  {/* Dark overlay for better contrast */}
                  <div className="absolute inset-0 bg-black/30"></div>
                  {/* Subtle color overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20"></div>
                </div>

                {/* Enemy Image - Square aspect ratio, centered */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`relative z-10 aspect-square h-full max-h-full w-auto transition-all duration-300 ${
                      attackAnimation ? "animate-attack-hit" : ""
                    }`}
                  >
                    <Image
                      src={getEnemyImage(enemy.image)}
                      alt="Enemy"
                      fill
                      className="object-contain"
                    />

                    {/* HP Bar, Title and HP - Positioned within enemy image bounds */}
                    <div className="absolute left-0 right-0 top-0 mx-auto max-w-[80%] bg-gradient-to-b from-black/80 via-black/60 to-transparent p-6">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                            {enemy.name}
                          </h2>
                          <div className="flex gap-1">{getDifficultyZaps(enemy.difficulty)}</div>
                        </div>
                        <span className="font-mono text-lg font-bold text-red-400 drop-shadow-lg">
                          {enemy.currentHealth} / {enemy.maxHealth}
                        </span>
                      </div>
                      <HealthBar
                        $percentage={(enemy.currentHealth / enemy.maxHealth) * 100}
                        className={attackAnimation ? "animate-health-flash" : ""}
                      />
                    </div>

                    {/* Attack Notification - Only show success notifications */}
                    {notification && notification.isSuccess && (
                      <div className="absolute left-0 right-0 top-20 flex justify-center px-6">
                        <div className="animate-bounce-in rounded-lg bg-green-500/80 px-3 py-1 text-sm font-bold text-white backdrop-blur-sm">
                          {notification.message}
                        </div>
                      </div>
                    )}

                    {/* Warriors - Positioned within enemy image bounds at bottom */}
                    <div className="absolute bottom-6 left-1/2 flex w-full -translate-x-1/2 transform flex-col items-center px-24">
                      <div className="mb-2 flex flex-wrap items-center justify-center gap-3">
                        {selectedCharacters.map((char) => {
                          const borderClass =
                            char.status === "success"
                              ? "ring-2 ring-green-500"
                              : char.status === "failure"
                              ? "ring-2 ring-red-500"
                              : char.status === "attacking"
                              ? "ring-2 ring-yellow-500"
                              : char.status === "loading"
                              ? "ring-2 ring-yellow-500 animate-pulse"
                              : "";

                          return (
                            <div
                              key={char.mint}
                              className={`relative h-16 w-16 overflow-hidden rounded-lg bg-slate-700 ${borderClass}`}
                            >
                              <Image
                                src={char.image}
                                alt={char.name || "Character"}
                                fill
                                className="object-cover"
                              />
                              {char.status === "failure" && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                  <X className="text-red-500" size={16} />
                                </div>
                              )}
                              {char.status === "loading" && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {!isSimpleFightMode && (
                          <button
                            onClick={() => setIsWarriorSheetOpen(true)}
                            className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-400 bg-black/50 backdrop-blur-sm transition-colors hover:bg-black/70"
                          >
                            <Plus size={24} className="text-gray-300" />
                          </button>
                        )}
                      </div>
                      <div className="rounded-full bg-black/50 px-3 py-1 text-sm font-medium text-white drop-shadow-lg backdrop-blur-sm">
                        Selected Attackers ({selectedCharacters.length})
                      </div>
                    </div>

                    {/* Notification overlay */}
                    {notification && (
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                        <Notification
                          message={notification.message}
                          isSuccess={notification.isSuccess}
                          onHide={() => setNotification(null)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons at bottom */}
          <div className="mt-8 w-full max-w-2xl">
            <div className="flex gap-4">
              <MainButton
                color="yellow"
                className="flex-1 font-sans font-bold"
                buttonClassName="h-16"
                onClick={isSimpleFightMode ? attackCurrentUnit : handleSimpleFight}
                disabled={selectedCharacters.length === 0 || attackMutation.isLoading}
              >
                {isSimpleFightMode
                  ? currentAttackingIndex >= 0 && currentAttackingIndex < selectedCharacters.length
                    ? `ATTACK (${currentAttackingIndex + 1}/${
                        selectedCharacters.length
                      }) - 100 RUDE`
                    : "SIMPLE FIGHT"
                  : "SIMPLE FIGHT - 100 RUDE"}
              </MainButton>
              <MainButton
                color="yellow"
                className="flex-1 font-sans font-bold"
                buttonClassName="h-16"
                onClick={handleBulkAttack}
                disabled={selectedCharacters.length === 0 || attackMutation.isLoading}
              >
                BULK FIGHT - 0.01 SOL
              </MainButton>
            </div>

            {isSimpleFightMode && (
              <div className="mt-4 text-center">
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
          </div>
        </div>

        {/* Warrior Selection Side Sheet */}
        {isWarriorSheetOpen && (
          <WarriorSheetOverlay onClick={() => setIsWarriorSheetOpen(false)}>
            <WarriorSheet onClick={(e) => e.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Select Warriors</h3>
                <button
                  onClick={() => setIsWarriorSheetOpen(false)}
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6 flex gap-4">
                <MainButton
                  color="yellow"
                  className="px-4 py-2 font-sans font-bold"
                  onClick={selectAll}
                >
                  SELECT ALL UNITS
                </MainButton>
                <MainButton
                  color="red"
                  className="px-4 py-2 font-sans font-bold"
                  onClick={unselectAll}
                >
                  DESELECT ALL
                </MainButton>
              </div>

              <WarriorGrid>
                {allCharacters.map((char) => {
                  const selectedChar = selectedCharacters.find((c) => c.mint === char.mint);
                  const isSelected = !!selectedChar;
                  const status = selectedChar?.status || "idle";
                  const borderClass = isSelected ? "ring-2 ring-blue-500" : "";

                  return (
                    <WarriorCard
                      key={char.mint}
                      className={`cursor-pointer ${borderClass}`}
                      onClick={() => toggleCharacter(char.mint)}
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                        <Image
                          src={char.image}
                          alt={char.name || "Character"}
                          fill
                          className="object-cover"
                        />
                        {status === "loading" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <div className="mb-1 text-sm font-bold text-white">
                          {char.name?.split(" #")[0] || "Character"}
                        </div>
                        <div className="text-xs text-gray-400">
                          #{char.name?.split(" #")[1] || "000"}
                        </div>
                        <div className="mt-2 flex justify-between text-xs">
                          <span className="text-yellow-400">
                            P: {char.power || char.rudeScore || 100}
                          </span>
                          <span className="text-blue-400">{char.type}</span>
                        </div>
                      </div>
                    </WarriorCard>
                  );
                })}
              </WarriorGrid>
            </WarriorSheet>
          </WarriorSheetOverlay>
        )}
      </div>
    </>
  );
};

// Styled components

const HealthContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  border-radius: 1rem;
  border: 2px solid #4b5563;
`;

const WarriorSheetOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
`;

const WarriorSheet = styled.div`
  width: 500px;
  height: 100vh;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  padding: 2rem;
  overflow-y: auto;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
`;

const WarriorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  max-height: calc(100vh - 200px);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #374151;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #6b7280;
    border-radius: 4px;
  }
`;

const WarriorCard = styled.div`
  background: #374151;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  border: 2px solid transparent;
  margin: 2px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const HealthBar = styled.div<{ $percentage: number }>`
  width: 100%;
  height: 1rem;
  background-color: #374151;
  border-radius: 0.5rem;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({ $percentage }) => $percentage}%;
    background: linear-gradient(90deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
    transition: width 0.3s ease-in-out;
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.5), 0 4px 8px rgba(239, 68, 68, 0.4);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({ $percentage }) => $percentage}%;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.3) 0%,
      transparent 50%,
      rgba(0, 0, 0, 0.2) 100%
    );
    transition: width 0.3s ease-in-out;
    z-index: 1;
  }
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
