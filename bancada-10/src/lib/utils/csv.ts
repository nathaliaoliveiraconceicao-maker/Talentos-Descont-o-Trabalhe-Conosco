/**
 * Parser de CSV simples, com suporte a campos entre aspas contendo vírgulas.
 * Suficiente para importação de catálogo — não cobre todos os casos de
 * borda do RFC 4180 (ex.: quebras de linha dentro de um campo).
 */
export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length === 0) return []

  function parseLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (inQuotes) {
        if (char === '"' && line[i + 1] === '"') {
          current += '"'
          i++
        } else if (char === '"') {
          inQuotes = false
        } else {
          current += char
        }
      } else if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    result.push(current)
    return result
  }

  const headers = parseLine(lines[0]!).map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const values = parseLine(line)
    const row: Record<string, string> = {}
    headers.forEach((header, i) => {
      row[header] = (values[i] ?? '').trim()
    })
    return row
  })
}
