"use client";

import { useEffect, useMemo, useState } from "react";
import type { ResolvedGame } from "../lib/types";

type Payload = {
  tournament: string;
  location: string;
  database_connected: boolean;
  refreshed_at: string;
  games: ResolvedGame[];
};

function statusLabel(g: ResolvedGame) {
  const s = (g.game_status || "").toLowerCase();
  if (s === "completed" || s === "final") return "FINAL";
  if (s.includes("live") || s.includes("progress")) return "LIVE";
  return "UPCOMING";
}

function formatTime(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
    timeZone: "America/Toronto"
  }).format(new Date(value));
}

export default function BracketClient() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const res = await fetch("/api/bracket", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load bracket");
      setData(await res.json());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load bracket");
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, []);

  const groups = useMemo(() => {
    const m = new Map<string, ResolvedGame[]>();
    for (const g of data?.games || []) {
      if (!g.enabled) continue;
      if (!m.has(g.round_label)) m.set(g.round_label, []);
      m.get(g.round_label)!.push(g);
    }
    return [...m.entries()];
  }, [data]);

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <div className="eyebrow">Ontario Baseball Association</div>
          <h1>11U AAA<br/>Live Bracket</h1>
          <p>Riverside • September 4–7, 2026 • Double knockout</p>
        </div>
        <div className="liveStamp">
          <span className="pulse"></span>
          {data ? `Updated ${new Date(data.refreshed_at).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}` : "Loading…"}
        </div>
      </header>

      {!data?.database_connected && (
        <div className="notice">Preview mode: connect Neon in Vercel to enable shared admin changes. GameChanger reads still work when IDs are configured in the database.</div>
      )}

      {error && <div className="error">{error}</div>}

      {groups.map(([label, games]) => (
        <section className="round" key={label}>
          <div className="roundTitle"><span>{label}</span><span>{games.length} {games.length === 1 ? "game" : "games"}</span></div>
          <div className="cards">
            {games.map(g => {
              const status = statusLabel(g);
              return (
                <article className={`gameCard ${g.resolved_team_a.includes("Burlington") || g.resolved_team_b.includes("Burlington") ? "burlingtonCard":""}`} key={g.game_key}>
                  <div className="gameTop">
                    <b>GAME {g.game_key}</b>
                    <span className={`status ${status.toLowerCase()}`}>{status}</span>
                  </div>
                  <div className={`teamRow ${g.resolved_team_a.includes("Burlington") ? "burlington":""}`}>
                    <span>{g.resolved_team_a}</span><strong>{g.score_a ?? "—"}</strong>
                  </div>
                  <div className={`teamRow ${g.resolved_team_b.includes("Burlington") ? "burlington":""}`}>
                    <span>{g.resolved_team_b}</span><strong>{g.score_b ?? "—"}</strong>
                  </div>
                  <div className="meta">
                    <span>{formatTime(g.scheduled_at)}</span>
                    <span>{g.field_name}</span>
                  </div>
                  {g.source === "gamechanger" && <div className="gc">GameChanger synced</div>}
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <footer>Unofficial live bracket • Scores may be manually corrected by tournament admin.</footer>
    </main>
  );
}
