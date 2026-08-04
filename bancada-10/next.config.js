/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Este projeto vive em bancada-10/, isolado do app VagaHub na raiz do
  // repositório. Fixar a raiz aqui evita que o Next confunda o workspace
  // com o package-lock.json/.eslintrc da VagaHub (repos irmãos no mesmo git).
  outputFileTracingRoot: __dirname,
  images: {
    // Permite o gerador de placeholders local (/placeholder-image?...) usado
    // pelo catálogo demonstrativo — trocar por fotos reais no Storage do
    // Supabase remove a necessidade deste padrão local.
    localPatterns: [{ pathname: '/placeholder-image', search: '**' }],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
