/**
 * Derive a representative IANA timezone for an online conference from its
 * daily schedule: take the midpoint of the schedule (converted to UTC) and
 * find the timezone whose local midday coincides with it on the edition's
 * dates. This approximates the centre of the audience the schedule targets.
 *
 * Runs directly with `node` (>=22.18) via native TypeScript type stripping.
 */

/** UTC offset of `timezone` in minutes on the given date (12:00 UTC probe). */
export function offsetMinutesAt(timezone: string, isoDate: string): number {
  const probe = new Date(`${isoDate}T12:00:00Z`)
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
  const parts = Object.fromEntries(
    dtf.formatToParts(probe).map((p) => [p.type, p.value]),
  )
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
  )
  return Math.round((asUtc - probe.getTime()) / 60000)
}

function parseTime(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

/**
 * Resolve the published-times timezone (IANA name or "UTC+X"/"UTC-X:YY"
 * style offset) to an offset in minutes on the given date.
 */
export function resolvePublishedOffset(
  timesTimezone: string,
  isoDate: string,
): number {
  const offsetMatch = timesTimezone.match(/^(?:UTC|GMT)\s*([+-])\s*(\d{1,2})(?::(\d{2}))?$/i)
  if (offsetMatch) {
    const sign = offsetMatch[1] === "-" ? -1 : 1
    return sign * (Number(offsetMatch[2]) * 60 + Number(offsetMatch[3] ?? 0))
  }
  if (/^(UTC|GMT)$/i.test(timesTimezone)) return 0
  return offsetMinutesAt(timesTimezone, isoDate)
}

/**
 * Preferred representative zones per region, tried in order. The first
 * zone whose offset on the edition date matches the target offset wins.
 */
const PREFERRED_ZONES = [
  "Pacific/Auckland",
  "Australia/Sydney",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Bangkok",
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Karachi",
  "Asia/Dubai",
  "Europe/Moscow",
  "Europe/Athens",
  "Europe/Berlin",
  "Europe/London",
  "UTC",
  "Atlantic/Azores",
  "America/Sao_Paulo",
  "America/Halifax",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
]

/**
 * Compute the timezone whose local midday matches the midpoint of the
 * daily schedule.
 *
 * @param dailyStart  "HH:MM" first-session start, in the published timezone
 * @param dailyEnd    "HH:MM" last-session end, in the published timezone
 * @param timesTimezone  timezone the published times are stated in
 * @param isoDate     edition start date, for DST-correct offsets
 */
export function middayTimezone(
  dailyStart: string,
  dailyEnd: string,
  timesTimezone: string,
  isoDate: string,
): { timezone: string; targetOffsetMinutes: number; midpointUtcMinutes: number } {
  const start = parseTime(dailyStart)
  let end = parseTime(dailyEnd)
  if (end < start) end += 24 * 60 // schedule crosses midnight

  const midLocal = (start + end) / 2
  const publishedOffset = resolvePublishedOffset(timesTimezone, isoDate)
  const midUtc = midLocal - publishedOffset

  // Offset that puts local noon at the UTC midpoint, rounded to :30.
  let target = 720 - midUtc
  target = Math.round(target / 30) * 30
  // Normalize into the real-world offset range [-12:00, +14:00].
  while (target > 14 * 60) target -= 24 * 60
  while (target < -12 * 60) target += 24 * 60

  const candidates = [target, Math.round(target / 60) * 60]
  for (const offset of candidates) {
    for (const zone of PREFERRED_ZONES) {
      if (offsetMinutesAt(zone, isoDate) === offset) {
        return { timezone: zone, targetOffsetMinutes: offset, midpointUtcMinutes: midUtc }
      }
    }
    for (const zone of Intl.supportedValuesOf("timeZone")) {
      if (offsetMinutesAt(zone, isoDate) === offset) {
        return { timezone: zone, targetOffsetMinutes: offset, midpointUtcMinutes: midUtc }
      }
    }
  }
  throw new Error(
    `no timezone found for offset ${target} (midpoint ${dailyStart}-${dailyEnd} ${timesTimezone})`,
  )
}
