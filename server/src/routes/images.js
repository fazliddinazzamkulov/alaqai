"use strict";
const express = require("express");
const { requireAuth, requireActiveAccount } = require("../middleware/auth");
const { getActiveKeys, markKeyUsed } = require("../keys");
const { logUsage } = require("../db");

const router = express.Router();

async function tryPexels(query) {
  for (const key of getActiveKeys("pexels")) {
    try {
      const r = await fetch(`https://api.pexels.com/v1/search?per_page=1&query=${encodeURIComponent(query)}`, {
        headers: { Authorization: key.value },
      });
      if (!r.ok) { markKeyUsed(key.id, false); continue; }
      const data = await r.json();
      const url = data?.photos?.[0]?.src?.large;
      if (url) { markKeyUsed(key.id, true); return url; }
      markKeyUsed(key.id, true);
    } catch (e) { markKeyUsed(key.id, false); }
  }
  return null;
}

async function tryUnsplash(query) {
  for (const key of getActiveKeys("unsplash")) {
    try {
      const r = await fetch(`https://api.unsplash.com/search/photos?per_page=1&query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Client-ID ${key.value}` },
      });
      if (!r.ok) { markKeyUsed(key.id, false); continue; }
      const data = await r.json();
      const url = data?.results?.[0]?.urls?.regular;
      if (url) { markKeyUsed(key.id, true); return url; }
      markKeyUsed(key.id, true);
    } catch (e) { markKeyUsed(key.id, false); }
  }
  return null;
}

async function tryPixabay(query) {
  for (const key of getActiveKeys("pixabay")) {
    try {
      const r = await fetch(
        `https://pixabay.com/api/?key=${encodeURIComponent(key.value)}&per_page=3&image_type=photo&safesearch=true&q=${encodeURIComponent(query)}`
      );
      if (!r.ok) { markKeyUsed(key.id, false); continue; }
      const data = await r.json();
      const url = data?.hits?.[0]?.largeImageURL || data?.hits?.[0]?.webformatURL;
      if (url) { markKeyUsed(key.id, true); return url; }
      markKeyUsed(key.id, true);
    } catch (e) { markKeyUsed(key.id, false); }
  }
  return null;
}

// GET /api/images/search?q=... — tries Pexels, then Unsplash, then Pixabay
// (whichever the admin has configured), returns the first hit.
router.get("/search", requireAuth, requireActiveAccount, async (req, res) => {
  const query = (req.query.q || "").toString().trim();
  if (!query) return res.status(400).json({ error: "bad_request", message: "q is required" });

  const url = (await tryPexels(query)) || (await tryUnsplash(query)) || (await tryPixabay(query));
  logUsage({ userId: req.user.id, kind: "image_search", ok: !!url });
  if (!url) return res.status(404).json({ error: "no_image_found" });
  res.json({ url });
});

module.exports = router;
