import type { Loader } from "astro/loaders"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  lookupLocation,
  type ConferenceLocation,
  type GeoInfo,
} from "../lib/world-cities.ts"

const conferencesDir = fileURLToPath(
  new URL("../content/conferences", import.meta.url),
)

type Location = ConferenceLocation & Partial<GeoInfo>

type Edition = {
  startDate: string
  endDate: string
  location?: Location
  isOnline?: boolean
}

type OrgType = "for-profit" | "non-profit"

type BrandFile = {
  brand: string
  orgType?: OrgType
  instances: Array<{
    id: string
    name: string
    url: string
    subjects: string[]
    editions?: Edition[]
  }>
}

/**
 * Adds latitude/longitude/timezone (derived from the location's
 * city/country, see src/lib/world-cities.ts) to the generated
 * edition objects. The JSON source files stay geo-free on purpose:
 * contributors only provide city and country.
 */
function enrichLocation(
  location: Location,
  warn: (message: string) => void,
): Location {
  const geo = lookupLocation(location)
  if (!geo) {
    if (location.city) {
      warn(
        `Could not resolve coordinates for "${location.city}, ${location.country ?? "?"}"`,
      )
    }
    return location
  }
  return { ...location, ...geo }
}

export function conferencesLoader(): Loader {
  return {
    name: "conferences-loader",
    load: async ({ store, parseData, logger }) => {
      if (!fs.existsSync(conferencesDir)) {
        logger.warn("Conferences directory not found")
        return
      }

      const files = fs
        .readdirSync(conferencesDir)
        .filter((f: string) => f.endsWith(".json"))

      const warned = new Set<string>()
      const warnOnce = (message: string) => {
        if (warned.has(message)) return
        warned.add(message)
        logger.warn(message)
      }

      for (const file of files) {
        const raw = JSON.parse(
          fs.readFileSync(path.join(conferencesDir, file), "utf8"),
        ) as BrandFile

        if (!raw.brand || !Array.isArray(raw.instances)) {
          logger.warn(`Skipping invalid brand file: ${file}`)
          continue
        }

        for (const instance of raw.instances) {
          const data = await parseData({
            id: instance.id,
            data: {
              id: instance.id,
              brand: raw.brand,
              name: instance.name,
              url: instance.url,
              subjects: instance.subjects,
              editions: (instance.editions ?? []).map((ed) => ({
                startDate: ed.startDate,
                endDate: ed.endDate,
                ...(ed.location
                  ? { location: enrichLocation(ed.location, warnOnce) }
                  : {}),
                isOnline: ed.isOnline === true,
              })),
              ...(raw.orgType ? { orgType: raw.orgType } : {}),
            },
          })

          store.set({
            id: instance.id,
            data,
          })
        }
      }
    },
  }
}
