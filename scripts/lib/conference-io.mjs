import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { formatConference, slugify, validateInstances } from "./brand-instances.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const conferencesDir = path.join(__dirname, "../../src/content/conferences")

function isBrandFile(data) {
  return Array.isArray(data?.instances)
}

function isFlatInstanceFile(data) {
  return data?.id && data?.name && data?.url && !data.instances
}

/**
 * Flatten brand-grouped files into instance rows (with brand on each).
 */
export function readBrandDir(dir = conferencesDir) {
  if (!fs.existsSync(dir)) return []

  const instances = []
  for (const file of fs.readdirSync(dir).sort()) {
    if (!file.endsWith(".json")) continue
    const filePath = path.join(dir, file)
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"))

    if (isBrandFile(data)) {
      const brand = data.brand
      if (!brand) throw new Error(`missing brand in ${file}`)
      const orgType = data.orgType
      for (const inst of data.instances) {
        const row = {
          id: inst.id,
          brand,
          name: inst.name,
          url: inst.url,
          subjects: inst.subjects ?? [],
          editions: inst.editions ?? [],
        }
        if (inst.location) row.location = inst.location
        if (inst.isOnline === true) row.isOnline = true
        if (orgType) row.orgType = orgType
        instances.push(row)
      }
      continue
    }

    if (isFlatInstanceFile(data)) {
      const id = file.slice(0, -".json".length)
      if (data.id && data.id !== id) {
        throw new Error(`id/filename mismatch: ${file} has id "${data.id}"`)
      }
      instances.push({ ...data, id: data.id || id })
      continue
    }

    throw new Error(`unrecognized conference file format: ${file}`)
  }

  return instances
}

/** @deprecated use readBrandDir */
export function readConferenceDir(dir = conferencesDir) {
  return readBrandDir(dir)
}

export function groupInstancesByBrand(instances) {
  const groups = new Map()
  for (const inst of instances) {
    const list = groups.get(inst.brand) ?? []
    list.push(formatConference(inst))
    groups.set(inst.brand, list)
  }
  return new Map(
    [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, "en")),
  )
}

function brandFileSlug(brand) {
  const slug = slugify(brand)
  if (!slug) throw new Error(`cannot slugify brand: ${brand}`)
  return slug
}

/**
 * Write instances as one JSON file per brand. Removes stale brand files.
 */
export function writeBrandDir(instances, dir = conferencesDir) {
  const formatted = instances.map(formatConference)
  const errors = validateInstances(formatted)
  if (errors.length) {
    throw new Error(`Validation failed:\n${errors.map((e) => `  - ${e}`).join("\n")}`)
  }

  const grouped = groupInstancesByBrand(formatted)
  const slugToBrand = new Map()

  for (const [brand] of grouped) {
    const slug = brandFileSlug(brand)
    if (slugToBrand.has(slug) && slugToBrand.get(slug) !== brand) {
      throw new Error(`brand slug collision: "${brand}" and "${slugToBrand.get(slug)}" → ${slug}`)
    }
    slugToBrand.set(slug, brand)
  }

  fs.mkdirSync(dir, { recursive: true })

  const nextFiles = new Set([...grouped.keys()].map((brand) => `${brandFileSlug(brand)}.json`))
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".json")) continue
    if (!nextFiles.has(file)) {
      fs.unlinkSync(path.join(dir, file))
    }
  }

  for (const [brand, brandInstances] of grouped) {
    const slug = brandFileSlug(brand)
    brandInstances.sort((a, b) => a.name.localeCompare(b.name, "en"))
    const orgType = brandInstances.find((i) => i.orgType)?.orgType
    const payload = {
      brand,
      ...(orgType ? { orgType } : {}),
      instances: brandInstances.map(
        ({ id, name, url, subjects, editions, location, isOnline }) => {
          const row = { id, name, url, subjects }
          if (editions?.length) row.editions = editions
          if (location) row.location = location
          if (isOnline === true) row.isOnline = true
          return row
        },
      ),
    }
    fs.writeFileSync(path.join(dir, `${slug}.json`), JSON.stringify(payload, null, 2) + "\n")
  }

  return formatted
}

/** @deprecated use writeBrandDir */
export function writeConferenceDir(instances, dir = conferencesDir) {
  return writeBrandDir(instances, dir)
}

export function validateBrandDir(dir = conferencesDir) {
  const instances = readBrandDir(dir)
  const errors = validateInstances(instances)

  if (!fs.existsSync(dir)) return errors

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".json")) continue
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"))
    if (!isBrandFile(data)) {
      errors.push(`expected brand-grouped file: ${file}`)
      continue
    }
    const slug = file.slice(0, -".json".length)
    if (brandFileSlug(data.brand) !== slug) {
      errors.push(`filename/brand mismatch: ${file} is brand "${data.brand}"`)
    }
    if (
      data.orgType !== undefined &&
      data.orgType !== "for-profit" &&
      data.orgType !== "non-profit"
    ) {
      errors.push(`bad orgType in ${file}: ${data.orgType}`)
    }
  }

  return errors
}
