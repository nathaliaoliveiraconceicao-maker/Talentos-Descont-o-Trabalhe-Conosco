import { NextRequest } from 'next/server'

/**
 * Gerador de imagem-placeholder (SVG) para o catálogo demonstrativo.
 * Evita depender de fotos externas/protegidas antes do cadastro das fotos
 * reais dos produtos. Trocar por `product.images` reais assim que o
 * catálogo verdadeiro for cadastrado no Supabase Storage.
 */

const TONES: Record<string, { bg: string; accent: string }> = {
  ink: { bg: '#141414', accent: '#D71920' },
  red: { bg: '#D71920', accent: '#141414' },
  off: { bg: '#F4F0E8', accent: '#141414' },
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const width = Math.min(Number(searchParams.get('w')) || 800, 1600)
  const height = Math.min(Number(searchParams.get('h')) || 1000, 2000)
  const label = escapeXml((searchParams.get('label') || 'Bancada 10').slice(0, 40))
  const tone = TONES[searchParams.get('tone') || 'ink'] ?? { bg: '#141414', accent: '#D71920' }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">
  <rect width="${width}" height="${height}" fill="${tone.bg}" />
  <g opacity="0.14">
    <path d="M${width * 0.5} ${height * 0.1} L${width * 0.78} ${height * 0.22} L${width * 0.68} ${height * 0.92} L${width * 0.32} ${height * 0.92} L${width * 0.22} ${height * 0.22} Z" fill="${tone.accent}" />
  </g>
  <circle cx="${width * 0.5}" cy="${height * 0.42}" r="${Math.min(width, height) * 0.16}" fill="none" stroke="${tone.accent}" stroke-width="3" opacity="0.5" />
  <text x="50%" y="${height * 0.42}" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${Math.max(width * 0.045, 18)}" fill="${tone.accent}" opacity="0.9">B10</text>
  <text x="50%" y="${height * 0.9}" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.max(width * 0.028, 12)}" fill="${tone.accent}" opacity="0.75">${label}</text>
  <text x="50%" y="${height * 0.96}" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.max(width * 0.02, 10)}" fill="${tone.accent}" opacity="0.55">FOTO DEMONSTRATIVA — substituir pelo produto real</text>
</svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
