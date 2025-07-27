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
import { getEnemyImageSrc, getAvailableEnemyImages } from "../../../utils/enemy-images";

type Enemy = {
  _id: { toString(): string };
  name: string;
  image: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  type: "BOSS" | "MINION" | "ELITE";
  maxHealth: number;
  currentHealth: number;
  isDefeated: boolean;
  totalDamageReceived: number;
  totalPowerReceived: number;
  createdAt: Date | string;
  updatedAt: Date | string;
};

const EnemyManagement: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    image: "enemy_1", // Default to first available enemy image
    difficulty: "MEDIUM" as "EASY" | "MEDIUM" | "HARD",
    type: "MINION" as "BOSS" | "MINION" | "ELITE",
    maxHealth: 1000,
  });

  // tRPC queries and mutations
  const {
    data: enemies,
    refetch: refetchEnemies,
    isLoading,
  } = trpc.gameManagement.getEnemies.useQuery();
  const createEnemyMutation = trpc.gameManagement.createEnemy.useMutation();
  const updateEnemyMutation = trpc.gameManagement.updateEnemy.useMutation();
  const deleteEnemyMutation = trpc.gameManagement.deleteEnemy.useMutation();

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
      name: "",
      image: "enemy_1", // Default to first available enemy image
      difficulty: "MEDIUM" as "EASY" | "MEDIUM" | "HARD",
      type: "MINION" as "BOSS" | "MINION" | "ELITE",
      maxHealth: 1000,
    });
  };

  const handleCreate = async () => {
    try {
      await createEnemyMutation.mutateAsync(formData);
      toast.success("Enemy created successfully!");
      setShowCreateModal(false);
      resetForm();
      refetchEnemies();
    } catch (error) {
      toast.error("Failed to create enemy");
    }
  };

  const handleEdit = (enemy: Enemy) => {
    setSelectedEnemy(enemy);
    setFormData({
      name: enemy.name,
      image: enemy.image,
      difficulty: enemy.difficulty,
      type: enemy.type,
      maxHealth: enemy.maxHealth,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedEnemy) return;

    try {
      await updateEnemyMutation.mutateAsync({
        enemyId: selectedEnemy._id.toString(),
        ...formData,
      });
      toast.success("Enemy updated successfully!");
      setShowEditModal(false);
      setSelectedEnemy(null);
      resetForm();
      refetchEnemies();
    } catch (error) {
      toast.error("Failed to update enemy");
    }
  };

  const handleDelete = async () => {
    if (!selectedEnemy) return;

    try {
      await deleteEnemyMutation.mutateAsync({
        enemyId: selectedEnemy._id.toString(),
      });
      toast.success("Enemy deleted successfully!");
      setShowDeleteModal(false);
      setSelectedEnemy(null);
      refetchEnemies();
    } catch (error) {
      toast.error("Failed to delete enemy");
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "BOSS":
        return "text-purple-400";
      case "ELITE":
        return "text-orange-400";
      case "MINION":
        return "text-blue-400";
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
            <h1 className="text-4xl font-bold text-[#ffe75c]">Enemy Management</h1>
            <MainButton color="yellow" onClick={() => setShowCreateModal(true)}>
              Create New Enemy
            </MainButton>
          </div>

          {isLoading ? (
            <div className="py-8 text-center">
              <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-2 border-[#ffe75c]"></div>
              <p className="mt-4 text-white">Loading enemies...</p>
            </div>
          ) : enemies && enemies.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enemies.map((enemy) => (
                <div
                  key={enemy._id.toString()}
                  className="overflow-hidden rounded-lg border border-gray-600 bg-gray-800"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-700">
                    <Image
                      src={getEnemyImageSrc(enemy.image)}
                      alt={enemy.name}
                      width={400}
                      height={225}
                      className="h-48 w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getEnemyImageSrc("placeholder");
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 text-xl font-bold text-white">{enemy.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Difficulty:</span>
                        <span className={getDifficultyColor(enemy.difficulty)}>
                          {enemy.difficulty}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className={getTypeColor(enemy.type)}>{enemy.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Health:</span>
                        <span className="text-white">
                          {enemy.currentHealth} / {enemy.maxHealth}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={enemy.isDefeated ? "text-red-400" : "text-green-400"}>
                          {enemy.isDefeated ? "Defeated" : "Active"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <MainButton
                        color="blue"
                        onClick={() => handleEdit(enemy)}
                        className="flex-1 text-sm"
                      >
                        Edit
                      </MainButton>
                      <MainButton
                        color="red"
                        onClick={() => {
                          setSelectedEnemy(enemy);
                          setShowDeleteModal(true);
                        }}
                        className="flex-1 text-sm"
                      >
                        Delete
                      </MainButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="mb-4 text-gray-400">No enemies found</p>
              <MainButton color="yellow" onClick={() => setShowCreateModal(true)}>
                Create Your First Enemy
              </MainButton>
            </div>
          )}
        </div>
      </Panel>

      {/* Create Enemy Modal */}
      <Modal
        isOpen={showCreateModal}
        handleClose={() => setShowCreateModal(false)}
        className="mx-4 w-[600px] rounded-lg bg-gray-800 shadow-lg"
      >
        <div className="p-6">
          <h2 className="mb-6 text-2xl font-bold text-[#ffe75c]">Create New Enemy</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-white">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
                placeholder="Enemy name"
              />
            </div>
            <div>
              <label className="mb-2 block text-white">Enemy Image</label>
              <select
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
              >
                {getAvailableEnemyImages().map((imageOption) => (
                  <option key={imageOption.value} value={imageOption.value}>
                    {imageOption.label}
                  </option>
                ))}
              </select>
              {/* Image Preview */}
              <div className="mt-2">
                <Image
                  src={getEnemyImageSrc(formData.image)}
                  alt="Preview"
                  width={200}
                  height={120}
                  className="h-20 w-32 rounded border border-gray-600 object-cover"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-white">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      difficulty: e.target.value as "EASY" | "MEDIUM" | "HARD",
                    })
                  }
                  className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-white">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "BOSS" | "MINION" | "ELITE",
                    })
                  }
                  className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
                >
                  <option value="MINION">Minion</option>
                  <option value="ELITE">Elite</option>
                  <option value="BOSS">Boss</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-white">Max Health</label>
              <input
                type="number"
                value={formData.maxHealth}
                onChange={(e) =>
                  setFormData({ ...formData, maxHealth: parseInt(e.target.value) || 1000 })
                }
                className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
                min="1"
                max="100000"
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
              disabled={createEnemyMutation.isLoading || !formData.name}
              className="flex-1"
            >
              {createEnemyMutation.isLoading ? "Creating..." : "Create Enemy"}
            </MainButton>
          </div>
        </div>
      </Modal>

      {/* Edit Enemy Modal */}
      <Modal
        isOpen={showEditModal}
        handleClose={() => setShowEditModal(false)}
        className="mx-4 w-[600px] rounded-lg bg-gray-800 shadow-lg"
      >
        <div className="p-6">
          <h2 className="mb-6 text-2xl font-bold text-[#ffe75c]">Edit Enemy</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-white">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-white">Enemy Image</label>
              <select
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
              >
                {getAvailableEnemyImages().map((imageOption) => (
                  <option key={imageOption.value} value={imageOption.value}>
                    {imageOption.label}
                  </option>
                ))}
              </select>
              {/* Image Preview */}
              <div className="mt-2">
                <Image
                  src={getEnemyImageSrc(formData.image)}
                  alt="Preview"
                  width={200}
                  height={120}
                  className="h-20 w-32 rounded border border-gray-600 object-cover"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-white">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      difficulty: e.target.value as "EASY" | "MEDIUM" | "HARD",
                    })
                  }
                  className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-white">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "BOSS" | "MINION" | "ELITE",
                    })
                  }
                  className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
                >
                  <option value="MINION">Minion</option>
                  <option value="ELITE">Elite</option>
                  <option value="BOSS">Boss</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-white">Max Health</label>
              <input
                type="number"
                value={formData.maxHealth}
                onChange={(e) =>
                  setFormData({ ...formData, maxHealth: parseInt(e.target.value) || 1000 })
                }
                className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
                min="1"
                max="100000"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-4">
            <MainButton color="gray" onClick={() => setShowEditModal(false)} className="flex-1">
              Cancel
            </MainButton>
            <MainButton
              color="yellow"
              onClick={handleUpdate}
              disabled={updateEnemyMutation.isLoading}
              className="flex-1"
            >
              {updateEnemyMutation.isLoading ? "Updating..." : "Update Enemy"}
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
          <h2 className="mb-6 text-2xl font-bold text-red-400">Delete Enemy</h2>
          <p className="mb-6 text-white">
            Are you sure you want to delete &ldquo;{selectedEnemy?.name}&rdquo;? This action cannot
            be undone.
          </p>
          <div className="flex gap-4">
            <MainButton color="gray" onClick={() => setShowDeleteModal(false)} className="flex-1">
              Cancel
            </MainButton>
            <MainButton
              color="red"
              onClick={handleDelete}
              disabled={deleteEnemyMutation.isLoading}
              className="flex-1"
            >
              {deleteEnemyMutation.isLoading ? "Deleting..." : "Delete Enemy"}
            </MainButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EnemyManagement;
