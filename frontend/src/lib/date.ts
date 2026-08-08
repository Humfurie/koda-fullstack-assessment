/** Normalizes any ISO date/datetime string from the API into YYYY-MM-DD for <input type="date"> and submission. */
export function toDateInputValue(iso: string) {
  return iso.slice(0, 10);
}

export function formatDisplayDate(
  iso: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" },
) {
  return new Date(toDateInputValue(iso) + "T00:00:00").toLocaleDateString("en-US", options);
}
