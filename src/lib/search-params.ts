import { parseAsArrayOf, parseAsString } from "nuqs"

export const searchParamsParsers = {
  subjects: parseAsArrayOf(parseAsString).withDefault([]),
  locations: parseAsArrayOf(parseAsString).withDefault([]),
}

export type SearchFilters = {
  subjects: string[]
  locations: string[]
}

export function isSearchActive(filters: SearchFilters): boolean {
  return filters.subjects.length > 0 || filters.locations.length > 0
}
