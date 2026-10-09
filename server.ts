import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { analyzeIncident, translateAlert } from './server/geminiService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/analyze-incident', async (req, res) => {
  try {
    const analysis = await analyzeIncident(req.body);
    res.json({ success: true, data: analysis });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Analysis failed' });
  }
});

app.post('/api/translate-alert', async (req, res) => {
  try {
    const translation = await translateAlert(req.body);
    res.json({ success: true, data: translation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Translation failed' });
  }
});

// Serve frontend build in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`DisasterLens AI Command Center listening on port ${port}`);
});
