import { v } from "convex/values";
import { mutation, query, action, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";

// Pricing constants (in USD)
const PRICING = {
  qwen: {
    // Qwen-plus pricing per 1M tokens (approximate)
    inputPerMillion: 0.0008,  // $0.0008 per 1M input tokens
    outputPerMillion: 0.0024, // $0.0024 per 1M output tokens
  },
  elevenlabs: {
    // ElevenLabs pricing per character
    turbo: 0.000015,         // $0.015 per 1K chars (preview)
    multilingual: 0.00003,   // $0.030 per 1K chars (HQ)
  },
};

// Create a new audio generation (start wizard)
export const create = mutation({
  args: {
    answers: v.any(),
    prompt: v.string(),
    voice: v.string(),
    business_id: v.optional(v.id("businesses")),
    clerk_user_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const generationId = await ctx.db.insert("audio_generations", {
      business_id: args.business_id,
      clerk_user_id: args.clerk_user_id,
      answers: args.answers,
      prompt: args.prompt,
      voice: args.voice,
      model: "tts-1", // Default to preview model
      status: "draft",
      created_at: now,
      updated_at: now,
    });

    return generationId;
  },
});

// Update generation status
export const updateStatus = mutation({
  args: {
    id: v.id("audio_generations"),
    status: v.union(
      v.literal("draft"),
      v.literal("script_generating"),
      v.literal("script_ready"),
      v.literal("preview_generating"),
      v.literal("preview_ready"),
      v.literal("hq_generating"),
      v.literal("hq_ready"),
      v.literal("failed")
    ),
    error_message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      error_message: args.error_message,
      updated_at: Date.now(),
    });
  },
});

// Update with generated script
export const updateScript = mutation({
  args: {
    id: v.id("audio_generations"),
    script_text: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      script_text: args.script_text,
      status: "script_ready",
      updated_at: Date.now(),
    });
  },
});

