"use client";

import React from "react";
import { usePrivy } from "@privy-io/react-auth";

const Button: React.FC = () => {
  const { ready, authenticated, login } = usePrivy();
  const disableLogin = !ready || authenticated;

  return (
    <button
      className="btn btn-primary btn-lg px-4 sm:px-10 py-2 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-base-content/40"
      onClick={login}
      disabled={disableLogin}
    >
      {!ready ? (
        <span className="loading loading-spinner loading-md"></span>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="hidden sm:inline">Login with your email or wallet of choice</span>
            <span className="sm:hidden">Login with email/wallet</span>
            <span className="text-[0.65rem] opacity-70 -mt-1">to see the full list of features</span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      )}
    </button>
  );
};

export default Button;
