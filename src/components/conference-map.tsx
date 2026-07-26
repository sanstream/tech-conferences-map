import { geoGraticule, geoMercator, geoPath } from "d3-geo"
import type { FeatureCollection, Geometry } from "geojson"
import type { ComponentProps } from "react"
import { feature } from "topojson-client"
import type { GeometryCollection, Topology } from "topojson-specification"
import landTopology from "world-atlas/land-110m.json"
import type { MapMarker } from "../lib/conference-map"
import ConferenceMapMarker from "./conference-map-marker"
import "./conference-map.css"

export type ConferenceMapProps = ComponentProps<"svg"> & {
  markers: MapMarker[]
  /** Astro passes `class`; React uses `className`. Accept both. */
  class?: string
}

const WIDTH = 960
const HEIGHT = 500
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

const ConferenceMap = ({
  markers,
  className,
  class: classProp,
  ...props
}: ConferenceMapProps) => {
  return (
    <svg
      className={["conference-map", className, classProp]
        .filter(Boolean)
        .join(" ")}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="World map of tech conferences"
      {...props}
    >
      <path
        className="conference-map-parallels"
        d={path(parallels) ?? undefined}
      />
      <path
        className="conference-map-land"
        d={path(land) ?? undefined}
      />
      <g className="conference-map-markers">
        {markers.map(marker => {
          const projected = projection([marker.longitude, marker.latitude])
          if (!projected) return null
          const [x, y] = projected
          return (
            <ConferenceMapMarker
              key={marker.id}
              x={x}
              y={y}
              count={marker.count}
              aria-label={marker.label}
            />
          )
        })}
      </g>
    </svg>
  )
}

export default ConferenceMap
