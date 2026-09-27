import Badge from "@/components/badge"
import { Button } from "@/components/button"
import "@/components/conference-results/conference-popover.css"
import type { MapEdition } from "@/lib/conference-map"
import type { SearchAwareMarker } from "@/lib/marker-search"
import type { ComponentProps, SVGProps } from "react"

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

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
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="conference-popover-close"
        popoverTarget={id}
        popoverTargetAction="hide"
        aria-label="Close results"
      >
        <CloseIcon />
      </Button>
      <h2 className="conference-popover-title">
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
