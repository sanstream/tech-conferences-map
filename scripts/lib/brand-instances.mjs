import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const brandInstancesPath = path.join(__dirname, "../../src/content/brand-instances.json")

/** Names to drop (alias duplicates — canonical name kept) */
export const ALIAS_DROPS = new Set([
  "AI Coding Summit",
  "NG Belgrade Conf",
  "App.js Conference",
  "CityJS Conference Athens",
  "Digital Design & UX (DDUX)",
  "The 11ty International Symposium on Making Web Sites Real Good",
  "Frontend Barcelona Conference",
  "JSConf Spain",
  "MadVue – Vue.js Conf",
  "Middlesbrough Front End Conference",
  "UXLx: User Experience Lisbon",
  "Vue.js Live Conference",
  "XtremeJS",
  "Cond42 JavaScript",
])

/** Umbrella homepages superseded by concrete instances */
export const UMBRELLA_DROPS = [
  { name: "JSConf", urlHost: "jsconf.com", path: "/" },
  { name: "CityJS", urlHost: "cityjsconf.org", path: "/" },
]

/** Prefix rules: conference name starts with prefix → brand */
export const PREFIX_BRANDS = [
  ["JSConf", "JSConf"],
  ["CityJS", "CityJS"],
  ["enterJS", "enterJS"],
  ["React Summit", "React Summit"],
  ["JSNation", "JSNation"],
  ["Vue.js Nation", "Vue.js Nation"],
  ["Frontend Nation", "Frontend Nation"],
  ["LDX3", "LeadDev"],
  ["LeadDev", "LeadDev"],
  ["Web Directions", "Web Directions"],
  ["Visual Studio Live", "Visual Studio Live"],
  ["React Advanced", "React Advanced"],
  ["UXDX", "UXDX"],
  ["Conf42", "Conf42"],
  ["JavaScript fwdays", "fwdays"],
  ["React+ fwdays", "fwdays"],
  ["AI Coding Summit", "AI Coding Summit"],
]

/** Host → brand for domain families */
export const HOST_BRANDS = {
  "leaddev.com": "LeadDev",
  "fwdays.com": "fwdays",
}

export function slugify(text) {
  return String(text)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

export function loadBrandManifest(filePath = brandInstancesPath) {
  if (!fs.existsSync(filePath)) return []
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

function urlHostPath(url) {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, "").toLowerCase()
    const p = u.pathname.replace(/\/+$/, "") || "/"
    return { host, path: p }
  } catch {
    return { host: "", path: "" }
  }
}

function isUmbrellaDrop(entry) {
  const { host, path } = urlHostPath(entry.url)
  return UMBRELLA_DROPS.some((u) => u.name === entry.name && u.urlHost === host && u.path === path)
}

function inferBrand(entry, manifest) {
  for (const m of manifest) {
    if (
      entry.name === m.brand ||
      entry.name.startsWith(`${m.brand} `) ||
      entry.name.startsWith(`${m.brand},`)
    ) {
      return m.brand
    }
    for (const inst of m.instances) {
      if (entry.name === inst.name || entry.url === inst.url || entry.id === inst.id) {
        return m.brand
      }
    }
  }

  for (const [prefix, brand] of PREFIX_BRANDS) {
    if (
      entry.name === prefix ||
      entry.name.startsWith(`${prefix} `) ||
      entry.name.startsWith(`${prefix},`)
    ) {
      return brand
    }
  }
  const { host } = urlHostPath(entry.url)
  if (HOST_BRANDS[host]) return HOST_BRANDS[host]
  if (entry.name === "fwdays") return "fwdays"
  return entry.name
}

function inferId(entry, brand) {
  const brandSlug = slugify(brand)
  const nameSlug = slugify(entry.name)
  if (nameSlug === brandSlug || nameSlug.startsWith(`${brandSlug}-`)) return nameSlug
  return `${brandSlug}-${nameSlug.replace(new RegExp(`^${brandSlug}-`), "")}`
}

function manifestMatchNames(manifest) {
  const names = new Set([manifest.brand])
  for (const n of manifest.matchNames || []) names.add(n)
  return names
}

function manifestAlreadyExpanded(manifestEntry, list) {
  return manifestEntry.instances.every((inst) =>
    list.some((e) => e.url === inst.url || e.name === inst.name || e.id === inst.id),
  )
}

/**
 * Transform flat conference rows into instance-level entries with id + brand.
 */
export function applyBrandInstances(entries, manifest = loadBrandManifest()) {
  let list = entries
    .filter((e) => e?.name && e?.url && !ALIAS_DROPS.has(e.name))
    .map((e) => ({
      name: e.name,
      url: e.url,
      subjects: e.subjects || [],
      id: e.id,
    }))

  const expandedBrands = new Set()
  const manifestByName = new Map()
  for (const m of manifest) {
    for (const n of manifestMatchNames(m)) manifestByName.set(n, m)
  }

  const out = []

  for (const entry of list) {
    if (isUmbrellaDrop(entry)) continue

    const manifestEntry = manifestByName.get(entry.name)
    if (manifestEntry && !expandedBrands.has(manifestEntry.brand)) {
      if (manifestAlreadyExpanded(manifestEntry, list)) {
        expandedBrands.add(manifestEntry.brand)
        continue
      }
      expandedBrands.add(manifestEntry.brand)
      for (const inst of manifestEntry.instances) {
        out.push({
          id: inst.id,
          brand: manifestEntry.brand,
          name: inst.name,
          url: inst.url,
          subjects: [...(entry.subjects || [])],
          editions: normalizeEditions(inst.editions),
          ...(formatLocation(inst.location) ? { location: formatLocation(inst.location) } : {}),
          ...(inst.isOnline === true ? { isOnline: true } : {}),
        })
      }
      continue
    }

    if (manifestEntry && expandedBrands.has(manifestEntry.brand)) {
      continue
    }

    const brand = inferBrand(entry, manifest)
    const id = entry.id && !manifestEntry ? entry.id : inferId(entry, brand)
    out.push({
      id,
      brand,
      name: entry.name,
      url: entry.url,
      subjects: [...(entry.subjects || [])],
      editions: normalizeEditions(entry.editions),
      ...(formatLocation(entry.location) ? { location: formatLocation(entry.location) } : {}),
      ...(entry.isOnline === true ? { isOnline: true } : {}),
    })
  }

  return dedupeInstances(out)
}

