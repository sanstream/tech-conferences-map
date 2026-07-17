import { z } from "astro/zod"
import { defineCollection } from "astro:content"
import { conferencesLoader } from "./loaders/conferences"

const editionSchema = z.object({
  startDate: z.iso.date(),
  endDate: z.iso.date(),
})

const locationSchema = z
  .object({
    city: z.string().min(1).optional(),
    country: z.string().min(1).optional(),
  })
  .refine(loc => Boolean(loc.city || loc.country), {
    message: "location requires city and/or country",
  })

const conferences = defineCollection({
  loader: conferencesLoader(),
  schema: z.object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    brand: z.string().min(1),
    name: z.string().min(1),
    url: z.url(),
    subjects: z.array(z.string().min(1)).min(1).max(10),
    editions: z.array(editionSchema).default([]),
    location: locationSchema.optional(),
    isOnline: z.boolean().default(false),
    orgType: z.enum(["for-profit", "non-profit"]).optional(),
  }),
})

export const collections = { conferences }
