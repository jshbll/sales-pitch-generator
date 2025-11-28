import { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Wrapper for safe API calls in actions
 */
export async function apiSafe<T>(
  ctx: ActionCtx,
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error("[apiSafe] Error:", error);
    throw error;
  }
}

/**
 * Wrapper for safe internal calls
 */
export async function internalSafe<T>(
  ctx: MutationCtx | QueryCtx,
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error("[internalSafe] Error:", error);
    throw error;
  }
}
