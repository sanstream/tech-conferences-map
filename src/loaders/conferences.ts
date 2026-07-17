import type { Loader } from "astro/loaders"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const conferencesDir = fileURLToPath(
  new URL("../content/conferences", import.meta.url),
)

type Edition = {
  startDate: string
  endDate: string
}

type Location = {
  city?: string
  country?: string
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
    location?: Location
    isOnline?: boolean
  }>
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
              editions: instance.editions ?? [],
              ...(instance.location ? { location: instance.location } : {}),
              isOnline: instance.isOnline === true,
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
