import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Auto-create the table on first call. Cheap and idempotent.
let initPromise: Promise<void> | null = null;
function init() {
  if (!initPromise) {
    initPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS scores (
          id          SERIAL PRIMARY KEY,
          name        TEXT NOT NULL,
          mode        TEXT NOT NULL,
          score       INT  NOT NULL,
          puzzle      INT  NOT NULL,
          play_date   DATE NOT NULL,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS scores_today_idx ON scores(play_date, mode, score DESC)`;
    })().catch((e) => { initPromise = null; throw e; });
  }
  return initPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await init();

    if (req.method === "GET") {
      const date = String(req.query.date || todayISO());
      const mode = String(req.query.mode || "quotes");
      if (mode !== "quotes" && mode !== "politicians") {
        return res.status(400).json({ error: "invalid mode" });
      }
      const rows = await sql`
        SELECT name,
               MAX(score) AS score,
               COUNT(*)::int AS attempts,
               MIN(created_at) AS first_played
        FROM scores
        WHERE play_date = ${date} AND mode = ${mode}
        GROUP BY name
        ORDER BY MAX(score) DESC, MIN(created_at) ASC
        LIMIT 50
      `;
      const totals = await sql`
        SELECT mode, COUNT(*)::int AS plays, COUNT(DISTINCT name)::int AS players
        FROM scores
        WHERE play_date = ${date}
        GROUP BY mode
      `;
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ date, mode, rows, totals });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const name = String(body.name || "").trim().slice(0, 32);
      const mode = body.mode === "politicians" ? "politicians" : body.mode === "quotes" ? "quotes" : null;
      const score = Number(body.score);
      const puzzle = Number(body.puzzle);
      const date = String(body.date || todayISO());

      if (!name) return res.status(400).json({ error: "name required" });
      if (!mode) return res.status(400).json({ error: "invalid mode" });
      if (!Number.isInteger(score) || score < 0 || score > 5) return res.status(400).json({ error: "invalid score" });
      if (!Number.isInteger(puzzle) || puzzle < 1) return res.status(400).json({ error: "invalid puzzle" });
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: "invalid date" });

      await sql`
        INSERT INTO scores (name, mode, score, puzzle, play_date)
        VALUES (${name}, ${mode}, ${score}, ${puzzle}, ${date})
      `;
      return res.status(201).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err: any) {
    console.error("scores api error", err);
    return res.status(500).json({ error: "server error", detail: err?.message });
  }
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
