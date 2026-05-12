import { useEffect, useMemo, useState } from "react";

// ---------- Parties ----------
const PARTIES = {
  CDU:    { name: "CDU/CSU", color: "#000000", fg: "#ffffff" },
  SPD:    { name: "SPD",     color: "#E3000F", fg: "#ffffff" },
  GRUENE: { name: "Grüne",   color: "#1AA037", fg: "#ffffff" },
  FDP:    { name: "FDP",     color: "#FFED00", fg: "#000000" },
  LINKE:  { name: "Linke",   color: "#BE3075", fg: "#ffffff" },
  AFD:    { name: "AfD",     color: "#0489DB", fg: "#ffffff" },
  BSW:    { name: "BSW",     color: "#7A1F8C", fg: "#ffffff" },
} as const;
type PartyId = keyof typeof PARTIES;

type Mode = "quotes" | "politicians";
const MODE_LABEL: Record<Mode, string> = { quotes: "Zitate", politicians: "Politiker" };

// ---------- Quote data ----------
// Paraphrased summaries of documented 2025 Bundestagswahl program positions.
// Replace `text` with verbatim wording + `source.page` before launch.
type Quote = {
  id: string;
  text: string;
  party: PartyId;
  topic: string;
  context: string;
  source: { doc: string; page?: string };
};

const QUOTES: Quote[] = [
  { id: "q01", party: "CDU",    topic: "Wirtschaft",
    text: "Wir wollen den Solidaritätszuschlag vollständig abschaffen und Unternehmenssteuern auf maximal 25 Prozent senken.",
    context: "Klassische angebotsorientierte Wirtschaftspolitik: Entlastung von Unternehmen und Spitzenverdienern als Wachstumsmotor.",
    source: { doc: "Wahlprogramm 2025", page: "S. ?" } },
  { id: "q02", party: "SPD",    topic: "Soziales",
    text: "Wir führen einen Mindestlohn von 15 Euro pro Stunde ein und stabilisieren das Rentenniveau bei 48 Prozent.",
    context: "Sozialdemokratisches Kernanliegen: Stärkung von Arbeitnehmerrechten und gesetzlicher Rente.",
    source: { doc: "Regierungsprogramm 2025", page: "S. ?" } },
  { id: "q03", party: "GRUENE", topic: "Klima",
    text: "Wir beschleunigen den Ausbau erneuerbarer Energien auf 100 Prozent bis 2035 und schaffen ein Klimageld zur sozialen Entlastung.",
    context: "Kombination aus Dekarbonisierung und Rückverteilung der CO₂-Bepreisung an Haushalte.",
    source: { doc: "Wahlprogramm 2025", page: "S. ?" } },
  { id: "q04", party: "FDP",    topic: "Finanzen",
    text: "Die Schuldenbremse ist unverhandelbar. Wir lehnen neue Steuern ab und entlasten die arbeitende Mitte durch ein einfacheres Steuersystem.",
    context: "Liberale Haushaltsorthodoxie: keine zusätzliche Verschuldung, Vereinfachung statt Umverteilung.",
    source: { doc: "Wahlprogramm 2025", page: "S. ?" } },
  { id: "q05", party: "LINKE",  topic: "Vermögen",
    text: "Wir führen eine Vermögenssteuer auf Vermögen über einer Million Euro ein und deckeln Mieten bundesweit.",
    context: "Umverteilung von oben nach unten, kombiniert mit starken Eingriffen in den Wohnungsmarkt.",
    source: { doc: "Wahlprogramm 2025", page: "S. ?" } },
  { id: "q06", party: "AFD",    topic: "Migration",
    text: "Wir fordern eine konsequente Zurückweisung an den deutschen Grenzen und den Ausstieg aus dem europäischen Asylsystem.",
    context: "Restriktive Migrationspolitik mit Bruch geltenden EU-Rechts als Programmpunkt.",
    source: { doc: "Wahlprogramm 2025", page: "S. ?" } },
  { id: "q07", party: "BSW",    topic: "Außenpolitik",
    text: "Wir lehnen Waffenlieferungen in Kriegsgebiete ab und setzen auf diplomatische Verhandlungen statt militärischer Eskalation.",
    context: "Pazifistisch-skeptische Außenpolitik, klare Abgrenzung von der Linie der Ampel und der Union.",
    source: { doc: "Gründungsmanifest 2024", page: "S. ?" } },
  { id: "q08", party: "GRUENE", topic: "Verkehr",
    text: "Wir investieren massiv in die Schiene und führen ein dauerhaftes 49-Euro-Ticket fort.",
    context: "Modal Shift: weg vom Auto, hin zu öffentlichem Verkehr.",
    source: { doc: "Wahlprogramm 2025", page: "S. ?" } },
  { id: "q09", party: "CDU",    topic: "Migration",
    text: "Wer arbeitsfähig ist und Bürgergeld bezieht, soll bei Verweigerung zumutbarer Arbeit deutlich stärker sanktioniert werden.",
    context: "Verschärfung der Mitwirkungspflichten beim Bürgergeld als Abgrenzung zur Ampel-Reform.",
    source: { doc: "Wahlprogramm 2025", page: "S. ?" } },
  { id: "q10", party: "SPD",    topic: "Wohnen",
    text: "Wir bauen 400.000 neue Wohnungen pro Jahr, davon 100.000 sozial gefördert, und verlängern die Mietpreisbremse.",
    context: "Quantitative Bauoffensive plus mietrechtliche Schutzinstrumente.",
    source: { doc: "Regierungsprogramm 2025", page: "S. ?" } },
  { id: "q11", party: "FDP",    topic: "Bildung",
    text: "Wir wollen ein bundesweites Digitalpakt 2.0 und Bildungsgutscheine, die Eltern echte Wahlfreiheit zwischen Schulen geben.",
    context: "Liberale Bildungspolitik: Wettbewerb und Wahlfreiheit statt zentraler Steuerung.",
    source: { doc: "Wahlprogramm 2025", page: "S. ?" } },
  { id: "q12", party: "LINKE",  topic: "Gesundheit",
    text: "Wir schaffen die Zwei-Klassen-Medizin ab und führen eine solidarische Bürgerversicherung für alle ein.",
    context: "Zusammenführung von gesetzlicher und privater Krankenversicherung in einem System.",
    source: { doc: "Wahlprogramm 2025", page: "S. ?" } },
  { id: "q13", party: "AFD",    topic: "Klima",
    text: "Wir beenden die einseitige deutsche Energiewende, kehren zur Kernkraft zurück und treten aus dem Pariser Abkommen aus.",
    context: "Ablehnung der internationalen Klimapolitik als programmatische Kernposition.",
    source: { doc: "Wahlprogramm 2025", page: "S. ?" } },
  { id: "q14", party: "BSW",    topic: "Wirtschaft",
    text: "Wir fordern bezahlbare Energie für Industrie und Haushalte – auch durch Wiederaufnahme der Gaslieferungen aus Russland.",
    context: "Wirtschaftspolitik mit ausdrücklicher Öffnung gegenüber russischen Energieträgern.",
    source: { doc: "Wahlprogramm 2025", page: "S. ?" } },
  { id: "q15", party: "CDU",    topic: "Sicherheit",
    text: "Wir stärken die Bundeswehr durch verbindliche Erfüllung des 2-Prozent-Ziels und prüfen die Wiedereinführung einer allgemeinen Dienstpflicht.",
    context: "Konservativer Sicherheits- und Verteidigungsfokus mit Dienstpflicht-Debatte.",
    source: { doc: "Wahlprogramm 2025", page: "S. ?" } },
];

