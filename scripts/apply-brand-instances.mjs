#!/usr/bin/env node
/**
 * Apply brand/instance fields to conference collection using brand-instances.json manifest.
 */
import {
  applyBrandInstances,
  formatConference,
  sortInstances,
} from "./lib/brand-instances.mjs"
import { conferencesDir, readBrandDir, writeBrandDir } from "./lib/conference-io.mjs"

function main() {
  const raw = readBrandDir(conferencesDir)
  const orgTypeByBrand = new Map()
  for (const row of raw) {
    if (row.orgType === "for-profit" || row.orgType === "non-profit") {
      orgTypeByBrand.set(row.brand, row.orgType)
    }
  }

  const transformed = sortInstances(
    applyBrandInstances(raw).map((row) => {
      const formatted = formatConference(row)
      const orgType = orgTypeByBrand.get(formatted.brand)
      if (orgType) formatted.orgType = orgType
      return formatted
    }),
  )

  writeBrandDir(transformed, conferencesDir)
  console.log(`Wrote ${transformed.length} conference instances → ${conferencesDir}`)

  const multiBrand = new Map()
  for (const c of transformed) {
    multiBrand.set(c.brand, (multiBrand.get(c.brand) || 0) + 1)
  }
  const franchises = [...multiBrand.entries()].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1])
  console.log(`Brands with 2+ instances: ${franchises.length}`)
}

main()
