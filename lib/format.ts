const dateFormatter = new Intl.DateTimeFormat("ka-GE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Tbilisi",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

/** 4.8 -> "4.8"; 5 -> "5.0" */
export function formatRating(value: number): string {
  return value.toFixed(1);
}
