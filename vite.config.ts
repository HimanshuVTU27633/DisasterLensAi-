import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { analyzeIncident, translateAlert } from './server/geminiService';

function apiServerPlugin(): Plugin {
  return {
    name: 'disasterlens-api-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // Parse JSON body helper
        const parseBody = (): Promise<any> => {
          return new Promise((resolve) => {
            let data = '';
            req.on('data', (chunk) => {
              data += chunk;
            });
            req.on('end', () => {
              try {
                resolve(data ? JSON.parse(data) : {});
              } catch {
                resolve({});
              }
            });
          });
        };

        res.setHeader('Content-Type', 'application/json');

        if (req.url === '/api/health' && req.method === 'GET') {
          res.statusCode = 200;
          return res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
        }

        if (req.url === '/api/analyze-incident' && req.method === 'POST') {
          try {
            const body = await parseBody();
            const analysis = await analyzeIncident(body);
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, data: analysis }));
          } catch (error: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, error: error.message || 'Analysis failed' }));
          }
        }

        if (req.url === '/api/translate-alert' && req.method === 'POST') {
          try {
            const body = await parseBody();
            const translation = await translateAlert(body);
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, data: translation }));
          } catch (error: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, error: error.message || 'Translation failed' }));
          }
        }

        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Endpoint not found' }));
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

