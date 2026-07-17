#!/usr/bin/env node
/**
 * Validate src/content/conferences/*.json brand files (CI-friendly).
 */
import { readBrandDir, validateBrandDir } from "./lib/conference-io.mjs"
import { formatConference } from "./lib/brand-instances.mjs"

function main() {
  const raw = readBrandDir()
  const instances = raw.map(formatConference)
  const errors = validateBrandDir()

  for (const entry of instances) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id)) {
      errors.push(`invalid id format: ${entry.id}`)
    }
  }

  if (errors.length) {
    console.error("Validation errors:")
    for (const e of errors) console.error(`  - ${e}`)
    process.exit(1)
  }

  console.log(`Validated ${instances.length} conference instances in brand-grouped files`)
}

main()
