# World Cities dataset

`worldcities.csv` is the [SimpleMaps World Cities Database (Basic)](https://simplemaps.com/data/world-cities), vendored in this repo so that conference locations can be geocoded (latitude/longitude) at build time without any network access or API keys. Contributors adding conferences via GitHub only need to provide a city and country — coordinates and timezone are derived automatically when the Astro collection is generated (see `src/lib/world-cities.mjs`).

- **Version:** 1.91.1 (released June 23, 2026)
- **License:** [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/) — redistribution is allowed with attribution (see `license.pdf`, shipped with the download)
- **Attribution:** city data by [SimpleMaps.com](https://simplemaps.com/data/world-cities)

Note: the free Basic tier does **not** include a timezone column (that is Pro/Comprehensive only). Timezones are instead derived from the coordinates using [`@photostructure/tz-lookup`](https://github.com/photostructure/tz-lookup).

## Updating the dataset

SimpleMaps has no update feed or newsletter; new versions are announced on their [database releases page](https://simplemaps.com/data/releases) (roughly 1–2 releases per year). To update:

1. Check the releases page for a newer World Cities version.
2. Download the free Basic database from <https://simplemaps.com/data/world-cities> (the download is behind bot protection, so it must be done in a browser).
3. Replace `worldcities.csv` (and `license.pdf` if it changed) in this directory. The `.xlsx` from the zip is not needed.
4. Update the version number above.
5. Run `pnpm conferences:validate` — it warns about conference locations that no longer resolve. Fix misses by adding aliases in `src/lib/world-cities.mjs` if a city was renamed.
