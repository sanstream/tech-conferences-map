#!/usr/bin/env node
/**
 * Enrich conference instances with editions + location/isOnline from:
 * 1) confs.tech seed (2026 / 2027 when available)
 * 2) curated fields in brand-instances.json
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  formatLocation,
  loadBrandManifest,
  mergeEditions,
  sortInstances,
} from "./lib/brand-instances.mjs"
import { conferencesDir, readBrandDir, writeBrandDir } from "./lib/conference-io.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const seedDir = path.join(__dirname, ".conf-seed")
const YEARS = ["2026", "2027"]
const TOPICS = [
  "javascript",
  "css",
  "typescript",
  "ux",
  "accessibility",
  "performance",
  "product",
  "general",
  "data",
]

function normalizeUrl(url) {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`)
    u.hash = ""
    u.search = ""
    const host = u.hostname.replace(/^www\./, "").toLowerCase()
    const p = u.pathname.replace(/\/+$/, "") || ""
    return `${host}${p}`.toLowerCase()
  } catch {
    return ""
  }
}

function normalizeName(name) {
  return String(name)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
}

function locationFromSeed(row) {
  return formatLocation({
    city: row.city || "",
    country: row.country || "",
  })
}

function loadSeedMeta() {
  const byUrl = new Map()
  const byName = new Map()

  const add = (map, key, meta) => {
    if (!key) return
    const list = map.get(key) ?? []
    list.push(meta)
    map.set(key, list)
  }

  for (const year of YEARS) {
    for (const topic of TOPICS) {
      const file = path.join(seedDir, `${year}-${topic}.json`)
      if (!fs.existsSync(file)) continue
      const rows = JSON.parse(fs.readFileSync(file, "utf8"))
      for (const row of rows) {
        if (!row?.url) continue
        const meta = {
          edition:
            row.startDate
              ? {
                  startDate: row.startDate,
                  endDate: row.endDate || row.startDate,
                }
              : null,
          location: locationFromSeed(row),
          isOnline: row.online === true,
        }
        add(byUrl, normalizeUrl(row.url), meta)
        if (row.name) add(byName, normalizeName(row.name), meta)
      }
    }
  }

  return { byUrl, byName }
}

function mergeSeedMeta(lists) {
  const editions = []
  let location
  let isOnline = false

  for (const meta of lists.flat()) {
    if (!meta) continue
    if (meta.edition) editions.push(meta.edition)
    if (meta.location && !location) location = meta.location
    if (meta.isOnline) isOnline = true
  }

  return {
    editions: mergeEditions(editions),
    location: formatLocation(location),
    isOnline,
  }
}

function loadManifestMeta() {
  const byId = new Map()
  for (const brand of loadBrandManifest()) {
    for (const inst of brand.instances || []) {
      if (!inst.id) continue
      byId.set(inst.id, {
        editions: inst.editions ?? [],
        location: formatLocation(inst.location),
        isOnline: inst.isOnline === true,
      })
    }
  }
  return byId
}

function main() {
  const { byUrl, byName } = loadSeedMeta()
  const byManifestId = loadManifestMeta()
  const instances = readBrandDir(conferencesDir)

  let matched = 0
  let withEditions = 0
  let withLocation = 0
  let onlineCount = 0

  const enriched = instances.map((inst) => {
    const fromUrl = byUrl.get(normalizeUrl(inst.url)) ?? []
    const fromName = byName.get(normalizeName(inst.name)) ?? []
    const fromManifest = byManifestId.get(inst.id)
    const seed = mergeSeedMeta([fromUrl, fromName])

    const editions = mergeEditions(
      inst.editions,
      seed.editions,
      fromManifest?.editions,
    )
    const location =
      formatLocation(inst.location) || seed.location || fromManifest?.location
    const isOnline =
      inst.isOnline === true || seed.isOnline || fromManifest?.isOnline === true

    if (fromUrl.length || fromName.length || fromManifest) matched++
    if (editions.length) withEditions++
    if (location) withLocation++
    if (isOnline) onlineCount++

    return {
      ...inst,
      editions,
      ...(location ? { location } : { location: undefined }),
      isOnline,
    }
  })

  writeBrandDir(sortInstances(enriched), conferencesDir)
  console.log(
    `Enriched ${instances.length} instances: ${matched} matched sources, ${withEditions} with editions, ${withLocation} with location, ${onlineCount} online/hybrid`,
  )
}

main()
