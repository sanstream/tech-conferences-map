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

export type FilterBySubjectsProps = ComponentProps<"div"> & {
  subjects: string[]
}

const FilterbySubjects = ({ className, subjects }: FilterBySubjectsProps) => {
  const [selectedSubjects, setSelectedSubjects] = useQueryState(
    "subjects",
    searchParamsParsers.subjects,
  )
  const anchor = useComboboxAnchor()
  return (
    <div className={clsx("filter-option-layout", className)}>
      <label htmlFor="subjects">Subjects</label>
      <Combobox
        id="subjects"
        items={subjects}
        multiple
        value={selectedSubjects}
        onValueChange={value => {
          void setSelectedSubjects(value)
        }}
      >
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(selected: string[]) =>
              selected.map(item => (
                <ComboboxChip className="tmap-badge-subject-colour" key={item}>
                  {item}
                </ComboboxChip>
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
      </Combobox>
    </div>
  )
}

export default FilterbySubjects
