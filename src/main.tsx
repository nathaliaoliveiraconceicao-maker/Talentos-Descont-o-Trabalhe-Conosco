import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

/**
 * O carregamento do App é dinâmico para que uma falha na inicialização do
 * Firebase (ex.: ".env" ainda não configurado) não resulte em uma tela em
 * branco sem explicação — o erro é capturado aqui e uma mensagem amigável é
 * exibida em seu lugar, orientando a configuração do projeto.
 */
import('./App')
  .then(({ App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  })
  .catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error('Falha ao inicializar a aplicação:', error);
    root.render(
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
          background: '#f5f5f5',
        }}
      >
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#12512e', marginBottom: 8 }}>
            Não foi possível carregar a aplicação
          </h1>
          <p style={{ color: '#525252', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Verifique se o arquivo <code>.env</code> foi criado a partir de{' '}
            <code>.env.example</code> e preenchido com as credenciais do seu projeto
            Firebase. Consulte o README na seção &quot;Configuração do Firebase&quot;.
          </p>
        </div>
      </div>
    );
  });
