import { normalize } from "./normalize"
import severityCfg from "./lists/severity.json"
import hateList from "./lists/hate.json"
import extremismList from "./lists/extremism.json"
import whitelistList from "./lists/whitelist.json"
import profanitySupplement from "./lists/profanity.json"

const fbl = require("french-badwords-list")
const profanityArray: string[] = [...fbl.array, ...profanitySupplement]

const whitelist: string[] = whitelistList
const extremism: string[] = extremismList

type Category = string
type Match = { category: Category; term: string }

export type CheckResult = {
  flagged: boolean
  score: number
  categories: Category[]
  matches: Match[]
  severity: "low" | "medium" | "high" | "critical"
}

function isWhitelisted(normalized: string): boolean {
  for (const w of whitelist) {
    const nw = normalize(w)
    if (normalized.includes(nw)) return true
  }
  return false
}

export function check(text: string): CheckResult {
  const original = text
  const n = normalize(text)

  if (isWhitelisted(n)) {
    return { flagged: false, score: 0, categories: [], matches: [], severity: "low" }
  }

  const matches: Match[] = []

  // Check extremism (critical)
  for (const phrase of extremism) {
    const np = normalize(phrase)
    if (n.includes(np)) {
      matches.push({ category: "extremism", term: phrase })
    }
  }

  // Check hate categories (keyed)
  for (const [category, terms] of Object.entries(hateList)) {
    for (const term of terms as string[]) {
      const nt = normalize(term)
      if (n.includes(nt)) {
        matches.push({ category, term })
      }
    }
  }

  // Check profanity via french-badwords-list
  for (const word of profanityArray) {
    const nw = normalize(word)
    if (nw.length >= 2 && n.includes(nw)) {
      matches.push({ category: "profanity", term: word })
    }
  }

  const categories = [...new Set(matches.map((m) => m.category))]
  const severity = severityCfg as Record<string, number>
  let score = 0
  for (const cat of categories) {
    score += severity[cat] || 10
  }
  score = Math.min(score, 100)

  let sev: CheckResult["severity"] = "low"
  if (score >= 80) sev = "critical"
  else if (score >= 50) sev = "high"
  else if (score >= 20) sev = "medium"

  return {
    flagged: score >= 20,
    score,
    categories,
    matches,
    severity: sev,
  }
}
