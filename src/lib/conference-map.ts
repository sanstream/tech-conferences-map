import type { ConferenceEntry } from "./conferences"

export type MapMarker = {
  id: string
  longitude: number
  latitude: number
  count: number
  label?: string
}

type MarkerGroup = {
  longitude: number
  latitude: number
  count: number
  names: Set<string>
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
      const existing = groups.get(id)
      if (existing) {
        existing.count += 1
        existing.names.add(entry.data.name)
      } else {
        groups.set(id, {
          longitude: Number(longitude.toFixed(4)),
          latitude: Number(latitude.toFixed(4)),
          count: 1,
          names: new Set([entry.data.name]),
        })
      }
    }
  }

  return [...groups.entries()]
    .map(([id, group]) => ({
      id,
      longitude: group.longitude,
      latitude: group.latitude,
      count: group.count,
      label:
        group.names.size === 1 ? [...group.names][0] : `${group.count} editions`,
    }))
    .sort((a, b) => a.id.localeCompare(b.id, "en"))
}
