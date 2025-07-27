import { useState } from "react";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Panel from "../../../components/common/Panel";
import MainButton from "../../../components/common/MainButton";
import { Modal } from "../../../components/common/Modal";
import Link from "next/link";
import { trpc } from "utils/trpc";
import { toast } from "react-toastify";
import Image from "next/image";
import { getEnemyImageSrc } from "../../../utils/enemy-images";

type GameSessionStatus = "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
type WinCondition = "ENEMY_DEFEATED" | "TIME_EXPIRED" | "MANUAL_END";

type Enemy = {
  _id: { toString(): string };
  name: string;
  image: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  type: "BOSS" | "MINION" | "ELITE";
  maxHealth: number;
  currentHealth: number;
};

type GameSession = {
  _id: { toString(): string };
  enemyId: Enemy | { toString(): string };
  status: GameSessionStatus;
  startTime: Date | string;
  endTime?: Date | string;
  scheduledEndTime: Date | string;
  totalDamageDealt: number;
  totalPowerDealt: number;
  participantCount: number;
  battleCount: number;
  winCondition?: WinCondition;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};

const GameSessionManagement: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);
  const [filterStatus, setFilterStatus] = useState<GameSessionStatus | "ALL">("ALL");
  const [formData, setFormData] = useState({
    enemyId: "",
    status: "PENDING" as GameSessionStatus,
    startTime: "",
    scheduledEndTime: "",
    winCondition: undefined as WinCondition | undefined,
  });

  // tRPC queries and mutations
  const {
    data: sessionsData,
    refetch: refetchSessions,
    isLoading: isLoadingSessions,
  } = trpc.gameManagement.getAllGameSessions.useQuery({
    limit: 50,
    offset: 0,
    status: filterStatus === "ALL" ? undefined : filterStatus,
  });

  const { data: enemies, isLoading: isLoadingEnemies } = trpc.gameManagement.getEnemies.useQuery();

  const createSessionMutation = trpc.gameManagement.createGameSession.useMutation();
  const updateSessionMutation = trpc.gameManagement.updateGameSession.useMutation();
  const deleteSessionMutation = trpc.gameManagement.deleteGameSession.useMutation();

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

  const resetForm = () => {
    setFormData({
      enemyId: "",
      status: "PENDING",
      startTime: "",
      scheduledEndTime: "",
      winCondition: undefined,
    });
  };

  const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString();
  };

  const formatDateTimeForInput = (date: Date | string) => {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  const handleCreate = async () => {
    try {
      await createSessionMutation.mutateAsync({
        enemyId: formData.enemyId,
        startTime: new Date(formData.startTime),
        scheduledEndTime: new Date(formData.scheduledEndTime),
        status: formData.status,
      });
      toast.success("Game session created successfully!");
      setShowCreateModal(false);
      resetForm();
      refetchSessions();
    } catch (error) {
      toast.error("Failed to create game session");
    }
  };

  const handleEdit = (session: GameSession) => {
    const enemy = session.enemyId as unknown as Enemy;
    setSelectedSession(session);
    setFormData({
      enemyId: enemy._id.toString(),
      status: session.status,
      startTime: formatDateTimeForInput(session.startTime),
      scheduledEndTime: formatDateTimeForInput(session.scheduledEndTime),
      winCondition: session.winCondition,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedSession) return;

    try {
      const selectedEnemy = selectedSession.enemyId as unknown as Enemy;
      const updateData: Record<string, unknown> = {};
      if (formData.enemyId !== selectedEnemy._id.toString()) {
        updateData.enemyId = formData.enemyId;
      }
      if (formData.status !== selectedSession.status) {
        updateData.status = formData.status;
      }
      if (formData.startTime !== formatDateTimeForInput(selectedSession.startTime)) {
        updateData.startTime = new Date(formData.startTime);
      }
      if (formData.scheduledEndTime !== formatDateTimeForInput(selectedSession.scheduledEndTime)) {
        updateData.scheduledEndTime = new Date(formData.scheduledEndTime);
      }
      if (formData.winCondition && formData.winCondition !== selectedSession.winCondition) {
        updateData.winCondition = formData.winCondition;
      }

      await updateSessionMutation.mutateAsync({
        sessionId: selectedSession._id.toString(),
        ...updateData,
      });
      toast.success("Game session updated successfully!");
      setShowEditModal(false);
      setSelectedSession(null);
      resetForm();
      refetchSessions();
    } catch (error) {
      toast.error("Failed to update game session");
    }
  };

  const handleDelete = async () => {
    if (!selectedSession) return;

    try {
      await deleteSessionMutation.mutateAsync({
        sessionId: selectedSession._id.toString(),
      });
      toast.success("Game session deleted successfully!");
      setShowDeleteModal(false);
      setSelectedSession(null);
      refetchSessions();
    } catch (error) {
      toast.error("Failed to delete game session");
    }
  };

  const getStatusColor = (status: GameSessionStatus) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-400 bg-yellow-400/20";
      case "ACTIVE":
        return "text-green-400 bg-green-400/20";
      case "COMPLETED":
        return "text-blue-400 bg-blue-400/20";
      case "CANCELLED":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "text-green-400";
      case "MEDIUM":
        return "text-yellow-400";
      case "HARD":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

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
            <h1 className="text-4xl font-bold text-[#ffe75c]">Game Session Management</h1>
            <MainButton color="yellow" onClick={() => setShowCreateModal(true)}>
              Create New Session
            </MainButton>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <label className="mb-2 block text-white">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as GameSessionStatus | "ALL")}
              className="rounded border border-gray-600 bg-gray-700 p-2 text-white"
            >
              <option value="ALL">All Sessions</option>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {isLoadingSessions ? (
            <div className="py-8 text-center">
              <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-2 border-[#ffe75c]"></div>
              <p className="mt-4 text-white">Loading game sessions...</p>
            </div>
          ) : sessionsData?.sessions && sessionsData.sessions.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {sessionsData.sessions.map((session) => {
                const enemy = session.enemyId as unknown as Enemy;
                return (
                  <div
                    key={session._id.toString()}
                    className="overflow-hidden rounded-lg border border-gray-600 bg-gray-800"
                  >
                    <div className="p-6">
                      {/* Header with Enemy Info */}
                      <div className="mb-4 flex items-center gap-4">
                        <div className="h-16 w-16 overflow-hidden rounded-lg">
                          <Image
                            src={getEnemyImageSrc(enemy.image)}
                            alt={enemy.name}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white">{enemy.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className={getDifficultyColor(enemy.difficulty)}>
                              {enemy.difficulty}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-400">{enemy.type}</span>
                          </div>
                        </div>
                        <div className={`rounded-full px-3 py-1 text-sm font-bold ${getStatusColor(session.status)}`}>
                          {session.status}
                        </div>
                      </div>

                    {/* Session Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Start Time:</span>
                        <span className="text-white">{formatDateTime(session.startTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Scheduled End:</span>
                        <span className="text-white">{formatDateTime(session.scheduledEndTime)}</span>
                      </div>
                      {session.endTime && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Actual End:</span>
                          <span className="text-white">{formatDateTime(session.endTime)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Participants:</span>
                        <span className="text-white">{session.participantCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Battles:</span>
                        <span className="text-white">{session.battleCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Damage:</span>
                        <span className="text-white">{session.totalDamageDealt.toLocaleString()}</span>
                      </div>
                      {session.winCondition && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Win Condition:</span>
                          <span className="text-white">{session.winCondition.replace("_", " ")}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      <MainButton
                        color="blue"
                        onClick={() => handleEdit(session)}
                        className="flex-1 text-sm"
                      >
                        Edit
                      </MainButton>
                      <MainButton
                        color="red"
                        onClick={() => {
                          setSelectedSession(session);
                          setShowDeleteModal(true);
                        }}
                        className="flex-1 text-sm"
                        disabled={session.status === "ACTIVE"}
                      >
                        Delete
                      </MainButton>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="mb-4 text-gray-400">No game sessions found</p>
              <MainButton color="yellow" onClick={() => setShowCreateModal(true)}>
                Create Your First Session
              </MainButton>
            </div>
          )}
        </div>
      </Panel>

      {/* Create Session Modal */}
      <Modal
        isOpen={showCreateModal}
        handleClose={() => setShowCreateModal(false)}
        className="mx-4 w-[600px] rounded-lg bg-gray-800 shadow-lg"
      >
        <div className="p-6">
          <h2 className="mb-6 text-2xl font-bold text-[#ffe75c]">Create New Game Session</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-white">Enemy</label>
              <select
                value={formData.enemyId}
                onChange={(e) => setFormData({ ...formData, enemyId: e.target.value })}
                className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
                disabled={isLoadingEnemies}
              >
                <option value="">Select an enemy</option>
                {enemies?.map((enemy) => (
                  <option key={enemy._id.toString()} value={enemy._id.toString()}>
                    {enemy.name} ({enemy.difficulty} - {enemy.type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-white">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as GameSessionStatus })}
                className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
              >
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-white">Start Time</label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-white">Scheduled End Time</label>
              <input
                type="datetime-local"
                value={formData.scheduledEndTime}
                onChange={(e) => setFormData({ ...formData, scheduledEndTime: e.target.value })}
                className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-4">
            <MainButton color="gray" onClick={() => setShowCreateModal(false)} className="flex-1">
              Cancel
            </MainButton>
            <MainButton
              color="yellow"
              onClick={handleCreate}
              disabled={
                createSessionMutation.isLoading ||
                !formData.enemyId ||
                !formData.startTime ||
                !formData.scheduledEndTime
              }
              className="flex-1"
            >
              {createSessionMutation.isLoading ? "Creating..." : "Create Session"}
            </MainButton>
          </div>
        </div>
      </Modal>

      {/* Edit Session Modal */}
      <Modal
        isOpen={showEditModal}
        handleClose={() => setShowEditModal(false)}
        className="mx-4 w-[600px] rounded-lg bg-gray-800 shadow-lg"
      >
        <div className="p-6">
          <h2 className="mb-6 text-2xl font-bold text-[#ffe75c]">Edit Game Session</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-white">Enemy</label>
              <select
                value={formData.enemyId}
                onChange={(e) => setFormData({ ...formData, enemyId: e.target.value })}
                className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
                disabled={isLoadingEnemies}
              >
                <option value="">Select an enemy</option>
                {enemies?.map((enemy) => (
                  <option key={enemy._id.toString()} value={enemy._id.toString()}>
                    {enemy.name} ({enemy.difficulty} - {enemy.type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-white">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as GameSessionStatus })}
                className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
              >
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-white">Start Time</label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-white">Scheduled End Time</label>
              <input
                type="datetime-local"
                value={formData.scheduledEndTime}
                onChange={(e) => setFormData({ ...formData, scheduledEndTime: e.target.value })}
                className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
              />
            </div>
            {(selectedSession?.status === "COMPLETED" || formData.status === "COMPLETED") && (
              <div>
                <label className="mb-2 block text-white">Win Condition</label>
                <select
                  value={formData.winCondition || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      winCondition: e.target.value ? (e.target.value as WinCondition) : undefined,
                    })
                  }
                  className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
                >
                  <option value="">Select win condition</option>
                  <option value="ENEMY_DEFEATED">Enemy Defeated</option>
                  <option value="TIME_EXPIRED">Time Expired</option>
                  <option value="MANUAL_END">Manual End</option>
                </select>
              </div>
            )}
          </div>
          <div className="mt-6 flex gap-4">
            <MainButton color="gray" onClick={() => setShowEditModal(false)} className="flex-1">
              Cancel
            </MainButton>
            <MainButton
              color="yellow"
              onClick={handleUpdate}
              disabled={updateSessionMutation.isLoading}
              className="flex-1"
            >
              {updateSessionMutation.isLoading ? "Updating..." : "Update Session"}
            </MainButton>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        className="mx-4 w-full max-w-md rounded-lg bg-gray-800 shadow-lg"
      >
        <div className="p-6">
          <h2 className="mb-6 text-2xl font-bold text-red-400">Delete Game Session</h2>
          <p className="mb-6 text-white">
            Are you sure you want to delete this game session for &ldquo;{selectedSession ? (selectedSession.enemyId as unknown as Enemy).name : ''}&rdquo;? This action cannot be undone.
          </p>
          {selectedSession?.status === "ACTIVE" && (
            <p className="mb-4 text-red-400 text-sm">
              Cannot delete an active session. Please change the status first.
            </p>
          )}
          <div className="flex gap-4">
            <MainButton color="gray" onClick={() => setShowDeleteModal(false)} className="flex-1">
              Cancel
            </MainButton>
            <MainButton
              color="red"
              onClick={handleDelete}
              disabled={
                deleteSessionMutation.isLoading || selectedSession?.status === "ACTIVE"
              }
              className="flex-1"
            >
              {deleteSessionMutation.isLoading ? "Deleting..." : "Delete Session"}
            </MainButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GameSessionManagement;