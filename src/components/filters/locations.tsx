import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/combobox"
import { searchParamsParsers } from "@/lib/search-params"
import clsx from "clsx"
import { useQueryState } from "nuqs"
import type { ComponentProps } from "react"

export type FilterByLocationsProps = ComponentProps<"div"> & {
  locations: string[]
}

const FilterByLocations = ({
  className,
  locations,
}: FilterByLocationsProps) => {
  const [selectedLocations, setSelectedLocations] = useQueryState(
    "locations",
    searchParamsParsers.locations,
  )
  const anchor = useComboboxAnchor()
  return (
    <div className={clsx("filter-option-layout", className)}>
      <label htmlFor="locations">Locations</label>
      <Combobox
        id="locations"
        items={locations}
        multiple
        value={selectedLocations}
        onValueChange={value => {
          void setSelectedLocations(value)
        }}
      >
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(selected: string[]) =>
              selected.map(item => (
                <ComboboxChip className="tmap-badge-location-colour" key={item}>
                  {item}
                </ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxChipsInput placeholder="Filter by location…" />
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No locations found.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}

export default FilterByLocations
