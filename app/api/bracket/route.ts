import { NextResponse } from "next/server";
import { getGames, hasDatabase } from "../../../lib/db";
import { resolveBracket } from "../../../lib/bracket";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await getGames();
  const games = await resolveBracket(rows);
  return NextResponse.json({
    tournament: "2026 11U AAA OBA Championship",
    location: "Riverside",
    database_connected: hasDatabase,
    refreshed_at: new Date().toISOString(),
    games
  });
}
