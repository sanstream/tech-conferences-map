import "@/components/conference-results/conference-popover.css"
import type { ComponentProps } from "react"

export type ConferencePopoverProps = Omit<ComponentProps<"div">, "id"> & {
  id: string
}

const ConferencePopover = ({
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
      {children}
    </div>
  )
}

export default ConferencePopover