// ---------- Politician data ----------
// `imageUrl` left undefined intentionally. Drop in verified Wikimedia Commons
// thumbnail URLs (e.g. https://commons.wikimedia.org/wiki/Special:FilePath/<File>?width=400)
// after checking each photo's license. Until then, the Avatar component falls
// back to a neutral initials tile so nothing breaks during the demo.
// `knownFor` describes documented political role/profile — not a fabricated quote.
type Politician = {
  id: string;
  name: string;
  party: PartyId;
  role: string;
  knownFor: string;
  imageUrl?: string;
};

// Image URLs are de.wikipedia.org REST API thumbnails (upload.wikimedia.org CDN).
// Each is the infobox photo from the politician's German Wikipedia page; licenses
// are CC-BY-SA / public domain via Wikimedia Commons. Verify each before launch.
const POLITICIANS: Politician[] = [
  { id: "p01", name: "Carsten Linnemann", party: "CDU",
    role: "CDU-Generalsekretär, MdB",
    knownFor: "Wirtschaftspolitischer Hardliner, treibende Stimme bei Bürgergeld-Verschärfung.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/2025-02-23_Bundestagswahl_%E2%80%93_Wahlabend_CDU_by_Sandro_Halank%E2%80%93052.jpg/330px-2025-02-23_Bundestagswahl_%E2%80%93_Wahlabend_CDU_by_Sandro_Halank%E2%80%93052.jpg" },
  { id: "p02", name: "Thorsten Frei", party: "CDU",
    role: "Erster Parlamentarischer Geschäftsführer der Union",
    knownFor: "Profilierte sich mit Vorstoß für einen Migrations-Mechanismus mit jährlicher Obergrenze.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Thorsten_Frei_2023_%28cropped%29.jpg/330px-Thorsten_Frei_2023_%28cropped%29.jpg" },
  { id: "p03", name: "Saskia Esken", party: "SPD",
    role: "SPD-Bundesvorsitzende",
    knownFor: "Verteidigt linken Parteiflügel; Schwerpunkte Digitalisierung und Bildung.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2025-05-05_Unterzeichnung_des_Koalitionsvertrages_der_21._Wahlperiode_des_Bundestages_by_Sandro_Halank%E2%80%93032.jpg/330px-2025-05-05_Unterzeichnung_des_Koalitionsvertrages_der_21._Wahlperiode_des_Bundestages_by_Sandro_Halank%E2%80%93032.jpg" },
  { id: "p04", name: "Rolf Mützenich", party: "SPD",
    role: "Vorsitzender der SPD-Bundestagsfraktion",
    knownFor: "Skeptisch gegenüber Waffenlieferungen, Befürworter einer diplomatischen Linie.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Rolf_M%C3%BCtzenich_2023.jpg/330px-Rolf_M%C3%BCtzenich_2023.jpg" },
  { id: "p05", name: "Britta Haßelmann", party: "GRUENE",
    role: "Fraktionsvorsitzende Bündnis 90/Die Grünen",
    knownFor: "Erfahrene Parlamentarierin, Stimme für Klimainvestitionen und Demokratiestärkung.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Maischberger_-_2025-11-04-5281.jpg/330px-Maischberger_-_2025-11-04-5281.jpg" },
  { id: "p06", name: "Omid Nouripour", party: "GRUENE",
    role: "Außenpolitischer Sprecher, ehem. Parteivorsitzender",
    knownFor: "Außenpolitik-Experte mit Fokus auf Iran, transatlantische Beziehungen, Ukraine-Unterstützung.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Omid_Nouripour_-_1_%28cropped%29.jpg/330px-Omid_Nouripour_-_1_%28cropped%29.jpg" },
  { id: "p07", name: "Bettina Stark-Watzinger", party: "FDP",
    role: "Ehem. Bundesministerin für Bildung und Forschung",
    knownFor: "Liberale Bildungspolitik, BAföG-Reform; öffentliche Debatte um Förderaffäre.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Bettina_Stark-Watzinger_%282024%29.jpg/330px-Bettina_Stark-Watzinger_%282024%29.jpg" },
  { id: "p08", name: "Konstantin Kuhle", party: "FDP",
    role: "Stellv. Fraktionsvorsitzender FDP, Innen- und Rechtspolitik",
    knownFor: "Liberale Stimme bei Bürgerrechten, Sicherheitsgesetzen und Demokratiefragen.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/2020-02-14_Konstantin_Kuhle_%28KPFC%29_01.jpg/330px-2020-02-14_Konstantin_Kuhle_%28KPFC%29_01.jpg" },
  { id: "p09", name: "Heidi Reichinnek", party: "LINKE",
    role: "Co-Fraktionsvorsitzende Die Linke",
    knownFor: "Wurde durch virale Bundestagsrede gegen Rechts bundesweit bekannt.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/2025-01-18_Au%C3%9Ferordentlicher_Bundesparteitag_Die_Linke_2025_in_Berlin_by_Sandro_Halank%E2%80%93197.jpg/330px-2025-01-18_Au%C3%9Ferordentlicher_Bundesparteitag_Die_Linke_2025_in_Berlin_by_Sandro_Halank%E2%80%93197.jpg" },
  { id: "p10", name: "Sören Pellmann", party: "LINKE",
    role: "Direkt gewählter MdB Leipzig II",
    knownFor: "Ostdeutsche Stimme der Linken, Schwerpunkt Soziales und Inklusion.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/2025-01-18_Au%C3%9Ferordentlicher_Bundesparteitag_Die_Linke_2025_in_Berlin_by_Sandro_Halank%E2%80%93027.jpg/330px-2025-01-18_Au%C3%9Ferordentlicher_Bundesparteitag_Die_Linke_2025_in_Berlin_by_Sandro_Halank%E2%80%93027.jpg" },
  { id: "p11", name: "Bernd Baumann", party: "AFD",
    role: "Erster Parlamentarischer Geschäftsführer AfD-Fraktion",
    knownFor: "Profilierter Geschäftsordnungs-Stratege der Fraktion; harte Migrationslinie.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Bernd_Baumann-8845.jpg/330px-Bernd_Baumann-8845.jpg" },
  { id: "p12", name: "Stephan Brandner", party: "AFD",
    role: "Stellv. Bundessprecher AfD, MdB",
    knownFor: "Polarisierende Auftritte im Bundestag und in Talkshows, Rechtspolitik.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Stephan_Brandner_%282017%29.jpg/330px-Stephan_Brandner_%282017%29.jpg" },
  { id: "p13", name: "Sahra Wagenknecht", party: "BSW",
    role: "Vorsitzende des Bündnis Sahra Wagenknecht",
    knownFor: "Gründerin des BSW; wirtschaftlich links, kulturell konservativ, friedenspolitisch.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/2025-04-29-Sahra_Wagenknecht-Maischberger-3041.jpg/330px-2025-04-29-Sahra_Wagenknecht-Maischberger-3041.jpg" },
  { id: "p14", name: "Amira Mohamed Ali", party: "BSW",
    role: "Co-Vorsitzende BSW",
    knownFor: "Ehem. Linken-Fraktionsvorsitzende, jetzt Mitgründerin und Co-Spitze des BSW.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Hart_aber_fair_2024-08-05-0454.jpg/330px-Hart_aber_fair_2024-08-05-0454.jpg" },
];

