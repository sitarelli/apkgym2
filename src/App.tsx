import { useState, useEffect, useRef } from "react";
import {
  Dumbbell, Flame, Timer, ChevronDown, ChevronUp,
  RotateCcw, Play, Pause, CheckCircle2, Info, X,
  BarChart3, ArrowLeft, Trash2, Download, Upload,
  Database, Zap, Trophy, Clock, TrendingUp, Calendar,
  Home, Activity, PenLine,
  ChevronRight, Save
} from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ExerciseRecord {
  name: string;
  setsCompleted: number;
  setsTotal: number;
  reps: string;
  notes?: string[];
}

interface WorkoutRecord {
  id: string;
  date: string;
  sessionId: number;
  sessionName: string;
  activityType?: string;
  duration: number;
  completed: boolean;
  exercises: ExerciseRecord[];
  totalSets: number;
  completedSets: number;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: number;
  description: string;
  isTime?: boolean;
  duration?: number;
}

interface ExerciseGroup {
  name: string;
  icon: string;
  exercises: Exercise[];
}

interface ActivityDef {
  name: string;
  icon: string;
  description: string;
}

interface Session {
  id: number;
  label: string;
  subtitle: string;
  color: string;
  glow: string;
  icon: string;
  type: string;
  groups?: ExerciseGroup[];
  activities?: ActivityDef[];
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const HISTORY_KEY = "workoutHistory";

const fmt = (s: number): string => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

function getHistory(): WorkoutRecord[] {
  try { const raw = localStorage.getItem(HISTORY_KEY); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}

function saveHistory(data: WorkoutRecord[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(data));
}

// ═══════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════

const sessions: Session[] = [
  {
    id: 1, label: "Sessione 1", subtitle: "Core · Petto · Tricipiti", color: "#818cf8", glow: "rgba(129,140,248,0.35)", icon: "💪", type: "workout",
    groups: [
      {
        name: "Addominali", icon: "🔥", exercises: [
          { name: "Leg Raiser", sets: 3, reps: "15", rest: 60, description: "Sdraiati su panca/pavimento, mani sotto i glutei. Gambe tese, solleva a 90° e abbassa lentamente. Lombare a terra." },
          { name: "Crunches", sets: 3, reps: "20", rest: 60, description: "Schiena a terra, ginocchia piegate. Stacca spalle dal suolo contraendo il retto. Movimento breve e controllato." },
          { name: "Plank", sets: 3, reps: "30-60s", rest: 60, isTime: true, duration: 45, description: "Avambracci e punte dei piedi. Corpo in linea retta. Contrai addome, glutei e quadricipiti." },
        ]
      },
      {
        name: "Petto & Tricipiti", icon: "🏋️", exercises: [
          { name: "Cavi dall'alto", sets: 4, reps: "15", rest: 90, description: "Cavo-croce maniglie alte. Braccia in arco avanti-basso. Gomiti fissi, contrai petto al picco." },
          { name: "Bench Press", sets: 4, reps: "10", rest: 120, description: "Panca piana, impugnatura oltre le spalle. Scendi al petto controllato, spingi esplosivo. Scapole retratte." },
          { name: "Pull Over Bilanciere", sets: 3, reps: "10", rest: 90, description: "Perpendicolare alla panca, spalle appoggiate. Bilanciere sopra il petto, abbassa oltre la testa stirando dorsale." },
          { name: "French Press Manubri", sets: 4, reps: "12", rest: 90, description: "Panca, manubri sopra con braccia estese. Piega gomiti verso tempie, gomiti fermi verso il soffitto." },
          { name: "Tricipiti ai Cavi", sets: 3, reps: "15", rest: 60, description: "Cavo alto, gomiti ai fianchi fissi. Estendi braccia verso il basso, torna su lentamente." },
        ]
      },
    ]
  },
  {
    id: 2, label: "Sessione 2", subtitle: "Core · Gambe · Spalle", color: "#fb7185", glow: "rgba(251,113,133,0.35)", icon: "🦵", type: "workout",
    groups: [
      {
        name: "Addome", icon: "🔥", exercises: [
          { name: "Rotary Torso", sets: 3, reps: "15", rest: 60, description: "Seduto, busto bloccato. Ruota il torso contraendo obliqui. Un lato alla volta, movimento lento." },
        ]
      },
      {
        name: "Gambe", icon: "🦵", exercises: [
          { name: "Leg Press", sets: 4, reps: "15-12-10-8", rest: 120, description: "Piedi larghezza spalle, scendi a ~90°. Spingi esplosivo senza bloccare ginocchia. Piramidale." },
          { name: "Affondi in camminata", sets: 3, reps: "10+10", rest: 90, description: "Manubri ai lati, passo lungo. Ginocchio posteriore verso terra. 10 per gamba, busto eretto." },
        ]
      },
      {
        name: "Cardio", icon: "🚴", exercises: [
          { name: "Cyclette", sets: 1, reps: "10 min", rest: 0, isTime: true, duration: 600, description: "10 min intensità moderata, RPM 70-90. Recupero attivo." },
        ]
      },
      {
        name: "Spalle", icon: "🏋️", exercises: [
          { name: "Croci a 90°", sets: 4, reps: "12", rest: 90, description: "Manubri ai lati, braccia laterali a 90°. Gomiti flessi, palmi in basso al picco. Peso leggero, tecnica perfetta." },
          { name: "Shoulder Press", sets: 4, reps: "15-12-10-8", rest: 120, description: "Panca con schienale, manubri altezza orecchie. Spingi su, torna giù lento. Piramidale." },
        ]
      },
    ]
  },
  {
    id: 3, label: "Sessione 3", subtitle: "Lombare · Dorso · Bicipiti", color: "#34d399", glow: "rgba(52,211,153,0.35)", icon: "🦾", type: "workout",
    groups: [
      {
        name: "Addome / Lombare", icon: "🔥", exercises: [
          { name: "Hyperextension", sets: 3, reps: "15", rest: 60, description: "Iperestensione: anche sul cuscinetto, piedi bloccati. Scendi e risali contraendo lombari fino alla linea retta." },
        ]
      },
      {
        name: "Dorso", icon: "🔙", exercises: [
          { name: "Row Presa Stretta", sets: 4, reps: "8", rest: 120, description: "Cavo basso presa prona stretta. Tira verso ombelico, gomiti ai fianchi, scapole al centro." },
          { name: "Row Presa Larga", sets: 2, reps: "18", rest: 90, description: "Presa larga, gomiti verso l'esterno. Deltoide posteriore e fibre superiori dorsale. Volume alto." },
          { name: "Lat Avanti", sets: 4, reps: "15-12-10-8", rest: 120, description: "Lat machine sbarra larga, tira al petto. Gomiti verso il pavimento, scapole abbassate. Piramidale." },
        ]
      },
      {
        name: "Bicipiti", icon: "💪", exercises: [
          { name: "Curl Cavo Basso", sets: 4, reps: "10", rest: 90, description: "Cavo basso barra dritta. Gomiti fissi, fletti verso spalle. Tensione costante anche in basso." },
          { name: "Curl Manubri", sets: 3, reps: "8+8", rest: 90, description: "Curl alternato con supinazione al picco. 8 per braccio, gomito fermo, movimento lento." },
        ]
      },
    ]
  },
  {
    id: 4, label: "Attività Extra", subtitle: "Gravel · Passeggiata", color: "#fbbf24", glow: "rgba(251,191,36,0.35)", icon: "🚴", type: "extra",
    activities: [
      { name: "Gravel Bike", icon: "🚵", description: "Sessione ciclismo su gravel. Avvia il timer." },
      { name: "Passeggiata", icon: "🚶", description: "Camminata all'aperto. Traccia la durata." },
    ]
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════

function useTimer(init: number) {
  const [time, setTime] = useState<number>(init);
  const [running, setRunning] = useState<boolean>(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (running && time > 0) ref.current = setInterval(() => setTime(t => t - 1), 1000);
    else if (time === 0) setRunning(false);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running, time]);
  return { time, running, start: () => setRunning(true), pause: () => setRunning(false), reset: () => { setRunning(false); setTime(init); } };
}

function useStopwatch() {
  const [elapsed, setElapsed] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (running) ref.current = setInterval(() => setElapsed(e => e + 1), 1000);
    else { if (ref.current) clearInterval(ref.current); }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);
  return { elapsed, running, setRunning, reset: () => { setRunning(false); setElapsed(0); } };
}

// ═══════════════════════════════════════════════════════════════════════════
// REST TIMER MODAL
// ═══════════════════════════════════════════════════════════════════════════

const REST_TIMER_KEY = "restTimerState";
const NOTIF_SOUND_KEY = "restTimerSound";

function saveRestTimer(endTs: number, total: number): void {
  localStorage.setItem(REST_TIMER_KEY, JSON.stringify({ endTimestamp: endTs, totalSeconds: total }));
}
function clearRestTimer(): void { localStorage.removeItem(REST_TIMER_KEY); }
function getRestTimer(): { endTimestamp: number; totalSeconds: number } | null {
  try { const r = localStorage.getItem(REST_TIMER_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}

function getSoundPref(): boolean {
  return localStorage.getItem(NOTIF_SOUND_KEY) !== "off";
}
function setSoundPref(on: boolean): void {
  localStorage.setItem(NOTIF_SOUND_KEY, on ? "on" : "off");
}

// Native local notification (works with screen off on Android/iOS)
async function scheduleRestNotification(delaySeconds: number): Promise<void> {
  const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
  if (!isNative) {
    // Browser fallback: web notification only (won't beep with screen off)
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
    return;
  }
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== "granted") return;
    // Cancel any existing rest notification first
    await LocalNotifications.cancel({ notifications: [{ id: 9999 }] });
    await LocalNotifications.schedule({
      notifications: [{
        id: 9999,
        title: "💪 Recupero completato!",
        body: "È ora della prossima serie!",
        schedule: { at: new Date(Date.now() + delaySeconds * 1000) },
        sound: "beep.wav",
        channelId: "rest-timer",
      }]
    });
  } catch (e) { console.warn("LocalNotifications not available:", e); }
}

async function cancelRestNotification(): Promise<void> {
  const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
  if (!isNative) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.cancel({ notifications: [{ id: 9999 }] });
  } catch { /* ignore */ }
}

// Create notification channel on Android (call once at app start)
async function createNotificationChannel(): Promise<void> {
  const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
  if (!isNative) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.createChannel({
      id: "rest-timer",
      name: "Timer Recupero",
      description: "Notifiche timer recupero allenamento",
      importance: 4, // HIGH
      sound: "beep.wav",
      vibration: true,
    });
  } catch { /* ignore */ }
}

