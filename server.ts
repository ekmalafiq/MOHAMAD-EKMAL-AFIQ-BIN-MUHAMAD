import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { apiRouter } from "./server/routes.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Mount API routes first
  app.use('/api', apiRouter);

  // Statically serve uploaded bit images and assets directly with correct MIME types
  const publicPath = path.join(process.cwd(), 'public');
  const assetsPath = path.join(process.cwd(), 'public', 'assets');
  app.use('/assets', express.static(assetsPath, { maxAge: '1h' }));
  app.use(express.static(publicPath));

  // Vite middleware for development vs static production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Unicron DrillBit AI Advisor server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
