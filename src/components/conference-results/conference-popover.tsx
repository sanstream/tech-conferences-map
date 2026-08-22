import Badge from "@/components/badge"
import "@/components/conference-results/conference-popover.css"
import type { MapMarker } from "@/lib/conference-map"
import type { ComponentProps } from "react"

export type ConferencePopoverProps = Omit<ComponentProps<"div">, "id"> & {
  id: string
  markerInfo: MapMarker
}

const ConferencePopover = ({
  markerInfo,
  id,
  className,
  children,
  ...props
}: ConferencePopoverProps) => {
  return (
    <div
      id={id}
      className={["conference-map-marker-popover", className]
        .filter(Boolean)
        .join(" ")}
      popover="auto"
      {...props}
    >
      <h4>
        {markerInfo.cityName}, {markerInfo.countryName} ({markerInfo.count})
      </h4>
      <ul>
        {markerInfo.editionsInLocation.map(edition => (
          <li key={edition.id}>
            {edition.conferenceName}<br/>
            <ul>
              <Badge purpose="location">
                {edition.isOnline && edition.location ? "Hybrid" : edition. ? "Hybrid" : "In-person"}
              </Badge>
            </ul>
            <br />
            <time dateTime={`${edition.startDate}/${edition.endDate}`}>
              {edition.startDate} &ndash; {edition.endDate}
            </time>
            {edition.notes && <p>{edition.notes}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ConferencePopover
