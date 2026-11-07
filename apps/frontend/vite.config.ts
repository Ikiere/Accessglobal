import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function localEmailProxyPlugin(): Plugin {
  return {
    name: 'local-email-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if ((req.url === '/api/send-email' || req.url === '/api/resend') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body);
              const apiKey =
                process.env.VITE_RESEND_API_KEY ||
                process.env.RESEND_API_KEY ||
                '';

              const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${apiKey.trim()}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
              });

              const data = await response.text();
              res.statusCode = response.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(data);
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localEmailProxyPlugin()],
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
