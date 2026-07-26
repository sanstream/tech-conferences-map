/**
 * Build-time geocoding for conference locations.
 *
 * Resolves a `{ city, country }` location to latitude/longitude using the
 * vendored SimpleMaps World Cities Basic database (see
 * src/data/world-cities/README.md) and derives the IANA timezone from the
 * coordinates, because the free Basic tier does not include a timezone field.
 *
 * Imported both by the Astro content loader (bundled by Vite) and by Node
 * scripts (run directly via Node's native type stripping), so this module
 * must stick to erasable TypeScript syntax (no enums etc.).
 */
import fs from "node:fs"
import { fileURLToPath } from "node:url"
import tzLookup from "@photostructure/tz-lookup"

const csvPath = fileURLToPath(
  new URL("../data/world-cities/worldcities.csv", import.meta.url),
)

export type ConferenceLocation = {
  city?: string
  country?: string
}

export type GeoInfo = {
  latitude: number
  longitude: number
  /** IANA timezone, e.g. "Europe/Amsterdam" */
  timezone: string
}

type CityRow = {
  lat: number
  lng: number
  iso2: string
  adminName: string
  population: number
}

type CityIndex = {
  byCityAndCountry: Map<string, CityRow[]>
  byCity: Map<string, CityRow[]>
  countryToIso2: Map<string, string>
}

/** Characters that Unicode NFD decomposition does not map to ASCII. */
const CHAR_FALLBACKS: Record<string, string> = {
  ł: "l",
  ø: "o",
  đ: "d",
  ð: "d",
  þ: "th",
  ß: "ss",
  æ: "ae",
  œ: "oe",
}

/** Lowercase, strip diacritics and collapse whitespace. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[łøđðþßæœ]/g, (c) => CHAR_FALLBACKS[c] ?? c)
    .replace(/\s+/g, " ")
    .trim()
}

/** Like normalize, but also drops periods ("u.s.a." -> "usa"). */
function normalizeCountry(value: string): string {
  return normalize(value).replace(/\./g, "")
}

/**
 * Aliases for country names as commonly written in conference data,
 * mapped to ISO alpha-2 codes as used by the SimpleMaps database.
 */
const COUNTRY_ALIASES = new Map<string, string>([
  ["us", "US"],
  ["usa", "US"],
  ["united states of america", "US"],
  ["america", "US"],
  ["uk", "GB"],
  ["great britain", "GB"],
  ["england", "GB"],
  ["scotland", "GB"],
  ["wales", "GB"],
  ["northern ireland", "GB"],
  ["the netherlands", "NL"],
  ["holland", "NL"],
  ["czech republic", "CZ"],
  ["south korea", "KR"],
  ["north korea", "KP"],
  ["turkiye", "TR"],
  ["myanmar", "MM"],
  ["ivory coast", "CI"],
  ["cape verde", "CV"],
  ["east timor", "TL"],
  ["swaziland", "SZ"],
  ["macedonia", "MK"],
  ["the bahamas", "BS"],
  ["bahamas", "BS"],
  ["the gambia", "GM"],
  ["gambia", "GM"],
  ["democratic republic of the congo", "CD"],
  ["drc", "CD"],
  ["republic of the congo", "CG"],
  ["vatican", "VA"],
  ["uae", "AE"],
])

/**
 * Aliases for city names (normalized) that differ from the primary
 * spelling used by the SimpleMaps database.
 */
const CITY_ALIASES = new Map<string, string>([
  ["bengaluru", "bangalore"],
  ["freiburg", "freiburg im breisgau"],
  ["bombay", "mumbai"],
  ["calcutta", "kolkata"],
  ["saigon", "ho chi minh city"],
])

/** US state abbreviations -> full names, to disambiguate "City, ST" input. */
const US_STATES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
  ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia",
}

/** Parse one CSV line with quoted fields (handles commas and "" escapes). */
function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let field = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ",") {
      fields.push(field)
      field = ""
    } else {
      field += char
    }
  }
  fields.push(field)
  return fields
}

let index: CityIndex | null = null

function buildIndex(): CityIndex {
  if (index) return index

  const byCityAndCountry = new Map<string, CityRow[]>()
  const byCity = new Map<string, CityRow[]>()
  const countryToIso2 = new Map<string, string>()

  const lines = fs.readFileSync(csvPath, "utf8").split("\n")
  const header = parseCsvLine(lines[0])
  const col = Object.fromEntries(header.map((name, i) => [name, i]))

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    const fields = parseCsvLine(line)

    const row: CityRow = {
      lat: Number(fields[col.lat]),
      lng: Number(fields[col.lng]),
      iso2: fields[col.iso2],
      adminName: fields[col.admin_name],
      population: Number(fields[col.population]) || 0,
    }

    countryToIso2.set(normalizeCountry(fields[col.country]), row.iso2)

    const cityKeys = new Set([
      normalize(fields[col.city]),
      normalize(fields[col.city_ascii] || fields[col.city]),
    ])
    for (const cityKey of cityKeys) {
      if (!cityKey) continue

      const countryKey = `${cityKey}|${row.iso2}`
      const withCountry = byCityAndCountry.get(countryKey)
      if (withCountry) withCountry.push(row)
      else byCityAndCountry.set(countryKey, [row])

      const global = byCity.get(cityKey)
      if (global) global.push(row)
      else byCity.set(cityKey, [row])
    }
  }

  index = { byCityAndCountry, byCity, countryToIso2 }
  return index
}

/**
 * Split "San Diego, CA" style input into a city key and an optional
 * admin (US state) hint used for disambiguation.
 */
function parseCityInput(rawCity: string): {
  cityKey: string
  adminHint: string | null
} {
  const parts = rawCity.split(",")
  let cityKey = normalize(parts[0])
  cityKey = CITY_ALIASES.get(cityKey) ?? cityKey

  let adminHint: string | null = null
  if (parts.length > 1) {
    const suffix = parts[1].replace(/\./g, "").trim().toUpperCase()
    const stateName = US_STATES[suffix]
    if (stateName) adminHint = normalize(stateName)
  }

  return { cityKey, adminHint }
}

/**
 * Resolve a country string to an ISO alpha-2 code.
 * Returns null when the country cannot be resolved.
 */
export function resolveCountry(country: string): string | null {
  const key = normalizeCountry(country)
  return COUNTRY_ALIASES.get(key) ?? buildIndex().countryToIso2.get(key) ?? null
}

/**
 * Look up latitude/longitude/timezone for a conference location.
 * Returns null when the location cannot be resolved (e.g. unknown city,
 * or a location without a city).
 */
export function lookupLocation(
  location: ConferenceLocation | undefined,
): GeoInfo | null {
  const { city, country } = location ?? {}
  if (!city) return null

  const { byCityAndCountry, byCity } = buildIndex()
  const { cityKey, adminHint } = parseCityInput(city)

  let candidates: CityRow[] | undefined
  if (country) {
    const iso2 = resolveCountry(country)
    if (!iso2) return null
    candidates = byCityAndCountry.get(`${cityKey}|${iso2}`)
  } else {
    candidates = byCity.get(cityKey)
  }
  if (!candidates?.length) return null

  let pool = candidates
  if (adminHint) {
    const adminMatches = candidates.filter(
      (row) => normalize(row.adminName) === adminHint,
    )
    if (adminMatches.length) pool = adminMatches
  }

  const best = [...pool].sort((a, b) => b.population - a.population)[0]

  return {
    latitude: best.lat,
    longitude: best.lng,
    timezone: tzLookup(best.lat, best.lng),
  }
}
