import { useState } from "react";
import Image from "next/image";
import { PaymentModal } from "./PaymentModal";
import {
  APIAccessProduct,
  CourseProduct,
  DigitalProduct,
  MembershipProduct,
  SoftwareLicenseProduct,
  SubscriptionProduct,
} from "./ProductModels";
import { StripePaymentButton } from "./StripePaymentButton";
import { ConnectButton } from "@rainbow-me/rainbowkit";

type AllProductTypes =
  | DigitalProduct
  | CourseProduct
  | SubscriptionProduct
  | SoftwareLicenseProduct
  | MembershipProduct
  | APIAccessProduct;

interface ProductCardProps {
  product: AllProductTypes;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const formatPrice = (price: bigint) => {
    return `$ ${Number(price)} / USDC`;
  };

  // Determine product type and render specific details
  const renderProductDetails = () => {
    const productWithFeatures = product as AllProductTypes;

    if ("downloadUrl" in product) {
      // Digital Product
      return (
        <div className="text-sm space-y-1 text-neutral">
          <div className="flex gap-2">
            <span className="font-medium">Format:</span> {product.fileFormat}
          </div>
          <div className="flex gap-2">
            <span className="font-medium">Size:</span> {product.fileSize}
          </div>
          <div className="flex gap-2">
            <span className="font-medium">License:</span> {product.licenseType}
          </div>
          <div className="flex gap-2">
            <span className="font-medium">Download:</span>
            <a
              href={product.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-focus underline"
            >
              Download Link
            </a>
          </div>
          <div>
            <span className="font-medium">Features:</span>
            <ul className="list-disc list-inside text-xs mt-1">
              {productWithFeatures.features.map((feature, index) => (
                <li key={index} className="truncate">
                  {typeof feature === "string" ? (
                    feature
                  ) : (
                    <>
                      {feature.name} - {feature.included ? "Included" : "Not Included"}{" "}
                      {feature.description && `(${feature.description})`}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    } else if ("accessDuration" in product) {
      // Course Product
      return (
        <div className="text-sm space-y-1 text-neutral">
          <div className="grid grid-cols-2 gap-1">
            <div>
              <span className="font-medium">Level:</span> {product.courseLevel}
            </div>
            <div>
              <span className="font-medium">Duration:</span> {product.accessDuration}d
            </div>
            <div>
              <span className="font-medium">Access:</span> {product.accessType}
            </div>
            <div>
              <span className="font-medium">Support:</span> {product.includesSupport ? "✓" : "✗"}
            </div>
          </div>
          <div className="mt-2">
            <span className="font-medium">Modules:</span>
            <ul className="list-disc list-inside text-xs mt-1">
              {product.modules.map((module, index) => (
                <li key={index} className="truncate">
                  {module}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-medium">Features:</span>
            <ul className="list-disc list-inside text-xs mt-1">
              {productWithFeatures.features.map((feature, index) => (
                <li key={index} className="truncate">
                  {typeof feature === "string" ? (
                    feature
                  ) : (
                    <>
                      {feature.name} - {feature.included ? "Included" : "Not Included"}{" "}
                      {feature.description && `(${feature.description})`}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    } else if ("billingCycle" in product) {
      // Subscription Product
      return (
        <div className="text-sm space-y-1 text-neutral">
          <div className="grid grid-cols-2 gap-1">
            <div>
              <span className="font-medium">Billing:</span> {product.billingCycle}
            </div>
            <div>
              <span className="font-medium">Trial:</span> {product.trialPeriodDays}d
            </div>
          </div>
          <div>
            <span className="font-medium">Features:</span>
            <ul className="list-disc list-inside text-xs mt-1">
              {productWithFeatures.features.map((feature, index) => (
                <li key={index} className="truncate">
                  {typeof feature === "string" ? (
                    feature
                  ) : (
                    <>
                      {feature.name} - {feature.included ? "Included" : "Not Included"}{" "}
                      {feature.description && `(${feature.description})`}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    } else if ("maxUsers" in product) {
      // Software License Product
      return (
        <div className="text-sm space-y-1 text-neutral">
          <div>
            <span className="font-medium">Features:</span>
            <ul className="list-disc list-inside text-xs mt-1">
              {productWithFeatures.features.map((feature, index) => (
                <li key={index} className="truncate">
                  {typeof feature === "string" ? (
                    feature
                  ) : (
                    <>
                      {feature.name} - {feature.included ? "Included" : "Not Included"}{" "}
                      {feature.description && `(${feature.description})`}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    } else if ("tier" in product) {
      // Membership Product
      return (
        <div className="text-sm space-y-1 text-neutral">
          <div>
            <span className="font-medium">Features:</span>
            <ul className="list-disc list-inside text-xs mt-1">
              {productWithFeatures.features.map((feature, index) => (
                <li key={index} className="truncate">
                  {typeof feature === "string" ? (
                    feature
                  ) : (
                    <>
                      {feature.name} - {feature.included ? "Included" : "Not Included"}{" "}
                      {feature.description && `(${feature.description})`}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    } else if ("rateLimit" in product) {
      // API Access Product
      return (
        <div className="text-sm space-y-1 text-neutral">
          <div>
            <span className="font-medium">Features:</span>
            <ul className="list-disc list-inside text-xs mt-1">
              {productWithFeatures.features.map((feature, index) => (
                <li key={index} className="truncate">
                  {typeof feature === "string" ? (
                    feature
                  ) : (
                    <>
                      {feature.name} - {feature.included ? "Included" : "Not Included"}{" "}
                      {feature.description && `(${feature.description})`}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
  };

  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  return (
    <div className="card bg-base-100 shadow-xl h-full hover:shadow-2xl transition-shadow duration-200">
      <figure className="px-3 sm:px-4 pt-3 sm:pt-4">
        <Image
          src="/software-box.jpg"
          alt={product.name}
          width={300}
          height={200}
          className="rounded-lg w-full h-36 sm:h-48 object-cover"
        />
      </figure>
      <div className="card-body p-3 sm:p-4 gap-2">
        <div className="flex justify-between items-start">
          <h2 className="card-title text-base sm:text-lg">{product.name}</h2>
        </div>

        <p className="text-xs sm:text-sm text-neutral line-clamp-2">{product.body}</p>

        <div className="divider my-0.5 sm:my-1"></div>

        <div className="space-y-1">{renderProductDetails()}</div>

        <div className="card-actions flex-col gap-2 mt-auto">
          <div className="flex justify-between items-center w-full px-2 sm:px-4">
            <span className="text-base sm:text-lg font-bold text-base-content">{formatPrice(product.price)}</span>
            <button className="btn btn-primary btn-xs sm:btn-sm">View Details</button>
          </div>

          <div className="divider my-0.5 sm:my-1"></div>

          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 w-full px-2 sm:px-4">
            <button
              className="btn btn-primary btn-xs sm:btn-sm h-auto min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center gap-2"
              onClick={() => setIsStripeModalOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 sm:h-4 sm:w-4 shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h14V5H5zm2 6h10v2H7v-2z" />
              </svg>
              Pay with Card
            </button>

            <ConnectButton.Custom>
              {({ openConnectModal, account }) => (
                <button
                  className="btn btn-primary btn-xs sm:btn-sm h-auto min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center gap-2"
                  onClick={async () => {
                    if (!account?.address) {
                      await openConnectModal();
                      // Use a slight delay to allow account state to update
                      setTimeout(() => {
                        setIsPaymentModalOpen(true);
                      }, 500);
                    } else {
                      setIsPaymentModalOpen(true);
                    }
                  }}
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 sm:h-4 sm:w-4 shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-9.5v5l3-2.5-3-2.5zm-2 0l-3 2.5 3 2.5v-5z" />
                  </svg>
                  Pay with USDC
                </button>
              )}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
      {isStripeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsStripeModalOpen(false)}></div>
          <div className="modal-box relative w-full max-w-xs sm:max-w-sm md:max-w-md">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2 z-20"
              onClick={() => setIsStripeModalOpen(false)}
            >
              ✕
            </button>
            <div className="relative z-10 p-4">
              <StripePaymentButton amount={product.price} />
            </div>
          </div>
        </div>
      )}
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} amount={product.price} />
    </div>
  );
};