// ---------- Daily helpers (mode-aware) ----------
const DAILY_LENGTH = 5;
const LAUNCH_DATE = "2025-01-01";

function todayKey(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function puzzleNumber(dateStr: string) {
  const a = new Date(LAUNCH_DATE + "T00:00:00").getTime();
  const b = new Date(dateStr   + "T00:00:00").getTime();
  return Math.max(1, Math.floor((b - a) / 86400000) + 1);
}
function seededShuffle<T>(arr: T[], seedStr: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
  let s = h >>> 0;
  const rand = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function pickDailyQuotes(dateStr: string): Quote[] {
  return seededShuffle(QUOTES, "parteicheck-quotes-" + dateStr).slice(0, DAILY_LENGTH);
}
function pickDailyPoliticians(dateStr: string): Politician[] {
  return seededShuffle(POLITICIANS, "parteicheck-politicians-" + dateStr).slice(0, DAILY_LENGTH);
}

// ---------- Storage (mode-aware) ----------
type DailyState = { date: string; guesses: PartyId[]; finished: boolean };
type Stats = { played: number; wins: number; correct: number; total: number; streak: number; maxStreak: number; lastDate: string | null };
type BoardEntry = { name: string; score: number; date: string; puzzle: number };

const LS_NAME = "parteicheck.name.v1";
const dailyKey = (m: Mode) => `parteicheck.daily.${m}.v1`;
const statsKey = (m: Mode) => `parteicheck.stats.${m}.v1`;
const boardKey = (m: Mode) => `parteicheck.board.${m}.v1`;

function loadDaily(mode: Mode, date: string): DailyState {
  try {
    const raw = localStorage.getItem(dailyKey(mode));
    if (raw) { const p = JSON.parse(raw) as DailyState; if (p.date === date) return p; }
  } catch {}
  return { date, guesses: [], finished: false };
}
function saveDaily(mode: Mode, s: DailyState) { try { localStorage.setItem(dailyKey(mode), JSON.stringify(s)); } catch {} }

const defaultStats: Stats = { played: 0, wins: 0, correct: 0, total: 0, streak: 0, maxStreak: 0, lastDate: null };
function loadStats(mode: Mode): Stats { try { const r = localStorage.getItem(statsKey(mode)); return r ? { ...defaultStats, ...JSON.parse(r) } : defaultStats; } catch { return defaultStats; } }
function saveStats(mode: Mode, s: Stats) { try { localStorage.setItem(statsKey(mode), JSON.stringify(s)); } catch {} }

function loadBoard(mode: Mode): BoardEntry[] { try { return JSON.parse(localStorage.getItem(boardKey(mode)) || "[]"); } catch { return []; } }
function saveBoard(mode: Mode, b: BoardEntry[]) { try { localStorage.setItem(boardKey(mode), JSON.stringify(b)); } catch {} }

// ---------- Countdown ----------
function useCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const t = new Date(); t.setHours(24, 0, 0, 0);
  const ms = Math.max(0, t.getTime() - now);
  const h = Math.floor(ms / 3.6e6), m = Math.floor((ms % 3.6e6) / 6e4), s = Math.floor((ms % 6e4) / 1000);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

// ---------- Avatar ----------
function Avatar({ politician, size = 220, hideName = true }: { politician: Politician; size?: number; hideName?: boolean }) {
  const [errored, setErrored] = useState(false);
  const initials = politician.name.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase();
  // Neutral palette so the avatar never leaks the party.
  const bg = "#1a1a1a";
  const fg = "#F5F1E8";
  if (politician.imageUrl && !errored) {
    return (
      <img
        src={politician.imageUrl}
        alt={hideName ? "Politiker:in" : politician.name}
        onError={() => setErrored(true)}
        loading="lazy"
        style={{ width: size, height: size, objectFit: "cover", objectPosition: "center top",
                 display: "block", border: "2px solid #0A0A0A" }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, background: bg, color: fg,
      border: "2px solid #0A0A0A", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Fraunces', Georgia, serif", fontSize: size * 0.32, fontWeight: 900,
      letterSpacing: "0.05em",
      position: "relative",
    }}>
      {hideName ? "?" : initials}
      <div style={{
        position: "absolute", bottom: 6, right: 8,
        fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
        textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.6,
      }}>
        Foto folgt
      </div>
    </div>
  );
}

// ---------- App ----------
type View = "home" | "daily" | "result" | "free" | "stats" | "board";

export default function ParteiCheck() {
  const date = todayKey();
  const puzzleNo = puzzleNumber(date);
  const dailyQuotes = useMemo(() => pickDailyQuotes(date), [date]);
  const dailyPoliticians = useMemo(() => pickDailyPoliticians(date), [date]);

  const [view, setView] = useState<View>("home");
  const [mode, setMode] = useState<Mode>("quotes");
  const [stateQ, setStateQ] = useState<DailyState>(() => loadDaily("quotes", date));
  const [stateP, setStateP] = useState<DailyState>(() => loadDaily("politicians", date));
  const [name, setName] = useState<string>(() => localStorage.getItem(LS_NAME) || "");
  const countdown = useCountdown();

  // free play
  const [freeIdx, setFreeIdx] = useState(0);
  const [freeGuess, setFreeGuess] = useState<PartyId | null>(null);
  const freeQuotes = useMemo(() => seededShuffle(QUOTES, "free-q-" + Math.random()).slice(0, 10), [view === "free" && mode === "quotes" ? 1 : 0]);
  const freePoliticians = useMemo(() => seededShuffle(POLITICIANS, "free-p-" + Math.random()).slice(0, 10), [view === "free" && mode === "politicians" ? 1 : 0]);

  useEffect(() => { try { localStorage.setItem(LS_NAME, name); } catch {} }, [name]);

  // Helpers bound to current mode
  const isQuoteMode = mode === "quotes";
  const dailyList: { party: PartyId; topic?: string }[] = isQuoteMode ? dailyQuotes : dailyPoliticians;
  const state = isQuoteMode ? stateQ : stateP;
  const setState = isQuoteMode ? setStateQ : setStateP;
  const currentIdx = state.guesses.length;
  const score = state.guesses.reduce((acc, g, i) => acc + (g === dailyList[i].party ? 1 : 0), 0);

  function submitDailyGuess(p: PartyId) {
    if (state.finished) return;
    const next: DailyState = { ...state, guesses: [...state.guesses, p] };
    if (next.guesses.length >= dailyList.length) {
      next.finished = true;
      const correctNow = next.guesses.reduce((a, g, i) => a + (g === dailyList[i].party ? 1 : 0), 0);
      const s = loadStats(mode);
      s.played += 1;
      s.correct += correctNow;
      s.total += dailyList.length;
      if (correctNow === dailyList.length) s.wins += 1;
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yKey = todayKey(yesterday);
      s.streak = s.lastDate === yKey || s.lastDate === date ? s.streak + (s.lastDate === date ? 0 : 1) : 1;
      s.maxStreak = Math.max(s.maxStreak, s.streak);
      s.lastDate = date;
      saveStats(mode, s);
      if (name.trim()) {
        const b = loadBoard(mode);
        b.push({ name: name.trim(), score: correctNow, date, puzzle: puzzleNo });
        saveBoard(mode, b);
      }
    }
    setState(next); saveDaily(mode, next);
    if (next.finished) setTimeout(() => setView("result"), 250);
  }

  function shareText() {
    const grid = state.guesses.map((g, i) => g === dailyList[i].party ? "🟩" : "🟥").join("");
    const label = isQuoteMode ? "Zitate" : "Politiker";
    return `ParteiCheck ${label} #${puzzleNo}  ${score}/${dailyList.length}\n${grid}\nparteicheck.de`;
  }
  async function doShare() {
    const txt = shareText();
    if ((navigator as any).share) { try { await (navigator as any).share({ text: txt }); return; } catch {} }
    try { await navigator.clipboard.writeText(txt); alert("Ergebnis kopiert!"); } catch { alert(txt); }
  }
  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText())}`, "_blank");
  }

  // ---------- styles ----------
  const C = { bg: "#F5F1E8", ink: "#0A0A0A", paper: "#FFFDF7", muted: "#6B6457", line: "#0A0A0A" };
  const wrap: React.CSSProperties = { minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: "'Fraunces', Georgia, serif", padding: "24px 16px" };
  const container: React.CSSProperties = { maxWidth: 640, margin: "0 auto" };
  const card: React.CSSProperties = { background: C.paper, border: `2px solid ${C.line}`, boxShadow: `6px 6px 0 ${C.line}`, padding: 24, marginBottom: 16 };
  const btn: React.CSSProperties = { background: C.ink, color: "#fff", border: `2px solid ${C.line}`, padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em" };
  const btnGhost: React.CSSProperties = { ...btn, background: "transparent", color: C.ink };
  const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted };
  const h1: React.CSSProperties = { fontSize: 44, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1, margin: 0 };

  function ModeCard({ m, badge }: { m: Mode; badge?: string }) {
    const ms = m === "quotes" ? stateQ : stateP;
    const list = m === "quotes" ? dailyQuotes : dailyPoliticians;
    const sc = ms.guesses.reduce((a, g, i) => a + (g === list[i].party ? 1 : 0), 0);
    const title = m === "quotes" ? "Zitate-Quiz" : "Politiker-Quiz";
    const subtitle = m === "quotes"
      ? "Welche Partei sagt was?"
      : "Welche Partei ist welche:r Abgeordnete?";
    return (
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={mono}>{title}{badge ? ` · ${badge}` : ""}</div>
          <div style={mono}>Nr. {puzzleNo}</div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, margin: "8px 0 6px", lineHeight: 1.2 }}>
          {ms.finished ? `${sc}/${list.length} richtig` : subtitle}
        </div>
        <div style={{ ...mono, marginBottom: 12 }}>5 Fragen · eine Chance pro Tag</div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${DAILY_LENGTH}, 1fr)`, gap: 6, marginBottom: 16 }}>
          {list.map((_, i) => {
            const done = i < ms.guesses.length;
            const ok = done && ms.guesses[i] === list[i].party;
            return <div key={i} style={{ height: 32, border: `2px solid ${C.line}`, background: done ? (ok ? "#1AA037" : "#E3000F") : C.paper }} />;
          })}
        </div>
        {!ms.finished ? (
          <button style={{ ...btn, width: "100%" }} onClick={() => { setMode(m); setView("daily"); }}>
            {ms.guesses.length === 0 ? "Starten" : "Weiterspielen"}
          </button>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button style={btn} onClick={() => { setMode(m); setView("result"); }}>Ergebnis</button>
            <button style={btnGhost} onClick={() => { setMode(m); setFreeIdx(0); setFreeGuess(null); setView("free"); }}>Frei spielen</button>
          </div>
        )}
      </div>
    );
  }

  // ---------- HOME ----------
  if (view === "home") {
    return (
      <div style={wrap}>
        <div style={container}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
            <div style={mono}>Bundestagswahl · Quiz</div>
            <div style={mono}>{date}</div>
          </div>
          <h1 style={h1}>ParteiCheck</h1>
          <div style={{ ...mono, marginTop: 8, marginBottom: 24 }}>Wordle für die deutsche Politik</div>

          <ModeCard m="quotes" />
          <ModeCard m="politicians" badge="NEU" />

          <div style={{ ...mono, textAlign: "center", marginBottom: 16 }}>
            Nächste Rätsel in <span style={{ color: C.ink, fontWeight: 700 }}>{countdown}</span>
          </div>

          <div style={card}>
            <div style={mono}>Dein Name (für Leaderboard)</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Anna"
              style={{ width: "100%", padding: "10px 12px", border: `2px solid ${C.line}`, background: C.paper, fontFamily: "'JetBrains Mono', monospace", fontSize: 14, marginTop: 8 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button style={btnGhost} onClick={() => setView("stats")}>Statistik</button>
            <button style={btnGhost} onClick={() => setView("board")}>Leaderboard</button>
          </div>

          <div style={{ ...mono, marginTop: 24, textAlign: "center", lineHeight: 1.7 }}>
            Zitate basieren auf dokumentierten Positionen aus den<br />Wahlprogrammen 2025. Hackathon-Prototyp.
            <br />Fotos: Wikimedia Commons (CC-BY-SA)
          </div>
        </div>
      </div>
    );
  }

  // ---------- DAILY (quotes) ----------
  if (view === "daily" && isQuoteMode && currentIdx < dailyQuotes.length) {
    const q = dailyQuotes[currentIdx];
    return (
      <div style={wrap}>
        <div style={container}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <button style={{ ...btnGhost, padding: "6px 10px", fontSize: 11 }} onClick={() => setView("home")}>← Zurück</button>
            <div style={mono}>Zitate #{puzzleNo} · {currentIdx + 1}/{dailyQuotes.length}</div>
          </div>
          <ProgressBar list={dailyQuotes} guesses={state.guesses} cur={currentIdx} C={C} />
          <div style={card}>
            <div style={mono}>Thema · {q.topic}</div>
            <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.3, margin: "16px 0", fontStyle: "italic" }}>
              „{q.text}"
            </div>
            <div style={{ ...mono, marginBottom: 16 }}>Welche Partei?</div>
            <PartyButtons onPick={submitDailyGuess} C={C} />
          </div>
        </div>
      </div>
    );
  }

  // ---------- DAILY (politicians) ----------
  if (view === "daily" && !isQuoteMode && currentIdx < dailyPoliticians.length) {
    const p = dailyPoliticians[currentIdx];
    return (
      <div style={wrap}>
        <div style={container}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <button style={{ ...btnGhost, padding: "6px 10px", fontSize: 11 }} onClick={() => setView("home")}>← Zurück</button>
            <div style={mono}>Politiker #{puzzleNo} · {currentIdx + 1}/{dailyPoliticians.length}</div>
          </div>
          <ProgressBar list={dailyPoliticians} guesses={state.guesses} cur={currentIdx} C={C} />
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <Avatar politician={p} size={240} hideName />
            </div>
            <div style={{ ...mono, marginBottom: 16, textAlign: "center" }}>Welche Partei?</div>
            <PartyButtons onPick={submitDailyGuess} C={C} />
          </div>
        </div>
      </div>
    );
  }

  // ---------- RESULT ----------
  if (view === "result") {
    const grid = state.guesses.map((g, i) => g === dailyList[i].party ? "🟩" : "🟥").join("");
    const label = isQuoteMode ? "Zitate" : "Politiker";
    return (
      <div style={wrap}>
        <div style={container}>
          <div style={mono}>{label} · Rätsel #{puzzleNo}</div>
          <h1 style={{ ...h1, margin: "8px 0 24px" }}>{score}/{dailyList.length}</h1>
          <div style={card}>
            <div style={{ fontSize: 48, textAlign: "center", letterSpacing: "0.1em", marginBottom: 16 }}>{grid}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <button style={btn} onClick={doShare}>Teilen</button>
              <button style={{ ...btn, background: "#25D366" }} onClick={shareWhatsApp}>WhatsApp</button>
            </div>
            <div style={{ ...mono, textAlign: "center", marginTop: 12 }}>
              Nächstes Rätsel in <span style={{ color: C.ink, fontWeight: 700 }}>{countdown}</span>
            </div>
          </div>

          <div style={card}>
            <div style={mono}>Auflösung</div>
            {isQuoteMode
              ? dailyQuotes.map((q, i) => {
                  const guess = state.guesses[i];
                  const ok = guess === q.party;
                  const gp = PARTIES[guess], rp = PARTIES[q.party];
                  return (
                    <div key={q.id} style={{ borderTop: `1px solid ${C.line}`, paddingTop: 12, marginTop: 12 }}>
                      <div style={mono}>Frage {i + 1} · {q.topic}</div>
                      <div style={{ fontStyle: "italic", margin: "6px 0", lineHeight: 1.4 }}>„{q.text}"</div>
                      <GuessRow ok={ok} gp={gp} rp={rp} />
                      <div style={{ fontSize: 13, marginTop: 8, color: C.muted, lineHeight: 1.5 }}>{q.context}</div>
                    </div>
                  );
                })
              : dailyPoliticians.map((p, i) => {
                  const guess = state.guesses[i];
                  const ok = guess === p.party;
                  const gp = PARTIES[guess], rp = PARTIES[p.party];
                  return (
                    <div key={p.id} style={{ borderTop: `1px solid ${C.line}`, paddingTop: 12, marginTop: 12 }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <Avatar politician={p} size={72} hideName={false} />
                        <div style={{ flex: 1 }}>
                          <div style={mono}>Frage {i + 1}</div>
                          <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2, marginTop: 4 }}>{p.name}</div>
                          <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{p.role}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 10 }}><GuessRow ok={ok} gp={gp} rp={rp} /></div>
                      <div style={{ fontSize: 13, marginTop: 8, color: C.muted, lineHeight: 1.5 }}>
                        <b style={{ color: C.ink, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>Bekannt für · </b>{p.knownFor}
                      </div>
                    </div>
                  );
                })
            }
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button style={btn} onClick={() => { setFreeIdx(0); setFreeGuess(null); setView("free"); }}>Frei weiterspielen</button>
            <button style={btnGhost} onClick={() => setView("home")}>Startseite</button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- FREE PLAY ----------
  if (view === "free") {
    const pool = isQuoteMode ? freeQuotes : freePoliticians;
    const item = pool[freeIdx];
    if (!item) {
      return (
        <div style={wrap}><div style={container}>
          <div style={card}>
            <h1 style={h1}>Runde fertig</h1>
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button style={btn} onClick={() => { setFreeIdx(0); setFreeGuess(null); setView(view); }}>Noch eine Runde</button>
              <button style={btnGhost} onClick={() => setView("home")}>Startseite</button>
            </div>
          </div>
        </div></div>
      );
    }
    return (
      <div style={wrap}><div style={container}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <button style={{ ...btnGhost, padding: "6px 10px", fontSize: 11 }} onClick={() => setView("home")}>← Zurück</button>
          <div style={mono}>Frei · {MODE_LABEL[mode]} · {freeIdx + 1}/{pool.length}</div>
        </div>
        <div style={card}>
          {isQuoteMode ? (
            <>
              <div style={mono}>Thema · {(item as Quote).topic}</div>
              <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, margin: "16px 0", fontStyle: "italic" }}>„{(item as Quote).text}"</div>
            </>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <Avatar politician={item as Politician} size={200} hideName={!freeGuess} />
            </div>
          )}
          {!freeGuess ? (
            <PartyButtons onPick={(p) => setFreeGuess(p)} C={C} />
          ) : (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                {freeGuess === item.party ? "Richtig ✓" : `Falsch — es war ${PARTIES[item.party].name}`}
              </div>
              {!isQuoteMode && (
                <div style={{ fontSize: 16, fontWeight: 700, margin: "4px 0" }}>{(item as Politician).name}</div>
              )}
              <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.5, marginBottom: 16 }}>
                {isQuoteMode ? (item as Quote).context : (item as Politician).knownFor}
              </div>
              <button style={btn} onClick={() => { setFreeGuess(null); setFreeIdx(freeIdx + 1); }}>Nächste Frage →</button>
            </div>
          )}
        </div>
      </div></div>
    );
  }

  // ---------- STATS ----------
  if (view === "stats") {
    return (
      <div style={wrap}><div style={container}>
        <button style={{ ...btnGhost, padding: "6px 10px", fontSize: 11, marginBottom: 16 }} onClick={() => setView("home")}>← Zurück</button>
        <h1 style={h1}>Statistik</h1>
        <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
          <button style={{ ...btn, flex: 1, background: mode === "quotes" ? C.ink : "transparent", color: mode === "quotes" ? "#fff" : C.ink }} onClick={() => setMode("quotes")}>Zitate</button>
          <button style={{ ...btn, flex: 1, background: mode === "politicians" ? C.ink : "transparent", color: mode === "politicians" ? "#fff" : C.ink }} onClick={() => setMode("politicians")}>Politiker</button>
        </div>
        <StatsCard mode={mode} C={C} card={card} mono={mono} />
      </div></div>
    );
  }

  // ---------- LEADERBOARD ----------
  if (view === "board") {
    const board = loadBoard(mode).filter(e => e.date === date).sort((a, b) => b.score - a.score).slice(0, 20);
    return (
      <div style={wrap}><div style={container}>
        <button style={{ ...btnGhost, padding: "6px 10px", fontSize: 11, marginBottom: 16 }} onClick={() => setView("home")}>← Zurück</button>
        <h1 style={h1}>Leaderboard</h1>
        <div style={{ ...mono, marginTop: 8, marginBottom: 16 }}>Heute · {MODE_LABEL[mode]} · Rätsel #{puzzleNo}</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button style={{ ...btn, flex: 1, background: mode === "quotes" ? C.ink : "transparent", color: mode === "quotes" ? "#fff" : C.ink }} onClick={() => setMode("quotes")}>Zitate</button>
          <button style={{ ...btn, flex: 1, background: mode === "politicians" ? C.ink : "transparent", color: mode === "politicians" ? "#fff" : C.ink }} onClick={() => setMode("politicians")}>Politiker</button>
        </div>
        <div style={card}>
          {board.length === 0 ? (
            <div style={{ ...mono, textAlign: "center", padding: 16 }}>Noch keine Einträge heute.</div>
          ) : board.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0",
                                  borderTop: i === 0 ? "none" : `1px solid ${C.line}`,
                                  fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>
              <span><b style={{ marginRight: 12 }}>#{i + 1}</b>{e.name}</span>
              <span style={{ fontWeight: 800 }}>{e.score}/{DAILY_LENGTH}</span>
            </div>
          ))}
        </div>
      </div></div>
    );
  }

  return null;
}

