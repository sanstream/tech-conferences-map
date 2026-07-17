#!/usr/bin/env node
/**
 * Enrich conference instances with editions (dates, location, isOnline)
 * from confs.tech seed (2026 / 2027 when available).
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  formatLocation,
  hoistLocationOntoEditions,
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

function loadSeedEditions() {
  const byUrl = new Map()
  const byName = new Map()

  const add = (map, key, edition) => {
    if (!key) return
    const list = map.get(key) ?? []
    list.push(edition)
    map.set(key, list)
  }

  for (const year of YEARS) {
    for (const topic of TOPICS) {
      const file = path.join(seedDir, `${year}-${topic}.json`)
      if (!fs.existsSync(file)) continue
      const rows = JSON.parse(fs.readFileSync(file, "utf8"))
      for (const row of rows) {
        if (!row?.url || !row?.startDate) continue
        const edition = {
          startDate: row.startDate,
          endDate: row.endDate || row.startDate,
          ...(formatLocation({ city: row.city || "", country: row.country || "" })
            ? {
                location: formatLocation({
                  city: row.city || "",
                  country: row.country || "",
                }),
              }
            : {}),
          ...(row.online === true ? { isOnline: true } : {}),
        }
        add(byUrl, normalizeUrl(row.url), edition)
        if (row.name) add(byName, normalizeName(row.name), edition)
      }
    }
  }

  return { byUrl, byName }
}

function main() {
  const { byUrl, byName } = loadSeedEditions()
  const instances = readBrandDir(conferencesDir)

  let matched = 0
  let withEditions = 0
  let withLocation = 0
  let onlineCount = 0

  const enriched = instances.map((inst) => {
    const fromUrl = byUrl.get(normalizeUrl(inst.url)) ?? []
    const fromName = byName.get(normalizeName(inst.name)) ?? []
    const editions = mergeEditions(
      hoistLocationOntoEditions(inst),
      fromUrl,
      fromName,
    )

    if (fromUrl.length || fromName.length) matched++
    if (editions.length) withEditions++
    if (editions.some((ed) => ed.location)) withLocation++
    if (editions.some((ed) => ed.isOnline)) onlineCount++

    return {
      id: inst.id,
      brand: inst.brand,
      name: inst.name,
      url: inst.url,
      subjects: inst.subjects,
      orgType: inst.orgType,
      editions,
    }
  })

  writeBrandDir(sortInstances(enriched), conferencesDir)
  console.log(
    `Enriched ${instances.length} instances: ${matched} matched seed, ${withEditions} with editions, ${withLocation} with location, ${onlineCount} online/hybrid`,
  )
}

main()
