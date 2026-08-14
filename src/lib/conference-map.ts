import type { ConferenceEntry } from "./conferences"

export type MapMarker = {
  id: string
} & MarkerGroup

type EditionWithId = ConferenceEntry["data"]["editions"][number] & {
  id: string
  conferenceName: string
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

/**
 * Group conference editions that have coordinates into map markers.
 * Editions without lat/lng (online-only or unresolved lookups) are skipped.
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
      const editionId = entry.id + entry.data.name
      const existing = groups.get(id)
      if (existing) {
        existing.count += 1
        existing.names.add(entry.data.name)
        existing.editionsInLocation.push({
          id: editionId,
          conferenceName: entry.data.name,
          ...edition,
        })
      } else {
        groups.set(id, {
          longitude: Number(longitude.toFixed(4)),
          latitude: Number(latitude.toFixed(4)),
          count: 1,
          names: new Set([entry.data.name]),
          cityName: edition.location?.city ?? "",
          countryName: edition.location?.country ?? "",
          editionsInLocation: [
            { id: editionId, conferenceName: entry.data.name, ...edition },
          ],
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
