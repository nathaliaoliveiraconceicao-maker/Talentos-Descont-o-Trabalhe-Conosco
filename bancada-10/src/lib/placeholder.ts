export function placeholderImage(label: string, tone: 'ink' | 'red' | 'off' = 'ink', w = 800, h = 1000) {
  const params = new URLSearchParams({ label, tone, w: String(w), h: String(h) })
  return `/placeholder-image?${params.toString()}`
}
