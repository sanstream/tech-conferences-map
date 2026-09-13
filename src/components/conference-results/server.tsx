import ConferenceMapMarker from "@/components/conference-results/conference-map-marker"
import ConferencePopover from "@/components/conference-results/conference-popover"

import "@/components/conference-results/conference-map.css"
import "@/components/conference-results/index.css"
import {
  HEIGHT,
  LAT_MAX,
  LAT_MIN,
  projection,
  WIDTH,
  WORLD_WIDTH_PX,
} from "@/lib/conference-map-projection"
import type { SearchAwareMarker } from "@/lib/marker-search"
import type { TimezoneOverlay } from "@/lib/timezone-overlay"
import { geoGraticule, geoPath } from "d3-geo"
import type { FeatureCollection, Geometry } from "geojson"
import type { ComponentProps, CSSProperties } from "react"
import { feature } from "topojson-client"
import type { GeometryCollection, Topology } from "topojson-specification"
import landTopology from "world-atlas/land-110m.json"

export type ConferenceResultsProps = ComponentProps<"div"> & {
  markers: SearchAwareMarker[]
  timezoneOverlay: TimezoneOverlay
  /** Astro passes `class`; React uses `className`. Accept both. */
  class?: string
}

type LandTopology = Topology<{
  land: GeometryCollection
}>

const topology = landTopology as unknown as LandTopology
/** Major landmasses (continents / islands), not individual countries. */
const land = feature(
  topology,
  topology.objects.land,
) as FeatureCollection<Geometry>

/** 0-1 opacity of the grain multiplied over the land fill. */
const DARK_LAND_STRENGTH = 0.55

const path = geoPath(projection)
/** Parallels every 10° within the visible latitude range (no meridians). */
const parallels = geoGraticule()
  .step([Infinity, 30])
  .extent([
    [-180, LAT_MIN],
    [180, LAT_MAX],
  ])()

const landPathD = path(land) ?? undefined
const parallelsPathD = path(parallels) ?? undefined

/**
 * Draw each background layer 3 times, shifted by a full world-width either
 * side. Only the hour-margin slivers beyond the real -180..180 map actually
 * show (the rest falls outside the svg's viewBox and is clipped away), so the
 * margins read as the map wrapping around rather than empty ocean.
 */
const WRAP_OFFSETS_PX = [-WORLD_WIDTH_PX, 0, WORLD_WIDTH_PX]

const ConferenceResults = ({
  markers,
  timezoneOverlay,
  className,
  class: classProp,
  ...props
}: ConferenceResultsProps) => {
  const inRangePath = path(timezoneOverlay.inRange) ?? undefined
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
        <defs>
          <filter id="paper-texture-filter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.04}
              numOctaves={4}
              stitchTiles="stitch"
              result="noise"
            />
            {/* Use the noise as a mask only, so it adds no colour of its own. */}
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0"
              result="noiseMask"
            />
            <feComponentTransfer in="noiseMask" result="grainMask">
              <feFuncA type="linear" slope={0.6} intercept="0" />
            </feComponentTransfer>
            {/* A darkened copy of the land, so the grain keeps the land's own colour. */}
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values={`${DARK_LAND_STRENGTH} 0 0 0 0  0 ${DARK_LAND_STRENGTH} 0 0 0  0 0 ${DARK_LAND_STRENGTH} 0 0  0 0 0 1 0`}
              result="darkLand"
            />
            <feComposite
              in="darkLand"
              in2="grainMask"
              operator="in"
              result="darkGrain"
            />
            {/* atop fades between plain and darkened land, clipped to the landmasses. */}
            <feComposite in="darkGrain" in2="SourceGraphic" operator="atop" />
          </filter>
          {/* White = dimmed; the in-range regions are punched out in black so they show through undimmed. */}
          <mask id="timezone-range-mask">
            <rect width={WIDTH} height={HEIGHT} fill="white" />
            {inRangePath && <path d={inRangePath} fill="black" />}
          </mask>
        </defs>
        {WRAP_OFFSETS_PX.map(dx => (
          <path
            key={dx}
            className="conference-map-parallels"
            d={parallelsPathD}
            transform={dx ? `translate(${dx})` : undefined}
          />
        ))}
        {WRAP_OFFSETS_PX.map(dx => (
          <path
            key={dx}
            className="conference-map-land"
            filter="url(#paper-texture-filter)"
            d={landPathD}
            transform={dx ? `translate(${dx})` : undefined}
          />
        ))}
        <rect
          className="conference-map-timezone-dim"
          width={WIDTH}
          height={HEIGHT}
          mask="url(#timezone-range-mask)"
        />
        {inRangePath && (
          <path className="conference-map-timezone-outline" d={inRangePath} />
        )}
      </svg>

      <ul className="conference-map-markers-list">
        {markers.map(marker => {
          const projected = projection([marker.longitude, marker.latitude])
          if (!projected) return null
          const popoverId = marker.id + "popover"
          const radius = marker.displayCount > 1 ? 20 : 10
          const [x, y] = projected
          return (
            <li
              key={marker.id}
              data-x={x}
              data-y={y}
              data-radius={radius}
              data-match={marker.containsMatches ? "true" : "false"}

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
                data-match={marker.containsMatches ? "true" : "false"}
                popoverTarget={popoverId}
                aria-label={`${marker.cityName}, ${marker.countryName}`}
              >
                {marker.displayCount > 1 ? marker.displayCount : ""}
              </ConferenceMapMarker>
              <ConferencePopover
                key={popoverId}
                id={popoverId}
                markerInfo={marker}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ConferenceResults