// ---------- Small subcomponents ----------
function ProgressBar({ list, guesses, cur, C }: { list: { party: PartyId }[]; guesses: PartyId[]; cur: number; C: any }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${DAILY_LENGTH}, 1fr)`, gap: 6, marginBottom: 16 }}>
      {list.map((_, i) => {
        const done = i < guesses.length;
        const ok = done && guesses[i] === list[i].party;
        const isCur = i === cur;
        return <div key={i} style={{ height: 8, border: `2px solid ${C.line}`, background: done ? (ok ? "#1AA037" : "#E3000F") : (isCur ? C.ink : C.paper) }} />;
      })}
    </div>
  );
}

function PartyButtons({ onPick, C }: { onPick: (p: PartyId) => void; C: any }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {(Object.keys(PARTIES) as PartyId[]).map((pid) => {
        const p = PARTIES[pid];
        return (
          <button key={pid} onClick={() => onPick(pid)}
            style={{ background: p.color, color: p.fg, border: `2px solid ${C.line}`,
                     padding: "14px 12px", fontFamily: "'JetBrains Mono', monospace",
                     fontWeight: 800, fontSize: 14, cursor: "pointer", letterSpacing: "0.05em" }}>
            {p.name}
          </button>
        );
      })}
    </div>
  );
}

function GuessRow({ ok, gp, rp }: { ok: boolean; gp: { name: string; color: string; fg: string }; rp: { name: string; color: string; fg: string } }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
      <span style={{ background: gp.color, color: gp.fg, padding: "2px 6px", textDecoration: ok ? "none" : "line-through" }}>Du: {gp.name}</span>
      {!ok && <span style={{ background: rp.color, color: rp.fg, padding: "2px 6px" }}>Richtig: {rp.name}</span>}
      {ok && <span>✓</span>}
    </div>
  );
}

function StatsCard({ mode, C, card, mono }: { mode: Mode; C: any; card: React.CSSProperties; mono: React.CSSProperties }) {
  const stats = loadStats(mode);
  const accuracy = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
  const stat = (label: string, v: string | number) => (
    <div style={{ textAlign: "center", flex: 1 }}>
      <div style={{ fontSize: 36, fontWeight: 900 }}>{v}</div>
      <div style={mono}>{label}</div>
    </div>
  );
  return (
    <>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {stat("Gespielt", stats.played)}
          {stat("Treffer %", accuracy + "%")}
          {stat("Streak", stats.streak)}
          {stat("Max", stats.maxStreak)}
        </div>
      </div>
      <div style={{ ...mono, textAlign: "center" }}>
        {stats.wins} perfekte Runden · {stats.correct}/{stats.total} richtig
      </div>
    </>
  );
}
