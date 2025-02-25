import {
  APIAccessProduct,
  CourseProduct,
  DigitalProduct,
  MembershipProduct,
  SoftwareLicenseProduct,
  SubscriptionProduct,
} from "./ProductModels";

export const sampleProducts = {
  digital: {
    id: BigInt(1),
    name: "Digital Product / Download",
    price: BigInt(3), // $3
    body: "Option to offer content for download",
    downloadUrl: "https://example.com/web3-toolkit-pro",
    fileSize: "2.5GB",
    fileFormat: "ZIP",
    licenseType: "commercial",
    features: [
      "Instant download after purchase",
      "Compatible with all major platforms",
      "Includes user guide and support",
      "Regular updates and new content",
    ],
  } as DigitalProduct,

  course: {
    id: BigInt(2),
    name: "Course / Access",
    price: BigInt(3), // $3
    body: "Option to offer access to a course for a limited time",
    accessDuration: 365, // 1 year access
    courseLevel: "advanced",
    modules: [
      "Includes video, text, and interactive content",
      "Module 1: Introduction to Web3",
      "Module 2: Smart Contracts",
      "Module 3: ... (Product info button)",
    ],
    includesSupport: true,
    accessType: "Full Access",
    contentType: "hybrid",
    features: [
      "Lifetime access to course materials",
      "Certificate of completion",
      "Access to exclusive webinars",
      "Community support and networking",
    ],
  } as CourseProduct,

  subscription: {
    id: BigInt(3),
    name: "Subscription / Access",
    price: BigInt(5), // $5
    body: "Option to offer access to a subscription service for a limited time",
    billingCycle: "monthly",
    features: [
      "Early Access to New Features",
      "Premium Development Tools",
      "Monthly Workshop Access",
      "Private Discord Community",
      "Custom Smart Contract Templates",
      "Exclusive content updates",
    ],
    trialPeriodDays: 14,
    autoRenew: true,
    timeframe: {
      purchaseDate: Date.now(),
      startDate: Date.now(),
      endDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
      lastRenewalDate: Date.now(),
    },
  } as SubscriptionProduct,

  softwareLicense: {
    id: BigInt(102),
    name: "Web3 Development Suite Pro",
    price: BigInt(9), // $9
    body: "Professional development toolkit for Web3 applications",
    licenseType: "subscription",
    maxUsers: 10,
    validityPeriod: 365, // 1 year
    features: [
      {
        name: "Unlimited Smart Contract Deployments",
        included: true,
        description: "Deploy unlimited smart contracts to any network",
      },
      {
        name: "Advanced Testing Suite",
        included: true,
        description: "Comprehensive testing tools",
      },
      {
        name: "24/7 Technical Support",
        included: true,
      },
      {
        name: "Custom Plugin Development",
        included: true,
      },
      {
        name: "Automated Security Scanning",
        included: true,
      },
    ],
    supportLevel: "premium",
    updatePolicy: "lifetime",
    deploymentType: "hybrid",
    apiAccess: true,
    customizationAllowed: true,
    validUntil: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year from now
    lastUpdate: Date.now(),
  } as SoftwareLicenseProduct,

  membership: {
    id: BigInt(103),
    name: "Web3 Builders Club",
    price: BigInt(5), // $5
    body: "Exclusive community for Web3 developers and entrepreneurs",
    tier: "gold",
    duration: 30, // 30 days
    benefits: [
      "Private Discord Access",
      "Weekly Developer Workshops",
      "Early Access to Features",
      "1-on-1 Mentoring Sessions",
      "Exclusive NFT Drops",
    ],
    accessiblePlatforms: ["Discord", "Telegram", "Forum"],
    exclusiveContent: [
      {
        type: "Technical Deep Dives",
        frequency: "weekly",
        description: "In-depth technical analysis of popular protocols",
      },
      {
        type: "Market Research",
        frequency: "monthly",
        description: "Comprehensive Web3 market analysis",
      },
    ],
    membershipPerks: ["Early access to new features", "Member-only events", "Exclusive educational content"],
    votingRights: true,
    referralBenefits: true,
    maxMembers: 1000,
    validUntil: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    memberSince: Date.now(),
    features: [
      "Access to exclusive content",
      "Networking opportunities with industry leaders",
      "Discounts on future products",
      "Monthly newsletters with insights",
    ],
  } as MembershipProduct,

  apiAccess: {
    id: BigInt(105),
    name: "Blockchain Data API Pro",
    price: BigInt(2), // $2
    body: "Professional access to blockchain data and analytics API",
    tier: "pro",
    rateLimit: {
      requestsPerSecond: 10,
      requestsPerMonth: 1000000,
    },
    endpoints: [
      {
        path: "/v1/transactions",
        method: "GET",
        description: "Fetch detailed transaction data",
      },
      {
        path: "/v1/analytics",
        method: "POST",
        description: "Generate custom analytics reports",
      },
    ],
    authentication: "api_key",
    supportSLA: "99.9% uptime, 24/7 support",
    dataRetention: 90, // 90 days
    customization: true,
    uptime: 99.9,
    sandboxAccess: true,
    features: [
      "1M API Calls per Month",
      "99.9% Uptime SLA",
      "Real-time Data Access",
      "Advanced Analytics",
      "Custom Endpoints",
    ],
    validUntil: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    lastUsage: Date.now(),
  } as APIAccessProduct,
};
