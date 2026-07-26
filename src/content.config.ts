import { z } from "astro/zod"
import { defineCollection } from "astro:content"
import { conferencesLoader } from "./loaders/conferences"

const conferences = defineCollection({
  loader: conferencesLoader(),
  schema: z.object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    brand: z.string().min(1),
    name: z.string().min(1),
    url: z.url(),
    subjects: z.array(z.string().min(1)).min(1).max(10),
    editions: z
      .array(
        z.object({
          startDate: z.iso.date(),
          endDate: z.iso.date(),
          location: z
            .object({
              city: z.string().min(1).optional(),
              country: z.string().min(1).optional(),
              // Derived at load time from city/country via the vendored
              // world-cities dataset; not present in the JSON source files.
              latitude: z.number().min(-90).max(90).optional(),
              longitude: z.number().min(-180).max(180).optional(),
              timezone: z.string().min(1).optional(),
            })
            .refine((loc) => Boolean(loc.city || loc.country), {
              message: "location requires city and/or country",
            })
            .optional(),
          isOnline: z.boolean().default(false),
        }),
      )
      .default([]),
    orgType: z.enum(["for-profit", "non-profit"]).optional(),
  }),
})

export const collections = { conferences }
