import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Confetti from "react-confetti";
import CopyToClipboard from "react-copy-to-clipboard";
import { usePublicClient } from "wagmi";
import { useAccount } from "wagmi";
import { useSwitchChain } from "wagmi";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useUSDCBalance } from "~~/hooks/useUSDCBalance";
import { MERCHANT_ADDRESS, useUSDCTransfer } from "~~/hooks/useUSDCTransfer";
import { NETWORK_CONFIG } from "~~/utils/networks";
import { notification } from "~~/utils/scaffold-eth";
import { PaymentDetail, db } from "~~/utils/upstash_db";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: bigint;
}

export const PaymentModal = ({ isOpen, onClose, amount }: PaymentModalProps) => {
  const { address, chain, connector } = useAccount();
  const { switchChain } = useSwitchChain();
  const usdcBalance = useUSDCBalance(address);
  const { transferUSDC } = useUSDCTransfer();
  const { user } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionData, setTransactionData] = useState<any>(null);
  const publicClient = usePublicClient();
  const { openConnectModal } = useConnectModal();

  // Initialize with first supported network, but will be updated when wallet connects
  const [selectedNetwork, setSelectedNetwork] = useState<number>(() => {
    return Object.values(NETWORK_CONFIG)[0].chainId;
  });

  // Watch for wallet connection and update selected network
  useEffect(() => {
    if (chain?.id && NETWORK_CONFIG[chain.id]) {
      setSelectedNetwork(chain.id);
    }
  }, [chain?.id]);

  // Reset states when modal is opened
  useEffect(() => {
    if (isOpen) {
      setPaymentSuccess(false);
      setTransactionData(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleWalletConnection = async () => {
      if (address && user && connector) {
        const walletInfo = {
          walletClientType: connector.id || "injected",
          connectorType: connector.name?.toLowerCase() || "injected",
        };
        try {
          await db.addWalletToUser(user.id, address, walletInfo);
        } catch (error) {
          console.error("Error saving wallet:", error);
        }
      }
    };

    if (address && user && connector) {
      handleWalletConnection();
    }
  }, [address, user, connector]);

  const width = typeof window !== "undefined" ? window.innerWidth * 2 : 1000;
  const height = typeof window !== "undefined" ? window.innerHeight * 2 : 1000;

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!user) {
      notification.error("Please sign in to continue");
      return;
    }

    // Check wallet connection first
    if (!address && openConnectModal) {
      notification.warning("Please connect your wallet for crypto payment");
      openConnectModal();
      return;
    }

    if (!address || !publicClient) {
      notification.error("Please connect your wallet to continue");
      return;
    }

    if (!NETWORK_CONFIG[chain?.id || 0]) {
      notification.error("Please select a supported network");
      return;
    }

    setIsLoading(true);
    try {
      const result = await transferUSDC(amount);
      if (result) {
        const { hash, receipt, amount: paidAmount, gasUsed, blockNumber, timestamp } = result;

        const userData = await db.readUser(user.id);
        if (!userData) return;

        const paymentDetail: PaymentDetail = {
          id_hash: hash,
          chainId: chain?.id,
          amount: paidAmount,
          currency: "USDC",
          status: receipt.status === "success" ? "succeeded" : "failed",
          type: "crypto",
          timestamp,
          subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          subscriptionId: "",
          subscription: false,
          productId: "",
          productDownloaded: false,
        };

        userData.payments.unshift(paymentDetail);
        userData.payed = true;
        await db.writeUser(user.id, userData);

        setTransactionData({
          hash,
          receipt,
          amount: paidAmount,
          gasUsed,
          blockNumber,
          timestamp,
        });
        setPaymentSuccess(true);
      }
    } catch (error: any) {
      console.error("Payment failed:", error);

      // Get user's current USDC balance
      const currentBalance = Number(usdcBalance);
      const requestedAmount = Number(amount);

      // Handle specific error cases
      if (error.message.includes("User rejected") || error.message.includes("user rejected")) {
        notification.error("You rejected the transaction");
      } else if (currentBalance < requestedAmount) {
        notification.error(
          `Insufficient USDC balance. You have ${currentBalance} USDC but trying to send ${requestedAmount} USDC`,
        );
      } else if (error.message.includes("reverted")) {
        notification.error("Transaction failed. Please check your balance and try again");
      } else {
        // For unknown errors, show a cleaner error message
        const cleanError = error.message.split("Request Arguments")[0].trim();
        notification.error(cleanError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNetworkChange = async (networkId: number) => {
    try {
      // Validate that the network is supported
      const targetNetwork = NETWORK_CONFIG[networkId];
      if (!targetNetwork) {
        notification.error("Network not supported");
        return;
      }

      if (switchChain) {
        // Add network if it doesn't exist in wallet
        try {
          await switchChain({ chainId: networkId });
        } catch (switchError: any) {
          console.error("Switch Error Details:", {
            code: switchError.code,
            message: switchError.message,
            connector: connector?.name, // from useAccount()
          });

          // Common error codes across different wallets
          if (switchError.code === 4001) {
            notification.error("User rejected network switch");
            return;
          }

          // Try to add the network if:
          // - MetaMask returns 4902 (chain not added)
          // - Generic JSON-RPC error (-32603)
          // - Method not supported (-32601)
          // - Or if we get any other error (wallet might need network to be added first)
          try {
            await window.ethereum?.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${networkId.toString(16)}`,
                  chainName: targetNetwork.label,
                  nativeCurrency: {
                    name: targetNetwork.viemChain.nativeCurrency.name,
                    symbol: targetNetwork.viemChain.nativeCurrency.symbol,
                    decimals: targetNetwork.viemChain.nativeCurrency.decimals,
                  },
                  rpcUrls: [targetNetwork.rpcUrl],
                  blockExplorerUrls: [targetNetwork.blockExplorer],
                },
              ],
            });
            // After adding, try switching again
            await switchChain({ chainId: networkId });
          } catch (addError: any) {
            console.error("Add Network Error:", addError);
            notification.error("Unable to switch networks. Please try switching networks directly in your wallet.");
            return;
          }
        }
        setSelectedNetwork(networkId);
      } else {
        notification.error("Your wallet does not support programmatic network switching");
      }
    } catch (error: any) {
      console.error("Network Change Error:", error);
      notification.error(error.message || "Failed to switch network");
      // Reset the select to the current chain
      setSelectedNetwork(chain?.id || networkId);
    }
  };

  const networkSelector = (
    <div className="flex flex-col gap-2 mb-4">
      <label className="text-sm font-bold opacity-80">Network</label>
      <div className="relative">
        <select
          className="select select-ghost w-full bg-base-100 border border-base-300 rounded-3xl font-medium text-sm"
          value={selectedNetwork}
          onChange={e => handleNetworkChange(Number(e.target.value))}
        >
          {Object.values(NETWORK_CONFIG).map(network => (
            <option key={network.chainId} value={network.chainId} className="bg-base-100">
              {network.label}
            </option>
          ))}
        </select>
      </div>
      <div className="text-s text-red-600 break-all">
        <p>TESTING: USDC ADDRESS</p>
        {NETWORK_CONFIG[selectedNetwork]?.usdcAddress || "Not supported on this network"}
      </div>
    </div>
  );

  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
        <div className="modal-box relative text-center w-full max-w-xs sm:max-w-sm md:max-w-md">
          <div className="absolute inset-0">
            <Confetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={1200}
              gravity={0.2}
              drawShape={(ctx: CanvasRenderingContext2D) => {
                ctx.beginPath();
                ctx.arc(0, 0, 15, 0, 10 * Math.PI);
                ctx.fill();
              }}
              style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
            />
          </div>
          <div className="relative z-10 py-4 sm:py-6">
            <h3 className="text-xl sm:text-2xl font-bold text-success mb-4">Payment Successful!</h3>

            {transactionData && (
              <div className="mt-4 mx-auto">
                <div className="bg-base-200 opacity-50 rounded-lg p-4 sm:p-6 shadow-lg">
                  <div className="text-center mb-4">
                    <h4 className="text-lg sm:text-xl font-semibold">Transaction Receipt</h4>
                    <p className="text-xs sm:text-sm opacity-60">{transactionData.timestamp.toLocaleString()}</p>
                    <p className="text-xs sm:text-sm opacity-60">Block #{transactionData.blockNumber}</p>
                  </div>

                  <div className="divide-y divide-base-300">
                    <div className="py-3">
                      <span className="text-sm opacity-75 block mb-2">Transaction Hash</span>
                      <div className="font-mono text-sm break-all">
                        {transactionData.hash}
                        <CopyToClipboard
                          text={transactionData.hash}
                          onCopy={() => {
                            notification.success("Transaction hash copied to clipboard!");
                          }}
                        >
                          <DocumentDuplicateIcon className="inline-block ml-2 h-4 w-4 cursor-pointer hover:text-primary" />
                        </CopyToClipboard>
                      </div>
                    </div>

                    <div className="py-3 flex justify-between">
                      <span className="text-sm opacity-75">From</span>
                      <span className="text-sm font-mono">
                        {address?.slice(0, 8)}...{address?.slice(-4)}
                      </span>
                    </div>

                    <div className="py-3 flex justify-between">
                      <span className="text-sm opacity-75">To</span>
                      <span className="text-sm font-mono">
                        {MERCHANT_ADDRESS.slice(0, 8)}...{MERCHANT_ADDRESS.slice(-4)}
                      </span>
                    </div>

                    <div className="py-3 flex justify-between">
                      <span className="text-sm opacity-75">Gas Used</span>
                      <span className="text-sm">{transactionData.gasUsed.toString()}</span>
                    </div>

                    <div className="py-4 flex justify-between items-center">
                      <span className="text-base font-semibold">Amount Paid</span>
                      <span className="text-xl font-bold">{transactionData.amount.toFixed(2)} USDC</span>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-sm opacity-60 mb-4">Thank you for your purchase!</p>
                    <button onClick={onClose} className="btn btn-primary">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="modal-box relative w-full max-w-xs sm:max-w-sm overflow-hidden p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-bold">Confirm Payment</h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            ✕
          </button>
        </div>

        {networkSelector}

        <div className="space-y-4">
          <div className="bg-base-100 border border-base-300 rounded-3xl px-6 py-4 space-y-3">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-base-300 pb-3">
                <span className="text-sm font-bold">Product Price:</span>
                <div className="flex items-center">
                  <span className="text-2xl font-bold">{Number(amount)}</span>
                  <span className="ml-2 text-sm opacity-70">USDC</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold">Connected Wallet (Balance):</span>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-mono">
                    {address?.slice(0, 8)}...{address?.slice(-4)}
                  </span>
                  <div className="flex items-center">
                    <span className="text-sm">{usdcBalance}</span>
                    <span className="ml-2 text-sm opacity-70">USDC</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold">Merchant Wallet:</span>
                <span className="text-sm font-mono">
                  {MERCHANT_ADDRESS.slice(0, 8)}...{MERCHANT_ADDRESS.slice(-4)}
                </span>
              </div>

              <div className="flex flex-col gap-1 border-t border-base-300 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">Network:</span>
                  <span className="text-sm">{chain?.name || "Not Connected"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">Token:</span>
                  <span className="text-sm">USDC (USD Coin)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button className="btn btn-ghost btn-sm px-6" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary btn-sm px-6" onClick={handlePayment} disabled={isLoading}>
              {isLoading ? <span className="loading loading-spinner loading-sm"></span> : "Confirm Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
