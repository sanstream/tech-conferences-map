import ConferenceMapMarker from "@/components/conference-results/conference-map-marker"
import ConferencePopover from "@/components/conference-results/conference-popover"

import "@/components/conference-results/conference-map.css"
import "@/components/conference-results/index.css"
import type { MapMarker } from "@/lib/conference-map"
import { geoGraticule, geoMercator, geoPath } from "d3-geo"
import type { FeatureCollection, Geometry } from "geojson"
import type { ComponentProps, CSSProperties } from "react"
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
          const popoverId = marker.id + "popover"
          const radius = marker.count > 1 ? 10 : 5
          const [x, y] = projected
          return (
            <li
              key={marker.id}
              data-x={x}
              data-y={y}
              data-radius={radius}
              style={
                {
                  "--marker-x": x,
                  "--marker-y": y,
                  "--marker-r": radius,
                } as CSSProperties
              }
            >
              <ConferenceMapMarker
                key={marker.id}
                popoverTarget={popoverId}
                aria-label={`${marker.cityName}, ${marker.countryName}`}
              >
                {marker.count > 1 ? marker.count : ""}
              </ConferenceMapMarker>
              <ConferencePopover key={popoverId} id={popoverId}>
                <h4>
                  {marker.cityName}, {marker.countryName} ({marker.count})
                </h4>
                <ul>
                  {marker.editionsInLocation.map(edition => (
                    <li key={edition.id}>
                      {edition.conferenceName} ({edition.startDate} -{" "}
                      {edition.endDate})
                    </li>
                  ))}
                </ul>
              </ConferencePopover>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ConferenceResults
