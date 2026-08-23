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
      <h2>
        {markerInfo.count} {markerInfo.count > 1 ? "conferences" : "conference"}{" "}
        in {markerInfo.cityName}, {markerInfo.countryName}
      </h2>
      <ul className="conference-popover-editions">
        {markerInfo.editionsInLocation.map(edition => (
          <li key={edition.id}>
            <header className="conference-popover-header">
              <a href={edition.url} target="_blank" rel="noopener noreferrer">
                {edition.conferenceName}
              </a>
              <ul className="inline-list">
                <Badge purpose="location">
                  {edition.isOnline && edition.location
                    ? "Hybrid"
                    : edition.isOnline
                      ? "Online"
                      : "In-person"}
                </Badge>
              </ul>
            </header>
            <time dateTime={`${edition.startDate}/${edition.endDate}`}>
              {edition.startDate} &ndash; {edition.endDate}
            </time>
            <ul className="conference-popover-subjects inline-list">
              {edition.subjects.map(subject => (
                <li key={subject}>
                  <Badge purpose="conferenceSubject">{subject}</Badge>
                </li>
              ))}
            </ul>
            {edition.notes && <p>{edition.notes}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ConferencePopover
