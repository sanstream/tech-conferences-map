import type { ComponentProps } from "react"
import "./conference-map-marker.css"

export type ConferenceMapMarkerProps = ComponentProps<"g"> & {
  count: number
  x: number
  y: number
}

const ConferenceMapMarker = ({
  count,
  x,
  y,
  className,
  ...props
}: ConferenceMapMarkerProps) => {
  return (
    <g
      className={["conference-map-marker", className].filter(Boolean).join(" ")}
      transform={`translate(${x} ${y})`}
      {...props}
    >
      <circle r={count > 1 ? 10 : 5} />
      {count > 1 ? (
        <text
          className="conference-map-marker-count"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {count}
        </text>
      ) : null}
    </g>
  )
}

export default ConferenceMapMarker
