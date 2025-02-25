"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Confetti from "react-confetti";
import { PaymentDetail, db } from "~~/utils/upstash_db";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CheckoutForm = ({ amount }: { amount: bigint }) => {
  const { user } = usePrivy();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"initial" | "processing" | "succeeded" | "failed">("initial");
  const [paymentData, setPaymentData] = useState<any>(null);

  const width = window.innerWidth * 2;
  const height = window.innerHeight * 2;

  const handlePaymentSuccess = async (paymentIntent: any) => {
    if (!user) return;

    try {
      const userData = await db.readUser(user.id);
      if (!userData) return;

      const paymentDetail: PaymentDetail = {
        id_hash: paymentIntent.id,
        chainId: 0,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        type: "stripe",
        timestamp: new Date(paymentIntent.created * 1000),
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subscriptionId: "",
        subscription: false,
        productId: "",
        productDownloaded: false,
      };
      // Add the payment detail to the user's payments array at [0]
      userData.payments.unshift(paymentDetail);
      userData.payed = true;
      await db.writeUser(user.id, userData);
    } catch (error) {
      console.error("Error updating user payment data:", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);
    setStatus("processing");

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (confirmError) {
        throw confirmError;
      }

      if (paymentIntent.status === "succeeded") {
        setStatus("succeeded");
        setPaymentData(paymentIntent);
        await handlePaymentSuccess(paymentIntent);
      }
    } catch (e: any) {
      setError(e.message || "An error occurred");
      setStatus("failed");
      console.error("Payment failed:", e);
    } finally {
      setLoading(false);
    }
  };

  if (status === "succeeded") {
    return (
      <div className="relative text-center w-full">
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
        <div className="relative z-10 py-4">
          <h3 className="text-xl sm:text-2xl font-bold text-success mb-4">Payment Successful!</h3>

          {paymentData && (
            <div className="mt-4 sm:mt-6 w-full max-w-xs sm:max-w-sm mx-auto">
              <div className="bg-base-200 opacity-50 rounded-lg p-4 sm:p-6 shadow-lg">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-semibold">Payment Receipt</h4>
                  <p className="text-sm opacity-60">{new Date(paymentData.created * 1000).toLocaleString()}</p>
                </div>

                <div className="divide-y divide-base-300">
                  <div className="py-3 flex justify-between">
                    <span className="text-sm opacity-75">Transaction ID</span>
                    <span className="text-sm font-mono">{paymentData.id.slice(-8)}</span>
                  </div>

                  <div className="py-3 flex justify-between">
                    <span className="text-sm opacity-75">Status</span>
                    <span className="badge badge-success">{paymentData.status}</span>
                  </div>

                  <div className="py-3 flex justify-between">
                    <span className="text-sm opacity-75">Payment Method</span>
                    <span className="capitalize">{paymentData.payment_method_types[0]}</span>
                  </div>

                  <div className="py-3 flex justify-between">
                    <span className="text-sm opacity-75">Currency</span>
                    <span className="uppercase">{paymentData.currency}</span>
                  </div>

                  <div className="py-4 flex justify-between items-center">
                    <span className="text-base font-semibold">Total Amount</span>
                    <span className="text-xl font-bold">${(paymentData.amount / 100).toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm opacity-60 mb-4">Thank you for your purchase!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <PaymentElement />
      {error && <div className="text-error text-sm mt-2">{error}</div>}
      <button type="submit" disabled={!stripe || loading} className="btn btn-primary mt-4 w-full">
        {loading ? <span className="loading loading-spinner loading-sm"></span> : `Pay $${Number(amount)}`}
      </button>
    </form>
  );
};

export const StripePaymentButton = ({ amount }: { amount: bigint }) => {
  const [clientSecret, setClientSecret] = useState<string>();
  const [stripeLoaded, setStripeLoaded] = useState(false);

  useEffect(() => {
    if (stripeLoaded) return; // Only load once

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount) }),
    })
      .then(res => res.json())
      .then(data => {
        setClientSecret(data.clientSecret);
        setStripeLoaded(true);
      })
      .catch(err => console.error("Error:", err));
  }, [amount, stripeLoaded]);

  if (!clientSecret) {
    return (
      <div className="flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <Elements
      key={clientSecret} // Add key to force re-render with new client secret
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
        },
      }}
    >
      <CheckoutForm amount={amount} />
    </Elements>
  );
};
