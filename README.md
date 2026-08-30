# 2026 11U AAA OBA Live Bracket

Mobile-first live bracket for the 2026 11U AAA OBA Championship in Riverside.

## Included

- Official Games 1–21 draw
- Conditional OBA championship paths: 22A/23A and 22B/23B
- Automatic winner/loser propagation through the bracket
- Manual Round 5 re-pairing
- Public GameChanger score synchronization
- Manual score override
- Password-protected admin update API
- Neon Postgres persistence
- Public bracket auto-refresh every 15 seconds

## 1. Upload this project to GitHub

Upload the CONTENTS of this folder to:

`creomedia/oba-11u-live-bracket`

`package.json` should be at the root of the GitHub repo.

## 2. Import the repo into Vercel

In Vercel:

1. Add New → Project
2. Import `creomedia/oba-11u-live-bracket`
3. Framework should auto-detect as Next.js
4. Do not deploy yet if you want the database ready first.

## 3. Add a Neon database

In the Vercel project:

1. Storage / Integrations → Neon Postgres
2. Create or connect a database.
3. Make sure Vercel adds `DATABASE_URL` to the project environment.

Run:

- `scripts/schema.sql`
- then `scripts/seed.sql`

against that Neon database.

Without a database, the public bracket still renders in preview mode but admin changes are not persistent.

## 4. Add admin password

In Vercel → Project Settings → Environment Variables:

`ADMIN_PASSWORD` = choose a private password

Do not commit the real password to GitHub.

## 5. Deploy

Deploy the project. Public bracket is at `/`.

Admin screen is at:

`/admin`

## GameChanger workflow

For each tournament game:

1. Open the specific GameChanger game page.
2. Copy the game UUID from the URL.
3. Open `/admin`.
4. Paste the UUID into the matching tournament game.
5. Make sure `Manual override` is OFF.
6. Save.

The app reads:

`https://api.team-manager.gc.com/public/game-stream-processing/{GAME_ID}/details?include=line_scores`

The public bracket refreshes every 15 seconds.

## Manual override

Use Manual override when:

- GameChanger is unavailable
- score needs correction
- Round 5 OBA re-pairing is announced
- the 3-team championship draw is announced

For Games 20/21 and Path B, enter the actual team names in admin after OBA announces the pairing.

## Important GameChanger mapping note

The feed describes the score from the perspective of the GameChanger team whose page generated the game. The code uses the feed's `home_away` property to map the scores. During the next live Burlington game, verify this mapping once before relying on it tournament-wide.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Security

This project uses only the public GameChanger game-data endpoint. It does not require or store GameChanger passwords, cookies, session tokens, or authenticated account data.
