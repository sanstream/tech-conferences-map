# Conference data sources

Conference data lives in [`conferences/`](./conferences/) — **one JSON file per brand**, validated by Astro Content Collections via a custom loader.

## Primary seed

- [confs.tech](https://confs.tech/) — public conference directory
- [tech-conferences/conference-data](https://github.com/tech-conferences/conference-data) — open JSON dataset behind confs.tech
  - Years: 2024, 2025, 2026
  - Topic files: `javascript`, `css`, `typescript`, `ux`, `accessibility`, `performance`, plus filtered rows from `product` and `general`

## Supplement / gap-fill lists and references

- [Front-End Front — CSS, JavaScript and Front-End Conferences](https://frontendfront.com/conferences/)
- [CSS Day](https://cssday.nl/)
- [SmashingConf](https://smashingconf.com/)
- [FITC](https://fitc.ca/)
- [Beyond Tellerrand](https://beyondtellerrand.com/)
- [An Event Apart](https://aneventapart.com/)
- [Information+](https://informationplusconference.com/)
- [OpenVisConf](https://openvisconf.com/)
- [IEEE VIS](https://ieeevis.org/)
- [EuroVis](https://www.eurovis.org/)
- [Data Visualization Society](https://www.datavisualizationsociety.org/)
- [MUTEK](https://mutek.org/)
- [Eyeo Festival](https://eyeofestival.com/)
- [Processing Foundation](https://processingfoundation.org/)
- [Config (Figma)](https://config.figma.com/)
- [UXLx](https://ux-lx.com/)
- [PUSH UX](https://push-conference.com/)

## Data model

Each file in `conferences/{brand-slug}.json` groups all instances of one brand:

```json
{
  "brand": "Data Visualization Society",
  "orgType": "non-profit",
  "instances": [
    {
      "id": "data-visualization-society",
      "name": "Data Visualization Society",
      "url": "https://www.datavisualizationsociety.org",
      "subjects": ["data-visualization", "information-design"]
    }
  ]
}
```

| Field | Description |
| ----- | ----------- |
| `brand` | Shared label for all instances in the file (filename is a slug of this) |
| `orgType` | Optional brand-level organizer type: `"for-profit"` or `"non-profit"` (omit when unknown) |
| `instances[].id` | Stable kebab-case slug, unique across the whole collection |
| `instances[].name` | Display name for this edition |
| `instances[].url` | Instance-specific homepage |
| `instances[].subjects` | Topic tags (1–10) |
| `instances[].editions` | Optional dated editions: `{ startDate, endDate }` as `YYYY-MM-DD` (2026 and 2027 when known) |
| `instances[].location` | Optional `{ city, country }` — omit for online-only events |
| `instances[].isOnline` | `true` for online or hybrid events (hybrid also has `location`) |

The Astro loader ([`src/loaders/conferences.ts`](../loaders/conferences.ts)) flattens each brand file into one collection entry per instance. Singleton brands (e.g. CSS Day) still use one file with a single instance.

[`brand-instances.json`](./brand-instances.json) is used by build scripts to expand collapsed seed rows into multiple instances when importing from confs.tech, and can carry curated `editions` for those franchises.

## Contributing via pull request

| Change type | What to edit |
| ----------- | ------------ |
| Add one conference | Add an instance to the brand file, or create a new `{brand-slug}.json` with one instance |
| Fix name, url, or subjects | Edit the instance inside the brand file |
| Add city editions for a franchise | Edit [`brand-instances.json`](./brand-instances.json), then run `pnpm conferences:apply` |
| Bulk import from confs.tech | Run `node scripts/build-conferences.mjs` (maintainer-only) |

Validation: `pnpm conferences:validate` and `pnpm build`.

## Maintenance

1. **Seed rebuild** — `node scripts/build-conferences.mjs` merges confs.tech seed data and supplements, then writes brand-grouped files.
2. **Instance expansion** — `pnpm conferences:apply` re-processes the collection (idempotent).
3. **Date/location enrichment** — `pnpm conferences:enrich-dates` merges start/end dates, `location`, and `isOnline` from confs.tech seed (2026/2027) and curated fields in `brand-instances.json`.
4. **Legacy flat files** — `pnpm conferences:migrate-brands` converts one-file-per-instance → one-file-per-brand.

## Notes

- Subject tags are derived from confs.tech topic files and enriched for well-known brands; coverage is uneven by design for this first broad pass.
- Alias duplicates (same URL, alternate name) are dropped during instance processing; umbrella-only rows (e.g. `jsconf.com` when regional JSConfs exist) are removed.
