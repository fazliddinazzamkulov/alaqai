"use strict";
const express = require("express");
const { db, nowIso, logAudit } = require("../db");
const { requireAdmin, requireOwner, publicUser } = require("../middleware/auth");
const { encryptSecret, maskSecret } = require("../crypto");

const router = express.Router();

const PROVIDERS = ["gemini", "gemini_image", "pixabay", "pexels", "unsplash"];
const MAX_SLOTS = 3;

// ---------------------------------------------------------------------------
// API key vault — admin + owner. Values are AES-256-GCM encrypted at rest and
// are NEVER returned to the client; only a short preview + metadata are.
// ---------------------------------------------------------------------------
router.get("/keys", requireAdmin, (req, res) => {
  const rows = db
    .prepare(`SELECT id, provider, slot, label, preview, active, last_used_at, fail_count, created_at FROM api_keys ORDER BY provider, slot`)
    .all();
  res.json({ providers: PROVIDERS, maxSlots: MAX_SLOTS, keys: rows });
});

router.post("/keys", requireAdmin, (req, res) => {
  const { provider, slot, label, value } = req.body || {};
  if (!PROVIDERS.includes(provider)) return res.status(400).json({ error: "bad_provider", providers: PROVIDERS });
  const slotNum = Number(slot) || 1;
  if (slotNum < 1 || slotNum > MAX_SLOTS) return res.status(400).json({ error: "bad_slot", maxSlots: MAX_SLOTS });
  if (!value || String(value).trim().length < 6) return res.status(400).json({ error: "bad_value" });

  const enc = encryptSecret(String(value).trim());
  const preview = maskSecret(String(value).trim());
  const existing = db.prepare(`SELECT id FROM api_keys WHERE provider = ? AND slot = ?`).get(provider, slotNum);
  if (existing) {
    db.prepare(
      `UPDATE api_keys SET label=?, enc_value=?, preview=?, active=1, fail_count=0, created_by=? WHERE id=?`
    ).run(label || null, enc, preview, req.user.id, existing.id);
  } else {
    db.prepare(
      `INSERT INTO api_keys (provider, slot, label, enc_value, preview, active, created_at, created_by) VALUES (?,?,?,?,?,1,?,?)`
    ).run(provider, slotNum, label || null, enc, preview, nowIso(), req.user.id);
  }
  logAudit({ actorId: req.user.id, actorEmail: req.user.email, action: "apikey.set", target: `${provider}#${slotNum}`, ip: req.ip });
  res.json({ ok: true });
});

