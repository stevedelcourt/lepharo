import { check } from "."
import type { CheckResult } from "."
import { moderationFlags } from "@/lib/schema"

export async function checkAndFlag(
  text: string,
  targetType: string,
  targetId: number,
  db: any,
): Promise<CheckResult> {
  const result = check(text)
  if (!result.flagged) return result

  try {
    await db.insert(moderationFlags).values({
      targetType,
      targetId,
      reason: `Auto-modération [${result.severity}] — ${result.categories.join(", ")}`,
      score: result.score,
      categories: JSON.stringify(result.categories),
      matchedRules: JSON.stringify(result.matches),
    }).run()
  } catch (e: any) {
    console.error("checkAndFlag insert error:", e?.message || e)
  }

  return result
}
