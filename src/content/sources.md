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
  "brand": "React Summit",
  "orgType": "for-profit",
  "instances": [
    {
      "id": "react-summit",
      "name": "React Summit",
      "url": "https://reactsummit.com",
      "subjects": ["react", "javascript", "frontend"],
      "editions": [
        {
          "startDate": "2026-06-12",
          "endDate": "2026-06-16",
          "location": { "city": "Amsterdam", "country": "Netherlands" },
          "isOnline": true
        }
      ]
    }
  ]
}
```

| Field | Description |
| ----- | ----------- |
| `brand` | Shared label for all instances in the file (filename is a slug of this) |
| `orgType` | Optional brand-level organizer type: `"for-profit"` or `"non-profit"` |
| `instances[].id` | Stable kebab-case slug, unique across the collection |
| `instances[].name` | Display name for this instance |
| `instances[].url` | Instance-specific homepage |
| `instances[].subjects` | Topic tags (1–10) |
| `instances[].editions[]` | Dated editions for this instance |
| `editions[].startDate` / `endDate` | ISO dates (`YYYY-MM-DD`) |
| `editions[].location` | Optional `{ city, country }` — omit for online-only |
| `editions[].isOnline` | `true` for online or hybrid (hybrid also has `location`) |

The Astro loader ([`src/loaders/conferences.ts`](../loaders/conferences.ts)) flattens each brand file into one collection entry per instance.

## Contributing via pull request

| Change type | What to edit |
| ----------- | ------------ |
| Add one conference | Add an instance to the brand file, or create a new `{brand-slug}.json` |
| Fix name, url, or subjects | Edit the instance inside the brand file |
| Add/update dates or location | Edit `editions` on that instance |

Validation: `pnpm conferences:validate` and `pnpm build`.

## Notes

- Subject tags were derived from confs.tech topic files and enriched for well-known brands; coverage is uneven by design.
