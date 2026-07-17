const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function slugify(text) {
  return String(text)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
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

export function formatEdition(edition) {
  if (!edition?.startDate || !ISO_DATE.test(edition.startDate)) return null
  const endDate =
    edition.endDate && ISO_DATE.test(edition.endDate) ? edition.endDate : edition.startDate
  if (endDate < edition.startDate) return null
  const out = { startDate: edition.startDate, endDate }
  const location = formatLocation(edition.location)
  if (location) out.location = location
  if (edition.isOnline === true) out.isOnline = true
  return out
}

export function normalizeEditions(editions) {
  if (!Array.isArray(editions)) return []
  const byKey = new Map()
  for (const ed of editions) {
    const formatted = formatEdition(ed)
    if (!formatted) continue
    const key = `${formatted.startDate}::${formatted.endDate}`
    const existing = byKey.get(key)
    if (!existing) {
      byKey.set(key, formatted)
      continue
    }
    if (!existing.location && formatted.location) existing.location = formatted.location
    if (formatted.isOnline) existing.isOnline = true
  }
  return [...byKey.values()].sort((a, b) => a.startDate.localeCompare(b.startDate))
}

/**
 * Move instance-level location/isOnline onto editions (legacy migration on write).
 */
export function hoistLocationOntoEditions(instance, fallback = {}) {
  const inheritedLocation =
    formatLocation(instance.location) || formatLocation(fallback.location)
  const inheritedOnline = instance.isOnline === true || fallback.isOnline === true

  const editions = normalizeEditions(instance.editions).map((ed) => {
    const out = { ...ed }
    if (!out.location && inheritedLocation) out.location = inheritedLocation
    if (inheritedOnline) out.isOnline = true
    return out
  })

  return normalizeEditions(editions)
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
          if (ed?.location !== undefined && ed?.location !== null) {
            const loc = formatLocation(ed.location)
            if (!loc) errors.push(`empty edition location: ${c.name}`)
            if (ed.location && typeof ed.location === "object") {
              for (const key of Object.keys(ed.location)) {
                if (key !== "city" && key !== "country") {
                  errors.push(`unknown edition location field ${key}: ${c.name}`)
                }
              }
            }
          }
          if (ed?.isOnline !== undefined && typeof ed.isOnline !== "boolean") {
            errors.push(`bad edition isOnline: ${c.name}`)
          }
        }
      }
    }
    if (c.location !== undefined) {
      errors.push(`instance-level location is deprecated (use editions): ${c.name}`)
    }
    if (c.isOnline !== undefined) {
      errors.push(`instance-level isOnline is deprecated (use editions): ${c.name}`)
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

export function formatConference(entry) {
  const editions = normalizeEditions(entry.editions)
  const out = {
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
