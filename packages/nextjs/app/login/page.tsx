"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Button } from "~~/components/auth";
import { db } from "~~/utils/upstash_db";

export default function LoginPage() {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    const handleUserAuth = async () => {
      if (ready && authenticated && user) {
        try {
          // First check if user exists by Privy ID
          const existingUser = await db.readUser(user.id);

          // If no user found, check for matching accounts
          if (!existingUser) {
            const filteredAccounts = await Promise.all(
              user.linkedAccounts.map(async account => {
                if ("address" in account && account.address) {
                  const exists = await db.checkAccountExists({
                    type: account.type,
                    address: account.address,
                  });
                  return exists ? null : account;
                }
                return account;
              }),
            );

            // Create new user with filtered accounts
            const newUser = {
              _id: crypto.randomUUID(),
              payed: false,
              privy: {
                id: user.id,
                createdAt: user.createdAt,
                linkedAccounts: filteredAccounts
                  .filter(account => account !== null)
                  .map(account => ({
                    address: "address" in account ? account.address : null,
                    type: account.type,
                    firstVerifiedAt: account.firstVerifiedAt,
                    latestVerifiedAt: account.latestVerifiedAt,
                    ...("walletClientType" in account && {
                      walletClientType: account.walletClientType,
                      ...("connectorType" in account && { connectorType: account.connectorType }),
                    }),
                  })),
              },
              payments: [],
            };

            await db.writeUser(user.id, newUser);
          }

          router.push("/");
        } catch (error) {
          console.error("Error handling user authentication:", error);
          router.push("/");
        }
      }
    };

    handleUserAuth();
  }, [ready, authenticated, user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-primary/5 to-secondary/5">
      <div className="absolute top-4 right-4 z-50">
        <SwitchTheme />
      </div>

      <div className="absolute inset-0 overflow-hidden z-0">
        <div
          className="absolute w-[200%] h-[100%] bg-base-300 origin-top-left -rotate-12 translate-y-1/2"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)" }}
        />

        <div className="absolute w-full h-full">
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-4 h-full transform rotate-12 scale-150">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-primary/20 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12 sm:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12">
            <div className="flex-1 text-center lg:text-left order-1 lg:order-1">
              <div className="w-16 h-1 bg-primary mb-8 mx-auto lg:mx-0" />
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Digital Assets, <br className="hidden sm:block" />
                Reimagined.
              </h1>
              <p className="text-lg md:text-xl text-base-content/70 mb-8">
                Your one-stop platform for premium digital content, expert-led courses, and exclusive Web3
                subscriptions.
              </p>
              <Button />
            </div>
            <div className="flex-1 order-2 lg:order-2 w-full">
              <div className="grid grid-cols-1 gap-8 px-8">
                <div className="relative aspect-square rounded-xl">
                  <div className="absolute inset-1 bg-base-200/50 backdrop-blur-sm rounded-lg p-4 border border-base-content/10">
                    <div className="h-full bg-gradient-to-br from-primary/20 to-secondary/80 rounded-md p-4 relative">
                      <Image
                        src="/Store.jpg"
                        alt="thumbnail"
                        fill
                        className="object-cover rounded-md mix-blend-luminosity"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-secondary/80 rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 sm:mt-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
              {[
                {
                  title: "Flexible Payments",
                  description: "Accept both USDC crypto payments and traditional credit card payments seamlessly.",
                  icon: "💳",
                },
                {
                  title: "Digital Products",
                  description: "Sell downloadable content, time-based course access, and subscription services.",
                  icon: "📦",
                },
                {
                  title: "Web3 Authentication",
                  description: "Simple login with email or wallet, with secure user data management.",
                  icon: "🔐",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-base-200/50 backdrop-blur-md p-8 rounded-xl border border-base-content/10 transform hover:scale-105 transition-all duration-300"
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-base-content/70">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(3deg);
          }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-y-12 {
          transform: rotateY(12deg);
        }
        .rotate-y-6 {
          transform: rotateY(6deg);
        }
        .rotate-x-12 {
          transform: rotateX(12deg);
        }
      `}</style>
    </div>
  );
}
