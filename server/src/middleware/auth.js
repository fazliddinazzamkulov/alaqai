"use strict";
const jwt = require("jsonwebtoken");
const { db, nowIso } = require("../db");

const COOKIE_NAME = "alaqai_token";

function getUserById(id) {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id);
}

function isTrialExpired(user) {
  if (user.subscription_status !== "trial") return false;
  if (!user.subscription_expires_at) return false;
  return new Date(user.subscription_expires_at).getTime() < Date.now();
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture,
    role: user.role,
    subscriptionStatus: isTrialExpired(user) ? "expired" : user.subscription_status,
    subscriptionPlan: user.subscription_plan,
    subscriptionExpiresAt: user.subscription_expires_at,
  };
}

function readToken(req) {
  const raw = req.cookies && req.cookies[COOKIE_NAME];
  if (!raw) return null;
  try {
    return jwt.verify(raw, process.env.JWT_SECRET);
  } catch (e) {
    return null;
  }
}

// Populates req.user (or leaves it undefined) without rejecting the request.
function attachUser(req, res, next) {
  const payload = readToken(req);
  if (!payload) return next();
  const session = db.prepare(`SELECT * FROM sessions WHERE id = ?`).get(payload.jti);
  if (!session || session.revoked || new Date(session.expires_at).getTime() < Date.now()) {
    return next();
  }
  const user = getUserById(payload.uid);
  if (!user || user.disabled) return next();
  req.user = user;
  req.sessionId = payload.jti;
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "auth_required", message: "Кіру қажет / Требуется вход через Google" });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "auth_required" });
  if (!["admin", "owner"].includes(req.user.role)) {
    return res.status(403).json({ error: "forbidden", message: "Тек әкімші үшін / Только для администратора" });
  }
  next();
}

function requireOwner(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "auth_required" });
  if (req.user.role !== "owner") {
    return res.status(403).json({ error: "forbidden", message: "Тек компания басшысы үшін / Только для руководителя" });
  }
  next();
}

// Gates AI/generation endpoints: must be signed in AND have an active/valid trial.
function requireActiveAccount(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "auth_required", message: "Google арқылы кіріңіз / Войдите через Google" });
  const status = isTrialExpired(req.user) ? "expired" : req.user.subscription_status;
  if (status === "suspended" || status === "expired") {
    return res.status(402).json({
      error: "subscription_inactive",
      status,
      message: status === "expired"
        ? "Сынақ мерзімі аяқталды. Жазылымды жаңартыңыз / Пробный период закончился. Продлите подписку."
        : "Аккаунт уақытша тоқтатылды / Доступ приостановлен администратором.",
    });
  }
  next();
}

module.exports = {
  COOKIE_NAME,
  attachUser,
  requireAuth,
  requireAdmin,
  requireOwner,
  requireActiveAccount,
  publicUser,
  isTrialExpired,
  nowIso,
};
