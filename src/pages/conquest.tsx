import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Conquest() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/toon-of-ladder");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] flex items-center justify-center">
      <p className="text-center text-2xl text-white">Redirecting to Toon of Ladder...</p>
    </div>
  );
}
