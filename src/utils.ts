export function avatarFor(name: string): string {
  const initials = initialsOf(name);
  let hue = 0;
  for (let i = 0; i < name.length; i++)
    hue = (hue + name.charCodeAt(i) * 7) % 360;
  const bg = `oklch(0.78 0.06 ${hue})`;
  const fg = `oklch(0.32 0.05 ${hue})`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='${bg}'/><text x='32' y='38' text-anchor='middle' font-family='Manrope, sans-serif' font-weight='700' font-size='24' fill='${fg}'>${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatLastSeen(iso: string): string {
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)}h`;
  if (diffMin < 60 * 24 * 7) return `${Math.floor(diffMin / 60 / 24)}d`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function uuid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
