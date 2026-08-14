import ConferenceMapMarker from "@/components/conference-results/conference-map-marker"

import "@/components/conference-results/conference-map.css"
import "@/components/conference-results/index.css"
import type { MapMarker } from "@/lib/conference-map"
import { geoGraticule, geoMercator, geoPath } from "d3-geo"
import type { FeatureCollection, Geometry } from "geojson"
import type { ComponentProps } from "react"
import { feature } from "topojson-client"
import type { GeometryCollection, Topology } from "topojson-specification"
import landTopology from "world-atlas/land-110m.json"

export type ConferenceResultsProps = ComponentProps<"div"> & {
  markers: MapMarker[]
  /** Astro passes `class`; React uses `className`. Accept both. */
  class?: string
}

// width is based on var(--page-max-content-width) - 2 * var(--page-min-x-padding)
// TODO: this needs to be value from a
const WIDTH = 1152
const HEIGHT = 648
// Cut off the map at the latitudes no conferences are ever held (the north pole and Antarctica).
const LAT_MIN = -60
const LAT_MAX = 70

type LandTopology = Topology<{
  land: GeometryCollection
}>

const topology = landTopology as unknown as LandTopology
/** Major landmasses (continents / islands), not individual countries. */
const land = feature(
  topology,
  topology.objects.land,
) as FeatureCollection<Geometry>

/** GeoJSON bbox feature used to fit the view to [-180, LAT_MIN]…[180, LAT_MAX]. */
const mapExtent = {
  type: "MultiPoint" as const,
  coordinates: [
    [-180, LAT_MIN],
    [180, LAT_MIN],
    [180, LAT_MAX],
    [-180, LAT_MAX],
  ],
}

const projection = geoMercator()
  .fitSize([WIDTH, HEIGHT], mapExtent)
  .clipExtent([
    [0, 0],
    [WIDTH, HEIGHT],
  ])
const path = geoPath(projection)
/** Parallels every 10° within the visible latitude range (no meridians). */
const parallels = geoGraticule()
  .step([Infinity, 30])
  .extent([
    [-180, LAT_MIN],
    [180, LAT_MAX],
  ])()

const ConferenceResults = ({
  markers,
  className,
  class: classProp,
  ...props
}: ConferenceResultsProps) => {
  return (
    <div
      className="conferences-results-container"
      data-width={WIDTH}
      data-height={HEIGHT}
      {...props}
    >
      <svg
        role="presentation"
        className={["conference-map", className, classProp]
          .filter(Boolean)
          .join(" ")}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        aria-label="World map of tech conferences"
      >
        <path
          className="conference-map-parallels"
          d={path(parallels) ?? undefined}
        />
        <path className="conference-map-land" d={path(land) ?? undefined} />
      </svg>

      <ul className="conference-map-markers-list">
        {markers.map(marker => {
          const projected = projection([marker.longitude, marker.latitude])
          if (!projected) return null
          return (
            <ConferenceMapMarker
              key={marker.id}
              data-x={projected[0]}
              data-y={projected[1]}
              data-radius={marker.count > 1 ? 10 : 5}
              aria-label={marker.label}
            >
              {marker.count > 1 ? marker.count : ""}
            </ConferenceMapMarker>
          )
        })}
      </ul>
    </div>
  )
}

export default ConferenceResults