// Get a specific generation
export const get = query({
  args: { id: v.id("audio_generations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get generations for a business
export const listByBusiness = query({
  args: { business_id: v.id("businesses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("audio_generations")
      .withIndex("by_business", (q) => q.eq("business_id", args.business_id))
      .order("desc")
      .take(50);
  },
});

// Get generations for a user (by Clerk ID)
export const listByUser = query({
  args: { clerk_user_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("audio_generations")
      .withIndex("by_clerk_user", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .order("desc")
      .take(50);
  },
});

// Delete a generation
export const remove = mutation({
  args: { id: v.id("audio_generations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Generate script using Qwen (Alibaba Cloud DashScope)
export const generateScript = action({
  args: {
    id: v.id("audio_generations"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    // Update status to generating
    await ctx.runMutation(api.audioGenerator.updateStatus, {
      id: args.id,
      status: "script_generating",
    });

    try {
      // Get Qwen API key from environment
      const qwenApiKey = process.env.QWEN_API_KEY;
      const qwenBaseUrl = process.env.QWEN_API_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";

      if (!qwenApiKey) {
        throw new Error("QWEN_API_KEY not configured");
      }

      // Call Qwen API to generate script (OpenAI-compatible format)
      const response = await fetch(`${qwenBaseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${qwenApiKey}`,
        },
        body: JSON.stringify({
          model: "qwen-plus",
          messages: [
            {
              role: "system",
              content: "You are an expert sales copywriter. Generate compelling, conversational sales scripts that sound natural when read aloud. CRITICAL RULES: 1) NEVER use placeholders like [first name], [your name], [company], etc. 2) Write the script as if you're speaking directly to someone - no blanks to fill in. 3) Never include headers, formatting, or meta-commentary. 4) Output ONLY the final script text, ready to be read aloud exactly as-is.",
            },
            {
              role: "user",
              content: args.prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Qwen API error: ${error}`);
      }

      const data = await response.json();
      const scriptText = data.choices[0]?.message?.content?.trim();

      if (!scriptText) {
        throw new Error("No script generated");
      }

      // Extract token usage from response
      const usage = data.usage || {};
      const inputTokens = usage.prompt_tokens || 0;
      const outputTokens = usage.completion_tokens || 0;

      // Calculate cost (Qwen pricing per 1M tokens)
      const inputCost = (inputTokens / 1_000_000) * PRICING.qwen.inputPerMillion;
      const outputCost = (outputTokens / 1_000_000) * PRICING.qwen.outputPerMillion;
      const totalCostCents = Math.ceil((inputCost + outputCost) * 100);

      // Log usage
      await ctx.runMutation(internal.audioGenerator.logUsageInternal, {
        service: "qwen",
        operation: "script_generation",
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        estimated_cost_cents: totalCostCents,
        generation_id: args.id,
        model: "qwen-plus",
        success: true,
      });

      // Update with generated script
      await ctx.runMutation(api.audioGenerator.updateScript, {
        id: args.id,
        script_text: scriptText,
      });

      return { success: true, script: scriptText };
    } catch (error) {
      // Log failed usage attempt
      await ctx.runMutation(internal.audioGenerator.logUsageInternal, {
        service: "qwen",
        operation: "script_generation",
        estimated_cost_cents: 0,
        generation_id: args.id,
        model: "qwen-plus",
        success: false,
        error_message: error instanceof Error ? error.message : "Unknown error",
      });

      // Update status to failed
      await ctx.runMutation(api.audioGenerator.updateStatus, {
        id: args.id,
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
      });

      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
});

// ElevenLabs voice ID mapping
const ELEVENLABS_VOICES: Record<string, string> = {
  // Custom voice
  "custom": "dTqqnmNMKYl0Y5SqbNOz",    // Custom cloned voice
  // Male voices
  "drew": "29vD33N1CtxCmqQRPOHJ",      // Confident, professional
  "clyde": "2EiwWnXFnvU5JabPnv8n",     // Deep, authoritative
  "paul": "5Q0t7uMcjvnagumLfvZi",      // News anchor style
  "dave": "CYw3kZ02Hs0563khs1Fj",      // Casual, friendly
  "fin": "D38z5RcWu1voky8WS1ja",       // Confident sales voice
  "antoni": "ErXwobaYiN019PkySvjV",    // Well-rounded, clear
  "thomas": "GBv7mTt0atIp3Br8iCZE",    // Calm, narrative
  "charlie": "IKne3meq5aSn9XLyUdCD",   // Casual, Australian
  "george": "JBFqnCBsd6RMkjVDRZzb",    // Warm, British
  "liam": "TX3LPaxmHKxFdv7VOQHJ",      // Articulate, American
  // Female voices
  "rachel": "21m00Tcm4TlvDq8ikWAM",    // Warm, conversational
  "domi": "AZnzlk1XvdvUeBnXmlld",      // Strong, assertive
  "sarah": "EXAVITQu4vr4xnSDxMaL",     // Soft, calm
  "emily": "LcfcDJNUP1GQjkzn1xUU",     // Calm, American
  "elli": "MF3mGyEYCl7XYWbV9V6O",      // Young, American
};

// Generate TTS audio using ElevenLabs
export const generateAudio = action({
  args: {
    id: v.id("audio_generations"),
    script_text: v.string(),
    voice: v.string(),
    model: v.union(v.literal("tts-1"), v.literal("tts-1-hd")),
  },
  handler: async (ctx, args) => {
    const isHQ = args.model === "tts-1-hd";
    const statusGenerating = isHQ ? "hq_generating" : "preview_generating";

    // Update status to generating
    await ctx.runMutation(api.audioGenerator.updateStatus, {
      id: args.id,
      status: statusGenerating,
    });

    try {
      const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenLabsApiKey) {
        throw new Error("ELEVENLABS_API_KEY not configured");
      }

      // Get voice ID from mapping, or use the provided value as a voice ID
      const voiceId = ELEVENLABS_VOICES[args.voice.toLowerCase()] || args.voice;

      // Use turbo for preview, multilingual_v2 for HQ
      const modelId = isHQ ? "eleven_multilingual_v2" : "eleven_turbo_v2_5";

      // Call ElevenLabs TTS API
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": elevenLabsApiKey,
        },
        body: JSON.stringify({
          text: args.script_text,
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs TTS API error: ${error}`);
      }

      // Get audio data
      const audioData = await response.arrayBuffer();

      // Store in Convex storage
      const blob = new Blob([audioData], { type: "audio/mpeg" });
      const storageId = await ctx.storage.store(blob);

      // Get URL for the stored file
      const audioUrl = await ctx.storage.getUrl(storageId);

      // Calculate cost for ElevenLabs
      const charCount = args.script_text.length;
      const costPerChar = isHQ ? PRICING.elevenlabs.multilingual : PRICING.elevenlabs.turbo;
      const totalCostCents = Math.ceil(charCount * costPerChar * 100);

      // Log usage
      await ctx.runMutation(internal.audioGenerator.logUsageInternal, {
        service: "elevenlabs",
        operation: isHQ ? "tts_hq" : "tts_preview",
        characters: charCount,
        estimated_cost_cents: totalCostCents,
        generation_id: args.id,
        model: modelId,
        voice_id: voiceId,
        success: true,
      });

      // Update the generation with audio info
      await ctx.runMutation(internal.audioGenerator.updateAudioInternal, {
        id: args.id,
        isHQ,
        storageId,
        audioUrl: audioUrl || undefined,
        charCount: charCount,
      });

      return { success: true, audioUrl };
    } catch (error) {
      // Log failed usage attempt
      const charCount = args.script_text.length;
      await ctx.runMutation(internal.audioGenerator.logUsageInternal, {
        service: "elevenlabs",
        operation: isHQ ? "tts_hq" : "tts_preview",
        characters: charCount,
        estimated_cost_cents: 0,
        generation_id: args.id,
        model: isHQ ? "eleven_multilingual_v2" : "eleven_turbo_v2_5",
        success: false,
        error_message: error instanceof Error ? error.message : "Unknown error",
      });

      await ctx.runMutation(api.audioGenerator.updateStatus, {
        id: args.id,
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
      });

      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
});

// Internal mutation to update audio fields
export const updateAudioInternal = internalMutation({
  args: {
    id: v.id("audio_generations"),
    isHQ: v.boolean(),
    storageId: v.id("_storage"),
    audioUrl: v.optional(v.string()),
    charCount: v.number(),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {
      status: args.isHQ ? "hq_ready" : "preview_ready",
      updated_at: Date.now(),
    };

    if (args.isHQ) {
      updates.hq_storage_id = args.storageId;
      updates.hq_url = args.audioUrl;
      updates.hq_char_count = args.charCount;
    } else {
      updates.preview_storage_id = args.storageId;
      updates.preview_url = args.audioUrl;
      updates.preview_char_count = args.charCount;
    }

    // Calculate estimated cost
    const costPerChar = args.isHQ ? 0.00003 : 0.000015; // $0.030/1K or $0.015/1K
    updates.estimated_cost = Math.ceil(args.charCount * costPerChar * 100); // In cents

    await ctx.db.patch(args.id, updates);
  },
});

// Internal mutation to log AI usage
export const logUsageInternal = internalMutation({
  args: {
    service: v.union(v.literal("qwen"), v.literal("elevenlabs")),
    operation: v.string(),
    input_tokens: v.optional(v.number()),
    output_tokens: v.optional(v.number()),
    characters: v.optional(v.number()),
    estimated_cost_cents: v.number(),
    generation_id: v.optional(v.id("audio_generations")),
    business_id: v.optional(v.id("businesses")),
    clerk_user_id: v.optional(v.string()),
    model: v.optional(v.string()),
    voice_id: v.optional(v.string()),
    success: v.boolean(),
    error_message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("ai_usage_tracking", {
      ...args,
      created_at: Date.now(),
    });
  },
});

// Query to get usage stats (for development monitoring)
export const getUsageStats = query({
  args: {
    days: v.optional(v.number()), // Default to 30 days
  },
  handler: async (ctx, args) => {
    const daysAgo = args.days || 30;
    const since = Date.now() - (daysAgo * 24 * 60 * 60 * 1000);

    const allUsage = await ctx.db
      .query("ai_usage_tracking")
      .withIndex("by_created")
      .filter((q) => q.gte(q.field("created_at"), since))
      .collect();

    // Aggregate by service
    const qwenUsage = allUsage.filter((u) => u.service === "qwen");
    const elevenLabsUsage = allUsage.filter((u) => u.service === "elevenlabs");

    const qwenTotalCents = qwenUsage.reduce((sum, u) => sum + u.estimated_cost_cents, 0);
    const elevenLabsTotalCents = elevenLabsUsage.reduce((sum, u) => sum + u.estimated_cost_cents, 0);

    const qwenInputTokens = qwenUsage.reduce((sum, u) => sum + (u.input_tokens || 0), 0);
    const qwenOutputTokens = qwenUsage.reduce((sum, u) => sum + (u.output_tokens || 0), 0);
    const elevenLabsChars = elevenLabsUsage.reduce((sum, u) => sum + (u.characters || 0), 0);

    // Count by operation
    const operationCounts: Record<string, number> = {};
    allUsage.forEach((u) => {
      operationCounts[u.operation] = (operationCounts[u.operation] || 0) + 1;
    });

    return {
      period: {
        days: daysAgo,
        since: new Date(since).toISOString(),
      },
      totals: {
        totalCostCents: qwenTotalCents + elevenLabsTotalCents,
        totalCostDollars: ((qwenTotalCents + elevenLabsTotalCents) / 100).toFixed(4),
        requestCount: allUsage.length,
        successCount: allUsage.filter((u) => u.success).length,
        failureCount: allUsage.filter((u) => !u.success).length,
      },
      qwen: {
        costCents: qwenTotalCents,
        costDollars: (qwenTotalCents / 100).toFixed(4),
        requestCount: qwenUsage.length,
        inputTokens: qwenInputTokens,
        outputTokens: qwenOutputTokens,
        totalTokens: qwenInputTokens + qwenOutputTokens,
      },
      elevenlabs: {
        costCents: elevenLabsTotalCents,
        costDollars: (elevenLabsTotalCents / 100).toFixed(4),
        requestCount: elevenLabsUsage.length,
        characters: elevenLabsChars,
        previewCount: elevenLabsUsage.filter((u) => u.operation === "tts_preview").length,
        hqCount: elevenLabsUsage.filter((u) => u.operation === "tts_hq").length,
      },
      operationCounts,
      // Recent usage for debugging
      recentUsage: allUsage.slice(-10).reverse().map((u) => ({
        service: u.service,
        operation: u.operation,
        costCents: u.estimated_cost_cents,
        success: u.success,
        created_at: new Date(u.created_at).toISOString(),
      })),
    };
  },
});
