import { Chain } from "viem";
import { arbitrum, avalanche, base, bsc, fantom, hardhat, mainnet, optimism, polygon } from "viem/chains";

export type NetworkConfig = {
  chainId: number;
  viemChain: Chain;
  label: string;
  rpcUrl: string;
  blockExplorer: string;
  usdcAddress: string;
  color?: string | [string, string];
};

export const NETWORK_CONFIG: { [chainId: number]: NetworkConfig } = {
  [mainnet.id]: {
    chainId: mainnet.id,
    viemChain: mainnet,
    label: "Ethereum",
    rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    blockExplorer: "https://etherscan.io/",
    usdcAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    color: "#ff8b9e",
  },
  [optimism.id]: {
    chainId: optimism.id,
    viemChain: optimism,
    label: "Optimism",
    rpcUrl: `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    blockExplorer: "https://optimistic.etherscan.io/",
    usdcAddress: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    color: "#f01a37",
  },
  [polygon.id]: {
    chainId: polygon.id,
    viemChain: polygon,
    label: "Polygon",
    rpcUrl: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    blockExplorer: "https://polygonscan.com/",
    usdcAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    color: "#2bbdf7",
  },
  [arbitrum.id]: {
    chainId: arbitrum.id,
    viemChain: arbitrum,
    label: "Arbitrum",
    rpcUrl: `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    blockExplorer: "https://arbiscan.io/",
    usdcAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    color: "#28a0f0",
  },
  [base.id]: {
    chainId: base.id,
    viemChain: base,
    label: "Base",
    rpcUrl: `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    blockExplorer: "https://basescan.org/",
    usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    color: "#0052ff",
  },
  [avalanche.id]: {
    chainId: avalanche.id,
    viemChain: avalanche,
    label: "Avalanche",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    blockExplorer: "https://snowtrace.io/",
    usdcAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    color: "#E84142",
  },
  [bsc.id]: {
    chainId: bsc.id,
    viemChain: bsc,
    label: "BSC",
    rpcUrl: "https://bsc-dataseed.binance.org/",
    blockExplorer: "https://bscscan.com/",
    usdcAddress: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    color: "#F0B90B",
  },
  [fantom.id]: {
    chainId: fantom.id,
    viemChain: fantom,
    label: "Fantom",
    rpcUrl: "https://rpc.ankr.com/fantom",
    blockExplorer: "https://ftmscan.com/",
    usdcAddress: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
    color: "#1969FF",
  },
  [hardhat.id]: {
    chainId: hardhat.id,
    viemChain: hardhat,
    label: "Localhost",
    rpcUrl: "http://localhost:8545",
    blockExplorer: "",
    usdcAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    color: "#b8af0c",
  },
};

export const getNetworkColor = (chainId: number): string => {
  return (NETWORK_CONFIG[chainId]?.color as string) || "#666666";
};

export const getUSDCAddress = (chainId: number): string => {
  return NETWORK_CONFIG[chainId]?.usdcAddress || NETWORK_CONFIG[mainnet.id].usdcAddress;
};

export const getSupportedNetworks = () => Object.values(NETWORK_CONFIG);
