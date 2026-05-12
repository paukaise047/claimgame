# ClaimGame — Politics. Guess it. Get it.

Tägliches Quiz für die deutsche Politik. Zwei Modi:

- **Zitate-Quiz** — Erkenne, welche Bundestagspartei welches Zitat aus dem Wahlprogramm 2025 vertritt
- **Politiker-Quiz** — Erkenne anhand des Fotos, welche:r Bundestagspolitiker:in zu welcher Partei gehört

## Features

- **Tägliches Rätsel** — 5 Fragen, gleich für alle, eine Chance pro Tag (pro Modus)
- **Frei-Spiel-Modus** — nach dem täglichen Rätsel freigeschaltet
- **Wordle-style Sharing** — Emoji-Grid für WhatsApp & Social
- **Streak & Statistik** — pro Modus getrennt
- **Lokales Leaderboard** — Tagesrangliste pro Modus

## Entwicklung

```bash
npm install
npm run dev
```

Öffne dann http://localhost:5173.

## Build

```bash
npm run build
npm run preview
```

## Deployment

- **Vercel** — `vercel` (oder via Dashboard `vercel.com/new` aus dem GitHub-Repo importieren). Vite wird automatisch erkannt.
- **GitHub Pages** — Push auf `main` triggert den Workflow unter `.github/workflows/deploy.yml`. Aktiviere Pages einmalig im Repo unter **Settings → Pages → Source: GitHub Actions**. Die Seite ist danach erreichbar unter `https://<user>.github.io/claimgame/`.

## Hinweise zu den Inhalten

- **Zitate**: paraphrasierte Zusammenfassungen dokumentierter Positionen aus den Wahlprogrammen 2025 (CDU/CSU, SPD, Grüne, FDP, Linke, AfD, BSW). Vor produktivem Einsatz: durch verbatime Zitate mit Seitenreferenzen ersetzen — Datenstruktur in `src/App.tsx` (`source.doc` / `source.page`) ist vorbereitet.
- **Fotos**: Wikimedia Commons Thumbnails (CC-BY-SA / public domain), automatisch vom de.wikipedia-REST-API geladen. Fallback auf neutrale Initialen-Kachel bei Ladeproblemen.
- **„Bekannt für"**: kurze Beschreibung der dokumentierten Rolle, keine fabrizierten Zitate.

## Stack

- Vite + React 18 + TypeScript
- Inline-Styles, Google Fonts (Fraunces + JetBrains Mono)
- LocalStorage für State, Stats und Leaderboard
