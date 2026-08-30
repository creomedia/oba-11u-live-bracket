import type { GameRow, ResolvedGame } from "./types";
import { fetchGameChanger } from "./gamechanger";

function winner(game: ResolvedGame): string | null {
  if (game.score_a == null || game.score_b == null || game.score_a === game.score_b) return null;
  return game.score_a > game.score_b ? game.resolved_team_a : game.resolved_team_b;
}
function loser(game: ResolvedGame): string | null {
  if (game.score_a == null || game.score_b == null || game.score_a === game.score_b) return null;
  return game.score_a < game.score_b ? game.resolved_team_a : game.resolved_team_b;
}

function resolveSource(source: string | null, map: Map<string, ResolvedGame>, fallback: string | null): string {
  if (!source) return fallback || "TBD";
  const [kind, key] = source.split(":");
  const sourceGame = map.get(key);
  if (!sourceGame) return kind === "W" ? `Winner Game ${key}` : `Loser Game ${key}`;
  return (kind === "W" ? winner(sourceGame) : loser(sourceGame)) || (kind === "W" ? `Winner Game ${key}` : `Loser Game ${key}`);
}

export async function resolveBracket(rows: GameRow[]): Promise<ResolvedGame[]> {
  const map = new Map<string, ResolvedGame>();
  const output: ResolvedGame[] = [];

  for (const row of [...rows].sort((a,b)=>a.sort_order-b.sort_order)) {
    const resolvedA = resolveSource(row.team_a_source, map, row.team_a);
    const resolvedB = resolveSource(row.team_b_source, map, row.team_b);

    let scoreA = row.score_a;
    let scoreB = row.score_b;
    let status = row.game_status;
    let source: ResolvedGame["source"] = row.is_manual_override ? "manual" : "scheduled";
    let gcStatus: string | null = null;
    let lineScore: unknown = null;

    if (row.gc_game_id && !row.is_manual_override) {
      const gc = await fetchGameChanger(row.gc_game_id);
      if (gc?.score && typeof gc.score.team === "number" && typeof gc.score.opponent_team === "number") {
        const teamScore = gc.score.team;
        const opponentScore = gc.score.opponent_team;
        if (gc.home_away === "away") {
          scoreA = opponentScore;
          scoreB = teamScore;
        } else {
          scoreA = teamScore;
          scoreB = opponentScore;
        }
        status = gc.game_status || status;
        source = "gamechanger";
        gcStatus = gc.game_status || null;
        lineScore = gc.line_score || null;
      }
    }

    const game: ResolvedGame = {
      ...row,
      resolved_team_a: resolvedA,
      resolved_team_b: resolvedB,
      score_a: scoreA,
      score_b: scoreB,
      game_status: status,
      source,
      gc_status: gcStatus,
      line_score: lineScore
    };

    map.set(row.game_key, game);
    output.push(game);
  }
  return output;
}
