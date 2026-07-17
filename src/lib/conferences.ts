import { getCollection, type CollectionEntry } from "astro:content"

export type ConferenceEntry = CollectionEntry<"conferences">
export type ConferenceData = ConferenceEntry["data"]

export type ConferenceFilters = {
  subjects?: string[]
  brand?: string
  query?: string
}

export async function getAllConferences(): Promise<ConferenceEntry[]> {
  return getCollection("conferences")
}

export function filterConferences(
  all: ConferenceEntry[],
  filters: ConferenceFilters,
): ConferenceEntry[] {
  return all.filter((entry) => {
    const { data } = entry

    if (filters.subjects?.length) {
      const hasSubject = filters.subjects.some((subject) =>
        data.subjects.includes(subject),
      )
      if (!hasSubject) return false
    }

    if (filters.brand && data.brand !== filters.brand) return false

    if (filters.query) {
      const q = filters.query.toLowerCase()
      const haystack = [data.name, data.brand, data.id, entry.id].join(" ").toLowerCase()
      if (!haystack.includes(q)) return false
    }

    return true
  })
}

export function groupByBrand(
  all: ConferenceEntry[],
): Map<string, ConferenceEntry[]> {
  const groups = new Map<string, ConferenceEntry[]>()

  for (const entry of all) {
    const brand = entry.data.brand
    const list = groups.get(brand) ?? []
    list.push(entry)
    groups.set(brand, list)
  }

  for (const [, list] of groups) {
    list.sort((a, b) => a.data.name.localeCompare(b.data.name, "en"))
  }

  return new Map([...groups.entries()].sort(([a], [b]) => a.localeCompare(b, "en")))
}

export function getSubjectIndex(all: ConferenceEntry[]): string[] {
  const subjects = new Set<string>()
  for (const entry of all) {
    for (const subject of entry.data.subjects) {
      subjects.add(subject)
    }
  }
  return [...subjects].sort((a, b) => a.localeCompare(b, "en"))
}

export type ConferenceIndexEntry = {
  id: string
  brand: string
  name: string
  subjects: string[]
}

export function toConferenceIndex(all: ConferenceEntry[]): ConferenceIndexEntry[] {
  return all
    .map((entry) => ({
      id: entry.id,
      brand: entry.data.brand,
      name: entry.data.name,
      subjects: entry.data.subjects,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "en"))
}
