import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@/components/slider"
import { offsetHoursToX, WIDTH } from "@/lib/conference-map-projection"
import {
  searchParamsParsers,
  TIMEZONE_RANGE_MAX,
  TIMEZONE_RANGE_MIN,
} from "@/lib/search-params"
import { useQueryState } from "nuqs"
import type { ComponentProps } from "react"
import "./timezone-range.css"

export type FilterByTimezoneRangeProps = ComponentProps<"div">

// The slider's usable track is inset to the filter's own -11..+12 bounds,
// not the map's full -180..180 span, expressed as a % of the map's width so
// it stays aligned with the meridians on the map below at any viewport size
// (see src/lib/conference-map-projection.ts) — the map itself is a
// fixed-viewBox SVG stretched to fit the same responsive container width.
const TRACK_LEFT_PERCENT = (offsetHoursToX(TIMEZONE_RANGE_MIN) / WIDTH) * 100
const TRACK_WIDTH_PERCENT =
  (offsetHoursToX(TIMEZONE_RANGE_MAX) / WIDTH) * 100 - TRACK_LEFT_PERCENT

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
        <SliderControl
          style={{
            marginLeft: `${TRACK_LEFT_PERCENT}%`,
            width: `${TRACK_WIDTH_PERCENT}%`,
          }}
        >
          <SliderTrack>
            <SliderIndicator />
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
      </Slider>
    </div>
  )
}

export default FilterByTimezoneRange
