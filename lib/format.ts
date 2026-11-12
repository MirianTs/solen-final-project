const dateFormatter = new Intl.DateTimeFormat("ka-GE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Tbilisi",
});

/** ISO timestamp -> Georgian long date in Tbilisi time, e.g. for review cards. Call on the server. */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

/** 4.8 -> "4.8"; 5 -> "5.0" */
export function formatRating(value: number): string {
  return value.toFixed(1);
}
