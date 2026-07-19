import type { ComponentProps } from "react"

export type ColorSchemeSwitchProps = ComponentProps<"div">

const ColorSchemeSwitch = (props: ColorSchemeSwitchProps) => {
  const setColorScheme = (colorScheme: "light" | "dark") => {
    const htmlElement = document.getElementsByTagName("html")[0]
    const currentColorScheme = htmlElement.getAttribute("data-color-scheme")
    if (currentColorScheme === colorScheme) {
      htmlElement.setAttribute("data-color-scheme", "")
    } else {
      htmlElement.setAttribute("data-color-scheme", colorScheme)
    }
  }

  return (
    <div {...props}>
      <button onClick={() => setColorScheme("light")} aria-label="Light mode">
        ☀️
      </button>
      <button onClick={() => setColorScheme("dark")} aria-label="Dark mode">
        🌙
      </button>
    </div>
  )
}

export default ColorSchemeSwitch
