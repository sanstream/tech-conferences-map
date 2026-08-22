#!/usr/bin/env node
/**
 * Write a static CSS snapshot of the speckle background (backup / reference).
 * Regenerate after changing src/lib/speckle-background.ts config.
 */
import { writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import {
  generateSpeckleBackgroundCss,
  speckleBackgroundConfig,
} from "../src/lib/speckle-background.ts"

const outputPath = fileURLToPath(
  new URL("../src/assets/speckle-background.generated.css", import.meta.url),
)

const banner = `/*
  AUTO-GENERATED — do not edit by hand.
  Source: src/lib/speckle-background.ts (seed: ${speckleBackgroundConfig.seed})
  Regenerate: pnpm speckle:generate
*/

`

writeFileSync(
  outputPath,
  banner + generateSpeckleBackgroundCss(speckleBackgroundConfig) + "\n",
)

console.log(`Wrote ${outputPath}`)
