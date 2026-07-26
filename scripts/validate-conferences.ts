#!/usr/bin/env node
/**
 * Validate src/content/conferences/*.json brand files (CI-friendly).
 *
 * Runs directly with `node` (>=22.18) via native TypeScript type stripping.
 */
import { readBrandDir, validateBrandDir } from "./lib/conference-io.ts"
import { formatConference } from "./lib/brand-instances.ts"
import { lookupLocation } from "../src/lib/world-cities.ts"

function main(): void {
  const raw = readBrandDir()
  const instances = raw.map(formatConference)
  const errors = validateBrandDir()

  for (const entry of instances) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id)) {
      errors.push(`invalid id format: ${entry.id}`)
    }
  }

  // Locations must be resolvable to coordinates (used to place
  // conferences on the map). Warn-only: an unknown city may just need
  // an alias in src/lib/world-cities.ts.
  const unresolved = new Set<string>()
  for (const entry of instances) {
    for (const edition of entry.editions ?? []) {
      const location = edition.location
      if (!location?.city) continue
      if (!lookupLocation(location)) {
        unresolved.add(
          `${location.city}, ${location.country ?? "?"} (${entry.id})`,
        )
      }
    }
  }
  if (unresolved.size) {
    console.warn("Locations without coordinates (not in world-cities dataset):")
    for (const w of [...unresolved].sort()) console.warn(`  - ${w}`)
  }

  if (errors.length) {
    console.error("Validation errors:")
    for (const e of errors) console.error(`  - ${e}`)
    process.exit(1)
  }

  console.log(`Validated ${instances.length} conference instances in brand-grouped files`)
}

main()
