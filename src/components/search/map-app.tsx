import "@/components/conference-filters.css"
import "@/components/search/map-app.css"
import ConferenceResults from "@/components/conference-results/server"
import FilterByLocations from "@/components/filters/locations"
import FilterbySubjects from "@/components/filters/subjects"
import SearchProviders from "@/components/search/providers"
import type { MapMarker } from "@/lib/conference-map"
import { applyMarkerSearch } from "@/lib/marker-search"
import { searchParamsParsers } from "@/lib/search-params"
import { useQuery } from "@tanstack/react-query"
import { useQueryStates } from "nuqs"

export type MapAppProps = {
  markers: MapMarker[]
  subjects: string[]
  locations: string[]
}

function MapAppContent({ markers, subjects, locations }: MapAppProps) {
  const [filters] = useQueryStates(searchParamsParsers)

  const { data: highlightedMarkers = [] } = useQuery({
    queryKey: ["map-markers", filters.subjects, filters.locations],
    queryFn: () => applyMarkerSearch(markers, filters),
    initialData: () => applyMarkerSearch(markers, filters),
    staleTime: Infinity,
  })

  return (
    <>
      <header className="main-content-filters">
        <h2 className="h3-heading filters-heading">
          Filter the map using these option:
        </h2>
        <div className="tmap-conference-filters">
          <FilterbySubjects subjects={subjects} />
          <FilterByLocations locations={locations} />
        </div>
      </header>
      <div className="main-content-results">
        <ConferenceResults markers={highlightedMarkers} />
      </div>
    </>
  )
}

export default function MapApp(props: MapAppProps) {
  return (
    <SearchProviders>
      <MapAppContent {...props} />
    </SearchProviders>
  )
}
