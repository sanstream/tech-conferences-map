import {
  formatEditionLocation,
  type MapEdition,
  type MapMarker,
} from "@/lib/conference-map"
import { isSearchActive, type SearchFilters } from "@/lib/search-params"
import { getUtcOffsetHours } from "@/lib/timezone-offset"

// Every MapEdition comes from getConferenceMapMarkers, which only keeps
// editions with resolved coordinates — those always carry a location
// timezone too (both are derived together, see src/lib/world-cities.ts).
function editionMatchesTimezoneRange(
  edition: MapEdition,
  timezoneRange: number[],
): boolean {
  const timezone = edition.location?.timezone
  if (!timezone) return true

  const offset = getUtcOffsetHours(timezone, edition.startDate)
  if (offset === null) return true

  return offset >= timezoneRange[0] && offset <= timezoneRange[1]
}

export type SearchAwareMarker = MapMarker & {
  matchingEditions: MapEdition[]
  nonMatchingEditions: MapEdition[]
  displayCount: number
  containsMatches: boolean
  searchActive: boolean
}

export function getSubjectWeight(
  edition: MapEdition,
  subjects: string[],
): number {
  if (edition.subjects.length === 0) return 0
  const matched = edition.subjects.filter(subject =>
    subjects.includes(subject),
  ).length
  return matched / edition.subjects.length
}

export function editionMatchesSearch(
  edition: MapEdition,
  filters: SearchFilters,
): boolean {
  const nameQuery = filters.name.trim().toLowerCase()
  const nameOk =
    nameQuery.length === 0 ||
    edition.conferenceName.toLowerCase().includes(nameQuery)

  const subjectOk =
    filters.subjects.length === 0 ||
    filters.subjects.some(subject => edition.subjects.includes(subject))

  const locationOk =
    filters.locations.length === 0 ||
    filters.locations.includes(formatEditionLocation(edition))

  const timezoneOk = editionMatchesTimezoneRange(
    edition,
    filters.timezoneRange,
  )

  return nameOk && subjectOk && locationOk && timezoneOk
}

export function applyMarkerSearch(
  markers: MapMarker[],
  filters: SearchFilters,
): SearchAwareMarker[] {
  const searchActive = isSearchActive(filters)

  return markers.map(marker => {
    if (!searchActive) {
      return {
        ...marker,
        matchingEditions: marker.editionsInLocation,
        nonMatchingEditions: [],
        displayCount: marker.count,
        containsMatches: true,
        searchActive: false,
      }
    }

    const matchingEditions: MapEdition[] = []
    const nonMatchingEditions: MapEdition[] = []

    for (const edition of marker.editionsInLocation) {
      if (editionMatchesSearch(edition, filters)) {
        matchingEditions.push(edition)
      } else {
        nonMatchingEditions.push(edition)
      }
    }

    if (filters.subjects.length > 0) {
      matchingEditions.sort(
        (a, b) =>
          getSubjectWeight(b, filters.subjects) -
          getSubjectWeight(a, filters.subjects),
      )
    }

    const displayCount = matchingEditions.length

    return {
      ...marker,
      matchingEditions,
      nonMatchingEditions,
      displayCount,
      containsMatches: displayCount > 0,
      searchActive: true,
    }
  })
}
