import { NextResponse } from "next/server";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    // Convert dollars to cents for Stripe
    const amountInCents = Math.round(amount * 100);

    // Check minimum amount ($0.50 = 50 cents)
    if (amountInCents < 50) {
      return NextResponse.json({ error: "Amount must be at least $0.50 USD" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      payment_method_types: ["card"],
      automatic_payment_methods: {
        enabled: false,
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Error creating payment intent:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error creating payment intent" },
      { status: 500 },
    );
  }
}
