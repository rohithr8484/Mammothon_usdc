"use client";

import { Address, formatEther } from "viem";
import { useWatchBalance } from "~~/hooks/scaffold-eth/useWatchBalance";
import { useUSDCBalance } from "~~/hooks/useUSDCBalance";

type BalanceProps = {
  address?: Address;
  className?: string;
};

export const Balance = ({ address, className = "" }: BalanceProps) => {
  const usdcBalance = useUSDCBalance(address);
  const { data: ethBalance } = useWatchBalance({ address });

  if (!address) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-md bg-slate-300 h-6 w-6"></div>
        <div className="flex items-center space-y-6">
          <div className="h-2 w-28 bg-slate-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`btn btn-sm btn-ghost flex font-normal items-center hover:bg-transparent ${className}`}>
      <span className="text-[0.8em] font-bold mr-1">USDC:</span>
      <span>{usdcBalance} / </span>
      <span className="text-[0.8em] font-bold mr-1">ETH:</span>
      <span>{ethBalance ? formatEther(ethBalance.value) : "0"}</span>
    </div>
  );
};
