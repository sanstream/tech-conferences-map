import { geoMercator } from "d3-geo"

// width is based on var(--page-max-content-width) - 2 * var(--page-min-x-padding)
// TODO: this needs to be value from a
export const WIDTH = 1152
export const HEIGHT = 648
// Cut off the map at the latitudes no conferences are ever held (the north pole and Antarctica).
export const LAT_MIN = -60
export const LAT_MAX = 70

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

// d3-geo's Mercator normalizes longitude to ±180°, so a wider map can't be
// made by feeding it longitudes past that (it just wraps around). Instead,
// the real -180..180 extent is fit into a box inset by one "hour" of margin
// on each side, so the timezone-range filter's UTC-12..+12 track (which
// spans the fitted extent's own edges, see offsetHoursToX below) sits inset
// from the map's 0..WIDTH edges rather than flush against them. The filter's
// 24-hour span plus a 1-hour margin on each side add up to 26 hour-widths
// across WIDTH.
const HOUR_MARGIN_PX = WIDTH / 26

/**
 * Pixel width of one full 360 degrees trip around the globe at the map's scale,
 * i.e. how far to shift a copy of the map so it lines up with itself.
 * Mercator's x-axis is linear in longitude, so translating a rendered copy by this many pixels
 * is equivalent to (and much simpler than) re-projecting it 360 degrees away, letting
 * the map's hour-margins show a wrapped sliver of the opposite edge instead of
 * empty space (see conference-results/server.tsx).
 */
export const WORLD_WIDTH_PX = WIDTH - 2 * HOUR_MARGIN_PX

export const projection = geoMercator()
  .fitExtent(
    [
      [HOUR_MARGIN_PX, 0],
      [WIDTH - HOUR_MARGIN_PX, HEIGHT],
    ],
    mapExtent,
  )
  .clipExtent([
    [0, 0],
    [WIDTH, HEIGHT],
  ])

/**
 * x axis coordinate pixels for a whole-hour UTC offset, using the same projection as the map
 * (1 hour = 15° of longitude). Mercator's x-axis is linear in longitude, so
 * this maps offsets to pixels linearly — offsets -12..+12 land exactly on
 * the fitted extent's own edges (HOUR_MARGIN_PX and WIDTH - HOUR_MARGIN_PX),
 * one hour inset from the map's 0..WIDTH edges either side.
 */
export function offsetHoursToX(offsetHours: number): number {
  const point = projection([offsetHours * 15, 0])
  return point ? point[0] : 0
}