function fireWebNotification(): void {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("💪 Recupero completato!", { body: "È ora della prossima serie!", tag: "rest-timer" });
  }
}

// In-app beep using Web Audio API (works when app is in foreground)
function playBeep(): void {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playTone = (freq: number, startTime: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = "sine";
      gain.gain.setValueAtTime(0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + dur);
      osc.start(startTime); osc.stop(startTime + dur);
    };
    const now = ctx.currentTime;
    playTone(880, now, 0.15);
    playTone(880, now + 0.2, 0.15);
    playTone(1100, now + 0.45, 0.3);
  } catch { /* audio not available */ }
}

function RestTimerModal({ seconds, onClose }: { seconds: number; onClose: () => void }) {
  const calcRemaining = (): number => {
    const state = getRestTimer();
    if (state && state.totalSeconds === seconds) {
      const rem = Math.ceil((state.endTimestamp - Date.now()) / 1000);
      return Math.max(0, rem);
    }
    return seconds;
  };

  const [time, setTime] = useState<number>(calcRemaining);
  const [running, setRunning] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(getSoundPref);
  const notifiedRef = useRef<boolean>(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundPref(next);
  };

  // On mount: auto-start
  useEffect(() => {
    const state = getRestTimer();
    if (state && state.totalSeconds === seconds && state.endTimestamp > Date.now()) {
      setRunning(true);
    } else {
      const endTs = Date.now() + seconds * 1000;
      saveRestTimer(endTs, seconds);
      setRunning(true);
      if (getSoundPref()) scheduleRestNotification(seconds);
    }
  }, []);

  // Tick using wall-clock
  useEffect(() => {
    if (!running) { if (ref.current) clearInterval(ref.current); return; }
    ref.current = setInterval(() => {
      const state = getRestTimer();
      if (!state) { setRunning(false); return; }
      const rem = Math.ceil((state.endTimestamp - Date.now()) / 1000);
      if (rem <= 0) {
        setTime(0); setRunning(false); clearRestTimer();
        if (!notifiedRef.current) {
          notifiedRef.current = true;
          fireWebNotification();
          if (soundOn) playBeep();
        }
      } else { setTime(rem); }
    }, 250);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running, soundOn]);

  const handlePause = () => {
    clearRestTimer(); setRunning(false);
    cancelRestNotification();
  };
  const handleResume = () => {
    const t = time === 0 ? seconds : time;
    if (time === 0) setTime(seconds);
    saveRestTimer(Date.now() + t * 1000, seconds);
    notifiedRef.current = false;
    setRunning(true);
    if (soundOn) scheduleRestNotification(t);
  };
  const handleReset = () => {
    clearRestTimer(); setRunning(false);
    notifiedRef.current = false; setTime(seconds);
    cancelRestNotification();
  };

  const pct = (time / seconds) * 100;
  const C = 2 * Math.PI * 54;
  const done = time === 0;
  const col = done ? "#34d399" : time <= 10 ? "#fb7185" : "#818cf8";

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modalCard} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16 }}>
          <p style={{ ...S.modalTitle, margin: 0 }}>Recupero</p>
          <button onClick={toggleSound} style={{
            ...S.sm, width: 30, height: 30,
            background: soundOn ? "rgba(129,140,248,0.25)" : "rgba(255,255,255,0.06)",
            border: soundOn ? "1px solid rgba(129,140,248,0.4)" : "1px solid rgba(255,255,255,0.1)",
          }} title={soundOn ? "Suono attivo" : "Suono disattivato"}>
            <span style={{ fontSize: 14 }}>{soundOn ? "🔔" : "🔕"}</span>
          </button>
        </div>
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
          <circle cx="70" cy="70" r="54" fill="none" stroke={col} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} transform="rotate(-90 70 70)"
            style={{ transition: "stroke-dashoffset 0.25s linear, stroke 0.3s" }} />
          <text x="70" y="76" textAnchor="middle" fill="white" fontSize="28" fontWeight="700" fontFamily="monospace">{fmt(time)}</text>
        </svg>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "16px" }}>
          {running
            ? <Btn bg="rgba(255,255,255,0.08)" onClick={handlePause}><Pause size={14} /> Pausa</Btn>
            : <Btn bg={`${col}55`} onClick={handleResume}><Play size={14} /> {done ? "Nuovo" : "Riprendi"}</Btn>}
          <Btn bg="rgba(255,255,255,0.06)" onClick={handleReset}><RotateCcw size={14} /></Btn>
          <Btn bg="rgba(255,255,255,0.04)" onClick={onClose}><X size={14} /></Btn>
        </div>
        {done && <p style={{ color: "#34d399", fontWeight: 700, marginTop: 12, fontSize: 14 }}>✅ Recupero completato!</p>}
        {running && !done && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 10 }}>
            {soundOn ? "🔔 Suonerà anche a schermo spento" : "Il timer continua in background"}
          </p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SMALL COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function Btn({ children, bg = "rgba(255,255,255,0.08)", style: sx, ...rest }: { children: React.ReactNode; bg?: string; style?: React.CSSProperties; onClick?: () => void }) {
  return <button style={{ ...S.btn, background: bg, ...sx }} {...rest}>{children}</button>;
}