function dedupeInstances(list) {
  const byId = new Map()
  for (const entry of list) {
    const existing = byId.get(entry.id)
    if (!existing) {
      byId.set(entry.id, entry)
      continue
    }
    existing.subjects = mergeSubjects(existing.subjects, entry.subjects)
    existing.editions = mergeEditions(existing.editions, entry.editions)
    if (!existing.location && entry.location) existing.location = formatLocation(entry.location)
    if (entry.isOnline === true) existing.isOnline = true
  }
  return [...byId.values()]
}

function mergeSubjects(a, b) {
  const seen = new Set()
  const out = []
  for (const s of [...(a || []), ...(b || [])]) {
    const t = String(s).toLowerCase().trim()
    if (!t || seen.has(t)) continue
    seen.add(t)
    out.push(t)
    if (out.length >= 10) break
  }
  return out
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function normalizeEditions(editions) {
  if (!Array.isArray(editions)) return []
  const out = []
  const seen = new Set()
  for (const ed of editions) {
    if (!ed?.startDate || !ISO_DATE.test(ed.startDate)) continue
    const endDate = ed.endDate && ISO_DATE.test(ed.endDate) ? ed.endDate : ed.startDate
    if (endDate < ed.startDate) continue
    const key = `${ed.startDate}::${endDate}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ startDate: ed.startDate, endDate })
  }
  return out.sort((a, b) => a.startDate.localeCompare(b.startDate))
}

export function mergeEditions(...lists) {
  return normalizeEditions(lists.flat())
}

export function formatLocation(location) {
  if (!location || typeof location !== "object") return undefined
  const city = typeof location.city === "string" ? location.city.trim() : ""
  const country = typeof location.country === "string" ? location.country.trim() : ""
  if (!city && !country) return undefined
  const out = {}
  if (city) out.city = city
  if (country) out.country = country
  return out
}

export function validateInstances(list) {
  const errors = []
  const ids = new Set()

  for (const c of list) {
    if (!c.id) errors.push(`missing id: ${c.name}`)
    if (!c.brand) errors.push(`missing brand: ${c.name}`)
    if (!c.name) errors.push("missing name")
    if (!/^https?:\/\//.test(c.url)) errors.push(`bad url: ${c.name}`)
    if (!Array.isArray(c.subjects) || c.subjects.length < 1 || c.subjects.length > 10) {
      errors.push(`bad subjects: ${c.name}`)
    }
    if (c.editions !== undefined) {
      if (!Array.isArray(c.editions)) {
        errors.push(`bad editions: ${c.name}`)
      } else {
        for (const ed of c.editions) {
          if (!ed?.startDate || !ISO_DATE.test(ed.startDate)) {
            errors.push(`bad edition startDate: ${c.name}`)
          }
          if (!ed?.endDate || !ISO_DATE.test(ed.endDate)) {
            errors.push(`bad edition endDate: ${c.name}`)
          }
          if (ed?.startDate && ed?.endDate && ed.endDate < ed.startDate) {
            errors.push(`edition end before start: ${c.name}`)
          }
        }
      }
    }
    if (c.location !== undefined && c.location !== null) {
      if (typeof c.location !== "object" || Array.isArray(c.location)) {
        errors.push(`bad location: ${c.name}`)
      } else {
        const loc = formatLocation(c.location)
        if (!loc) errors.push(`empty location object: ${c.name}`)
        for (const key of Object.keys(c.location)) {
          if (key !== "city" && key !== "country") {
            errors.push(`unknown location field ${key}: ${c.name}`)
          }
        }
      }
    }
    if (c.isOnline !== undefined && typeof c.isOnline !== "boolean") {
      errors.push(`bad isOnline: ${c.name}`)
    }
    if (
      c.orgType !== undefined &&
      c.orgType !== "for-profit" &&
      c.orgType !== "non-profit"
    ) {
      errors.push(`bad orgType: ${c.name}`)
    }
    if (ids.has(c.id)) errors.push(`duplicate id: ${c.id}`)
    ids.add(c.id)
  }

  return errors
}

export function sortInstances(list) {
  return [...list].sort((a, b) => a.name.localeCompare(b.name, "en"))
}

export function formatConference(entry) {
  const editions = normalizeEditions(entry.editions)
  const location = formatLocation(entry.location)
  const out = {
    id: entry.id,
    brand: entry.brand,
    name: entry.name,
    url: entry.url,
    subjects: entry.subjects.slice(0, 10),
  }
  if (editions.length) out.editions = editions
  if (location) out.location = location
  if (entry.isOnline === true) out.isOnline = true
  if (entry.orgType === "for-profit" || entry.orgType === "non-profit") {
    out.orgType = entry.orgType
  }
  return out
}
