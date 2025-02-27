# ShenzuSpendingVault


A platform designed for creators to monetize digital content and subscription services with payments via USDC and credit cards. Built at Encode Mammothon 2025

⚠️ Test Mode Guidelines

The application is currently in test mode, allowing you to try out USDC and credit card payments:
 
1. **Crypto Payments (Local Network Only)**  
   - Use the faucet to obtain ETH  
   - Transactions will process successfully but will send test ETH  
   - Payments occur on Localhost instead of USDC on the live blockchain  
 
2. **Credit Card Payments (Live Demo Available)**  
   - Test card details: 4242 4242 4242 4242  
   - CVC: Any three digits  
   - Expiry: Any future date  
 
3. **Development Environment**  
   - Features operate locally for testing  
   - Free-tier support for integrations (Privy, Stripe, Upstash)  
   - Ideal for testing market demand before upgrading to paid plans
  
     ![image](https://github.com/user-attachments/assets/83b41248-e320-4761-8eaa-1ffb31a52055)

     
📚 Documentation


Scaffold-ETH 2 Docs
Privy Docs
Stripe API
Upstash Redis Docs

🎯 Project Highlights


This platform empowers creators to:

Sell downloadable digital products

Offer subscription-based services

Accept payments in both crypto and fiat

Manage user data and sessions via Redis


🔧 Tech Stack
Core Infrastructure

Scaffold-ETH 2 – Ethereum development framework
Authentication & Payments
Privy – Web3 authentication
Stripe – Payment processing
Database & Caching
Upstash Redis – Serverless Redis database

🌟 Key Features
Digital Content Marketplace
Upload and sell digital assets
Content preview functionality

Subscription Model
Time-based access control
Automated recurring payments
Membership benefit management
Payment Integration

Support for USDC transactions
Fiat payment processing via Stripe
Automated revenue distribution


🚀 Getting Started with the Project
Prerequisites
Ensure you have the following installed:

Node.js (v18.18+)-
Yarn (v1 or v2+)-
Git-
Set Up Environment Variables-
Create a .env.local file in the packages/nextjs directory.

Privy Configuration

Sign in to Privy Dashboard-
Create a new project-
Copy your APP_ID-
Stripe Configuration

Sign up at Stripe-
Retrieve API keys from Stripe Dashboard


Upstash Redis Configuration

Register at Upstash-
Create a Redis database-
Copy your REST URL and TOKEN

1. Clone the Repository
Open your terminal and clone the repository:


2. Navigate to the Project Directory
Change into the project directory:

3. Install Dependencies
Run the following command to install the required dependencies:
---
yarn install
---
5. Run the Development Server
Start the development server with the following command:
---
yarn start
---

You can view it in your browser at http://localhost:3000.

5. Connect Your Wallet
Once the app is running, you can connect your wallet by clicking the "Connect Wallet" button in the interface.

6. Buy Product 
After connecting your wallet, you can buy the product with the amount of USDC/ by card

📝 Additional Commands

# Build the project for production
---
yarn build  
---

🏗 Project created using [Scaffold-ETH 2](https://scaffoldeth.io/)
