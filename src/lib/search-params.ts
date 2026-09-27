import { parseAsArrayOf, parseAsInteger, parseAsString } from "nuqs"

/** The timezone-range filter's fixed, artificial bounds (see the filter UI). */
export const TIMEZONE_RANGE_MIN = -12
export const TIMEZONE_RANGE_MAX = 12
export const DEFAULT_TIMEZONE_RANGE: [number, number] = [
  TIMEZONE_RANGE_MIN,
  TIMEZONE_RANGE_MAX,
]

/** Matches the map svg's one-hour margins beyond the filter track (see conference-map-projection.ts). */
export const MAP_OVERLAY_MARGIN_HOURS = 1

/**
 * UTC-offset span used to dim/highlight land on the map. At the filter default
 * (-12..+12), expand by the map margins so visible land in the ±13 edge strips
 * (e.g. New Zealand at UTC+13) is not muted.
 */
export function timezoneRangeForMapOverlay(
  timezoneRange: readonly [number, number],
): [number, number] {
  const [min, max] = timezoneRange
  if (min === TIMEZONE_RANGE_MIN && max === TIMEZONE_RANGE_MAX) {
    return [
      TIMEZONE_RANGE_MIN - MAP_OVERLAY_MARGIN_HOURS,
      TIMEZONE_RANGE_MAX + MAP_OVERLAY_MARGIN_HOURS,
    ]
  }
  return [min, max]
}

export const searchParamsParsers = {
  name: parseAsString.withDefault(""),
  subjects: parseAsArrayOf(parseAsString).withDefault([]),
  locations: parseAsArrayOf(parseAsString).withDefault([]),
  timezoneRange: parseAsArrayOf(parseAsInteger).withDefault(
    DEFAULT_TIMEZONE_RANGE,
  ),
}

export type SearchFilters = {
  name: string
  subjects: string[]
  locations: string[]
  timezoneRange: number[]
}

export function isSearchActive(filters: SearchFilters): boolean {
  return (
    filters.name.trim().length > 0 ||
    filters.subjects.length > 0 ||
    filters.locations.length > 0 ||
    filters.timezoneRange[0] !== TIMEZONE_RANGE_MIN ||
    filters.timezoneRange[1] !== TIMEZONE_RANGE_MAX
  )
}
