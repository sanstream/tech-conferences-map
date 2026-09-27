import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@/components/slider"
import {
  mapDistanceToCssLength,
  offsetHoursToX,
  WIDTH,
} from "@/lib/conference-map-projection"
import {
  searchParamsParsers,
  TIMEZONE_RANGE_MAX,
  TIMEZONE_RANGE_MIN,
} from "@/lib/search-params"
import { useQueryState } from "nuqs"
import type { ComponentProps } from "react"
import "./timezone-range.css"

export type FilterByTimezoneRangeProps = ComponentProps<"div">

// The filter's own bounds (-12..+12) are one hour narrower than the map's
// -13..+13 span on each side. The bar mirrors that with a disabled section on
// each side of the active track, exactly as wide as the map's margins, so the
// UTC-12 and UTC+12 thumb positions sit on the same meridians as the edges of
// the default timezone frame on the map below.
// The map is a fixed-viewBox svg rendered at a fixed CSS width, so these are
// absolute CSS lengths derived from the map (via mapDistanceToCssLength), not
// a share of the slider's own width. When the viewport is narrower than the
// map, the map scrolls underneath and no alignment is possible; the sections
// are dropped there instead (see timezone-range.css).
const LEFT_EDGE_WIDTH = mapDistanceToCssLength(
  offsetHoursToX(TIMEZONE_RANGE_MIN),
)
const RIGHT_EDGE_WIDTH = mapDistanceToCssLength(
  WIDTH - offsetHoursToX(TIMEZONE_RANGE_MAX),
)

function formatOffset(offsetHours: number): string {
  if (offsetHours === 0) return "UTC"
  return `UTC${offsetHours > 0 ? "+" : ""}${offsetHours}`
}

const FilterByTimezoneRange = ({
  className,
  ...props
}: FilterByTimezoneRangeProps) => {
  const [timezoneRange, setTimezoneRange] = useQueryState(
    "timezoneRange",
    searchParamsParsers.timezoneRange,
  )
  const [min, max] = timezoneRange

  return (
    <div
      className={["tmap-timezone-range-filter", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div className="tmap-timezone-range-header">
        <label id="timezone-range-label">Timezone range</label>
        <span className="tmap-timezone-range-readout">
          {formatOffset(min)} to {formatOffset(max)}
        </span>
      </div>
      <Slider
        aria-labelledby="timezone-range-label"
        min={TIMEZONE_RANGE_MIN}
        max={TIMEZONE_RANGE_MAX}
        step={1}
        minStepsBetweenValues={1}
        value={timezoneRange}
        onValueChange={value => {
          void setTimezoneRange(value as number[])
        }}
      >
        <div className="tmap-timezone-range-bar">
          <span
            aria-hidden="true"
            className="tmap-timezone-range-edge"
            style={{ width: LEFT_EDGE_WIDTH }}
          />
          <SliderControl className="tmap-timezone-range-control">
            <SliderTrack className="tmap-timezone-range-track">
              <SliderIndicator className="tmap-timezone-range-indicator" />
              <SliderThumb
                index={0}
                getAriaValueText={(_, value) => formatOffset(value)}
              />
              <SliderThumb
                index={1}
                getAriaValueText={(_, value) => formatOffset(value)}
              />
            </SliderTrack>
          </SliderControl>
          <span
            aria-hidden="true"
            className="tmap-timezone-range-edge"
            style={{ width: RIGHT_EDGE_WIDTH }}
          />
        </div>
      </Slider>
    </div>
  )
}

export default FilterByTimezoneRange
