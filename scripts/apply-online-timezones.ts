#!/usr/bin/env node
/**
 * For online-only conference editions (isOnline, no location), derive a
 * representative IANA timezone from the published daily schedule midpoint
 * and write it onto the edition as `timezone`, with a `notes` explanation.
 *
 * Schedule research lives in scripts/lib/online-schedules.ts.
 * Midday matching lives in scripts/lib/midday-timezone.ts.
 *
 * Runs directly with `node` (>=22.18) via native TypeScript type stripping.
 */
import { readBrandDir, writeBrandDir } from "./lib/conference-io.ts"
import { middayTimezone } from "./lib/midday-timezone.ts"
import { ONLINE_SCHEDULES, type ScheduleFinding } from "./lib/online-schedules.ts"

function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? "-" : "+"
  const abs = Math.abs(minutes)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  return m ? `UTC${sign}${h}:${String(m).padStart(2, "0")}` : `UTC${sign}${h}`
}

function derivationNotes(
  finding: ScheduleFinding,
  timezone: string,
  targetOffsetMinutes: number,
): string {
  const window = `${finding.dailyStart}–${finding.dailyEnd} ${finding.timesTimezone}`
  const match = `midday matches ${timezone} (${formatOffset(targetOffsetMinutes)} on this date)`
  const evidence = finding.notes.replace(/\s+/g, " ").trim()
  const confidence =
    finding.confidence === "high" ? "" : ` Confidence: ${finding.confidence}.`
  return `Online schedule ${window}; ${match}. ${evidence}${confidence}`
}

function main(): void {
  const byKey = new Map(
    ONLINE_SCHEDULES.map((s) => [`${s.id}::${s.editionStartDate}`, s] as const),
  )

  const instances = readBrandDir()
  const applied: string[] = []
  const missing: string[] = []
  const skippedLow: string[] = []

  for (const inst of instances) {
    for (const ed of inst.editions ?? []) {
      if (!ed.isOnline || ed.location) continue
      const key = `${inst.id}::${ed.startDate}`
      const finding = byKey.get(key)
      if (!finding) {
        missing.push(key)
        continue
      }
      if (finding.confidence === "low") {
        skippedLow.push(key)
      }
      const { timezone, targetOffsetMinutes } = middayTimezone(
        finding.dailyStart,
        finding.dailyEnd,
        finding.timesTimezone,
        ed.startDate,
      )
      ed.timezone = timezone
      ed.notes = derivationNotes(finding, timezone, targetOffsetMinutes)
      applied.push(
        `${inst.id} ${ed.startDate}: ${finding.dailyStart}–${finding.dailyEnd} ${finding.timesTimezone} → ${timezone} (${finding.confidence})`,
      )
    }
  }

  writeBrandDir(instances)

  console.log(`Applied timezone to ${applied.length} online edition(s):\n`)
  for (const line of applied.sort()) console.log(`  ${line}`)

  if (skippedLow.length) {
    console.log(`\nLow-confidence inferences (${skippedLow.length}):`)
    for (const k of skippedLow.sort()) console.log(`  ${k}`)
  }

  if (missing.length) {
    console.log(`\nOnline editions still without schedule research (${missing.length}):`)
    for (const k of missing.sort()) console.log(`  ${k}`)
  }
}

main()
