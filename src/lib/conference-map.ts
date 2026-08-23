import type { ConferenceEntry } from "./conferences"

export type MapMarker = {
  id: string
} & MarkerGroup

type EditionWithId = ConferenceEntry["data"]["editions"][number] & {
  id: string
  conferenceId: string
  conferenceName: string
  subjects: string[]
  url: string
}

type MarkerGroup = {
  longitude: number
  latitude: number
  count: number
  names: Set<string>
  cityName: string
  countryName: string
  editionsInLocation: EditionWithId[]
}

function coordinateKey(latitude: number, longitude: number): string {
  return `${latitude.toFixed(4)},${longitude.toFixed(4)}`
}

/** True if `candidate` starts (or, if tied, ends) later than `current`. */
function isLaterEdition(
  candidate: EditionWithId,
  current: EditionWithId,
): boolean {
  if (candidate.startDate !== current.startDate) {
    return candidate.startDate > current.startDate
  }
  return candidate.endDate > current.endDate
}

/**
 * Group conference editions that have coordinates into map markers.
 * Editions without lat/lng (online-only or unresolved lookups) are skipped.
 * At a given location, only the latest edition of each conference is kept.
 */
export function getConferenceMapMarkers(
  conferences: ConferenceEntry[],
): MapMarker[] {
  const groups = new Map<string, MarkerGroup>()

  for (const entry of conferences) {
    for (const edition of entry.data.editions) {
      const latitude = edition.location?.latitude
      const longitude = edition.location?.longitude
      if (typeof latitude !== "number" || typeof longitude !== "number") {
        continue
      }

      const id = coordinateKey(latitude, longitude)
      const nextEdition: EditionWithId = {
        ...edition,
        id: `${entry.id}-${edition.startDate}`,
        conferenceId: entry.id,
        conferenceName: entry.data.name,
        subjects: entry.data.subjects,
        url: entry.data.url,
      }
      const existing = groups.get(id)
      if (existing) {
        const sameConferenceIndex = existing.editionsInLocation.findIndex(
          grouped => grouped.conferenceId === entry.id,
        )
        if (sameConferenceIndex === -1) {
          existing.editionsInLocation.push(nextEdition)
          existing.names.add(entry.data.name)
          existing.count += 1
        } else if (
          isLaterEdition(
            nextEdition,
            existing.editionsInLocation[sameConferenceIndex],
          )
        ) {
          existing.editionsInLocation[sameConferenceIndex] = nextEdition
        }
      } else {
        groups.set(id, {
          longitude: Number(longitude.toFixed(4)),
          latitude: Number(latitude.toFixed(4)),
          count: 1,
          names: new Set([entry.data.name]),
          cityName: edition.location?.city ?? "",
          countryName: edition.location?.country ?? "",
          editionsInLocation: [nextEdition],
        })
      }
    }
  }

  return [...groups.entries()]
    .map(([id, group]) => ({
      id,
      ...group,
    }))
    .sort((a, b) => a.id.localeCompare(b.id, "en"))
}
