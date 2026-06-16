import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory sessions storage for real-time baby monitor synchronization fallback
const dbSessions = new Map<string, any>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large base64 payloads (for audio clips / video frame streams)
  app.use(express.json({ limit: "15mb" }));

  // ---fallback API ENDPOINTS ---
  app.get("/api/sessions/:id", (req, res) => {
    const session = dbSessions.get(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session non trouvée" });
    }
    res.json(session);
  });

  app.post("/api/sessions/:id", (req, res) => {
    const existing = dbSessions.get(req.params.id) || {};
    const updated = {
      ...existing,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    dbSessions.set(req.params.id, updated);
    res.json(updated);
  });

  app.delete("/api/sessions/:id", (req, res) => {
    dbSessions.delete(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", activeSessions: dbSessions.size });
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production static assets.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
