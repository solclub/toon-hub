import React, { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon, X } from "lucide-react";
import { trpc } from "utils/trpc";
import Image from "next/image";
import Notification from "./Notification";

interface Character {
  id: number;
  status: "idle" | "success" | "failure" | "next";
}

interface NotificationState {
  message: string;
  isSuccess: boolean;
}

const GameInterface = () => {
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [allCharacters] = useState<Character[]>(
    Array(20)
      .fill(null)
      .map((_, i) => ({ id: i + 1, status: "idle" }))
  );
  const [attackAnimation, setAttackAnimation] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [currentAttackIndex, setCurrentAttackIndex] = useState(0);
  const [isBulkAttack, setIsBulkAttack] = useState(false);
  const [attackRoundComplete, setAttackRoundComplete] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const { data: enemy, isLoading, error, refetch } = trpc.conquest.getCurrentEnemy.useQuery();

  const attackMutation = trpc.conquest.attackEnemy.useMutation({
    onSuccess: async (result: any) => {
      setAttackAnimation(true);
      await refetch();
      setAttackAnimation(false);
      setCombatLog((prevLog) => [result.log, ...prevLog].slice(0, 5));

      // Update the character status based on the attack result
      setSelectedCharacters((prev: Character[]) => {
        return prev.map((char: Character) => {
          const attackResult = result.characterResults.find((r: any) => r.id === char.id);
          if (attackResult) {
            char.status = attackResult.success ? "success" : "failure";
          }
          return char;
        });
      });

      // Set notification based on attack result
      if (isBulkAttack) {
        const totalDamage = result.characterResults.filter((r: any) => r.success).length;
        setNotification({
          message: `${totalDamage} Dmg`,
          isSuccess: totalDamage > 0,
        });
      } else {
        const singleResult = result.characterResults[0];
        setNotification({
          message: singleResult?.success ? "1 Dmg" : "Miss",
          isSuccess: singleResult ? singleResult.success : false,
        });
      }

      // Check if all characters have attacked
      if (isBulkAttack || currentAttackIndex === selectedCharacters.length - 1) {
        setAttackRoundComplete(true);
      } else {
        setCurrentAttackIndex((prevIndex) => prevIndex + 1);
      }

      // Reset bulk attack flag
      setIsBulkAttack(false);
    },
  });

  useEffect(() => {
    // Update the 'next' status for the current character
    if (!isBulkAttack && !attackRoundComplete) {
      setSelectedCharacters((prev) => {
        return prev.map((char, index) => ({
          ...char,
          status: index === currentAttackIndex ? "next" : char.status,
        }));
      });
    }
  }, [currentAttackIndex, isBulkAttack, attackRoundComplete]);

  const toggleCharacter = (id: number) => {
    if (attackRoundComplete) {
      // If attack round is complete, first reset all characters
      setSelectedCharacters([]);
      setAttackRoundComplete(false);
      setCurrentAttackIndex(0);
    }
    setSelectedCharacters((prev) =>
      prev.find((char) => char.id === id)
        ? prev.filter((char) => char.id !== id)
        : [...prev, { id, status: prev.length === 0 ? "next" : "idle" }]
    );
  };

  const selectAll = () => {
    if (attackRoundComplete) {
      setAttackRoundComplete(false);
      setCurrentAttackIndex(0);
    }
    setSelectedCharacters(
      allCharacters.map((c, index) => ({
        ...c,
        status: index === 0 ? "next" : "idle",
      }))
    );
  };

  const unselectAll = () => {
    setSelectedCharacters([]);
    setAttackRoundComplete(false);
    setCurrentAttackIndex(0);
  };

  const handleAttack = () => {
    if (enemy && selectedCharacters.length > 0 && !attackRoundComplete) {
      setIsBulkAttack(false);
      const nextCharacter = selectedCharacters[currentAttackIndex];
      if (nextCharacter && !attackMutation.isLoading) {
        attackMutation.mutate({
          enemyId: enemy._id.toString(),
          characterMints: [nextCharacter.id.toString()],
          isBulkAttack: false,
        });
      }
    }
  };

  const handleBulkAttack = () => {
    if (
      enemy &&
      selectedCharacters.length > 0 &&
      !attackRoundComplete &&
      !attackMutation.isLoading
    ) {
      setIsBulkAttack(true);
      attackMutation.mutate({
        enemyId: enemy._id.toString(),
        characterMints: selectedCharacters.map((char) => char.id.toString()),
        isBulkAttack: true,
      });
    }
  };

  if (isLoading) return <div>Loading enemy data...</div>;
  if (error) return <div>Error loading enemy data: {error.message}</div>;
  if (!enemy) return <div>No enemy found</div>;

  const getCharacterBorderColor = (status: Character["status"]) => {
    switch (status) {
      case "success":
        return "ring-2 ring-green-500";
      case "failure":
        return "ring-2 ring-red-500";
      case "next":
        return "ring-2 ring-yellow-500";
      default:
        return "";
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-900 p-4 text-slate-200 md:flex-row">
      {/* Left side - Enemy display */}
      <div className="mb-4 md:mb-0 md:w-1/2 md:pr-4">
        <h2 className="mb-4 text-center text-2xl font-bold text-slate-200">
          Enemy: {enemy.name} ({enemy.type} - {enemy.difficulty})
        </h2>
        <div
          className={`relative aspect-square overflow-hidden rounded-xl bg-slate-800 ${
            attackAnimation ? "animate-shake" : ""
          }`}
        >
          <Image
            src="/forest_bg.jpg"
            alt="Background"
            className="h-full w-full object-cover"
            fill
          />
          <Image
            src={enemy.image}
            alt="Enemy"
            width={100}
            height={200}
            className="absolute left-1/2 top-[40%] w-2/4 -translate-x-1/2 -translate-y-1/2 transform"
          />
          {notification && (
            <Notification
              message={notification.message}
              isSuccess={notification.isSuccess}
              onHide={() => setNotification(null)}
            />
          )}
        </div>
        <div className="-mt-24 flex flex-wrap justify-center gap-2">
          {selectedCharacters.map((char) => (
            <div
              key={char.id}
              className={`relative flex aspect-square w-16 items-center justify-center overflow-hidden rounded-lg bg-slate-700 p-2 ${getCharacterBorderColor(
                char.status
              )}`}
            >
              <Image src="/placeholder.jpg" alt={`Character ${char.id}`} fill />
              {char.status === "failure" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <X className="text-red-500" size={32} />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-slate-800 p-4">
          <h3 className="mb-2 text-lg font-bold text-slate-200">Combat Log</h3>
          {combatLog.map((log, index) => (
            <p key={index} className="text-sm text-slate-300">
              {log}
            </p>
          ))}
        </div>
      </div>

      {/* Right side - Game controls */}
      <div className="md:w-1/2">
        <div className="mb-4 rounded-xl bg-slate-800 p-4">
          <div className="mb-2 flex justify-between text-slate-200">
            <span>Enemy Health:</span>
            <span>
              {enemy.currentHealth} / {enemy.maxHealth}
            </span>
          </div>
          <div className="mb-4 h-4 w-full rounded-full bg-slate-700">
            <div
              className="h-4 rounded-full bg-red-600 transition-all duration-300 ease-in-out"
              style={{
                width: `${(enemy.currentHealth / enemy.maxHealth) * 100}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between gap-4">
            <button
              onClick={handleAttack}
              disabled={
                selectedCharacters.length === 0 || attackMutation.isLoading || attackRoundComplete
              }
              className="flex-1 rounded-lg bg-yellow-500 px-4 py-2 font-bold text-slate-900 hover:bg-yellow-600 disabled:bg-slate-600"
            >
              Attack enemy!
            </button>
            <button
              onClick={handleBulkAttack}
              disabled={
                selectedCharacters.length === 0 || attackMutation.isLoading || attackRoundComplete
              }
              className="flex-1 rounded-lg bg-green-500 px-4 py-2 font-bold text-slate-900 hover:bg-green-600 disabled:bg-slate-600"
            >
              Bulk attack
            </button>
          </div>
          {attackRoundComplete && (
            <div className="mt-4 text-center text-yellow-500">
              Attack round complete. Please unselect or select new characters to attack again.
            </div>
          )}
        </div>

        <div className="rounded-xl bg-slate-800 p-4">
          <div className="mb-4 flex justify-between">
            <button
              onClick={selectAll}
              className="rounded-lg bg-yellow-500 px-4 py-2 font-bold text-slate-900 hover:bg-yellow-600"
            >
              Select all units
            </button>
            <button
              onClick={unselectAll}
              className="rounded-lg bg-slate-600 px-4 py-2 font-bold text-slate-200 hover:bg-slate-700"
            >
              Unselect all
            </button>
          </div>
          <div className="relative px-4">
            <div className="-mx-4 flex gap-1 overflow-x-auto pb-4">
              {allCharacters.map((char) => (
                <div
                  key={char.id}
                  className={`relative m-1 h-36 w-36 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl ${
                    selectedCharacters.find((c) => c.id === char.id) ? "ring-2 ring-yellow-500" : ""
                  }`}
                  onClick={() => toggleCharacter(char.id)}
                >
                  <Image src="/placeholder.jpg" alt={`Character ${char.id}`} fill />
                </div>
              ))}
            </div>
            <button className="absolute left-0 top-1/2 -translate-y-1/2 transform rounded-full bg-slate-700 p-1">
              <ChevronLeftIcon size={24} />
            </button>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 transform rounded-full bg-slate-700 p-1">
              <ChevronRightIcon size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameInterface;