function ExTimer({ duration }: { duration: number }) {
  const { time, running, start, pause, reset } = useTimer(duration);
  const pct = (time / duration) * 100;
  const col = time <= 10 ? "#fb7185" : "#34d399";
  return (
    <div style={S.exTimer}>
      <div style={{ ...S.timerBar, width: `${pct}%`, background: col }} />
      <span style={S.timerTxt}>{fmt(time)}</span>
      <div style={{ display: "flex", gap: 6, marginLeft: "auto", position: "relative" as const, zIndex: 1 }}>
        {running
          ? <button style={S.sm} onClick={pause}><Pause size={14} /></button>
          : <button style={{ ...S.sm, background: "rgba(52,211,153,0.25)" }} onClick={start}><Play size={14} /></button>}
        <button style={{ ...S.sm, background: "rgba(251,113,133,0.2)" }} onClick={reset}><RotateCcw size={13} /></button>
      </div>
    </div>
  );
}

function SetNoteInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || "");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);
  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} style={{ ...S.noteBtn, color: value ? "#fbbf24" : "rgba(255,255,255,0.25)" }}>
        {value ? <span style={{ fontSize: 11 }}>{value}</span> : <PenLine size={11} />}
      </button>
    );
  }
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      <input ref={inputRef} value={val} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value)}
        placeholder="kg / note"
        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") { onChange(val); setEditing(false) } }}
        style={S.noteInput} />
      <button style={{ ...S.sm, width: 26, height: 26, background: "rgba(52,211,153,0.2)" }}
        onClick={() => { onChange(val); setEditing(false) }}><Save size={11} /></button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXERCISE CARD
