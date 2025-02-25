import { Redis } from "@upstash/redis";

// env variables
const url = process.env.NEXT_PUBLIC_KV_REST_API_URL;
const token = process.env.NEXT_PUBLIC_KV_REST_API_TOKEN;

if (!url || !token) {
  throw new Error("Missing Redis environment variables");
}

const redis = new Redis({
  url,
  token,
});

// Function to test Redis connection
export const testRedisConnection = async () => {
  try {
    const testKey = "_test_connection";
    const testValue = { test: "value" };

    await redis.set(testKey, testValue);
    const retrievedValue = await redis.get<{ test: string }>(testKey);

    // Clean up test key
    await redis.del(testKey);

    if (retrievedValue?.test === testValue.test) {
      console.log("Redis connection is working correctly.");
    } else {
      console.error("Redis connection test failed: Retrieved value does not match.");
      console.log("Expected:", testValue);
      console.log("Received:", retrievedValue);
    }
  } catch (error) {
    console.error("Redis connection test failed:", error);
  }
};

// Export all interfaces
export interface LinkedAccount {
  address: string | null;
  type: string;
  firstVerifiedAt: Date | null;
  latestVerifiedAt: Date | null;
  walletClientType?: string;
  connectorType?: string;
  isDefaultWallet?: boolean;
}

export interface PrivyData {
  id: string;
  createdAt: Date;
  linkedAccounts: LinkedAccount[];
}

export interface PaymentDetail {
  id_hash: string;
  chainId?: number;
  amount: number;
  currency: string;
  status: string;
  timestamp: Date;
  type: "stripe" | "crypto";
  subscriptionId: string;
  subscription: boolean;
  subscriptionEndsAt: Date;
  productId: string;
  productDownloaded: boolean;
}

export interface User {
  _id: string; // Internal UUID
  payed: boolean;
  privy: PrivyData;
  payments: PaymentDetail[];
}

export const db = {
  // Enter new user to database
  writeUser: async (key: string, user: User): Promise<string | null> => {
    try {
      // Convert dates to ISO strings before saving
      const serializedUser = {
        ...user,
        privy: {
          ...user.privy,
          createdAt: user.privy.createdAt.toISOString(),
          linkedAccounts: user.privy.linkedAccounts.map(account => ({
            ...account,
            firstVerifiedAt: account.firstVerifiedAt?.toISOString() || null,
            latestVerifiedAt: account.latestVerifiedAt?.toISOString() || null,
          })),
        },
        payments: user.payments.map(payment => ({
          ...payment,
          timestamp: payment.timestamp.toISOString(),
          subscriptionEndsAt: payment.subscriptionEndsAt.toISOString(),
        })),
      };
      const userData = JSON.stringify(serializedUser);
      return await redis.set(key, userData);
    } catch (error) {
      console.error("Write error:", error);
      throw error;
    }
  },

  // Read user from database
  readUser: async (key: string): Promise<User | null> => {
    try {
      const userData = await redis.get<string>(key);
      if (!userData) return null;

      // Skip if the value is the test value
      if (userData === "testValue") return null;

      let parsedUser;
      try {
        parsedUser = typeof userData === "string" ? JSON.parse(userData) : userData;
      } catch (error) {
        console.error("Parse error:", error);
        return null;
      }

      // Convert ISO strings back to Date objects
      return {
        ...parsedUser,
        privy: {
          ...parsedUser.privy,
          createdAt: new Date(parsedUser.privy.createdAt),
          linkedAccounts: parsedUser.privy.linkedAccounts.map((account: any) => ({
            ...account,
            firstVerifiedAt: account.firstVerifiedAt ? new Date(account.firstVerifiedAt) : null,
            latestVerifiedAt: account.latestVerifiedAt ? new Date(account.latestVerifiedAt) : null,
          })),
        },
        payments: parsedUser.payments.map((payment: any) => ({
          ...payment,
          timestamp: new Date(payment.timestamp),
          subscriptionEndsAt: new Date(payment.subscriptionEndsAt),
        })),
      };
    } catch (error) {
      console.error("Read error:", error);
      return null;
    }
  },

  addWalletToUser: async (
    userId: string,
    walletAddress: string,
    walletInfo?: {
      walletClientType?: string;
      connectorType?: string;
    },
  ): Promise<User | null> => {
    try {
      const userData = await db.readUser(userId);
      if (!userData) return null;

      // Only check if wallet exists in current user's account
      const walletExistsLocally = userData.privy.linkedAccounts.some(
        (account: LinkedAccount) => account.type === "wallet" && account.address === walletAddress,
      );

      if (walletExistsLocally) {
        // If wallet exists locally, just update isDefaultWallet flags
        userData.privy.linkedAccounts = userData.privy.linkedAccounts.map((account: LinkedAccount) => ({
          ...account,
          isDefaultWallet: account.type === "wallet" && account.address === walletAddress,
        }));
      } else {
        // Set all existing accounts' isDefaultWallet to false
        userData.privy.linkedAccounts = userData.privy.linkedAccounts.map((account: LinkedAccount) => ({
          ...account,
          isDefaultWallet: false,
        }));

        // Add new wallet with isDefaultWallet set to true
        userData.privy.linkedAccounts.push({
          address: walletAddress,
          type: "wallet",
          firstVerifiedAt: new Date(),
          latestVerifiedAt: new Date(),
          walletClientType: walletInfo?.walletClientType || "injected",
          connectorType: walletInfo?.connectorType || "injected",
          isDefaultWallet: true,
        });
      }

      await db.writeUser(userId, userData);
      return userData;
    } catch (error) {
      console.error("Error adding wallet to user:", error);
      throw error;
    }
  },

  readUserByInjectedWallet: async (walletAddress: string): Promise<User | null> => {
    try {
      const keys = await redis.keys("*");

      for (const key of keys) {
        const userData = await db.readUser(key);
        if (!userData) continue;

        // Check if any of the user's linked accounts match the injected wallet
        const hasMatchingWallet = userData.privy.linkedAccounts.some(
          account =>
            account.type === "wallet" && account.address === walletAddress && account.connectorType !== "embedded",
        );

        if (hasMatchingWallet) {
          return userData;
        }
      }
      return null;
    } catch (error) {
      console.error("Read user by injected wallet error:", error);
      throw error;
    }
  },

  getAllKeys: async (): Promise<string[]> => {
    try {
      return await redis.keys("*");
    } catch (error) {
      console.error("Get all keys error:", error);
      throw error;
    }
  },

  checkAccountExists: async (account: { type: string; address: string | null }): Promise<boolean> => {
    try {
      const keys = await redis.keys("*");

      for (const key of keys) {
        const userData = await db.readUser(key);
        if (!userData) continue;

        const hasAccount = userData.privy.linkedAccounts.some(
          dbAccount =>
            dbAccount.type === account.type &&
            dbAccount.address === account.address &&
            // Only check non-embedded wallets
            (account.type !== "wallet" || dbAccount.connectorType !== "embedded"),
        );

        if (hasAccount) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error checking account existence:", error);
      throw error;
    }
  },
};
