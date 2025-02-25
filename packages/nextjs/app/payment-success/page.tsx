"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStripe } from "@stripe/react-stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentSuccessContent() {
  const [status, setStatus] = useState<"processing" | "succeeded" | "failed">("processing");
  const stripe = useStripe();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!stripe) return;

    const clientSecret = searchParams.get("payment_intent_client_secret");

    if (clientSecret) {
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        switch (paymentIntent?.status) {
          case "succeeded":
            setStatus("succeeded");
            break;
          case "processing":
            setStatus("processing");
            break;
          default:
            setStatus("failed");
            break;
        }
      });
    }
  }, [stripe, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Payment {status}</h1>
        <button className="btn btn-primary" onClick={() => router.push("/")}>
          Return Home
        </button>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentSuccessContent />
    </Elements>
  );
}
