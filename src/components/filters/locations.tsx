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
import clsx from "clsx"
import { useState, type ComponentProps } from "react"

export type FilterByLocationsProps = ComponentProps<"div"> & {
  locations: string[]
}

const FilterByLocations = ({
  className,
  locations,
}: FilterByLocationsProps) => {
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const anchor = useComboboxAnchor()
  return (
    <div className={clsx("filter-option-layout", className)}>
      <label htmlFor="locations">Locations</label>
      <Combobox
        id="locations"
        items={locations}
        multiple
        value={selectedLocations}
        onValueChange={setSelectedLocations}
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
