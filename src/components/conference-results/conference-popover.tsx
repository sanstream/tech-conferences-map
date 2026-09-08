import Badge from "@/components/badge"
import "@/components/conference-results/conference-popover.css"
import type { MapEdition } from "@/lib/conference-map"
import type { SearchAwareMarker } from "@/lib/marker-search"
import type { ComponentProps } from "react"

export type ConferencePopoverProps = Omit<ComponentProps<"div">, "id"> & {
  id: string
  markerInfo: SearchAwareMarker
}

function EditionRow({ edition }: { edition: MapEdition }) {
  return (
    <li>
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
  )
}

const ConferencePopover = ({
  markerInfo,
  id,
  className,
  children,
  ...props
}: ConferencePopoverProps) => {
  const {
    displayCount,
    cityName,
    countryName,
    searchActive,
    matchingEditions,
    nonMatchingEditions,
    editionsInLocation,
  } = markerInfo

  const showSplit =
    searchActive &&
    matchingEditions.length > 0 &&
    nonMatchingEditions.length > 0

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
        {!showSplit ? (
          <>
            {displayCount} {displayCount === 1 ? "conference" : "conferences"}
          </>
        ) : (
          "Conferences"
        )}{" "}
        in {cityName}, {countryName}
      </h2>

      {showSplit ? (
        <>
          <h3 className="conference-popover-section-heading">
            Matching ({matchingEditions.length})
          </h3>
          <ul className="conference-popover-editions">
            {matchingEditions.map(edition => (
              <EditionRow key={edition.id} edition={edition} />
            ))}
          </ul>
          <h3 className="conference-popover-section-heading">
            Other ({nonMatchingEditions.length})
          </h3>
          <ul className="conference-popover-editions">
            {nonMatchingEditions.map(edition => (
              <EditionRow key={edition.id} edition={edition} />
            ))}
          </ul>
        </>
      ) : (
        <ul className="conference-popover-editions">
          {(searchActive
            ? matchingEditions.length > 0
              ? matchingEditions
              : nonMatchingEditions
            : editionsInLocation
          ).map(edition => (
            <EditionRow key={edition.id} edition={edition} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default ConferencePopover
