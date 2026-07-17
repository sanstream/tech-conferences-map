#!/usr/bin/env node
/**
 * One-off: split a legacy monolithic conferences.json → src/content/conferences/{id}.json
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { formatConference, sortInstances, validateInstances } from "./lib/brand-instances.mjs"
import { conferencesDir, writeBrandDir } from "./lib/conference-io.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const legacyPaths = [
  path.join(__dirname, "../src/content/conferences.json"),
  path.join(__dirname, "../content/data/conferences.json"),
]

function main() {
  const inPath = legacyPaths.find((p) => fs.existsSync(p))
  if (!inPath) {
    console.error(`Source file not found. Tried:\n${legacyPaths.map((p) => `  - ${p}`).join("\n")}`)
    process.exit(1)
  }

  const raw = JSON.parse(fs.readFileSync(inPath, "utf8"))
  const instances = sortInstances(raw.map(formatConference))
  const errors = validateInstances(instances)

  if (errors.length) {
    console.error("Validation errors:")
    for (const e of errors) console.error(`  - ${e}`)
    process.exit(1)
  }

  writeBrandDir(instances, conferencesDir)
  console.log(`Wrote ${instances.length} conference instances → ${conferencesDir}`)
}

main()
