import express from "express";
import path from "path";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { runWebsiteAudit, AuditReachabilityError } from "./audit/index";
import { runPageSpeedInsights } from "./audit/pageSpeedInsights";
import { connectMongoDb, ensureMongoCollections, getMongoCollection, getNextSequenceValue, isMongoConfigured } from "./mongo";

dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use((req, res, next) => {
  if (req.url.startsWith("/api/")) {
    const originalUrl = req.originalUrl || req.url;
    const urlObj = new URL(originalUrl, "http://localhost");
    if (urlObj.searchParams.has("path")) {
      urlObj.searchParams.delete("path");
      const cleaned = urlObj.pathname + urlObj.search + urlObj.hash;
      req.url = cleaned;
      req.originalUrl = cleaned;
      if ((req as any)._parsedUrl) (req as any)._parsedUrl = null;
    }

    console.log(`[API] ${req.method} ${req.url}`);
  }
  next();
});

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_sign_key_123456789";

// In-memory fallback stores for the local app session
const anonymousProjects: any[] = [];

const anonymousScans: any[] = [];

// In-memory user store for local app sessions
const inMemoryUsers: Array<{ id: number; email: string; password: string; name: string }> = [];
let inMemoryUserIdCounter = 1;

// Authentication Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

// Optional Auth Middleware (Doesn't fail if no token, just adds user context)
function optionalAuthenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
}

// --- AUTHENTICATION ENDPOINTS ---

// Signup Endpoint
app.post("/api/auth/signup", async (req: any, res: any) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const usersCollection = await getMongoCollection("users");

    if (usersCollection) {
      const existing = await usersCollection.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ error: "Email is already registered" });
      }

      const userId = await getNextSequenceValue("users");
      const newUser = {
        id: userId,
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || email.split("@")[0],
        createdAt: new Date(),
      };

      await usersCollection.insertOne(newUser);
      const token = jwt.sign({ userId: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET, { expiresIn: "7d" });
      console.log(`[Mongo Auth] New user registered: ${newUser.email}`);
      return res.status(201).json({
        token,
        user: { id: newUser.id, email: newUser.email, name: newUser.name }
      });
    }

    const existing = inMemoryUsers.find((u) => u.email === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const newUser = { id: inMemoryUserIdCounter++, email: email.toLowerCase(), password: hashedPassword, name: name || email.split("@")[0] };
    inMemoryUsers.push(newUser);
    const token = jwt.sign({ userId: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET, { expiresIn: "7d" });
    console.log(`[In-Memory Auth] New user registered: ${newUser.email}`);
    return res.status(201).json({
      token,
      user: { id: newUser.id, email: newUser.email, name: newUser.name }
    });
  } catch (err: any) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error during registration" });
  }
});

// Login Endpoint
app.post("/api/auth/login", async (req: any, res: any) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const usersCollection = await getMongoCollection("users");
    if (usersCollection) {
      const user = await usersCollection.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
      console.log(`[Mongo Auth] User logged in: ${user.email}`);
      return res.json({
        token,
        user: { id: user.id, email: user.email, name: user.name }
      });
    }

    const user = inMemoryUsers.find((u) => u.email === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
    console.log(`[In-Memory Auth] User logged in: ${user.email}`);
    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error during login" });
  }
});

