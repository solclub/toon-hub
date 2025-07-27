import { useState } from "react";
import { type NextPage } from "next";
import { useSession, signIn } from "next-auth/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Panel from "../../components/common/Panel";
import MainButton from "../../components/common/MainButton";
import Link from "next/link";
import { toast } from "react-toastify";
import { SigninMessage } from "utils/signin-message";
import { getCsrfToken } from "next-auth/react";
import bs58 from "bs58";

const AdminDashboard: NextPage = () => {
  const { data: session, status } = useSession();
  const { publicKey, signMessage } = useWallet();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleWalletAuth = async () => {
    if (!publicKey || !signMessage) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsAuthenticating(true);
      const csrf = await getCsrfToken();
      if (!csrf) {
        throw new Error("Failed to get CSRF token");
      }

      const message = new SigninMessage({
        domain: window.location.host,
        publicKey: publicKey.toBase58(),
        statement: "Sign in to access Admin Dashboard",
        nonce: csrf,
      });

      const data = message.prepare();
      const signature = await signMessage(data);
      const serializedSignature = bs58.encode(signature);

      const result = await signIn("credentials", {
        message: JSON.stringify(message),
        signature: serializedSignature,
        csrfToken: csrf,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Authentication failed");
      } else {
        toast.success("Successfully authenticated!");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("Authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Panel>
          <div className="p-8 text-center">
            <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-[#ffe75c]"></div>
            <p className="mt-4 text-white">Loading...</p>
          </div>
        </Panel>
      </div>
    );
  }

  // Not authenticated - show wallet connect
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Panel>
          <div className="max-w-md p-8 text-center">
            <h1 className="mb-6 text-3xl font-bold text-[#ffe75c]">Admin Dashboard</h1>
            <p className="mb-6 text-white">
              Connect your Solana wallet to access the admin dashboard.
            </p>
            <div className="mb-6">
              <WalletMultiButton className="!bg-[#ffe75c] !text-black hover:!bg-yellow-400" />
            </div>
            {publicKey && (
              <MainButton
                color="yellow"
                onClick={handleWalletAuth}
                disabled={isAuthenticating}
                className="w-full"
              >
                {isAuthenticating ? "Authenticating..." : "Sign In"}
              </MainButton>
            )}
          </div>
        </Panel>
      </div>
    );
  }

  // Not admin - show access denied
  if (!session.user?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Panel>
          <div className="max-w-md p-8 text-center">
            <h1 className="mb-6 text-3xl font-bold text-red-500">Access Denied</h1>
            <p className="mb-6 text-white">
              You do not have admin privileges. Please contact an administrator if you believe this
              is an error.
            </p>
            <p className="text-sm text-gray-400">Wallet: {session.user.walletId}</p>
          </div>
        </Panel>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="container mx-auto px-4 py-8">
      <Panel>
        <div className="p-8">
          <h1 className="mb-8 text-center text-4xl font-bold text-[#ffe75c]">Admin Dashboard</h1>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Enemy Management */}
            <Link href="/admin/enemies">
              <div className="cursor-pointer rounded-lg border border-gray-600 bg-gray-800 p-6 transition-colors hover:bg-gray-700">
                <h2 className="mb-4 text-2xl font-bold text-[#ffe75c]">Enemy Management</h2>
                <p className="mb-4 text-white">
                  Create, edit, and manage enemies for the battle system.
                </p>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Add new enemies</li>
                  <li>• Edit existing enemies</li>
                  <li>• Manage health and difficulty</li>
                  <li>• Upload enemy images</li>
                </ul>
              </div>
            </Link>

            {/* Crayon Token Management */}
            <Link href="/admin/crayon">
              <div className="cursor-pointer rounded-lg border border-gray-600 bg-gray-800 p-6 transition-colors hover:bg-gray-700">
                <h2 className="mb-4 text-2xl font-bold text-[#ffe75c]">Crayon Token</h2>
                <p className="mb-4 text-white">
                  Manage the crayon token creation and minting process.
                </p>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Initialize SPL Token</li>
                  <li>• Add metadata JSON</li>
                  <li>• Mint tokens</li>
                  <li>• Track token state</li>
                </ul>
              </div>
            </Link>

            {/* Game Management */}
            <Link href="/admin/game-sessions">
              <div className="cursor-pointer rounded-lg border border-gray-600 bg-gray-800 p-6 transition-colors hover:bg-gray-700">
                <h2 className="mb-4 text-2xl font-bold text-[#ffe75c]">Game Session Management</h2>
                <p className="mb-4 text-white">
                  Create, schedule, and manage game sessions with enemies.
                </p>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Create new game sessions</li>
                  <li>• Schedule start and end times</li>
                  <li>• Monitor active sessions</li>
                  <li>• View session statistics</li>
                </ul>
              </div>
            </Link>

            {/* User Management */}
            <div className="rounded-lg border border-gray-600 bg-gray-800 p-6 opacity-50">
              <h2 className="mb-4 text-2xl font-bold text-gray-500">User Management</h2>
              <p className="mb-4 text-gray-400">Manage user accounts and admin privileges.</p>
              <p className="text-xs text-gray-500">Coming Soon</p>
            </div>
          </div>

          {/* Admin Info */}
          <div className="mt-8 rounded-lg border border-gray-600 bg-gray-800 p-4">
            <h3 className="mb-2 text-lg font-bold text-[#ffe75c]">Admin Session Info</h3>
            <p className="text-sm text-gray-300">
              Logged in as: <span className="text-white">{session.user.walletId}</span>
            </p>
            <p className="text-sm text-gray-300">
              Admin Status: <span className="text-green-400">Active</span>
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
};

export default AdminDashboard;
