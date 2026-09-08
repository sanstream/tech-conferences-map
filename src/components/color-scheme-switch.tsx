import { Switch } from "@base-ui/react/switch"
import clsx from "clsx"
import {
  useState,
  type ComponentProps,
  type SVGProps,
} from "react"
import "./color-scheme-switch.css"

export type ColorSchemeSwitchProps = ComponentProps<"label">

function getIsDark(): boolean {
  const scheme = document.documentElement.getAttribute("data-color-scheme")
  if (scheme === "dark") return true
  if (scheme === "light") return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

function setColorScheme(isDark: boolean) {
  document.documentElement.setAttribute(
    "data-color-scheme",
    isDark ? "dark" : "light",
  )
}

function SunIcon(props: SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

function MoonIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

const ColorSchemeSwitch = ({
  className,
  ...props
}: ColorSchemeSwitchProps) => {
  const [isDark, setIsDark] = useState(getIsDark)

  return (
    <label
      className={clsx("tmap-color-scheme-switch", className)}
      data-scheme={isDark ? "dark" : "light"}
      {...props}
    >
      <SunIcon className="tmap-color-scheme-switch-icon tmap-color-scheme-switch-icon--sun" />
      <Switch.Root
        checked={isDark}
        onCheckedChange={(checked) => {
          setIsDark(checked)
          setColorScheme(checked)
        }}
        className="tmap-color-scheme-switch-track"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <Switch.Thumb className="tmap-color-scheme-switch-thumb" />
      </Switch.Root>
      <MoonIcon className="tmap-color-scheme-switch-icon tmap-color-scheme-switch-icon--moon" />
    </label>
  )
}

export default ColorSchemeSwitch
