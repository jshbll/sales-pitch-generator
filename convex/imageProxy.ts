import { httpAction } from "./_generated/server";

/**
 * Proxy image requests to avoid CORS issues
 */
export const proxyImage = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const imageUrl = url.searchParams.get("url");

  if (!imageUrl) {
    return new Response("Missing url parameter", { status: 400 });
  }

  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    return new Response(blob, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("[proxyImage] Error:", error);
    return new Response("Failed to fetch image", { status: 500 });
  }
});
