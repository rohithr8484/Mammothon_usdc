"use client";

import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useDisconnect } from "wagmi";

const LogoutButton = () => {
  const { logout } = usePrivy();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    disconnect();
    router.push("/login");
  };

  return (
    <button onClick={handleLogout} className="btn btn-sm btn-error">
      Logout
    </button>
  );
};

export default LogoutButton;
