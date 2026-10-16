/** Formats an amount as Nigerian naira, e.g. `₦45,000`. */
export function formatNaira(value?: number | null): string {
  const amount = Number.isFinite(value ?? NaN) ? (value ?? 0) : 0;
  return `₦${new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}
