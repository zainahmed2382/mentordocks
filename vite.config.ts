import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/audit' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const reqMock = {
                    method: req.method,
                    body: body ? JSON.parse(body) : {},
                    headers: req.headers
                  };
                  const resMock = {
                    statusCode: 200,
                    headers: {} as Record<string, string>,
                    setHeader(name: string, value: string) {
                      this.headers[name] = value;
                      res.setHeader(name, value);
                    },
                    status(code: number) {
                      this.statusCode = code;
                      res.statusCode = code;
                      return this;
                    },
                    json(data: any) {
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(data));
                    },
                    end(data?: any) {
                      res.end(data);
                    }
                  };
                  const handler = (await import('./api/audit.ts')).default;
                  await handler(reqMock, resMock);
                } catch (e: any) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: e.message || String(e) }));
                }
              });
            } else {
              next();
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
