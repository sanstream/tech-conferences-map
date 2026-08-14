import "@/components/conference-results/conference-map-marker.css"
import type { ComponentProps } from "react"

export type ConferenceMapMarkerProps = ComponentProps<"li">

const ConferenceMapMarker = ({
  className,
  children,
  ...props
}: ConferenceMapMarkerProps) => {
  return (
    <li
      className={["conference-map-marker", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </li>
  )
}

export default ConferenceMapMarker
