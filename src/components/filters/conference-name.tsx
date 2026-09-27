import { searchParamsParsers } from "@/lib/search-params"
import clsx from "clsx"
import { debounce, useQueryState } from "nuqs"
import type { ComponentProps } from "react"
import "./conference-name.css"

export type FilterByConferenceNameProps = ComponentProps<"div">

const FilterByConferenceName = ({
  className,
  ...props
}: FilterByConferenceNameProps) => {
  const [name, setName] = useQueryState("name", searchParamsParsers.name)

  return (
    <div className={clsx("filter-option-layout", className)} {...props}>
      <label htmlFor="conference-name">Conference name</label>
      <input
        id="conference-name"
        type="search"
        className="tmap-conference-name-input"
        placeholder="Filter by name…"
        autoComplete="off"
        value={name}
        onChange={event => {
          const value = event.target.value
          void setName(value || null, {
            limitUrlUpdates: value ? debounce(300) : undefined,
          })
        }}
      />
    </div>
  )
}

export default FilterByConferenceName
