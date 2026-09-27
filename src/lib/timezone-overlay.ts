/**
 * Builds the map overlay data for a selected UTC-offset range: the merged
 * outline of whichever vendored timezone-boundary features (see
 * src/data/timezones/README.md) fall inside the range, so the map can
 * highlight them and mute everything else back to the app's background
 * colour.
 *
 * The features are merged (dissolving the borders between adjoining
 * in-range timezones) rather than drawn individually, so the overlay reads
 * as a single "box" outline rather than tracing every timezone's border.
 *
 * The dataset's `utcOffsetHours` is a fixed-reference-date approximation —
 * fine for this purely visual bucketing. Per-conference filtering (which
 * markers match) instead uses each edition's own date via
 * src/lib/timezone-offset.ts, so it stays DST-correct.
 */
import timezoneTopology from "@/data/timezones/timezones-110m.json"
import type { MultiPolygon } from "geojson"
import { merge } from "topojson-client"
import type {
  GeometryCollection,
  MultiPolygon as TopoMultiPolygon,
  Polygon as TopoPolygon,
  Topology,
} from "topojson-specification"

type TimezoneProperties = {
  tzid: string
  utcOffsetHours: number
}

type TimezoneTopology = Topology<{
  "combined-with-oceans-1970": GeometryCollection<TimezoneProperties>
}>

const topology = timezoneTopology as unknown as TimezoneTopology
const timezoneGeometries = topology.objects["combined-with-oceans-1970"]
  .geometries as Array<
  TopoPolygon<TimezoneProperties> | TopoMultiPolygon<TimezoneProperties>
>

const EMPTY_MULTI_POLYGON: MultiPolygon = {
  type: "MultiPolygon",
  coordinates: [],
}

export type TimezoneOverlay = {
  /** Dissolved outer boundary of the in-range timezones — no internal borders. */
  inRange: MultiPolygon
}

export function buildTimezoneOverlay(
  timezoneRange: readonly [number, number],
): TimezoneOverlay {
  const [min, max] = timezoneRange
  const inRangeGeometries = timezoneGeometries.filter(g => {
    const offset = g.properties?.utcOffsetHours
    // Slider max is a whole hour; include zones up to (but not including) the next
    // hour so half/quarter-hour offsets count as that hour (e.g. Pacific/Chatham
    // at UTC+13:45 → 13.75, on New Zealand territory east of the main islands).
    return offset !== undefined && offset >= min && offset < max + 1
  })

  return {
    inRange:
      inRangeGeometries.length > 0
        ? merge(topology, inRangeGeometries)
        : EMPTY_MULTI_POLYGON,
  }
}
