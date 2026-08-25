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
import "@/components/conference-filters.css"

export type ConferenceFiltersProps = ComponentProps<"div"> & {
  subjects: string[]
}

const ConferenceFilters = ({ className, subjects }: ConferenceFiltersProps) => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const anchor = useComboboxAnchor()
  return (
    <div className={clsx("tmap-conference-filters", className)}>
      <div className="filter-option-layout">
        <label htmlFor="subjects">Subjects</label>
        <Combobox
          id="subjects"
          items={subjects}
          multiple
          value={selectedSubjects}
          onValueChange={setSelectedSubjects}
        >
          <ComboboxChips ref={anchor}>
            <ComboboxValue>
              {(selected: string[]) =>
                selected.map(item => (
                  <ComboboxChip key={item}>{item}</ComboboxChip>
                ))
              }
            </ComboboxValue>
            <ComboboxChipsInput placeholder="Filter by subject…" />
          </ComboboxChips>
          <ComboboxContent anchor={anchor}>
            <ComboboxEmpty>No subjects found.</ComboboxEmpty>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>{" "}
      </div>
    </div>
  )
}

export default ConferenceFilters
