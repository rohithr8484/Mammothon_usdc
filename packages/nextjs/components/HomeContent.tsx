"use client";

import Link from "next/link";
import { ProductCard } from "./ProductCard";
import { sampleProducts } from "./SampleProducts";
import { usePrivy } from "@privy-io/react-auth";
// import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { UserAuth } from "~~/components/db";

export const HomeContent = () => {
  const { user } = usePrivy();

  const renderUserDetails = () => {
    if (!user) return null;

    return (
      <div className="p-5 bg-base-100 border border-base-300 rounded-lg shadow-md w-full">
        <h2 className="text-xl font-semibold mb-4">Current User</h2>
        <div className="flex items-center gap-2">
          <p className="text-sm">test user:</p>
          <p className="text-sm text-red-500">ID: did:privy:cm5sma46v08hjoahlcuql688f</p>
        </div>
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <span className="font-medium whitespace-nowrap">Privy ID: </span>
            <span className="text-sm my-auto">{user.id}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-5 sm:pt-10">
      <div className="px-2 sm:px-5 w-full">
        <h1 className="text-center mb-8">
          <span className="block text-3xl sm:text-4xl font-bold">IdeaBox</span>
        </h1>
        {/* Products */}
        <div className="w-full max-w-7xl mx-auto mt-8 sm:mt-16">
          {/* All Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 px-2 sm:px-6">
            <ProductCard product={sampleProducts.digital} />
            <ProductCard product={sampleProducts.course} />
            <ProductCard product={sampleProducts.subscription} />
            <ProductCard product={sampleProducts.softwareLicense} />
            <ProductCard product={sampleProducts.membership} />
            <ProductCard product={sampleProducts.apiAccess} />
          </div>
        </div>
        {/* Redis */}
        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12 rounded-3xl">
          {/* Privy User Details */}
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row pb-10">
            {renderUserDetails()}
          </div>
          <UserAuth />
        </div>
        {/* SE2 */}
        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12 rounded-3xl">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
