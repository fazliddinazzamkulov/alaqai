"use strict";
const { db, nowIso } = require("./db");
const { decryptSecret } = require("./crypto");

// Returns decrypted, active keys for a provider ordered by slot (1..3), skipping
// any that fail to decrypt (e.g. ENCRYPTION_KEY rotated without re-entering keys).
function getActiveKeys(provider) {
  const rows = db
    .prepare(`SELECT id, slot, enc_value FROM api_keys WHERE provider = ? AND active = 1 ORDER BY slot ASC`)
    .all(provider);
  const out = [];
  for (const row of rows) {
    try {
      out.push({ id: row.id, slot: row.slot, value: decryptSecret(row.enc_value) });
    } catch (e) {
      // skip undecryptable key
    }
  }
  return out;
}

function markKeyUsed(id, ok) {
  if (ok) {
    db.prepare(`UPDATE api_keys SET last_used_at = ?, fail_count = 0 WHERE id = ?`).run(nowIso(), id);
  } else {
    db.prepare(`UPDATE api_keys SET last_used_at = ?, fail_count = fail_count + 1 WHERE id = ?`).run(nowIso(), id);
  }
}

module.exports = { getActiveKeys, markKeyUsed };
