import type { ConferenceLocation } from "../../src/lib/world-cities.ts"

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export type OrgType = "for-profit" | "non-profit"

export type Edition = {
  startDate: string
  endDate: string
  location?: ConferenceLocation
  isOnline?: boolean
  /**
   * For online editions without a physical location: the IANA timezone
   * whose local midday best matches the midpoint of the daily schedule.
   */
  timezone?: string
  /** additional relevant notes on this edition:
   * - for online editions without a physical location: the IANA timezone
   *   whose local midday best matches the midpoint of the daily schedule.
   * - for online editions with a physical location: the timezone of the
   *   physical location.
   * - for physical editions: the timezone of the physical location.
   */
  notes?: string
}

export type ConferenceInstance = {
  id: string
  brand: string
  name: string
  url: string
  subjects: string[]
  editions?: Edition[]
  orgType?: OrgType
  /** Legacy instance-level field, migrated onto editions on write. */
  location?: ConferenceLocation
  /** Legacy instance-level field, migrated onto editions on write. */
  isOnline?: boolean
}

/**
 * Raw, not-yet-validated data as read from the JSON source files.
 * The functions in this module normalize and validate it at runtime.
 */
type Raw = any

export function slugify(text: unknown): string {
  return String(text)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

export function formatLocation(location: Raw): ConferenceLocation | undefined {
  if (!location || typeof location !== "object") return undefined
  const city = typeof location.city === "string" ? location.city.trim() : ""
  const country =
    typeof location.country === "string" ? location.country.trim() : ""
  if (!city && !country) return undefined
  const out: ConferenceLocation = {}
  if (city) out.city = city
  if (country) out.country = country
  return out
}

export function formatEdition(edition: Raw): Edition | null {
  if (!edition?.startDate || !ISO_DATE.test(edition.startDate)) return null
  const endDate =
    edition.endDate && ISO_DATE.test(edition.endDate)
      ? edition.endDate
      : edition.startDate
  if (endDate < edition.startDate) return null
  const out: Edition = { startDate: edition.startDate, endDate }
  const location = formatLocation(edition.location)
  if (location) out.location = location
  if (edition.isOnline === true) out.isOnline = true
  if (typeof edition.timezone === "string" && edition.timezone.trim()) {
    out.timezone = edition.timezone.trim()
  }
  if (typeof edition.notes === "string" && edition.notes.trim()) {
    out.notes = edition.notes.trim()
  }
  return out
}

export function normalizeEditions(editions: Raw): Edition[] {
  if (!Array.isArray(editions)) return []
  const byKey = new Map<string, Edition>()
  for (const ed of editions) {
    const formatted = formatEdition(ed)
    if (!formatted) continue
    const key = `${formatted.startDate}::${formatted.endDate}`
    const existing = byKey.get(key)
    if (!existing) {
      byKey.set(key, formatted)
      continue
    }
    if (!existing.location && formatted.location)
      existing.location = formatted.location
    if (formatted.isOnline) existing.isOnline = true
    if (!existing.timezone && formatted.timezone)
      existing.timezone = formatted.timezone
    if (!existing.notes && formatted.notes) existing.notes = formatted.notes
  }
  return [...byKey.values()].sort((a, b) =>
    a.startDate.localeCompare(b.startDate),
  )
}

/**
 * Move instance-level location/isOnline onto editions (legacy migration on write).
 */
export function hoistLocationOntoEditions(
  instance: Raw,
  fallback: Raw = {},
): Edition[] {
  const inheritedLocation =
    formatLocation(instance.location) || formatLocation(fallback.location)
  const inheritedOnline =
    instance.isOnline === true || fallback.isOnline === true

  const editions = normalizeEditions(instance.editions).map(ed => {
    const out: Edition = { ...ed }
    if (!out.location && inheritedLocation) out.location = inheritedLocation
    if (inheritedOnline) out.isOnline = true
    return out
  })

  return normalizeEditions(editions)
}

function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

export function validateInstances(list: Raw[]): string[] {
  const errors: string[] = []
  const ids = new Set<string>()

  for (const c of list) {
    if (!c.id) errors.push(`missing id: ${c.name}`)
    if (!c.brand) errors.push(`missing brand: ${c.name}`)
    if (!c.name) errors.push("missing name")
    if (!/^https?:\/\//.test(c.url)) errors.push(`bad url: ${c.name}`)
    if (
      !Array.isArray(c.subjects) ||
      c.subjects.length < 1 ||
      c.subjects.length > 10
    ) {
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
          if (ed?.location !== undefined && ed?.location !== null) {
            const loc = formatLocation(ed.location)
            if (!loc) errors.push(`empty edition location: ${c.name}`)
            if (ed.location && typeof ed.location === "object") {
              for (const key of Object.keys(ed.location)) {
                if (key !== "city" && key !== "country") {
                  errors.push(
                    `unknown edition location field ${key}: ${c.name}`,
                  )
                }
              }
            }
          }
          if (ed?.isOnline !== undefined && typeof ed.isOnline !== "boolean") {
            errors.push(`bad edition isOnline: ${c.name}`)
          }
          if (ed?.timezone !== undefined) {
            if (
              typeof ed.timezone !== "string" ||
              !isValidTimezone(ed.timezone)
            ) {
              errors.push(`bad edition timezone "${ed.timezone}": ${c.name}`)
            }
          }
          if (ed?.notes !== undefined && typeof ed.notes !== "string") {
            errors.push(`bad edition notes: ${c.name}`)
          }
        }
      }
    }
    if (c.location !== undefined) {
      errors.push(
        `instance-level location is deprecated (use editions): ${c.name}`,
      )
    }
    if (c.isOnline !== undefined) {
      errors.push(
        `instance-level isOnline is deprecated (use editions): ${c.name}`,
      )
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

export function formatConference(entry: Raw): ConferenceInstance {
  const editions = normalizeEditions(entry.editions)
  const out: ConferenceInstance = {
    id: entry.id,
    brand: entry.brand,
    name: entry.name,
    url: entry.url,
    subjects: entry.subjects.slice(0, 10),
  }
  if (editions.length) out.editions = editions
  if (entry.orgType === "for-profit" || entry.orgType === "non-profit") {
    out.orgType = entry.orgType
  }
  return out
}