// ═══════════════════════════════════════════════════════════════════════════

function ExCard({ ex, color, done, onSet, notes, onNote }: {
  ex: Exercise; color: string; done: number;
  onSet: (i: number) => void; notes: string[];
  onNote: (setIdx: number, val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showRest, setShowRest] = useState(false);
  return (
    <>
      {showRest && <RestTimerModal seconds={ex.rest || 90} onClose={() => setShowRest(false)} />}
      <div style={{ ...S.card, borderColor: `${color}30` }}>
        <div style={S.cardHead}>
          <div style={{ flex: 1 }}>
            <p style={S.exName}>{ex.name}</p>
            <p style={S.exMeta}>{ex.sets}×{ex.reps}{ex.rest > 0 ? ` · ${ex.rest}s rec` : ""}</p>
          </div>
          <button style={{ ...S.infoBtn, borderColor: `${color}30`, color }} onClick={() => setOpen(!open)}>
            {open ? <ChevronUp size={14} /> : <Info size={14} />}
          </button>
        </div>
        {open && (
          <div style={{ ...S.desc, borderColor: `${color}20` }}>
            <p style={S.descTxt}>{ex.description}</p>
          </div>
        )}
        {ex.isTime && ex.duration && <ExTimer duration={ex.duration} />}
        <div style={S.sets}>
          {Array.from({ length: ex.sets }).map((_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3 }}>
              <button
                style={{
                  ...S.dot,
                  background: done > i ? color : "rgba(255,255,255,0.04)",
                  borderColor: done > i ? color : "rgba(255,255,255,0.1)",
                  boxShadow: done > i ? `0 0 12px ${color}44` : "none",
                  transform: done > i ? "scale(1.05)" : "scale(1)"
                }}
                onClick={() => onSet(i)}>
                {done > i ? <CheckCircle2 size={16} /> : <span style={{ fontSize: 11, opacity: 0.5 }}>{i + 1}</span>}
              </button>
              <SetNoteInput value={notes?.[i] || ""} onChange={(v: string) => onNote(i, v)} />
            </div>
          ))}
          {ex.rest > 0 && (
            <button style={{ ...S.restBtn, borderColor: `${color}30`, color }} onClick={() => setShowRest(true)}>
              <Timer size={12} /> Rec
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function Group({ group, color, completedSets, onSetComplete, notes, onNote }: {
  group: ExerciseGroup; color: string; completedSets: number[];
  onSetComplete: (exIdx: number, setIdx: number) => void;
  notes: string[][]; onNote: (exIdx: number, setIdx: number, val: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
        <span style={{ fontSize: 18 }}>{group.icon}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color, letterSpacing: "-0.01em" }}>{group.name}</span>
        <div style={{ flex: 1, height: 1, background: `${color}15` }} />
      </div>
      {group.exercises.map((ex, i) => (
        <ExCard key={ex.name} ex={ex} color={color} done={completedSets[i]}
          onSet={(si: number) => onSetComplete(i, si)} notes={notes?.[i] || []}
          onNote={(si: number, v: string) => onNote(i, si, v)} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKOUT SESSION
// ═══════════════════════════════════════════════════════════════════════════

function WorkoutSession({ session, onFinish }: { session: Session; onFinish: () => void }) {
  const { elapsed, running, setRunning, reset } = useStopwatch();
  const [completedSets, setCompletedSets] = useState<number[][]>(
    () => (session.groups ?? []).map(g => g.exercises.map(() => 0))
  );
  const [notes, setNotes] = useState<string[][][]>(
    () => (session.groups ?? []).map(g => g.exercises.map(ex => Array(ex.sets).fill("")))
  );

  const handleSet = (gIdx: number, eIdx: number, sIdx: number) => {
    setCompletedSets(prev => {
      const next = prev.map(g => [...g]);
      next[gIdx][eIdx] = next[gIdx][eIdx] >= sIdx + 1 ? sIdx : sIdx + 1;
      return next;
    });
  };

  const handleNote = (gIdx: number, eIdx: number, sIdx: number, val: string) => {
    setNotes(prev => {
      const next = prev.map(g => g.map(e => [...e]));
      next[gIdx][eIdx][sIdx] = val;
      return next;
    });
  };

  const totalSets = (session.groups ?? []).reduce((s, g) => s + g.exercises.reduce((s2, e) => s2 + e.sets, 0), 0);
  const doneSets = completedSets.reduce((s, g) => s + g.reduce((s2, v) => s2 + v, 0), 0);
  const pct = totalSets > 0 ? Math.round(doneSets / totalSets * 100) : 0;

  const handleFinish = () => {
    const exercises: ExerciseRecord[] = [];
    (session.groups ?? []).forEach((group, gIdx) => {
      group.exercises.forEach((ex, eIdx) => {
        exercises.push({
          name: ex.name, setsCompleted: completedSets[gIdx][eIdx],
          setsTotal: ex.sets, reps: ex.reps,
          notes: notes[gIdx][eIdx].filter(Boolean)
        });
      });
    });
    const workout: WorkoutRecord = {
      id: Date.now().toString(), date: new Date().toISOString(),
      sessionId: session.id, sessionName: session.label,
      duration: elapsed, completed: true,
      exercises, totalSets, completedSets: doneSets
    };
    const prev = getHistory();
    prev.push(workout);
    saveHistory(prev);
    onFinish();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
      <div style={{ ...S.watch, borderColor: `${session.color}30`, boxShadow: `0 0 40px ${session.glow}` }}>
        <div>
          <p style={S.wLabel}>Durata</p>
          <p style={{ ...S.wTime, color: session.color }}>{fmt(elapsed)}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: 8 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {running
              ? <Btn bg="rgba(255,255,255,0.08)" onClick={() => setRunning(false)}><Pause size={14} /></Btn>
              : <Btn bg={`${session.color}aa`} onClick={() => setRunning(true)}><Play size={14} /></Btn>}
            <Btn bg="rgba(251,113,133,0.2)" onClick={reset}><RotateCcw size={14} /></Btn>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 80, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: session.color, borderRadius: 2, transition: "width 0.3s" }} />
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{pct}%</span>
          </div>
        </div>
      </div>

      {(session.groups ?? []).map((g, gIdx) => (
        <Group key={g.name} group={g} color={session.color}
          completedSets={completedSets[gIdx]}
          onSetComplete={(eIdx: number, sIdx: number) => handleSet(gIdx, eIdx, sIdx)}
          notes={notes[gIdx]}
          onNote={(eIdx: number, sIdx: number, v: string) => handleNote(gIdx, eIdx, sIdx, v)} />
      ))}

      <button style={{ ...S.finishBtn, background: `linear-gradient(135deg,${session.color}cc,${session.color}77)` }}
        onClick={handleFinish}>
        <CheckCircle2 size={18} /> Completa Sessione · {doneSets}/{totalSets} serie
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXTRA ACTIVITIES
// ═══════════════════════════════════════════════════════════════════════════

function ExtraSession({ session, onFinish }: { session: Session; onFinish: () => void }) {
  const [active, setActive] = useState<ActivityDef | null>(null);
  const { elapsed, running, setRunning, reset } = useStopwatch();

  const handleStart = (a: ActivityDef) => { setActive(a); reset(); setRunning(true); };
  const handleFinish = () => {
    if (!active) return;
    const workout: WorkoutRecord = {
      id: Date.now().toString(), date: new Date().toISOString(),
      sessionId: session.id, sessionName: `${session.label} — ${active.name}`,
      activityType: active.name, duration: elapsed, completed: true,
      exercises: [], totalSets: 0, completedSets: 0
    };
    const prev = getHistory();
    prev.push(workout);
    saveHistory(prev);
    setActive(null); reset(); onFinish();
  };

  if (active) {
    return (
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
        <div style={{ ...S.card, borderColor: `${session.color}30` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 36 }}>{active.icon}</span>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: session.color }}>{active.name}</h3>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{active.description}</p>
            </div>
          </div>
          <div style={{ ...S.watch, borderColor: `${session.color}30` }}>
            <div>
              <p style={S.wLabel}>Durata</p>
              <p style={{ ...S.wTime, color: session.color }}>{fmt(elapsed)}</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {running
                ? <Btn bg="rgba(255,255,255,0.08)" onClick={() => setRunning(false)}><Pause size={14} /></Btn>
                : <Btn bg={`${session.color}88`} onClick={() => setRunning(true)}><Play size={14} /></Btn>}
              <Btn bg="rgba(251,113,133,0.2)" onClick={reset}><RotateCcw size={14} /></Btn>
            </div>
          </div>
        </div>
        <button style={{ ...S.finishBtn, background: `${session.color}88` }} onClick={handleFinish}>
          <CheckCircle2 size={18} /> Completa
        </button>
        <Btn bg="rgba(255,255,255,0.06)" style={{ width: "100%", padding: 12, justifyContent: "center" }}
          onClick={() => { setActive(null); reset(); }}>
          <ArrowLeft size={14} /> Torna alla selezione
        </Btn>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
      {(session.activities ?? []).map(a => (
        <div key={a.name} style={{ ...S.card, borderColor: `${session.color}25`, cursor: "pointer" }} onClick={() => handleStart(a)}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 36 }}>{a.icon}</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{a.name}</h3>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{a.description}</p>
            </div>
            <ChevronRight size={20} color={session.color} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HEATMAP
// ═══════════════════════════════════════════════════════════════════════════

function Heatmap({ history }: { history: WorkoutRecord[] }) {
  const today = new Date();
  const weeks = 12;
  const days: Date[] = [];
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    days.push(d);
  }
  const countMap: Record<string, number> = {};
  history.forEach(w => {
    const key = new Date(w.date).toISOString().slice(0, 10);
    countMap[key] = (countMap[key] || 0) + 1;
  });
  const getColor = (count: number) => {
    if (!count) return "rgba(255,255,255,0.03)";
    if (count === 1) return "rgba(129,140,248,0.3)";
    if (count === 2) return "rgba(129,140,248,0.5)";
    return "rgba(129,140,248,0.75)";
  };
  return (
    <div style={{ display: "flex", gap: 2, flexWrap: "wrap" as const, justifyContent: "flex-end" }}>
      {days.map((d, i) => {
        const key = d.toISOString().slice(0, 10);
        const c = countMap[key] || 0;
        const isToday = key === today.toISOString().slice(0, 10);
        return (
          <div key={i} title={`${key}: ${c} allenamenti`}
            style={{ width: 12, height: 12, borderRadius: 3, background: getColor(c), border: isToday ? "1px solid rgba(129,140,248,0.6)" : "none", transition: "background 0.2s" }} />
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

function Dashboard({ onBack, history }: { onBack: () => void; history: WorkoutRecord[] }) {
  const [filter, setFilter] = useState("all");
  const [showHistory, setShowHistory] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const now = new Date();
  const filterDays: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "year": 365 };
  const cutoff = filter === "all" ? null : new Date(now.getTime() - filterDays[filter] * 864e5);
  const filtered = cutoff ? history.filter(w => new Date(w.date).getTime() >= cutoff.getTime()) : history;

  const totalWorkouts = filtered.length;
  const totalSets = filtered.reduce((s, w) => s + (w.completedSets || 0), 0);
  const totalDuration = filtered.reduce((s, w) => s + w.duration, 0);
  const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  // Streak
  const sortedDates = [...new Set(history.map(w => new Date(w.date).toDateString()))]
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let streak = 0;
  for (const d of sortedDates) {
    if (Math.floor((now.getTime() - new Date(d).getTime()) / 864e5) === streak) streak++;
    else break;
  }

  // Weekly chart
  const weeklyData: { name: string; sessioni: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - weekStart.getDay() - i * 7);
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7);
    const count = history.filter(w => { const d = new Date(w.date); return d >= weekStart && d < weekEnd; }).length;
    weeklyData.push({ name: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`, sessioni: count });
  }

  // Distribution
  const sessionCounts: Record<string, number> = {};
  filtered.forEach(w => { const k = String(w.sessionId || "?"); sessionCounts[k] = (sessionCounts[k] || 0) + 1; });

  // Top exercises
  const exFreq: Record<string, number> = {};
  filtered.forEach(w => w.exercises?.forEach(ex => { exFreq[ex.name] = (exFreq[ex.name] || 0) + ex.setsCompleted; }));
  const topEx = Object.entries(exFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const handleExport = async () => {
    const data = JSON.stringify({ exportDate: new Date().toISOString(), workouts: history }, null, 2);
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `workout_backup_${dateStr}.json`;
    const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
    if (isNative) {
      try {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const { Share } = await import('@capacitor/share');
        await Filesystem.writeFile({ path: fileName, data, directory: Directory.Cache, encoding: 'utf8' as any });
        const uriResult = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });
        await Share.share({ title: 'Backup Allenamenti', text: `Backup del ${dateStr}`, url: uriResult.uri, dialogTitle: 'Salva o condividi il backup' });
      } catch (err) { console.error('Export error:', err); alert('Errore durante il salvataggio.'); }
    } else {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = fileName; a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        let workouts: WorkoutRecord[] = Array.isArray(parsed) ? parsed : parsed.workouts;
        if (!Array.isArray(workouts)) { setImportMsg({ ok: false, text: "❌ File non valido" }); return; }
        const existing = getHistory();
        const ids = new Set(existing.map(w => w.id));
        const newOnes = workouts.filter(w => !ids.has(w.id));
        const merged = [...existing, ...newOnes].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        saveHistory(merged);
        setImportMsg({ ok: true, text: `✅ Importati ${newOnes.length} allenamenti` });
        setTimeout(() => window.location.reload(), 1800);
      } catch { setImportMsg({ ok: false, text: "❌ Errore parsing" }); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDelete = (id: string) => {
    const prev = getHistory();
    saveHistory(prev.filter(w => w.id !== id));
    window.location.reload();
  };

  const stats = [
    { label: "Streak", value: `${streak}g`, color: "#f472b6", icon: <Flame size={16} /> },
    { label: "Sessioni", value: String(totalWorkouts), color: "#818cf8", icon: <Dumbbell size={16} /> },
    { label: "Serie", value: String(totalSets), color: "#34d399", icon: <Zap size={16} /> },
    { label: "Media", value: fmt(avgDuration), color: "#fbbf24", icon: <Clock size={16} /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 14, paddingBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <BarChart3 size={22} color="#818cf8" />
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Dashboard</h2>
        </div>
        <Btn bg="rgba(255,255,255,0.06)" style={{ border: "1px solid rgba(255,255,255,0.08)" }} onClick={onBack}>
          <ArrowLeft size={14} /> Indietro
        </Btn>
      </div>

      {/* Heatmap */}
      <div style={{ ...S.card, borderColor: "rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Calendar size={14} color="rgba(255,255,255,0.35)" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Ultime 12 settimane</span>
        </div>
        <Heatmap history={history} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const }}>
        {["all", "7d", "30d", "90d", "year"].map(f => (
          <button key={f} style={{
            ...S.btn, padding: "5px 14px", fontSize: 11,
            background: filter === f ? "rgba(129,140,248,0.2)" : "rgba(255,255,255,0.04)",
            border: filter === f ? "1px solid rgba(129,140,248,0.5)" : "1px solid rgba(255,255,255,0.06)",
            color: filter === f ? "#818cf8" : "rgba(255,255,255,0.4)"
          }} onClick={() => setFilter(f)}>
            {f === "all" ? "Tutto" : f === "7d" ? "7g" : f === "30d" ? "30g" : f === "90d" ? "90g" : "Anno"}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {stats.map(c => (
          <div key={c.label} style={{ ...S.card, borderColor: `${c.color}18`, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: c.color }}>
              {c.icon}
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.35)" }}>{c.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: c.color, fontFamily: "monospace" }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      {history.length > 0 && (
        <div style={{ ...S.card, borderColor: "rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <TrendingUp size={14} color="rgba(255,255,255,0.35)" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Sessioni per settimana</span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12, color: "#fff" }} />
              <Area type="monotone" dataKey="sessioni" stroke="#818cf8" fill="url(#grad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Distribution */}
      {Object.keys(sessionCounts).length > 0 && (
        <div style={{ ...S.card, borderColor: "rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Activity size={14} color="rgba(255,255,255,0.35)" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Distribuzione</span>
          </div>
          {Object.entries(sessionCounts).map(([id, count]) => {
            const sess = sessions.find(s => s.id === parseInt(id));
            const color = sess?.color || "#999";
            const pctVal = (count / totalWorkouts * 100).toFixed(0);
            return (
              <div key={id} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color }}>{sess?.label || "Extra"}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{count}× · {pctVal}%</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pctVal}%`, background: color, borderRadius: 2, transition: "width 0.4s" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Top exercises */}
      {topEx.length > 0 && (
        <div style={{ ...S.card, borderColor: "rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Trophy size={14} color="rgba(255,255,255,0.35)" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Top Esercizi</span>
          </div>
          {topEx.map(([name, sets], idx) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 14, minWidth: 22, textAlign: "center" as const }}>
                {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{name}</p>
                <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{sets} serie totali</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History toggle */}
      <button style={{
        ...S.btn, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
        width: "100%", padding: 12, justifyContent: "center", borderRadius: 14
      }} onClick={() => setShowHistory(!showHistory)}>
        <Calendar size={14} /> {showHistory ? "Nascondi Storico" : "Mostra Storico"}
        {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {showHistory && (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {history.slice().reverse().map(w => {
            const sess = sessions.find(s => s.id === w.sessionId);
            const color = sess?.color || "#999";
            const d = new Date(w.date);
            return (
              <div key={w.id} style={{ ...S.card, borderColor: `${color}18`, padding: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color }}>{w.sessionName}</p>
                    <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                      {d.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })} · {d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <button style={{ ...S.sm, background: "rgba(251,113,133,0.15)", width: 28, height: 28 }}
                    onClick={() => { if (confirm("Eliminare?")) { handleDelete(w.id) } }}>
                    <Trash2 size={12} />
                  </button>
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} /> {fmt(w.duration)}</span>
                  {w.completedSets > 0 && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Dumbbell size={11} /> {w.completedSets} serie</span>}
                </div>
                {w.exercises?.some(e => e.notes && e.notes.length > 0) && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    {w.exercises.filter(e => e.notes && e.notes.length > 0).map(e => (
                      <p key={e.name} style={{ margin: "2px 0", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                        <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>{e.name}:</span> {e.notes!.join(" · ")}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {history.length === 0 && <p style={{ textAlign: "center" as const, color: "rgba(255,255,255,0.25)", padding: 20, fontSize: 12 }}>Nessun allenamento</p>}
        </div>
      )}

      {/* Data management */}
      <div style={{ ...S.card, borderColor: "rgba(129,140,248,0.12)", marginTop: 4 }}>
        <button style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
          background: "none", border: "none", cursor: "pointer", color: "#fff", padding: 0
        }} onClick={() => setShowBackup(!showBackup)}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Database size={14} color="#818cf8" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Gestione Dati</span>
          </div>
          {showBackup ? <ChevronUp size={14} color="rgba(255,255,255,0.3)" /> : <ChevronDown size={14} color="rgba(255,255,255,0.3)" />}
        </button>
        {showBackup && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <p style={{ margin: "0 0 12px", fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
              Esporta JSON di backup — salvalo su Google Drive per non perderlo.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
              <Btn bg="rgba(52,211,153,0.15)" style={{ border: "1px solid rgba(52,211,153,0.3)", color: "#34d399", padding: "9px 16px" }} onClick={handleExport}>
                <Download size={13} /> Esporta
              </Btn>
              <Btn bg="rgba(129,140,248,0.15)" style={{ border: "1px solid rgba(129,140,248,0.3)", color: "#818cf8", padding: "9px 16px" }} onClick={() => fileRef.current?.click()}>
                <Upload size={13} /> Importa
              </Btn>
              <input ref={fileRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleImport} />
            </div>
            {importMsg && <p style={{ margin: "10px 0 0", fontSize: 12, fontWeight: 600, color: importMsg.ok ? "#34d399" : "#fb7185" }}>{importMsg.text}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════

export default function App() {
  const [view, setView] = useState("home");
  const [activeSession, setActiveSession] = useState(0);
  const [history, setHistory] = useState<WorkoutRecord[]>([]);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap";
    link.rel = "stylesheet"; document.head.appendChild(link);
    setHistory(getHistory());
    createNotificationChannel();
  }, []);

  const refreshHistory = () => { setHistory(getHistory()); };

  const handleSelect = (i: number) => { setActiveSession(i); setView("session"); };
  const handleFinish = () => { refreshHistory(); setView("home"); };

  const lastWorkout = history.length > 0 ? history[history.length - 1] : null;
  const lastSession = lastWorkout ? sessions.find(s => s.id === lastWorkout.sessionId) : null;

  const renderView = () => {
    if (view === "dashboard") {
      return <Dashboard onBack={() => setView("home")} history={history} />;
    }
    if (view === "session") {
      const session = sessions[activeSession];
      return (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: session.color }}>
              {session.icon} {session.label}
            </h2>
            <Btn bg="rgba(255,255,255,0.06)" style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              onClick={() => setView("home")}>
              <ArrowLeft size={14} /> Indietro
            </Btn>
          </div>
          {session.type === "extra"
            ? <ExtraSession session={session} onFinish={handleFinish} />
            : <WorkoutSession session={session} onFinish={handleFinish} />}
        </>
      );
    }
    // HOME
    return (
      <>
        <div style={{ textAlign: "center" as const, marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 6 }}>
            <Dumbbell size={26} color="#818cf8" />
            <h1 style={S.title}>Workout Tracker</h1>
          </div>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, margin: 0, letterSpacing: "0.06em" }}>
            3 SESSIONI · ATTIVITÀ EXTRA
          </p>
        </div>

        {lastWorkout && lastSession && (
          <div style={{
            ...S.card, borderColor: `${lastSession.color}20`, marginBottom: 12, cursor: "pointer",
            background: `linear-gradient(135deg,${lastSession.color}08,transparent)`
          }}
            onClick={() => handleSelect(sessions.indexOf(lastSession))}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Zap size={16} color={lastSession.color} />
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: lastSession.color }}>Ripeti ultima sessione</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                    {lastSession.label} · {new Date(lastWorkout.date).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
              <ChevronRight size={18} color={lastSession.color} />
            </div>
          </div>
        )}

        <div style={S.tabs}>
          {sessions.map((s, i) => (
            <button key={s.id} style={{
              ...S.tab,
              background: `linear-gradient(145deg,${s.color}12,${s.color}06)`,
              borderColor: `${s.color}25`
            }} onClick={() => handleSelect(i)}>
              <span style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{s.label}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textAlign: "center" as const, marginTop: 1 }}>{s.subtitle}</span>
            </button>
          ))}
        </div>

        {history.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <div style={{ flex: 1, ...S.card, padding: "10px 14px", borderColor: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 8 }}>
              <Flame size={14} color="#f472b6" />
              <span style={{ fontSize: 20, fontWeight: 800, color: "#f472b6", fontFamily: "monospace" }}>{history.length}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>sessioni</span>
            </div>
            <div style={{ flex: 1, ...S.card, padding: "10px 14px", borderColor: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={14} color="#fbbf24" />
              <span style={{ fontSize: 20, fontWeight: 800, color: "#fbbf24", fontFamily: "monospace" }}>{fmt(history.reduce((s, w) => s + w.duration, 0))}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>totale</span>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div style={S.root}>
      <div style={S.b1} /><div style={S.b2} /><div style={S.b3} />
      <div style={S.wrap}>
        {renderView()}
      </div>
      <div style={S.bottomNav}>
        <button style={{ ...S.navBtn, color: view === "home" ? "#818cf8" : "rgba(255,255,255,0.3)" }} onClick={() => setView("home")}>
          <Home size={20} /><span style={{ fontSize: 10, marginTop: 2 }}>Home</span>
        </button>
        <button style={{ ...S.navBtn, color: view === "dashboard" ? "#818cf8" : "rgba(255,255,255,0.3)" }} onClick={() => setView("dashboard")}>
          <BarChart3 size={20} /><span style={{ fontSize: 10, marginTop: 2 }}>Stats</span>
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const S: Record<string, React.CSSProperties> = {
  root: { minHeight: "100vh", background: "#0a0a14", fontFamily: "'Inter',system-ui,sans-serif", color: "#fff", position: "relative", overflowX: "hidden" },
  b1: { position: "fixed", top: "-120px", left: "-80px", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,rgba(129,140,248,0.08) 0%,transparent 65%)", pointerEvents: "none", zIndex: 0 },
  b2: { position: "fixed", bottom: "-60px", right: "-60px", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,rgba(251,113,133,0.06) 0%,transparent 65%)", pointerEvents: "none", zIndex: 0 },
  b3: { position: "fixed", top: "45%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 180, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(52,211,153,0.04) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 },
  wrap: { position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "24px 16px 100px" },
  title: { fontSize: "clamp(22px,5vw,32px)", fontWeight: 900, margin: 0, letterSpacing: "-0.03em", background: "linear-gradient(135deg,#818cf8 0%,#f472b6 50%,#34d399 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  tabs: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 8 },
  tab: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "20px 10px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, cursor: "pointer", transition: "all 0.2s", backdropFilter: "blur(20px)", background: "rgba(255,255,255,0.02)" },
  watch: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "18px 20px" },
  wLabel: { margin: "0 0 2px", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 },
  wTime: { margin: 0, fontSize: 36, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "1px" },
  card: { background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 14 },
  cardHead: { display: "flex", alignItems: "flex-start", gap: 12 },
  exName: { margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "#f0f0f0", letterSpacing: "-0.01em" },
  exMeta: { margin: 0, fontSize: 11, color: "rgba(255,255,255,0.33)" },
  infoBtn: { width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" },
  desc: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "10px 12px", margin: "10px 0 6px" },
  descTxt: { margin: 0, fontSize: 12, lineHeight: 1.7, color: "rgba(255,255,255,0.55)" },
  exTimer: { position: "relative", height: 38, background: "rgba(255,255,255,0.04)", borderRadius: 10, margin: "8px 0 2px", display: "flex", alignItems: "center", padding: "0 10px", gap: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" },
  timerBar: { position: "absolute", left: 0, top: 0, height: "100%", borderRadius: 10, opacity: 0.12, transition: "width 0.9s linear" },
  timerTxt: { fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 14, color: "#fff", zIndex: 1, letterSpacing: "1px" },
  sets: { display: "flex", flexWrap: "wrap", gap: 6, alignItems: "flex-end", marginTop: 12 },
  dot: { width: 38, height: 38, borderRadius: 11, border: "1px solid", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#fff", transition: "all 0.18s cubic-bezier(.4,0,.2,1)", display: "flex", alignItems: "center", justifyContent: "center" },
  restBtn: { padding: "6px 14px", borderRadius: 18, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", cursor: "pointer", fontSize: 11, fontWeight: 600, marginLeft: "auto", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s" },
  noteBtn: { padding: "2px 6px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 30, height: 20, transition: "all 0.15s" },
  noteInput: { width: 70, padding: "3px 6px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 10, outline: "none", fontFamily: "'JetBrains Mono',monospace" },
  overlay: { position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center" },
  modalCard: { background: "rgba(16,16,28,0.95)", backdropFilter: "blur(32px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "32px 24px", textAlign: "center", minWidth: 260, boxShadow: "0 24px 80px rgba(0,0,0,0.6)" },
  modalTitle: { margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em", textTransform: "uppercase" },
  btn: { padding: "8px 16px", borderRadius: 11, border: "none", cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5, transition: "all 0.15s" },
  sm: { width: 32, height: 32, borderRadius: 9, border: "none", cursor: "pointer", color: "#fff", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.07)", transition: "all 0.15s" },
  finishBtn: { width: "100%", padding: 14, borderRadius: 14, border: "none", cursor: "pointer", color: "#fff", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", marginTop: 8 },
  bottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: "rgba(10,10,20,0.92)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "center", gap: 48, padding: "8px 0 12px", paddingBottom: "max(12px, env(safe-area-inset-bottom))" },
  navBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 1, background: "none", border: "none", cursor: "pointer", padding: "4px 16px", transition: "all 0.15s" },
};
