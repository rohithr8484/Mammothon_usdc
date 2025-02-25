import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { erc20Abi } from "viem";
import { usePublicClient } from "wagmi";
import { useAccount } from "wagmi";
import { NETWORK_CONFIG } from "~~/utils/networks";

const SUPPORTED_NETWORKS = [
  31337, // Hardhat/Localhost
  1, // Mainnet
  10, // Optimism
  137, // Polygon
  42161, // Arbitrum
  8453, // Base
  43114, // Avalanche
  56, // BSC
  250, // Fantom
];

export const useUSDCBalance = (address?: string) => {
  const [balance, setBalance] = useState<string>("0");
  const { chain } = useAccount();
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchBalance = async () => {
      const currentChainId = chain?.id;

      if (!address || !currentChainId || !publicClient) {
        setBalance("0");
        return;
      }

      if (!SUPPORTED_NETWORKS.includes(currentChainId)) {
        return;
      }

      try {
        const data = await publicClient.readContract({
          address: NETWORK_CONFIG[currentChainId].usdcAddress,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [address],
        });

        const formatted = formatUnits(data as bigint, 6);
        setBalance(Number(formatted).toFixed(2));
      } catch (error) {
        if (SUPPORTED_NETWORKS.includes(currentChainId)) {
          console.error("Error fetching USDC balance:", error);
        }
        setBalance("0");
      }
    };

    fetchBalance();
  }, [address, chain?.id, publicClient]);

  return balance;
};
