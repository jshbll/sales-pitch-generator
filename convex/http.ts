import { httpRouter } from "convex/server";
// import { stripeWebhook } from "./stripeWebhooks"; // Disabled - Stripe removed
// import { handleStripeWebhook } from "./subscriptions/webhooks"; // Disabled - Stripe removed
import { proxyImage } from "./imageProxy";
import { handleClerkWebhook } from "./clerkWebhooks";
import { handleClerkMobileWebhook } from "./clerkMobileWebhooks";

const http = httpRouter();

// Clerk webhook endpoint for business users - auto-creates businesses and handles billing events
http.route({
  path: "/clerk-business",
  method: "POST",
  handler: handleClerkWebhook,
});

// Clerk webhook endpoint for mobile users - syncs user profiles
http.route({
  path: "/clerk-mobile",
  method: "POST",
  handler: handleClerkMobileWebhook,
});

// // Stripe webhook endpoint (removed - using Clerk billing)
// http.route({
//   path: "/stripe/webhook",
//   method: "POST",
//   handler: stripeWebhook,
// });

// // New clean webhook endpoint (removed - using Clerk billing)
// http.route({
//   path: "/webhooks/stripe",
//   method: "POST",
//   handler: handleStripeWebhook,
// });

// Image proxy endpoint for iOS simulator
// Handles paths like /images/{imageId}/{variant}
http.route({
  pathPrefix: "/images/",
  method: "GET",
  handler: proxyImage,
});

export default http;