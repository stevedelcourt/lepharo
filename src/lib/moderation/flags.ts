import { check, normalize } from "."
import type { CheckResult } from "."
import { reports } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function checkAndFlag(
  text: string,
  targetType: string,
  targetId: number,
  db: any,
): Promise<CheckResult> {
  const result = check(text)
  if (!result.flagged) return result

  try {
    await db.insert(reports).values({
      targetType,
      targetId,
      reason: `Auto-modération [${result.severity}] — ${result.categories.join(", ")}`,
      reporterId: 0,
      autoFlagged: true,
      score: result.score,
      categories: JSON.stringify(result.categories),
      matchedRules: JSON.stringify(result.matches),
    }).run()
  } catch {
    // silently ignore if insert fails
  }

  return result
}
