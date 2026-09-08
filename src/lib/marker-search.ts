import {
  formatEditionLocation,
  type MapEdition,
  type MapMarker,
} from "@/lib/conference-map"
import { isSearchActive, type SearchFilters } from "@/lib/search-params"

export type SearchAwareMarker = MapMarker & {
  matchingEditions: MapEdition[]
  nonMatchingEditions: MapEdition[]
  displayCount: number
  containsMatches: boolean
  searchActive: boolean
}

export function editionMatchesSearch(
  edition: MapEdition,
  filters: SearchFilters,
): boolean {
  const subjectOk =
    filters.subjects.length === 0 ||
    filters.subjects.some(subject => edition.subjects.includes(subject))

  const locationOk =
    filters.locations.length === 0 ||
    filters.locations.includes(formatEditionLocation(edition))

  return subjectOk && locationOk
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
