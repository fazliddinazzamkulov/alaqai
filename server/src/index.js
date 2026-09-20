"use strict";
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { attachUser } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const aiRoutes = require("./routes/ai");
const imageRoutes = require("./routes/images");
const classRoutes = require("./routes/classes");
const contentRoutes = require("./routes/content");

for (const required of ["JWT_SECRET", "ENCRYPTION_KEY"]) {
  if (!process.env[required]) {
    console.error(`[alaqai] Missing required env var ${required}. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }
}

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "12mb" }));
app.use(cookieParser());
app.use(attachUser);

app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/content", contentRoutes);

app.use((req, res) => res.status(404).json({ error: "not_found" }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: "server_error", message: err.message });
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`[alaqai] server listening on :${port}`);
});