router.patch("/keys/:id", requireAdmin, (req, res) => {
  const { active } = req.body || {};
  const row = db.prepare(`SELECT * FROM api_keys WHERE id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: "not_found" });
  db.prepare(`UPDATE api_keys SET active = ? WHERE id = ?`).run(active ? 1 : 0, row.id);
  logAudit({ actorId: req.user.id, actorEmail: req.user.email, action: "apikey.toggle", target: `${row.provider}#${row.slot}`, meta: { active: !!active }, ip: req.ip });
  res.json({ ok: true });
});

router.delete("/keys/:id", requireAdmin, (req, res) => {
  const row = db.prepare(`SELECT * FROM api_keys WHERE id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: "not_found" });
  db.prepare(`DELETE FROM api_keys WHERE id = ?`).run(row.id);
  logAudit({ actorId: req.user.id, actorEmail: req.user.email, action: "apikey.delete", target: `${row.provider}#${row.slot}`, ip: req.ip });
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Users & subscriptions — admin can manage teachers; only owner can touch
// admin/owner roles or another admin account (privilege-escalation guard).
// ---------------------------------------------------------------------------
router.get("/users", requireAdmin, (req, res) => {
  const q = (req.query.q || "").trim();
  let rows;
  if (q) {
    rows = db
      .prepare(
        `SELECT id, email, name, role, subscription_status, subscription_plan, subscription_expires_at, disabled, created_at, last_login_at
         FROM users WHERE email LIKE ? OR name LIKE ? ORDER BY created_at DESC LIMIT 200`
      )
      .all(`%${q}%`, `%${q}%`);
  } else {
    rows = db
      .prepare(
        `SELECT id, email, name, role, subscription_status, subscription_plan, subscription_expires_at, disabled, created_at, last_login_at
         FROM users ORDER BY created_at DESC LIMIT 200`
      )
      .all();
  }
  res.json({ users: rows });
});

router.patch("/users/:id", requireAdmin, (req, res) => {
  const target = db.prepare(`SELECT * FROM users WHERE id = ?`).get(req.params.id);
  if (!target) return res.status(404).json({ error: "not_found" });

  const isPrivilegedTarget = target.role === "admin" || target.role === "owner";
  const wantsRoleChange = typeof req.body.role === "string" && req.body.role !== target.role;
  if ((isPrivilegedTarget || wantsRoleChange) && req.user.role !== "owner") {
    return res.status(403).json({ error: "forbidden", message: "Тек басшы рөлдерді өзгерте алады / Только руководитель может менять роли/админов" });
  }
  if (wantsRoleChange && !["teacher", "admin", "owner"].includes(req.body.role)) {
    return res.status(400).json({ error: "bad_role" });
  }

  const next = {
    role: wantsRoleChange ? req.body.role : target.role,
    subscription_status: req.body.subscriptionStatus || target.subscription_status,
    subscription_plan: req.body.subscriptionPlan || target.subscription_plan,
    subscription_expires_at:
      req.body.subscriptionExpiresAt !== undefined ? req.body.subscriptionExpiresAt : target.subscription_expires_at,
    disabled: req.body.disabled !== undefined ? (req.body.disabled ? 1 : 0) : target.disabled,
  };
  db.prepare(
    `UPDATE users SET role=?, subscription_status=?, subscription_plan=?, subscription_expires_at=?, disabled=? WHERE id=?`
  ).run(next.role, next.subscription_status, next.subscription_plan, next.subscription_expires_at, next.disabled, target.id);

  logAudit({
    actorId: req.user.id,
    actorEmail: req.user.email,
    action: "user.update",
    target: target.email,
    meta: { before: { role: target.role, subscription_status: target.subscription_status, disabled: !!target.disabled }, after: next },
    ip: req.ip,
  });

  const updated = db.prepare(`SELECT * FROM users WHERE id = ?`).get(target.id);
  res.json({ user: publicUser(updated) });
});

// ---------------------------------------------------------------------------
// Security — owner only. Audit log + active-session control across all users.
// ---------------------------------------------------------------------------
router.get("/audit-log", requireOwner, (req, res) => {
  const rows = db.prepare(`SELECT * FROM audit_log ORDER BY id DESC LIMIT 300`).all();
  res.json({ entries: rows.map((r) => ({ ...r, meta: r.meta ? JSON.parse(r.meta) : null })) });
});

router.get("/sessions", requireOwner, (req, res) => {
  const rows = db
    .prepare(
      `SELECT s.id, s.user_id, u.email, u.name, s.created_at, s.expires_at, s.user_agent, s.ip, s.revoked
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.revoked = 0 AND s.expires_at > ?
       ORDER BY s.created_at DESC LIMIT 300`
    )
    .all(nowIso());
  res.json({ sessions: rows });
});

router.delete("/sessions/:id", requireOwner, (req, res) => {
  db.prepare(`UPDATE sessions SET revoked = 1 WHERE id = ?`).run(req.params.id);
  logAudit({ actorId: req.user.id, actorEmail: req.user.email, action: "session.revoke", target: req.params.id, ip: req.ip });
  res.json({ ok: true });
});

router.get("/stats", requireAdmin, (req, res) => {
  const totalUsers = db.prepare(`SELECT COUNT(*) c FROM users`).get().c;
  const activeSubs = db.prepare(`SELECT COUNT(*) c FROM users WHERE subscription_status = 'active'`).get().c;
  const trialSubs = db.prepare(`SELECT COUNT(*) c FROM users WHERE subscription_status = 'trial'`).get().c;
  const suspended = db.prepare(`SELECT COUNT(*) c FROM users WHERE subscription_status = 'suspended' OR disabled = 1`).get().c;
  const aiToday = db
    .prepare(`SELECT COUNT(*) c FROM usage_log WHERE at >= ?`)
    .get(new Date(Date.now() - 86400000).toISOString()).c;
  res.json({ totalUsers, activeSubs, trialSubs, suspended, aiToday });
});

module.exports = router;
