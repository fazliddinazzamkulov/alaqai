"use strict";
const express = require("express");
const { requireAuth, requireActiveAccount } = require("../middleware/auth");
const { getActiveKeys, markKeyUsed } = require("../keys");
const { logUsage } = require("../db");

const router = express.Router();

const DEFAULT_MODELS = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-2.5-flash-lite"];
const DEFAULT_IMAGE_MODELS = ["gemini-2.5-flash-image", "gemini-2.0-flash-preview-image-generation"];

function isTransient(status, message) {
  return status === 503 || status === 429 || /overloaded|high demand|unavailable/i.test(message || "");
}

// Transparent Gemini generateContent proxy. Frontend keeps its existing
// contents/generationConfig/safetySettings shape and its existing
// `res.ok` / `res.json()` handling — only the URL + auth changes.
router.post("/generate", requireAuth, requireActiveAccount, async (req, res) => {
  const { contents, generationConfig, safetySettings } = req.body || {};
  if (!Array.isArray(contents) || !contents.length) {
    return res.status(400).json({ error: "bad_request", message: "contents is required" });
  }
  const requestedModel = typeof req.query.model === "string" && req.query.model.trim() ? req.query.model.trim() : null;
  const models = requestedModel ? [requestedModel, ...DEFAULT_MODELS.filter((m) => m !== requestedModel)] : DEFAULT_MODELS;

  const keys = getActiveKeys("gemini");
  if (!keys.length) {
    return res.status(503).json({
      error: "no_api_keys",
      message: "Gemini кілттері орнатылмаған. Әкімшіге хабарласыңыз / Ключи Gemini не настроены. Сообщите администратору.",
    });
  }

  let lastStatus = 503;
  let lastBody = { error: "upstream_failed" };

  for (const model of models) {
    for (const key of keys) {
      try {
        const upstream = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-goog-api-key": key.value },
            body: JSON.stringify({ contents, generationConfig, safetySettings }),
          }
        );
        const body = await upstream.json().catch(() => ({}));
        if (upstream.ok) {
          markKeyUsed(key.id, true);
          logUsage({ userId: req.user.id, kind: "ai_generate", ok: true });
          return res.status(200).json(body);
        }
        const message = body?.error?.message || `HTTP ${upstream.status}`;
        lastStatus = upstream.status;
        lastBody = body;
        if (isTransient(upstream.status, message)) {
          markKeyUsed(key.id, false);
          continue; // try next key / model
        }
        // Hard error (bad request, blocked content, etc) — surface immediately.
        logUsage({ userId: req.user.id, kind: "ai_generate", ok: false });
        return res.status(upstream.status).json(body);
      } catch (e) {
        lastStatus = 503;
        lastBody = { error: "network_error", message: String(e.message || e) };
        markKeyUsed(key.id, false);
      }
    }
  }
  logUsage({ userId: req.user.id, kind: "ai_generate", ok: false });
  res.status(lastStatus).json(lastBody);
});

// Gemini image generation ("nano banana" family). Returns a data: URL so the
// frontend can drop it straight into an <img src>.
router.post("/generate-image", requireAuth, requireActiveAccount, async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt || !String(prompt).trim()) return res.status(400).json({ error: "bad_request", message: "prompt is required" });

  let keys = getActiveKeys("gemini_image");
  if (!keys.length) keys = getActiveKeys("gemini"); // fall back to the text keys if no dedicated image key is set
  if (!keys.length) {
    return res.status(503).json({
      error: "no_api_keys",
      message: "Сурет генерациялау кілті орнатылмаған / Ключ для генерации изображений не настроен.",
    });
  }

  let lastStatus = 503;
  let lastBody = { error: "upstream_failed" };

  for (const model of DEFAULT_IMAGE_MODELS) {
    for (const key of keys) {
      try {
        const upstream = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-goog-api-key": key.value },
            body: JSON.stringify({
              contents: [{ parts: [{ text: String(prompt).trim() }] }],
              generationConfig: { responseModalities: ["IMAGE"] },
            }),
          }
        );
        const body = await upstream.json().catch(() => ({}));
        if (upstream.ok) {
          const part = body?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData || p.inline_data);
          const inline = part?.inlineData || part?.inline_data;
          if (inline?.data) {
            markKeyUsed(key.id, true);
            logUsage({ userId: req.user.id, kind: "image_generate", ok: true });
            return res.json({ dataUrl: `data:${inline.mimeType || inline.mime_type || "image/png"};base64,${inline.data}` });
          }
          lastStatus = 502;
          lastBody = { error: "no_image_returned" };
          continue;
        }
        const message = body?.error?.message || `HTTP ${upstream.status}`;
        lastStatus = upstream.status;
        lastBody = body;
        if (isTransient(upstream.status, message)) {
          markKeyUsed(key.id, false);
          continue;
        }
        logUsage({ userId: req.user.id, kind: "image_generate", ok: false });
        return res.status(upstream.status).json(body);
      } catch (e) {
        lastStatus = 503;
        lastBody = { error: "network_error", message: String(e.message || e) };
        markKeyUsed(key.id, false);
      }
    }
  }
  logUsage({ userId: req.user.id, kind: "image_generate", ok: false });
  res.status(lastStatus).json(lastBody);
});

module.exports = router;
