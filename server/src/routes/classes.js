"use strict";
const express = require("express");
const { db, nowIso } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function loadClassWithStudents(id, ownerId) {
  const cls = db.prepare(`SELECT * FROM classes WHERE id = ? AND owner_id = ?`).get(id, ownerId);
  if (!cls) return null;
  const students = db.prepare(`SELECT * FROM students WHERE class_id = ? ORDER BY id ASC`).all(id);
  return { id: cls.id, name: cls.name, createdAt: cls.created_at, students: students.map(mapStudent) };
}
function mapStudent(s) {
  return { id: s.id, name: s.name, note: s.note || "", score: s.score };
}

router.get("/", (req, res) => {
  const classes = db.prepare(`SELECT id FROM classes WHERE owner_id = ? ORDER BY id ASC`).all(req.user.id);
  res.json({ classes: classes.map((c) => loadClassWithStudents(c.id, req.user.id)) });
});

router.post("/", (req, res) => {
  const name = (req.body?.name || "").trim();
  if (!name) return res.status(400).json({ error: "bad_request", message: "name is required" });
  const info = db.prepare(`INSERT INTO classes (owner_id, name, created_at) VALUES (?,?,?)`).run(req.user.id, name, nowIso());
  res.json({ class: loadClassWithStudents(info.lastInsertRowid, req.user.id) });
});

router.delete("/:id", (req, res) => {
  const cls = db.prepare(`SELECT * FROM classes WHERE id = ? AND owner_id = ?`).get(req.params.id, req.user.id);
  if (!cls) return res.status(404).json({ error: "not_found" });
  db.prepare(`DELETE FROM classes WHERE id = ?`).run(cls.id);
  res.json({ ok: true });
});

router.post("/:id/students", (req, res) => {
  const cls = db.prepare(`SELECT * FROM classes WHERE id = ? AND owner_id = ?`).get(req.params.id, req.user.id);
  if (!cls) return res.status(404).json({ error: "not_found" });
  const name = (req.body?.name || "").trim();
  if (!name) return res.status(400).json({ error: "bad_request", message: "name is required" });
  db.prepare(`INSERT INTO students (class_id, name, note, score, created_at) VALUES (?,?,?,0,?)`).run(
    cls.id, name, (req.body?.note || "").trim() || null, nowIso()
  );
  res.json({ class: loadClassWithStudents(cls.id, req.user.id) });
});

router.patch("/students/:studentId", (req, res) => {
  const student = db
    .prepare(`SELECT s.* FROM students s JOIN classes c ON c.id = s.class_id WHERE s.id = ? AND c.owner_id = ?`)
    .get(req.params.studentId, req.user.id);
  if (!student) return res.status(404).json({ error: "not_found" });
  const name = req.body?.name !== undefined ? String(req.body.name).trim() : student.name;
  const note = req.body?.note !== undefined ? String(req.body.note).trim() : student.note;
  const score = req.body?.score !== undefined ? Number(req.body.score) : student.score;
  db.prepare(`UPDATE students SET name=?, note=?, score=? WHERE id=?`).run(name, note, score, student.id);
  res.json({ class: loadClassWithStudents(student.class_id, req.user.id) });
});

router.delete("/students/:studentId", (req, res) => {
  const student = db
    .prepare(`SELECT s.* FROM students s JOIN classes c ON c.id = s.class_id WHERE s.id = ? AND c.owner_id = ?`)
    .get(req.params.studentId, req.user.id);
  if (!student) return res.status(404).json({ error: "not_found" });
  db.prepare(`DELETE FROM students WHERE id = ?`).run(student.id);
  res.json({ class: loadClassWithStudents(student.class_id, req.user.id) });
});

module.exports = router;