// Get Current User Info
app.get("/api/auth/me", authenticateToken, async (req: any, res: any) => {
  try {
    const usersCollection = await getMongoCollection("users");
    if (usersCollection) {
      const user = await usersCollection.findOne({ id: Number(req.user.userId) });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.json({ user: { id: user.id, email: user.email, name: user.name } });
    }

    const user = inMemoryUsers.find((u) => u.id === Number(req.user.userId));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err: any) {
    console.error("Me endpoint error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- PROJECTS ENDPOINTS ---

// GET user's saved projects
app.get("/api/projects", optionalAuthenticateToken, async (req: any, res: any) => {
  try {
    const projectsCollection = await getMongoCollection("projects");
    if (projectsCollection && req.user) {
      const docs = await projectsCollection.find({ userId: Number(req.user.userId) }).sort({ createdAt: -1 }).toArray();
      return res.json(docs.map((doc) => ({
        id: doc.id,
        name: doc.name,
        url: doc.url,
        score: doc.score,
        lastScan: doc.lastScan,
        issues: doc.issues,
        category: doc.category,
      })));
    }
    return res.json(anonymousProjects);
  } catch (err: any) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// POST save a new project
app.post("/api/projects", optionalAuthenticateToken, async (req: any, res: any) => {
  const { name, url, score, lastScan, issues, category } = req.body;

  if (!name || !url) {
    return res.status(400).json({ error: "Name and URL are required" });
  }

  try {
    const projectsCollection = await getMongoCollection("projects");
    if (projectsCollection && req.user) {
      const projectDoc = {
        id: "p_" + Date.now(),
        userId: Number(req.user.userId),
        name,
        url,
        score: score || 80,
        lastScan: lastScan || "Just now",
        issues: issues || 0,
        category: category || "Other",
        createdAt: new Date(),
      };
      await projectsCollection.insertOne(projectDoc);
      return res.status(201).json({
        id: projectDoc.id,
        name: projectDoc.name,
        url: projectDoc.url,
        score: projectDoc.score,
        lastScan: projectDoc.lastScan,
        issues: projectDoc.issues,
        category: projectDoc.category,
      });
    }

    const newProj = {
      id: "p_" + Date.now(),
      name,
      url,
      score: score || 80,
      lastScan: lastScan || "Just now",
      issues: issues || 0,
      category: category || "Other"
    };
    anonymousProjects.unshift(newProj);
    return res.status(201).json(newProj);
  } catch (err: any) {
    console.error("Error saving project:", err);
    res.status(500).json({ error: "Failed to save project" });
  }
});

// --- SCANS ENDPOINTS ---

// GET saved scan history
app.get("/api/scans", optionalAuthenticateToken, async (req: any, res: any) => {
  try {
    const scansCollection = await getMongoCollection("scans");
    if (scansCollection && req.user) {
      const docs = await scansCollection.find({ userId: Number(req.user.userId) }).sort({ createdAt: -1 }).toArray();
      return res.json(docs.map((doc) => ({
        id: doc.id,
        url: doc.url,
        score: doc.score,
        healthMessage: doc.healthMessage,
        problems: doc.problems,
        recommendations: doc.recommendations,
        metrics: doc.metrics,
        date: doc.date,
      })));
    }
    return res.json(anonymousScans);
  } catch (err: any) {
    console.error("Error fetching scans:", err);
    res.status(500).json({ error: "Failed to fetch scans" });
  }
});

// POST save a scan report
app.post("/api/scans", optionalAuthenticateToken, async (req: any, res: any) => {
  const { url, score, healthMessage, problems, recommendations, metrics, date } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const scansCollection = await getMongoCollection("scans");
    if (scansCollection && req.user) {
      const newScan = {
        id: "scan_" + Date.now(),
        userId: Number(req.user.userId),
        url,
        score,
        healthMessage,
        problems: problems || [],
        recommendations: recommendations || [],
        metrics: metrics || {},
        date: date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        createdAt: new Date(),
      };
      await scansCollection.insertOne(newScan);
      return res.status(201).json({
        id: newScan.id,
        url: newScan.url,
        score: newScan.score,
        healthMessage: newScan.healthMessage,
        problems: newScan.problems,
        recommendations: newScan.recommendations,
        metrics: newScan.metrics,
        date: newScan.date,
      });
    }

    const newScan = {
      id: "scan_" + Date.now(),
      url,
      score,
      healthMessage,
      problems: problems || [],
      recommendations: recommendations || [],
      metrics: metrics || {},
      date: date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    };
    anonymousScans.unshift(newScan);
    return res.status(201).json(newScan);
  } catch (err: any) {
    console.error("Error saving scan:", err);
    res.status(500).json({ error: "Failed to save scan" });
  }
});

// DELETE a scan report
app.delete("/api/scans/:id", optionalAuthenticateToken, async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const scansCollection = await getMongoCollection("scans");
    if (scansCollection && req.user) {
      await scansCollection.deleteOne({ id, userId: Number(req.user.userId) });
      return res.status(200).json({ message: "Scan deleted successfully" });
    }

    const index = anonymousScans.findIndex(s => s.id === id || String(s.id) === String(id));
    if (index !== -1) {
      anonymousScans.splice(index, 1);
    }
    return res.status(200).json({ message: "Scan deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting scan:", err);
    res.status(500).json({ error: "Failed to delete scan" });
  }
});

// --- DIRECT PAGESPEED INSIGHTS ENDPOINT ---
app.get("/api/pagespeed", optionalAuthenticateToken, async (req: any, res: any) => {
  const url = (req.query.url as string) || "";
  const strategy = (req.query.strategy as string) === "desktop" ? "desktop" : "mobile";

  if (!url) {
    return res.status(400).json({ error: "URL query parameter is required" });
  }

  try {
    const psiResult = await runPageSpeedInsights(url, strategy);
    return res.json(psiResult);
  } catch (err: any) {
    console.error("PageSpeed Insights endpoint failed:", err);
    return res.status(502).json({ error: err?.message || "PageSpeed Insights call failed" });
  }
});

app.post("/api/pagespeed", optionalAuthenticateToken, async (req: any, res: any) => {
  const { url, strategy } = req.body || {};

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const psiResult = await runPageSpeedInsights(url, strategy === "desktop" ? "desktop" : "mobile");
    return res.json(psiResult);
  } catch (err: any) {
    console.error("PageSpeed Insights endpoint failed:", err);
    return res.status(502).json({ error: err?.message || "PageSpeed Insights call failed" });
  }
});

// --- URL SCANNER (Lighthouse / PSI / Puppeteer / CDP) ---
app.post("/api/scans/analyze", optionalAuthenticateToken, async (req: any, res: any) => {
  const { url, scanMode, device, checks } = req.body || {};

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const deep = scanMode !== "standard";
  const strategy = device === "desktop" ? "desktop" : "mobile";

  try {
    const finalReport = await runWebsiteAudit(url, {
      deep,
      strategy,
      checks: checks || {
        domStructure: true,
        contrastWcag: true,
        performanceWebVitals: true,
        securityHeaders: true,
        seoOptimization: true,
      },
    });

    const { auditMeta, status, ...persisted } = finalReport as any;

    try {
      const payload = {
        ...persisted,
        id: "scan_" + Date.now(),
        status: "completed" as const,
        auditMeta,
      };

      const scansCollection = await getMongoCollection("scans");
      if (scansCollection && req.user) {
        await scansCollection.insertOne({
          id: payload.id,
          userId: Number(req.user.userId),
          url: payload.url,
          score: payload.score,
          healthMessage: payload.healthMessage,
          problems: payload.problems || [],
          recommendations: payload.recommendations || [],
          metrics: payload.metrics || {},
          date: payload.date,
          createdAt: new Date(),
        });
      } else {
        anonymousScans.unshift(payload);
      }

      return res.status(200).json(payload);
    } catch (saveErr: any) {
      console.error("Failed to save analyzed scan:", saveErr);
      return res.status(200).json({
        ...persisted,
        id: "scan_temp_" + Date.now(),
        status: "completed",
        auditMeta,
      });
    }
  } catch (err: any) {
    console.error("Website audit failed:", err?.message || err);

    if (err instanceof AuditReachabilityError || err?.errorType) {
      const statusCode = err.errorType === "INVALID_URL" ? 400 : err.errorType === "NOT_FOUND" ? 404 : 502;
      return res.status(statusCode).json({
        error: err.message,
        title: err.title,
        errorType: err.errorType,
      });
    }

    return res.status(502).json({
      error: "We couldn't scan this website right now. Please try again in a moment.",
      title: "Website Temporarily Unreachable",
      errorType: "UNREACHABLE",
    });
  }
});

// Global API error handler (catches 413 Payload Too Large, JSON parse errors, etc.)
app.use((err: any, req: any, res: any, next: any) => {
  if (err?.type === "entity.too.large" || err?.status === 413) {
    return res.status(413).json({
      error: "Payload too large. Please use a smaller file or screenshot (under 25MB).",
    });
  }
  if (err) {
    console.error("[API Error Handler]:", err?.message || err);
    return res.status(err.status || 500).json({
      error: err.message || "An unexpected error occurred.",
    });
  }
  next();
});

// Vite Middleware & Startup
async function startServer() {
  if (isMongoConfigured()) {
    await connectMongoDb();
    await ensureMongoCollections();
  }

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: any, res: any) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
