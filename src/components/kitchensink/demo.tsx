import { Button } from "@/components/button"
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
import { useState } from "react"

const buttonVariants = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const

const buttonSizes = ["default", "xs", "sm", "lg"] as const

const iconSizes = ["icon", "icon-xs", "icon-sm", "icon-lg"] as const

function PlusIcon() {
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
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

export type KitchenSinkDemoProps = {
  subjects: string[]
}

export default function KitchenSinkDemo({ subjects }: KitchenSinkDemoProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const anchor = useComboboxAnchor()

  return (
    <div className="kitchensink">
      <section className="kitchensink-section">
        <h2 className="h3-heading">Buttons</h2>

        <div className="kitchensink-subsection">
          <h3 className="kitchensink-label">Variants × sizes</h3>
          <div className="kitchensink-button-grid">
            {buttonVariants.map((variant) => (
              <div key={variant} className="kitchensink-button-row">
                <span className="kitchensink-row-label">{variant}</span>
                {buttonSizes.map((size) => (
                  <Button key={size} variant={variant} size={size}>
                    {size}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="kitchensink-subsection">
          <h3 className="kitchensink-label">Icon buttons</h3>
          <div className="kitchensink-icon-row">
            {iconSizes.map((size) => (
              <Button key={size} variant="outline" size={size}>
                <PlusIcon />
              </Button>
            ))}
          </div>
        </div>

        <div className="kitchensink-subsection">
          <h3 className="kitchensink-label">Disabled</h3>
          <div className="kitchensink-icon-row">
            {buttonVariants.map((variant) => (
              <Button key={variant} variant={variant} disabled>
                {variant}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="kitchensink-section">
        <h2 className="h3-heading">Combobox (subjects)</h2>
        <p className="kitchensink-description">
          Multi-select combobox with chip pills. Conference subjects are used as
          example data.
        </p>

        <Combobox
          items={subjects}
          multiple
          value={selectedSubjects}
          onValueChange={setSelectedSubjects}
        >
          <ComboboxChips ref={anchor}>
            <ComboboxValue>
              {(selected: string[]) =>
                selected.map((item) => (
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
        </Combobox>

        {selectedSubjects.length > 0 && (
          <p className="kitchensink-selection">
            Selected: {selectedSubjects.join(", ")}
          </p>
        )}
      </section>
    </div>
  )
}
