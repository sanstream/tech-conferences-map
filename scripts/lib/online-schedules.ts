/**
 * Published daily schedule windows for online-only conference editions
 * (no physical location). Used by scripts/apply-online-timezones.ts to
 * derive a representative IANA timezone via midday matching.
 *
 * dailyStart/dailyEnd are in timesTimezone. confidence reflects how
 * directly the hours were sourced for that edition.
 */
export type ScheduleFinding = {
  id: string
  editionStartDate: string
  dailyStart: string
  dailyEnd: string
  timesTimezone: string
  confidence: "high" | "medium" | "low"
  notes: string
}

export const ONLINE_SCHEDULES: ScheduleFinding[] = [
  // axe-con — Deque virtual a11y conf, Eastern US daytime
  {
    id: "axe-con",
    editionStartDate: "2024-02-20",
    dailyStart: "09:00",
    dailyEnd: "16:00",
    timesTimezone: "America/New_York",
    confidence: "medium",
    notes: "Same ET daytime pattern as 2026 agenda (9am–3pm talks, social ~4pm).",
  },
  {
    id: "axe-con",
    editionStartDate: "2025-02-25",
    dailyStart: "09:00",
    dailyEnd: "16:00",
    timesTimezone: "America/New_York",
    confidence: "medium",
    notes: "Same ET daytime pattern as 2026 agenda.",
  },
  {
    id: "axe-con",
    editionStartDate: "2026-02-24",
    dailyStart: "09:00",
    dailyEnd: "16:00",
    timesTimezone: "America/New_York",
    confidence: "high",
    notes: "deque.com/axe-con/schedule: keynotes 9am ET, last talks 3pm, social 4pm.",
  },

  // Azure Cosmos DB Conf — Microsoft Reactor, Pacific morning
  {
    id: "azure-cosmos-db-conf",
    editionStartDate: "2024-04-16",
    dailyStart: "09:00",
    dailyEnd: "12:00",
    timesTimezone: "America/Los_Angeles",
    confidence: "medium",
    notes: "Same 3-hour PT live-show format as 2025.",
  },
  {
    id: "azure-cosmos-db-conf",
    editionStartDate: "2025-04-15",
    dailyStart: "09:00",
    dailyEnd: "12:00",
    timesTimezone: "America/Los_Angeles",
    confidence: "high",
    notes: "devblogs.microsoft.com: 9 AM – 12 PM PT livestream.",
  },
  {
    id: "azure-cosmos-db-conf",
    editionStartDate: "2026-04-28",
    dailyStart: "09:00",
    dailyEnd: "12:00",
    timesTimezone: "America/Los_Angeles",
    confidence: "medium",
    notes: "Same PT morning live-show pattern as prior years.",
  },

  // betterCode ArchDoc — German heise/dpunkt online day
  {
    id: "bettercode-archdoc",
    editionStartDate: "2024-09-30",
    dailyStart: "09:00",
    dailyEnd: "16:30",
    timesTimezone: "Europe/Berlin",
    confidence: "medium",
    notes: "Same German daytime programme shape as 2026 edition.",
  },
  {
    id: "bettercode-archdoc",
    editionStartDate: "2025-05-12",
    dailyStart: "09:00",
    dailyEnd: "16:30",
    timesTimezone: "Europe/Berlin",
    confidence: "medium",
    notes: "Same German daytime programme shape as 2026 edition.",
  },
  {
    id: "bettercode-archdoc",
    editionStartDate: "2026-05-20",
    dailyStart: "09:00",
    dailyEnd: "16:30",
    timesTimezone: "Europe/Berlin",
    confidence: "high",
    notes: "archdoc.bettercode.eu: 09:00 Begrüßung – 16:30 Verabschiedung.",
  },

  // !!Con 2021 — Pacific Daylight Time programme
  {
    id: "con",
    editionStartDate: "2021-05-15",
    dailyStart: "12:00",
    dailyEnd: "15:45",
    timesTimezone: "America/Los_Angeles",
    confidence: "high",
    notes: "bangbangcon.com/2021/program.html opening day: 12:00–15:00 sessions PDT.",
  },

  // Code & Coffee / Virtual Coffee Conf
  {
    id: "code-coffee-a-virtual-coffee-conference",
    editionStartDate: "2025-04-25",
    dailyStart: "11:00",
    dailyEnd: "16:45",
    timesTimezone: "America/New_York",
    confidence: "high",
    notes: "cfe.dev: starts 11am ET; closing Frontend Friday Feud ~4:45pm ET.",
  },

  // CypressConf 2024
  {
    id: "cypressconf",
    editionStartDate: "2024-10-22",
    dailyStart: "14:00",
    dailyEnd: "22:15",
    timesTimezone: "Europe/London",
    confidence: "high",
    notes: "Ministry of Testing listing: 14:00–22:15 BST.",
  },

  // Eleventy symposium
  {
    id: "eleventy-international-symposium",
    editionStartDate: "2024-05-09",
    dailyStart: "15:00",
    dailyEnd: "20:35",
    timesTimezone: "UTC",
    confidence: "high",
    notes: "conf.11ty.dev schedule: Kickoff 15:00 UTC, wrap-up 20:35 UTC.",
  },

  // enterJS day events — German daytime online
  {
    id: "enterjs-accessibility-day",
    editionStartDate: "2024-11-07",
    dailyStart: "09:00",
    dailyEnd: "17:15",
    timesTimezone: "Europe/Berlin",
    confidence: "medium",
    notes: "enterJS online day pattern (09:00–17:15) as confirmed for Integrate AI / Angular.",
  },
  {
    id: "enterjs-advanced-angular-day",
    editionStartDate: "2025-07-01",
    dailyStart: "09:00",
    dailyEnd: "17:15",
    timesTimezone: "Europe/Berlin",
    confidence: "high",
    notes: "Archived enterJS Advanced Angular Day programme 09:00–17:15 CEST.",
  },
  {
    id: "enterjs-integrate-ai",
    editionStartDate: "2026-04-28",
    dailyStart: "09:00",
    dailyEnd: "17:15",
    timesTimezone: "Europe/Berlin",
    confidence: "high",
    notes: "enterjs.de/ai.php: 09:00 Begrüßung – 16:45–17:15 Abschlussdiskussion.",
  },
  {
    id: "enterjs-react-19-day",
    editionStartDate: "2024-10-17",
    dailyStart: "09:00",
    dailyEnd: "17:15",
    timesTimezone: "Europe/Berlin",
    confidence: "medium",
    notes: "enterJS online day pattern matching other enterJS day events.",
  },
  {
    id: "enterjs-web-security-day",
    editionStartDate: "2025-10-09",
    dailyStart: "09:00",
    dailyEnd: "16:45",
    timesTimezone: "Europe/Berlin",
    confidence: "high",
    notes: "Archived enterJS Web Security Day: 09:00 start, farewell 16:45.",
  },

  // Frontend Nation — BitterBrains free remote (same family as Vue.js Nation)
  {
    id: "frontend-nation",
    editionStartDate: "2024-06-04",
    dailyStart: "14:00",
    dailyEnd: "18:00",
    timesTimezone: "UTC",
    confidence: "medium",
    notes: "Same UTC afternoon window as Vue.js Nation 2025 schedule.",
  },
  {
    id: "frontend-nation",
    editionStartDate: "2025-06-03",
    dailyStart: "14:00",
    dailyEnd: "18:00",
    timesTimezone: "UTC",
    confidence: "medium",
    notes: "Same UTC afternoon window as Vue.js Nation 2025 schedule.",
  },

  // JetBrains JavaScript Day
  {
    id: "jetbrains-javascript-day",
    editionStartDate: "2024-10-24",
    dailyStart: "09:00",
    dailyEnd: "13:00",
    timesTimezone: "America/New_York",
    confidence: "high",
    notes: "JetBrains blog: 9:00 am EDT; greymatter lists 14:00–18:00 GMT (= 09:00–13:00 EDT).",
  },

  // Micro Frontends Conference
  {
    id: "micro-frontends-conference",
    editionStartDate: "2024-06-17",
    dailyStart: "07:00",
    dailyEnd: "16:20",
    timesTimezone: "Europe/Berlin",
    confidence: "high",
    notes: "conference.microfrontends.cloud/2024/schedule: 07:00–16:20 CEST.",
  },

  // Next.js Conf 2023 online — Vercel PT main stage (excl. happy hour)
  {
    id: "next-js-conf",
    editionStartDate: "2023-10-26",
    dailyStart: "09:00",
    dailyEnd: "16:30",
    timesTimezone: "America/Los_Angeles",
    confidence: "medium",
    notes: "Vercel Next.js Conf main-stage pattern ~9:00–16:30 PT (excl. happy hour).",
  },

  // Node Congress — GitNation remote afternoon CET/CEST
  {
    id: "node-congress",
    editionStartDate: "2024-04-04",
    dailyStart: "16:00",
    dailyEnd: "21:00",
    timesTimezone: "Europe/Berlin",
    confidence: "high",
    notes: "GitNation schedule: opening 14:00 UTC / 16:00 CEST, close ~19:00 UTC / 21:00 CEST.",
  },
  {
    id: "node-congress",
    editionStartDate: "2025-04-17",
    dailyStart: "16:00",
    dailyEnd: "20:30",
    timesTimezone: "Europe/Berlin",
    confidence: "high",
    notes: "GitNation schedule: opening 14:00Z / 16:00 CEST, close ~18:15Z / 20:15 CEST.",
  },
  {
    id: "node-congress",
    editionStartDate: "2026-03-26",
    dailyStart: "16:00",
    dailyEnd: "20:20",
    timesTimezone: "Europe/Berlin",
    confidence: "high",
    notes: "GitNation schedule: opening 15:00Z / 16:00 CET, close ~19:20Z / 20:20 CET.",
  },

  // Other GitNation remotes — same afternoon CET/CEST window as Node Congress
  {
    id: "devops-js-conference",
    editionStartDate: "2024-02-15",
    dailyStart: "16:00",
    dailyEnd: "21:00",
    timesTimezone: "Europe/Berlin",
    confidence: "low",
    notes: "GitNation remote default afternoon CET window (as Node Congress).",
  },
  {
    id: "typescript-congress",
    editionStartDate: "2023-09-21",
    dailyStart: "16:00",
    dailyEnd: "21:00",
    timesTimezone: "Europe/Berlin",
    confidence: "low",
    notes: "GitNation remote default afternoon CEST window (as Node Congress).",
  },
  {
    id: "vue-js-live",
    editionStartDate: "2024-04-25",
    dailyStart: "16:00",
    dailyEnd: "21:00",
    timesTimezone: "Europe/Berlin",
    confidence: "low",
    notes: "GitNation remote default afternoon CEST window (as Node Congress).",
  },
  {
    id: "react-and-chill",
    editionStartDate: "2024-06-27",
    dailyStart: "16:00",
    dailyEnd: "21:00",
    timesTimezone: "Europe/Berlin",
    confidence: "low",
    notes: "GitNation remote default afternoon CEST window (as Node Congress).",
  },
  {
    id: "techlead-conf-amsterdam",
    editionStartDate: "2024-06-15",
    dailyStart: "16:00",
    dailyEnd: "21:00",
    timesTimezone: "Europe/Berlin",
    confidence: "low",
    notes: "GitNation remote track default afternoon CEST ( Tito lists multi-day 10am–9pm window).",
  },
  {
    id: "techlead-conf-amsterdam",
    editionStartDate: "2025-09-18",
    dailyStart: "16:00",
    dailyEnd: "21:00",
    timesTimezone: "Europe/Berlin",
    confidence: "low",
    notes: "GitNation remote track default afternoon CEST.",
  },

  // PlatformCon — EMEA kickoff through Americas wrap
  {
    id: "platform-con",
    editionStartDate: "2024-06-10",
    dailyStart: "10:00",
    dailyEnd: "19:00",
    timesTimezone: "Europe/Berlin",
    confidence: "high",
    notes: "2024.platformcon.com: talk days 10:00 AM–07:00 PM CEST (EMEA + Americas kickoffs).",
  },

  // Savvy UX Summit — Asia-evening start; assume ~5h keynote day
  {
    id: "savvy-ux-summit",
    editionStartDate: "2024-11-07",
    dailyStart: "13:00",
    dailyEnd: "18:00",
    timesTimezone: "Asia/Tokyo",
    confidence: "medium",
    notes: "savvyuxsummit.com: starts 1 PM JST; end estimated ~18:00 for keynote day.",
  },

  // Software Architecture Conference (C# Corner) — Eastern US
  {
    id: "software-architecture-conference",
    editionStartDate: "2024-07-16",
    dailyStart: "09:00",
    dailyEnd: "15:00",
    timesTimezone: "America/New_York",
    confidence: "medium",
    notes: "softwarearchitecture.live uses Eastern Time; ~09:00–15:00 day pattern.",
  },
  {
    id: "software-architecture-conference",
    editionStartDate: "2024-08-18",
    dailyStart: "09:00",
    dailyEnd: "15:00",
    timesTimezone: "America/New_York",
    confidence: "medium",
    notes: "softwarearchitecture.live Eastern Time day pattern.",
  },
  {
    id: "software-architecture-conference",
    editionStartDate: "2025-08-05",
    dailyStart: "08:50",
    dailyEnd: "15:35",
    timesTimezone: "America/New_York",
    confidence: "high",
    notes: "softwarearchitecture.live 2025 schedule in Eastern Time, ~08:50–15:35.",
  },

  // Vue.js Nation
  {
    id: "vue-js-nation",
    editionStartDate: "2025-01-29",
    dailyStart: "14:00",
    dailyEnd: "18:00",
    timesTimezone: "UTC",
    confidence: "high",
    notes: "vuejsnation.com/2025 schedule: 14:00–18:00 UTC.",
  },

  // XtremeJS — GMT worldwide day
  {
    id: "xtremejs-online-conference",
    editionStartDate: "2024-11-12",
    dailyStart: "07:00",
    dailyEnd: "16:35",
    timesTimezone: "UTC",
    confidence: "high",
    notes: "xtremejs.dev/2024/schedule: 07:00 GMT welcome – 16:25/16:35 closure.",
  },
  {
    id: "xtremejs-online-conference",
    editionStartDate: "2025-11-11",
    dailyStart: "07:00",
    dailyEnd: "16:35",
    timesTimezone: "UTC",
    confidence: "high",
    notes: "xtremejs.dev/2025/schedule: same GMT timetable as 2024.",
  },
  {
    id: "xtremejs-online-conference",
    editionStartDate: "2026-05-19",
    dailyStart: "07:00",
    dailyEnd: "16:35",
    timesTimezone: "UTC",
    confidence: "medium",
    notes: "XtremeJS GMT day pattern carried forward.",
  },
  {
    id: "xtremejs-online-conference",
    editionStartDate: "2026-11-10",
    dailyStart: "07:00",
    dailyEnd: "16:35",
    timesTimezone: "UTC",
    confidence: "medium",
    notes: "XtremeJS GMT day pattern carried forward.",
  },

  // Svelte Summit Fall 2024
  {
    id: "svelte-summit",
    editionStartDate: "2024-10-19",
    dailyStart: "15:00",
    dailyEnd: "21:00",
    timesTimezone: "Europe/Berlin",
    confidence: "medium",
    notes: "sveltesummit.com: starts 3PM CET, lasts about 5–6 hours.",
  },

  // Nuxt Nation — same BitterBrains/Vue School family as Vue.js Nation
  {
    id: "nuxt-nation",
    editionStartDate: "2024-11-12",
    dailyStart: "14:00",
    dailyEnd: "18:00",
    timesTimezone: "UTC",
    confidence: "medium",
    notes: "Same UTC afternoon window as Vue.js Nation 2025.",
  },

  // ng-conf 2021 virtual
  {
    id: "ng-conf",
    editionStartDate: "2021-04-22",
    dailyStart: "09:00",
    dailyEnd: "17:00",
    timesTimezone: "America/Denver",
    confidence: "high",
    notes: "2021.ng-conf.org sessions: 9am–5pm MST.",
  },

  // Tableau Conference-ish 2020 — Americas broadcast matches startDate
  {
    id: "tableau-conference",
    editionStartDate: "2020-10-06",
    dailyStart: "09:00",
    dailyEnd: "15:00",
    timesTimezone: "America/Los_Angeles",
    confidence: "high",
    notes: "Tableau: Americas 9am–3pm PDT (Europe/APAC had separate regional windows).",
  },

  // FITC Spotlight AI
  {
    id: "fitc-spotlight-ai",
    editionStartDate: "2026-12-01",
    dailyStart: "10:30",
    dailyEnd: "16:00",
    timesTimezone: "America/New_York",
    confidence: "high",
    notes: "fitc.ca/event/slai26: 10:30 A.M. to 4:00 P.M. Eastern.",
  },

  // Chrome Dev Summit 2021 — public keynote + AMA window
  {
    id: "chrome-dev-summit",
    editionStartDate: "2021-11-03",
    dailyStart: "09:00",
    dailyEnd: "11:00",
    timesTimezone: "America/Los_Angeles",
    confidence: "high",
    notes: "9to5Google / Google: public keynote+AMA livestream 9 a.m. PT for two hours.",
  },

  // Open Source Observability Day — daytime programme, US-facing speakers
  {
    id: "open-source-observability-day",
    editionStartDate: "2025-10-23",
    dailyStart: "09:00",
    dailyEnd: "16:10",
    timesTimezone: "America/New_York",
    confidence: "medium",
    notes: "osoday.com/schedule: 9:00am–4:10pm; timezone inferred ET from speaker base.",
  },
  {
    id: "open-source-observability-day",
    editionStartDate: "2026-10-23",
    dailyStart: "09:00",
    dailyEnd: "16:10",
    timesTimezone: "America/New_York",
    confidence: "low",
    notes: "Same daytime pattern as 2025 OSOD schedule.",
  },
]
