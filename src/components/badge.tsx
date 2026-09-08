import "@/components/badge.css"
import { cva, type VariantProps } from "class-variance-authority"
import clsx from "clsx"
import type { ComponentProps } from "react"

export type BadgeProps = ComponentProps<"span"> &
  VariantProps<typeof rootClassName>

export const defaultVariants = {
  purpose: "default",
} as const

export const rootClassName = cva("tmap-badge", {
  variants: {
    purpose: {
      default: "tmap-badge",
      // maps onto a city location, hybrid and fully online
      location: "tmap-badge tmap-badge-location-colour",
      conferenceSubject: "tmap-badge tmap-badge-subject-colour",
    },
  },
  defaultVariants,
})

const Badge = ({
  className,
  purpose = defaultVariants.purpose,
  children,
  ...restProps
}: BadgeProps) => {
  return (
    <span
      className={clsx(rootClassName({ purpose, className }))}
      {...restProps}
    >
      {children}
    </span>
  )
}

export default Badge
