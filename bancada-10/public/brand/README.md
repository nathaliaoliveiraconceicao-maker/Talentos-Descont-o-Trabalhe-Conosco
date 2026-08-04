# Arquivos oficiais da marca

Esta pasta é o local reservado para os arquivos **finais** de identidade visual da Bancada 10, quando forem produzidos por um designer:

- `logo-mark.svg` — monograma B10 (ícone isolado, com o campo de futebol dentro do "0").
- `logo-full.svg` — versão com wordmark completo ("BANCADA 10").
- `logo-mark-mono-white.svg` / `logo-mark-mono-black.svg` — versões monocromáticas para fundos escuros/claros.
- `favicon.svg` / `favicon.ico`.
- `og-image.png` — imagem para compartilhamento (Open Graph), 1200x630.

Até que esses arquivos existam, o app usa um monograma **placeholder** gerado em código (`src/components/ui/Logo.tsx`), que já segue o conceito descrito (B10 com o "0" representando um campo visto de cima), mas não deve ser considerado a arte final da marca.

Quando os arquivos oficiais chegarem, basta colocá-los aqui e atualizar `Logo.tsx` e `app/layout.tsx` (metadata de ícones) para apontar para eles.
