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

export const projection = geoMercator()
  .fitSize([WIDTH, HEIGHT], mapExtent)
  .clipExtent([
    [0, 0],
    [WIDTH, HEIGHT],
  ])

/**
 * x pixel for a whole-hour UTC offset, using the same projection as the map
 * (1 hour = 15° of longitude). Mercator's x-axis is linear in longitude, so
 * this maps offsets to pixels linearly — but only across the map's full
 * longitude span (-180..180, i.e. offsets -12..+12); the timezone-range
 * filter's own bounds (-11..+12) are a narrower, inset sub-range of that.
 */
export function offsetHoursToX(offsetHours: number): number {
  const point = projection([offsetHours * 15, 0])
  return point ? point[0] : 0
}
