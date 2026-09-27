/**
 * Resolves a conference edition's UTC offset (in hours, e.g. 5.5 for
 * "Asia/Kolkata") from its IANA timezone and date, so it can be compared
 * against a selected UTC-offset range. Uses `Intl.DateTimeFormat` directly —
 * no timezone library needed — and takes the edition's own date so the
 * result is correct across DST, unlike the fixed reference offset baked
 * into the map overlay dataset (see src/lib/timezone-overlay.ts).
 */
export function getUtcOffsetHours(
  timeZone: string,
  date: string | Date,
): number | null {
  let offsetPart: string | undefined
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    }).formatToParts(new Date(date))
    offsetPart = parts.find(part => part.type === "timeZoneName")?.value
  } catch {
    return null
  }

  if (offsetPart === "GMT") return 0
  const match = offsetPart && /^GMT([+-])(\d{1,2}):(\d{2})$/.exec(offsetPart)
  if (!match) return null

  const [, sign, hours, minutes] = match
  const magnitude = Number(hours) + Number(minutes) / 60
  return sign === "-" ? -magnitude : magnitude
}
