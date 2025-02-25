"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { authenticated, ready } = usePrivy();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !authenticated && pathname !== "/login") {
      router.replace("/login");
    }
  }, [ready, authenticated, router, pathname]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Allow access to login page even when not authenticated
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Show loading state instead of immediate redirect
  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;
