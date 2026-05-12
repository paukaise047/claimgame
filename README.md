# ParteiCheck — Wordle für deutsche Politik

Tägliches Quiz: Erkenne, welche Bundestagspartei welches Zitat aus dem Wahlprogramm 2025 vertritt.

- **Tägliches Rätsel** — 5 Zitate, gleich für alle, eine Chance pro Tag
- **Frei-Spiel-Modus** — nach dem täglichen Rätsel freigeschaltet
- **Wordle-style Sharing** — Emoji-Grid für WhatsApp & Social
- **Streak & Statistik** — wie bei Wordle
- **Lokales Leaderboard** — Tagesrangliste

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

## Deployment (GitHub Pages)

Push auf `main` triggert den Workflow unter `.github/workflows/deploy.yml`. Aktiviere Pages einmalig im Repo unter **Settings → Pages → Source: GitHub Actions**. Die Seite ist danach erreichbar unter `https://<user>.github.io/claimgame/`.

## Wichtiger Hinweis zu den Zitaten

Die Zitate im Prototyp sind **paraphrasierte Zusammenfassungen** dokumentierter Positionen aus den Wahlprogrammen 2025 (CDU/CSU, SPD, Grüne, FDP, Linke, AfD, BSW). Die Datenstruktur in `src/App.tsx` enthält `source.doc` und `source.page` Felder für verbatime Zitate mit Seitenreferenzen — vor jedem produktiven Einsatz müssen die Texte gegen die offiziellen PDFs geprüft und ersetzt werden.

## Stack

- Vite + React 18 + TypeScript
- Inline-Styles (kein Tailwind/Setup nötig)
- Google Fonts: Fraunces (Display) + JetBrains Mono
- LocalStorage für State, Stats und Leaderboard
