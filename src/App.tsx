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

// ---------- Quotes ----------
// NOTE: Paraphrased summaries of documented 2025 Bundestagswahl program positions.
// Before any real launch: replace `text` with verbatim wording from the official
// Wahlprogramm PDF and fill in `source.page`. The structure is ready for that swap.
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

// ---------- Daily selection (same for everyone, deterministic) ----------
const DAILY_LENGTH = 5;
const LAUNCH_DATE = "2025-01-01"; // puzzle #1 reference

function todayKey(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function puzzleNumber(dateStr: string) {
  const a = new Date(LAUNCH_DATE + "T00:00:00").getTime();
  const b = new Date(dateStr   + "T00:00:00").getTime();
  return Math.max(1, Math.floor((b - a) / 86400000) + 1);
}
// xorshift seeded by date so today's puzzle is fixed worldwide
function seededShuffle<T>(arr: T[], seedStr: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
  let s = h >>> 0;
  const rand = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function pickDaily(dateStr: string): Quote[] {
  return seededShuffle(QUOTES, "parteicheck-" + dateStr).slice(0, DAILY_LENGTH);
}

// ---------- Storage ----------
type DailyState = { date: string; guesses: PartyId[]; finished: boolean };
type Stats = { played: number; wins: number; correct: number; total: number; streak: number; maxStreak: number; lastDate: string | null };
const LS_DAILY = "parteicheck.daily.v1";
const LS_STATS = "parteicheck.stats.v1";
const LS_NAME  = "parteicheck.name.v1";
const LS_BOARD = "parteicheck.board.v1";

function loadDaily(date: string): DailyState {
  try {
    const raw = localStorage.getItem(LS_DAILY);
    if (raw) { const p = JSON.parse(raw) as DailyState; if (p.date === date) return p; }
  } catch {}
  return { date, guesses: [], finished: false };
}
function saveDaily(s: DailyState) { try { localStorage.setItem(LS_DAILY, JSON.stringify(s)); } catch {} }

const defaultStats: Stats = { played: 0, wins: 0, correct: 0, total: 0, streak: 0, maxStreak: 0, lastDate: null };
function loadStats(): Stats { try { const r = localStorage.getItem(LS_STATS); return r ? { ...defaultStats, ...JSON.parse(r) } : defaultStats; } catch { return defaultStats; } }
function saveStats(s: Stats) { try { localStorage.setItem(LS_STATS, JSON.stringify(s)); } catch {} }

type BoardEntry = { name: string; score: number; date: string; puzzle: number };
function loadBoard(): BoardEntry[] { try { return JSON.parse(localStorage.getItem(LS_BOARD) || "[]"); } catch { return []; } }
function saveBoard(b: BoardEntry[]) { try { localStorage.setItem(LS_BOARD, JSON.stringify(b)); } catch {} }

// ---------- Countdown to next puzzle ----------
function useCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const t = new Date(); t.setHours(24, 0, 0, 0);
  const ms = Math.max(0, t.getTime() - now);
  const h = Math.floor(ms / 3.6e6), m = Math.floor((ms % 3.6e6) / 6e4), s = Math.floor((ms % 6e4) / 1000);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

// ---------- App ----------
type View = "home" | "daily" | "result" | "free" | "stats" | "board";

export default function ParteiCheck() {
  const date = todayKey();
  const puzzleNo = puzzleNumber(date);
  const daily = useMemo(() => pickDaily(date), [date]);
  const [view, setView] = useState<View>("home");
  const [state, setState] = useState<DailyState>(() => loadDaily(date));
  const [stats, setStats] = useState<Stats>(() => loadStats());
  const [name, setName] = useState<string>(() => localStorage.getItem(LS_NAME) || "");
  const countdown = useCountdown();

  // free play state
  const [freeIdx, setFreeIdx] = useState(0);
  const [freeGuess, setFreeGuess] = useState<PartyId | null>(null);
  const freePool = useMemo(() => seededShuffle(QUOTES, "free-" + Math.random()).slice(0, 10), [view === "free" ? 1 : 0]);

  useEffect(() => { try { localStorage.setItem(LS_NAME, name); } catch {} }, [name]);

  const currentIdx = state.guesses.length;
  const currentQuote = daily[currentIdx];
  const score = state.guesses.reduce((acc, g, i) => acc + (g === daily[i].party ? 1 : 0), 0);

  function submitDailyGuess(p: PartyId) {
    if (state.finished) return;
    const next: DailyState = { ...state, guesses: [...state.guesses, p] };
    if (next.guesses.length >= daily.length) {
      next.finished = true;
      const correctNow = next.guesses.reduce((a, g, i) => a + (g === daily[i].party ? 1 : 0), 0);
      // update stats once
      const s = { ...stats };
      s.played += 1;
      s.correct += correctNow;
      s.total += daily.length;
      if (correctNow === daily.length) s.wins += 1;
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yKey = todayKey(yesterday);
      s.streak = s.lastDate === yKey || s.lastDate === date ? s.streak + (s.lastDate === date ? 0 : 1) : 1;
      s.maxStreak = Math.max(s.maxStreak, s.streak);
      s.lastDate = date;
      setStats(s); saveStats(s);
      // board
      if (name.trim()) {
        const b = loadBoard();
        b.push({ name: name.trim(), score: correctNow, date, puzzle: puzzleNo });
        saveBoard(b);
      }
    }
    setState(next); saveDaily(next);
    if (next.finished) setTimeout(() => setView("result"), 250);
  }

  function shareText() {
    const grid = state.guesses.map((g, i) => g === daily[i].party ? "🟩" : "🟥").join("");
    return `ParteiCheck #${puzzleNo}  ${score}/${daily.length}\n${grid}\nparteicheck.de`;
  }
  async function doShare() {
    const txt = shareText();
    if ((navigator as any).share) { try { await (navigator as any).share({ text: txt }); return; } catch {} }
    try { await navigator.clipboard.writeText(txt); alert("Ergebnis kopiert!"); } catch { alert(txt); }
  }
  function shareWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText())}`;
    window.open(url, "_blank");
  }

  // ---------- styles ----------
  const C = {
    bg: "#F5F1E8", ink: "#0A0A0A", paper: "#FFFDF7", muted: "#6B6457", line: "#0A0A0A",
  };
  const wrap: React.CSSProperties = { minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: "'Fraunces', Georgia, serif", padding: "24px 16px" };
  const container: React.CSSProperties = { maxWidth: 640, margin: "0 auto" };
  const card: React.CSSProperties = { background: C.paper, border: `2px solid ${C.line}`, boxShadow: `6px 6px 0 ${C.line}`, padding: 24, marginBottom: 16 };
  const btn: React.CSSProperties = { background: C.ink, color: "#fff", border: `2px solid ${C.line}`, padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em" };
  const btnGhost: React.CSSProperties = { ...btn, background: "transparent", color: C.ink };
  const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted };
  const h1: React.CSSProperties = { fontSize: 44, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1, margin: 0 };

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

          <div style={card}>
            <div style={mono}>Heutiges Rätsel · Nr. {puzzleNo}</div>
            <div style={{ fontSize: 22, fontWeight: 700, margin: "8px 0 16px", lineHeight: 1.2 }}>
              {state.finished ? `Du hast heute ${score}/${daily.length} richtig.` : "5 Zitate. Eine Chance pro Tag."}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${DAILY_LENGTH}, 1fr)`, gap: 6, marginBottom: 16 }}>
              {daily.map((_, i) => {
                const done = i < state.guesses.length;
                const ok = done && state.guesses[i] === daily[i].party;
                return <div key={i} style={{ height: 36, border: `2px solid ${C.line}`, background: done ? (ok ? "#1AA037" : "#E3000F") : C.paper }} />;
              })}
            </div>
            {!state.finished ? (
              <button style={{ ...btn, width: "100%" }} onClick={() => setView("daily")}>
                {state.guesses.length === 0 ? "Tägliches Rätsel starten" : "Weiterspielen"}
              </button>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button style={btn} onClick={() => setView("result")}>Ergebnis ansehen</button>
                <button style={btnGhost} onClick={() => setView("free")}>Frei weiterspielen</button>
              </div>
            )}
            <div style={{ ...mono, marginTop: 16, textAlign: "center" }}>
              Nächstes Rätsel in <span style={{ color: C.ink, fontWeight: 700 }}>{countdown}</span>
            </div>
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

          <div style={{ ...mono, marginTop: 24, textAlign: "center", lineHeight: 1.5 }}>
            Zitate basieren auf dokumentierten Positionen aus den<br />Wahlprogrammen 2025. Hackathon-Prototyp.
          </div>
        </div>
      </div>
    );
  }

  // ---------- DAILY ----------
  if (view === "daily" && currentQuote) {
    const q = currentQuote;
    return (
      <div style={wrap}>
        <div style={container}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <button style={{ ...btnGhost, padding: "6px 10px", fontSize: 11 }} onClick={() => setView("home")}>← Zurück</button>
            <div style={mono}>Rätsel #{puzzleNo} · {currentIdx + 1}/{daily.length}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${DAILY_LENGTH}, 1fr)`, gap: 6, marginBottom: 16 }}>
            {daily.map((_, i) => {
              const done = i < state.guesses.length;
              const ok = done && state.guesses[i] === daily[i].party;
              const cur = i === currentIdx;
              return <div key={i} style={{ height: 8, border: `2px solid ${C.line}`, background: done ? (ok ? "#1AA037" : "#E3000F") : (cur ? C.ink : C.paper) }} />;
            })}
          </div>
          <div style={card}>
            <div style={mono}>Thema · {q.topic}</div>
            <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.3, margin: "16px 0", fontStyle: "italic" }}>
              „{q.text}"
            </div>
            <div style={{ ...mono, marginBottom: 16 }}>Welche Partei?</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {(Object.keys(PARTIES) as PartyId[]).map((pid) => {
                const p = PARTIES[pid];
                return (
                  <button key={pid} onClick={() => submitDailyGuess(pid)}
                    style={{ background: p.color, color: p.fg, border: `2px solid ${C.line}`, padding: "14px 12px",
                             fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 14, cursor: "pointer",
                             letterSpacing: "0.05em" }}>
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- RESULT ----------
  if (view === "result") {
    const grid = state.guesses.map((g, i) => g === daily[i].party ? "🟩" : "🟥").join("");
    return (
      <div style={wrap}>
        <div style={container}>
          <div style={mono}>Rätsel #{puzzleNo}</div>
          <h1 style={{ ...h1, margin: "8px 0 24px" }}>{score}/{daily.length}</h1>
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
            {daily.map((q, i) => {
              const guess = state.guesses[i];
              const ok = guess === q.party;
              const gp = PARTIES[guess], rp = PARTIES[q.party];
              return (
                <div key={q.id} style={{ borderTop: `1px solid ${C.line}`, paddingTop: 12, marginTop: 12 }}>
                  <div style={mono}>Frage {i + 1} · {q.topic}</div>
                  <div style={{ fontStyle: "italic", margin: "6px 0", lineHeight: 1.4 }}>„{q.text}"</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                    <span style={{ background: gp.color, color: gp.fg, padding: "2px 6px", textDecoration: ok ? "none" : "line-through" }}>Du: {gp.name}</span>
                    {!ok && <span style={{ background: rp.color, color: rp.fg, padding: "2px 6px" }}>Richtig: {rp.name}</span>}
                    {ok && <span>✓</span>}
                  </div>
                  <div style={{ fontSize: 13, marginTop: 8, color: C.muted, lineHeight: 1.5 }}>{q.context}</div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button style={btn} onClick={() => setView("free")}>Frei weiterspielen</button>
            <button style={btnGhost} onClick={() => setView("home")}>Startseite</button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- FREE PLAY ----------
  if (view === "free") {
    const q = freePool[freeIdx];
    if (!q) {
      return (
        <div style={wrap}><div style={container}>
          <div style={card}>
            <h1 style={h1}>Runde fertig</h1>
            <div style={{ marginTop: 16 }}>
              <button style={btn} onClick={() => { setFreeIdx(0); setFreeGuess(null); }}>Noch eine Runde</button>{" "}
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
          <div style={mono}>Frei spielen · {freeIdx + 1}/10</div>
        </div>
        <div style={card}>
          <div style={mono}>Thema · {q.topic}</div>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, margin: "16px 0", fontStyle: "italic" }}>„{q.text}"</div>
          {!freeGuess ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {(Object.keys(PARTIES) as PartyId[]).map((pid) => {
                const p = PARTIES[pid];
                return <button key={pid} onClick={() => setFreeGuess(pid)}
                  style={{ background: p.color, color: p.fg, border: `2px solid ${C.line}`, padding: "14px 12px",
                           fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                  {p.name}
                </button>;
              })}
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                {freeGuess === q.party ? "Richtig ✓" : `Falsch — es war ${PARTIES[q.party].name}`}
              </div>
              <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.5, marginBottom: 16 }}>{q.context}</div>
              <button style={btn} onClick={() => { setFreeGuess(null); setFreeIdx(freeIdx + 1); }}>Nächste Frage →</button>
            </div>
          )}
        </div>
      </div></div>
    );
  }

  // ---------- STATS ----------
  if (view === "stats") {
    const winPct = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;
    const accuracy = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
    const stat = (label: string, v: string | number) => (
      <div style={{ textAlign: "center", flex: 1 }}>
        <div style={{ fontSize: 36, fontWeight: 900 }}>{v}</div>
        <div style={mono}>{label}</div>
      </div>
    );
    return (
      <div style={wrap}><div style={container}>
        <button style={{ ...btnGhost, padding: "6px 10px", fontSize: 11, marginBottom: 16 }} onClick={() => setView("home")}>← Zurück</button>
        <h1 style={h1}>Statistik</h1>
        <div style={{ ...card, marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {stat("Gespielt", stats.played)}
            {stat("Treffer %", accuracy + "%")}
            {stat("Streak", stats.streak)}
            {stat("Max", stats.maxStreak)}
          </div>
        </div>
        <div style={{ ...mono, textAlign: "center" }}>
          {stats.wins} perfekte Runden · {stats.correct}/{stats.total} Zitate richtig zugeordnet
        </div>
      </div></div>
    );
  }

  // ---------- LEADERBOARD ----------
  if (view === "board") {
    const board = loadBoard()
      .filter(e => e.date === date)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
    return (
      <div style={wrap}><div style={container}>
        <button style={{ ...btnGhost, padding: "6px 10px", fontSize: 11, marginBottom: 16 }} onClick={() => setView("home")}>← Zurück</button>
        <h1 style={h1}>Leaderboard</h1>
        <div style={{ ...mono, marginTop: 8, marginBottom: 16 }}>Heute · Rätsel #{puzzleNo}</div>
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
