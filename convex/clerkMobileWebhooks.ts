import { httpAction } from "./_generated/server";

/**
 * Handle Clerk mobile webhooks
 */
export const handleClerkMobileWebhook = httpAction(async (ctx, request) => {
  // Placeholder for mobile webhook handling
  console.log("[clerkMobileWebhooks] Received webhook");
  return new Response("OK", { status: 200 });
});
