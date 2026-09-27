import { parseAsArrayOf, parseAsInteger, parseAsString } from "nuqs"

/** The timezone-range filter's fixed, artificial bounds (see the filter UI). */
export const TIMEZONE_RANGE_MIN = -12
export const TIMEZONE_RANGE_MAX = 12
export const DEFAULT_TIMEZONE_RANGE: [number, number] = [
  TIMEZONE_RANGE_MIN,
  TIMEZONE_RANGE_MAX,
]

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
