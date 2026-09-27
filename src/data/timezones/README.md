# Timezone boundaries dataset

`timezones-110m.json` is a heavily simplified TopoJSON derived from [timezone-boundary-builder](https://github.com/evansiroky/timezone-boundary-builder), vendored so the map can highlight which regions fall inside a selected UTC-offset range without any network access at build or run time.

- **Source release:** `timezones-with-oceans-1970.geojson.zip`, tag `2026c`
  (the "1970" variant merges zones that have agreed on timekeeping since 1970, per [zone1970.tab](https://data.iana.org/time-zones/tz-link.html) — fewer, simpler polygons than the full "now" dataset, similar in spirit to how `world-atlas`'s `land-110m.json` is a simplified view rather than full-resolution coastlines)
- **License:** the underlying boundary data is licensed under the [Open Data Commons Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/) (derived from OpenStreetMap); the extraction code is MIT. Attribution: © OpenStreetMap contributors, via timezone-boundary-builder.
- **Processing:** simplified with [mapshaper](https://github.com/mbloch/mapshaper) (`-simplify 3% keep-shapes -clean`, topojson quantization `1e5`) to a fidelity comparable to the existing `world-atlas` 110m data, reducing the ~152MB source GeoJSON to under 1MB. Each feature keeps its original `tzid` property (e.g. `"Europe/Paris"`) plus a baked-in `utcOffsetHours` (a plain number, e.g. `1`), computed once via `Intl.DateTimeFormat(tzid, { timeZoneName: "longOffset" })` at a fixed reference instant (2026-01-15T12:00:00Z).

`utcOffsetHours` is only used for the map's visual bucketing (which regions light up for a selected range) — it is **not** used to filter actual conferences. Per-conference filtering uses each edition's own IANA timezone and real date (`src/lib/timezone-offset.ts`), so it stays correct across DST regardless of this dataset's fixed reference date.

## Updating the dataset

timezone-boundary-builder cuts a new release whenever the IANA tzdata database changes (a few times a year). To refresh:

1. Download the latest `timezones-with-oceans-1970.geojson.zip` from the [releases page](https://github.com/evansiroky/timezone-boundary-builder/releases).
2. Simplify: `npx mapshaper -i combined-with-oceans-1970.json -simplify 3% keep-shapes -clean -o format=topojson quantization=1e5 out.json`.
3. Re-run the offset-baking step (compute `utcOffsetHours` per feature from its `tzid` via `Intl.DateTimeFormat`, same as above) and overwrite `timezones-110m.json`.
4. Update the source release tag above.
