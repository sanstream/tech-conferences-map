#!/usr/bin/env node
/**
 * One-off: convert per-instance JSON files → one file per brand.
 */
import { readBrandDir, writeBrandDir, conferencesDir } from "./lib/conference-io.mjs"
import { sortInstances } from "./lib/brand-instances.mjs"

const instances = sortInstances(readBrandDir(conferencesDir))
writeBrandDir(instances, conferencesDir)
console.log(`Migrated ${instances.length} instances into brand-grouped files → ${conferencesDir}`)
