"use strict";
const express = require("express");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { db, nowIso, logAudit } = require("../db");
const { COOKIE_NAME, requireAuth, publicUser } = require("../middleware/auth");

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const SESSION_DAYS = 30;

function cookieOpts() {
  const sameSite = (process.env.COOKIE_SAMESITE || "lax").toLowerCase();
  return {
    httpOnly: true,
    secure: sameSite === "none" ? true : process.env.NODE_ENV === "production",
    sameSite,
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
    domain: process.env.COOKIE_DOMAIN || undefined,
  };
}

function ownerEmails() {
  return (process.env.OWNER_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

// POST /api/auth/google  { credential }  — credential is the Google ID token (JWT) from GSI.
router.post("/google", async (req, res) => {
  const { credential } = req.body || {};
  if (!credential) return res.status(400).json({ error: "missing_credential" });
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: "server_misconfigured", message: "GOOGLE_CLIENT_ID is not set on the server" });
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (e) {
    return res.status(401).json({ error: "invalid_google_token" });
  }
  if (!payload || !payload.email) return res.status(401).json({ error: "invalid_google_token" });

  const email = payload.email.toLowerCase();
  const sub = payload.sub;
  const name = payload.name || email.split("@")[0];
  const picture = payload.picture || null;

  let user = db.prepare(`SELECT * FROM users WHERE google_sub = ? OR email = ?`).get(sub, email);
  const trialDays = Number(process.env.TRIAL_DAYS || 7);

  if (!user) {
    const role = ownerEmails().includes(email) ? "owner" : "teacher";
    const trialEnds = new Date(Date.now() + trialDays * 86400000).toISOString();
    const info = db
      .prepare(
        `INSERT INTO users (google_sub, email, name, picture, role, subscription_status, subscription_plan, subscription_expires_at, created_at, last_login_at)
         VALUES (?,?,?,?,?, 'trial', 'free', ?, ?, ?)`
      )
      .run(sub, email, name, picture, role, trialEnds, nowIso(), nowIso());
    user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(info.lastInsertRowid);
    logAudit({ actorId: user.id, actorEmail: email, action: "user.signup", target: email, ip: req.ip });
  } else {
    // Self-heal owner role if the account is listed in OWNER_EMAILS but wasn't yet.
    const shouldBeOwner = ownerEmails().includes(email) && user.role !== "owner";
    db.prepare(
      `UPDATE users SET google_sub=?, name=?, picture=?, last_login_at=?, role = CASE WHEN ? THEN 'owner' ELSE role END WHERE id=?`
    ).run(sub, name, picture, nowIso(), shouldBeOwner ? 1 : 0, user.id);
    user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(user.id);
    logAudit({ actorId: user.id, actorEmail: email, action: "user.login", target: email, ip: req.ip });
  }

  if (user.disabled) {
    return res.status(403).json({ error: "account_disabled", message: "Аккаунт бұғатталған / Аккаунт заблокирован" });
  }

  const jti = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  db.prepare(
    `INSERT INTO sessions (id, user_id, created_at, expires_at, user_agent, ip, revoked) VALUES (?,?,?,?,?,?,0)`
  ).run(jti, user.id, nowIso(), expiresAt, req.headers["user-agent"] || null, req.ip);

  const token = jwt.sign({ uid: user.id, jti }, process.env.JWT_SECRET, { expiresIn: `${SESSION_DAYS}d` });
  res.cookie(COOKIE_NAME, token, cookieOpts());
  res.json({ user: publicUser(user) });
});

router.get("/me", (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.post("/logout", requireAuth, (req, res) => {
  db.prepare(`UPDATE sessions SET revoked = 1 WHERE id = ?`).run(req.sessionId);
  res.clearCookie(COOKIE_NAME, { path: "/", domain: process.env.COOKIE_DOMAIN || undefined });
  res.json({ ok: true });
});

module.exports = router;
