"use strict";
const express = require("express");
const crypto = require("node:crypto");
const { db, nowIso } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const TYPES = ["presentation", "test"];

function mapRow(r) {
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    classId: r.class_id,
    data: JSON.parse(r.data),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

router.get("/", (req, res) => {
  const type = req.query.type;
  let rows;
  if (type && TYPES.includes(type)) {
    rows = db
      .prepare(`SELECT id, type, title, class_id, created_at, updated_at, data FROM content_items WHERE owner_id=? AND type=? ORDER BY updated_at DESC`)
      .all(req.user.id, type);
  } else {
    rows = db
      .prepare(`SELECT id, type, title, class_id, created_at, updated_at, data FROM content_items WHERE owner_id=? ORDER BY updated_at DESC`)
      .all(req.user.id);
  }
  // list endpoint stays light — strip the heavy `data` blob, keep a short summary only
  res.json({
    items: rows.map((r) => ({
      id: r.id, type: r.type, title: r.title, classId: r.class_id, createdAt: r.created_at, updatedAt: r.updated_at,
    })),
  });
});

router.get("/:id", (req, res) => {
  const row = db.prepare(`SELECT * FROM content_items WHERE id=? AND owner_id=?`).get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: "not_found" });
  res.json({ item: mapRow(row) });
});

router.post("/", (req, res) => {
  const { type, title, classId, data } = req.body || {};
  if (!TYPES.includes(type)) return res.status(400).json({ error: "bad_type", types: TYPES });
  if (data === undefined) return res.status(400).json({ error: "bad_request", message: "data is required" });
  const id = crypto.randomUUID();
  const now = nowIso();
  db.prepare(
    `INSERT INTO content_items (id, owner_id, type, title, class_id, data, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)`
  ).run(id, req.user.id, type, title || null, classId || null, JSON.stringify(data), now, now);
  res.json({ item: mapRow(db.prepare(`SELECT * FROM content_items WHERE id=?`).get(id)) });
});

router.put("/:id", (req, res) => {
  const row = db.prepare(`SELECT * FROM content_items WHERE id=? AND owner_id=?`).get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: "not_found" });
  const title = req.body?.title !== undefined ? req.body.title : row.title;
  const classId = req.body?.classId !== undefined ? req.body.classId : row.class_id;
  const data = req.body?.data !== undefined ? JSON.stringify(req.body.data) : row.data;
  db.prepare(`UPDATE content_items SET title=?, class_id=?, data=?, updated_at=? WHERE id=?`).run(
    title, classId, data, nowIso(), row.id
  );
  res.json({ item: mapRow(db.prepare(`SELECT * FROM content_items WHERE id=?`).get(row.id)) });
});

router.delete("/:id", (req, res) => {
  const row = db.prepare(`SELECT * FROM content_items WHERE id=? AND owner_id=?`).get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: "not_found" });
  db.prepare(`DELETE FROM content_items WHERE id=?`).run(row.id);
  res.json({ ok: true });
});

module.exports = router;
