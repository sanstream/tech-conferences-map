import "@/components/conference-results/conference-map-marker.css"
import type { ComponentProps } from "react"

export type ConferenceMapMarkerProps = ComponentProps<"button">

const ConferenceMapMarker = ({
  className,
  children,
  ...props
}: ConferenceMapMarkerProps) => {
  return (
    <button
      className={["conference-map-marker", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </button>
  )
}

export default ConferenceMapMarker
