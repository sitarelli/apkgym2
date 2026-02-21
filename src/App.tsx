import React, { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ExerciseRecord {
  name: string;
  setsCompleted: number;
  setsTotal: number;
  reps: string;
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

interface Activity {
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
  activities?: Activity[];
}

// ═══════════════════════════════════════════════════════════════════════════
// DATA — Sessions 1-3 remain UNCHANGED
// ═══════════════════════════════════════════════════════════════════════════

const sessions: Session[] = [
  {
    id: 1,
    label: "Sessione 1",
    subtitle: "Core · Petto · Tricipiti",
    color: "#6C63FF",
    glow: "rgba(108,99,255,0.45)",
    icon: "💪",
    type: "workout",
    groups: [
      {
        name: "Addominali",
        icon: "🔥",
        exercises: [
          {
            name: "Leg Raiser",
            sets: 3,
            reps: "15",
            rest: 60,
            description:
              "Sdraiati su una panca o sul pavimento con le mani sotto i glutei. Tieni le gambe tese e sollevale fino a 90°, poi abbassale lentamente senza toccare terra. Mantieni la zona lombare incollata al suolo. Respira: espira salendo, inspira scendendo.",
          },
          {
            name: "Crunches",
            sets: 3,
            reps: "20",
            rest: 60,
            description:
              "Sdraiati sulla schiena, ginocchia piegate, piedi a terra. Metti le mani dietro la testa. Stacca le spalle dal suolo contraendo il rettore addominale, senza tirare il collo. Movimento breve e controllato. Torna giù senza riposare completamente prima della prossima rep.",
          },
          {
            name: "Plank",
            sets: 3,
            reps: "30-60 sec",
            rest: 60,
            isTime: true,
            duration: 45,
            description:
              "Posizione prona: appoggiati sugli avambracci e sulle punte dei piedi. Il corpo forma una linea retta dalla testa ai talloni. Contrai addome, glutei e quadricipiti. Non far cadere i fianchi né alzarli. Respira in modo costante.",
          },
        ],
      },
      {
        name: "Petto & Tricipiti",
        icon: "🏋️",
        exercises: [
          {
            name: "Cavi dall'alto",
            sets: 4,
            reps: "15",
            rest: 90,
            description:
              "In piedi al centro del cavo-croce con le maniglie alte. Porta le braccia in avanti e in basso formando un arco, come se abbracciassi un albero. Tieni i gomiti leggermente piegati e fissi. Contrai il petto al picco, poi ritorna lentamente. Pre-affaticamento ideale per il petto.",
          },
          {
            name: "Bench Press (Panca Piana)",
            sets: 4,
            reps: "10",
            rest: 120,
            description:
              "Sdraiati sulla panca, piedi piatti a terra. Impugna il bilanciere leggermente più largo delle spalle. Scendi verso il petto (altezza capezzoli) in modo controllato, poi spingi esplosivo in su. Tieni i polsi dritti, le scapole retratte e i glutei sulla panca.",
          },
          {
            name: "Pull Over Bilanciere",
            sets: 3,
            reps: "10",
            rest: 90,
            description:
              "Sdraiati perpendicolare alla panca con solo le spalle appoggiate. Tieni il bilanciere sopra il petto con le braccia quasi tese. Abbassalo lentamente oltre la testa stirando il gran dorsale. Riporta in posizione contraendo i muscoli. Ottimo per espandere la cassa toracica.",
          },
          {
            name: "French Press Manubri",
            sets: 4,
            reps: "12",
            rest: 90,
            description:
              "Sdraiati sulla panca, tieni un manubrio in ogni mano con le braccia estese verso l'alto. Piega i gomiti abbassando i manubri verso le tempie, mantenendo i gomiti fermi e puntati verso il soffitto. Stendi le braccia tornando su. Concentrati sul tricipite lungo.",
          },
          {
            name: "Tricipiti ai Cavi",
            sets: 3,
            reps: "15",
            rest: 60,
            description:
              "In piedi davanti al cavo alto con corda o barra. Tieni i gomiti incollati ai fianchi — non si muovono. Estendi le braccia verso il basso contraendo i tricipiti, poi torna su lentamente. Piegati leggermente in avanti per isolare meglio il muscolo.",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    label: "Sessione 2",
    subtitle: "Core · Gambe · Spalle",
    color: "#FF6B6B",
    glow: "rgba(255,107,107,0.45)",
    icon: "🦵",
    type: "workout",
    groups: [
      {
        name: "Addome",
        icon: "🔥",
        exercises: [
          {
            name: "Rotary Torso",
            sets: 3,
            reps: "15",
            rest: 60,
            description:
              "Seduto sul macchinario Rotary Torso, busto bloccato, braccia incrociate sul petto. Ruota il torso da un lato all'altro contraendo gli obliqui. Esegui tutte le rip. per un lato, poi cambia. Movimento lento, evita gli scatti. Fondamentale per rinforzare gli obliqui.",
          },
        ],
      },
      {
        name: "Gambe",
        icon: "🦵",
        exercises: [
          {
            name: "Leg Press",
            sets: 4,
            reps: "15-12-10-8",
            rest: 120,
            description:
              "Siediti sul macchinario con i piedi alla larghezza delle spalle. Abbassa la piattaforma piegando le ginocchia fino a ~90° senza che superino le punte dei piedi. Spingi esplosivamente verso l'alto senza bloccare le ginocchia. Peso crescente ogni serie (piramidale).",
          },
          {
            name: "Affondi in camminata",
            sets: 3,
            reps: "10+10",
            rest: 90,
            description:
              "In piedi con i manubri ai lati. Fai un passo avanti lungo e scendi col ginocchio posteriore verso terra. Il ginocchio anteriore non deve superare la punta del piede. Spingiti avanti col piede anteriore. 10 rip. per gamba. Mantieni busto eretto e core contratto.",
          },
        ],
      },
      {
        name: "Cardio",
        icon: "🚴",
        exercises: [
          {
            name: "Cyclette",
            sets: 1,
            reps: "10 min",
            rest: 0,
            isTime: true,
            duration: 600,
            description:
              "10 minuti di cyclette a intensità moderata. Mantieni un ritmo costante (RPM 70-90). Imposta una resistenza che ti faccia lavorare senza essere troppo affannato. Migliora la circolazione e favorisce il recupero attivo tra gambe e spalle.",
          },
        ],
      },
      {
        name: "Spalle",
        icon: "🏋️",
        exercises: [
          {
            name: "Croci a 90°",
            sets: 4,
            reps: "12",
            rest: 90,
            description:
              "In piedi o seduto, con i manubri ai lati. Solleva le braccia lateralmente fino all'altezza delle spalle (90°), gomiti leggermente flessi. Al picco i palmi guardano verso il basso. Abbassa lentamente senza dondolare il busto. Isola il deltoide medio. Peso leggero, tecnica perfetta.",
          },
          {
            name: "Shoulder Press",
            sets: 4,
            reps: "15-12-10-8",
            rest: 120,
            description:
              "Seduto su una panca con schienale, tieni i manubri all'altezza delle orecchie con i gomiti a 90°. Spingi verso l'alto fino quasi all'estensione completa, poi torna giù lentamente. Peso crescente ogni serie. Coinvolge deltoide anteriore e medio, oltre al tricipite.",
          },
        ],
      },
    ],
  },
  {
    id: 3,
    label: "Sessione 3",
    subtitle: "Lombare · Dorso · Bicipiti",
    color: "#00D4AA",
    glow: "rgba(0,212,170,0.45)",
    icon: "🦾",
    type: "workout",
    groups: [
      {
        name: "Addome / Lombare",
        icon: "🔥",
        exercises: [
          {
            name: "Hyperextension",
            sets: 3,
            reps: "15",
            rest: 60,
            description:
              "Sul macchinario per l'iperestensione, posizionati con le anche sul cuscinetto e i piedi bloccati. Mani incrociate sul petto. Scendi piegando il busto verso il basso, poi risali contraendo i lombari fino a essere in linea retta (non oltre). Rinforza erettori spinali, glutei, ischio-crurali.",
          },
        ],
      },
      {
        name: "Dorso",
        icon: "🔙",
        exercises: [
          {
            name: "Row Presa Stretta",
            sets: 4,
            reps: "8",
            rest: 120,
            description:
              "Al cavo basso con presa prona stretta. Tira verso l'ombelico mantenendo i gomiti vicini ai fianchi. Contrai le scapole al centro alla fine del movimento. La schiena rimane dritta. Torna avanti con controllo senza perdere la tensione. Colpisce gran dorsale e romboidi.",
          },
          {
            name: "Row Presa Larga",
            sets: 2,
            reps: "18",
            rest: 90,
            description:
              "Stessa esecuzione del Row ma con presa larga. I gomiti si aprono verso l'esterno, coinvolgendo il deltoide posteriore e le fibre superiori del dorsale. Volume alto (18 rep) per il pump e la resistenza. Usa un peso più leggero rispetto alla presa stretta.",
          },
          {
            name: "Lat Avanti",
            sets: 4,
            reps: "15-12-10-8",
            rest: 120,
            description:
              "Alla lat machine, impugna la sbarra larga. Tirala verso il petto (non alla nuca) con un lieve arco lombare e il petto aperto verso l'alto. I gomiti puntano verso il pavimento e le scapole si abbassano. Risali lentamente. Serie piramidale: aumenta il carico ogni set.",
          },
        ],
      },
      {
        name: "Bicipiti",
        icon: "💪",
        exercises: [
          {
            name: "Curl Cavo Basso",
            sets: 4,
            reps: "10",
            rest: 90,
            description:
              "Al cavo basso con barra diritta o corda. Gomiti ai fianchi fissi, fletti le braccia portando la barra verso le spalle. La tensione del cavo mantiene il muscolo sotto stress anche nella posizione bassa. Torna giù lentamente senza dondolare il busto.",
          },
          {
            name: "Curl Manubri",
            sets: 3,
            reps: "8+8",
            rest: 90,
            description:
              "In piedi o seduto, con un manubrio in ogni mano. Esegui il curl alternato: fletti un braccio ruotando il polso verso l'esterno (supinazione) al picco. 8 rip. per braccio. Tieni il gomito fermo senza portarlo avanti durante il curl. Movimento lento e controllato.",
          },
        ],
      },
    ],
  },
  {
    id: 4,
    label: "Attività Extra",
    subtitle: "Gravel Bike · Passeggiata",
    color: "#FFA500",
    glow: "rgba(255,165,0,0.45)",
    icon: "🚴",
    type: "extra",
    activities: [
      {
        name: "Gravel Bike",
        icon: "🚵",
        description: "Sessione di ciclismo su gravel. Avvia il timer e registra la durata della tua uscita.",
      },
      {
        name: "Passeggiata",
        icon: "🚶",
        description: "Camminata all'aperto. Avvia il timer per tracciare la durata dell'attività.",
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function useTimer(initialSeconds: number) {
  const [time, setTime] = useState<number>(initialSeconds);
  const [running, setRunning] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (running && time > 0) {
      intervalRef.current = setInterval(() => setTime((t: number) => t - 1), 1000);
    } else if (time === 0) setRunning(false);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, time]);
  return {
    time,
    running,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset: () => { setRunning(false); setTime(initialSeconds); },
  };
}

// Persistent rest timer that keeps counting even when app is in background
const REST_TIMER_KEY = "restTimerState";

function saveRestTimerState(endTimestamp: number, totalSeconds: number): void {
  localStorage.setItem(REST_TIMER_KEY, JSON.stringify({ endTimestamp, totalSeconds }));
}

function clearRestTimerState(): void {
  localStorage.removeItem(REST_TIMER_KEY);
}

function getRestTimerState(): { endTimestamp: number; totalSeconds: number } | null {
  try {
    const raw = localStorage.getItem(REST_TIMER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function fireRestNotification(): void {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("💪 Recupero completato!", {
      body: "È ora di iniziare la prossima serie!",
      icon: "/icon.png",
      badge: "/icon.png",
      tag: "rest-timer",
    });
  }
}

function fmt(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function getWorkoutHistory(): WorkoutRecord[] {
  const stored = localStorage.getItem("workoutHistory");
  return stored ? JSON.parse(stored) : [];
}

function saveWorkout(workout: WorkoutRecord): void {
  const history = getWorkoutHistory();
  history.push(workout);
  localStorage.setItem("workoutHistory", JSON.stringify(history));
}

function deleteWorkout(id: string): void {
  const history = getWorkoutHistory().filter((w: WorkoutRecord) => w.id !== id);
  localStorage.setItem("workoutHistory", JSON.stringify(history));
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS — Modals & Timers
// ═══════════════════════════════════════════════════════════════════════════

function RestTimerModal({ seconds, onClose }: { seconds: number; onClose: () => void }) {
  // Calculate initial remaining time from persisted state (background-aware)
  const calcRemaining = () => {
    const state = getRestTimerState();
    if (state && state.totalSeconds === seconds) {
      const remaining = Math.ceil((state.endTimestamp - Date.now()) / 1000);
      return Math.max(0, remaining);
    }
    return seconds;
  };

  const [time, setTime] = useState(calcRemaining);
  const [running, setRunning] = useState(false);
  const [notifGranted, setNotifGranted] = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );
  const notifiedRef = useRef<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // On mount: request notifications, start timer, restore state if any
  useEffect(() => {
    requestNotificationPermission().then(granted => setNotifGranted(granted));
    // If there's a persisted timer running, restore it
    const state = getRestTimerState();
    if (state && state.totalSeconds === seconds && state.endTimestamp > Date.now()) {
      setRunning(true);
    } else {
      // Fresh start
      const endTs = Date.now() + seconds * 1000;
      saveRestTimerState(endTs, seconds);
      setRunning(true);
    }
  }, []);

  // Tick every 250ms using wall-clock time for accuracy even when throttled
  useEffect(() => {
    if (!running) { if(intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      const state = getRestTimerState();
      if (!state) { setRunning(false); return; }
      const remaining = Math.ceil((state.endTimestamp - Date.now()) / 1000);
      if (remaining <= 0) {
        setTime(0);
        setRunning(false);
        clearRestTimerState();
        if (!notifiedRef.current) { notifiedRef.current = true; fireRestNotification(); }
      } else {
        setTime(remaining);
      }
    }, 250);
    return () => { if(intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const handlePause = () => {
    clearRestTimerState();
    setRunning(false);
  };

  const handleResume = () => {
    const endTs = Date.now() + time * 1000;
    saveRestTimerState(endTs, seconds);
    notifiedRef.current = false;
    setRunning(true);
  };

  const handleReset = () => {
    clearRestTimerState();
    setRunning(false);
    notifiedRef.current = false;
    setTime(seconds);
  };

  const handleClose = () => {
    // Keep timer state in localStorage so it keeps running in background
    onClose();
  };

  const pct = (time / seconds) * 100;
  const C = 2 * Math.PI * 54;
  const isExpired = time === 0;

  return (
    <div style={S.overlay} onClick={handleClose}>
      <div style={S.modalCard} onClick={(e) => e.stopPropagation()}>
        <p style={S.modalTitle}>⏱ Recupero</p>
        {!notifGranted && (
          <p style={{fontSize:"11px",color:"rgba(255,200,100,0.8)",margin:"-8px 0 10px",textAlign:"center"}}>
            ⚠️ Abilita le notifiche per l'allarme
          </p>
        )}
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
          <circle cx="65" cy="65" r="54" fill="none"
            stroke={isExpired ? "#00D4AA" : time <= 10 ? "#FF6B6B" : "#6C63FF"} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)}
            transform="rotate(-90 65 65)"
            style={{ transition: "stroke-dashoffset 0.25s linear, stroke 0.3s" }} />
          <text x="65" y="70" textAnchor="middle" fill="white" fontSize="26" fontWeight="700" fontFamily="monospace">
            {fmt(time)}
          </text>
        </svg>
        <div style={S.row}>
          {running
            ? <button style={{...S.btn, background:"rgba(255,255,255,0.15)"}} onClick={handlePause}>⏸ Pausa</button>
            : <button style={{...S.btn, background:"rgba(108,99,255,0.6)"}} onClick={handleResume}>▶ {isExpired ? "Nuovo" : "Riprendi"}</button>}
          <button style={{...S.btn, background:"rgba(255,107,107,0.4)"}} onClick={handleReset}>↺</button>
          <button style={{...S.btn, background:"rgba(255,255,255,0.08)"}} onClick={handleClose}>✕ Chiudi</button>
        </div>
        {isExpired && (
          <p style={{color:"#00D4AA",fontWeight:"700",marginTop:"10px",animation:"pulse 1s infinite"}}>
            ✅ Recupero completato!
          </p>
        )}
        {running && !isExpired && (
          <p style={{fontSize:"11px",color:"rgba(255,255,255,0.4)",marginTop:"10px"}}>
            Il timer continua anche se chiudi questa finestra
          </p>
        )}
      </div>
    </div>
  );
}

function ExTimer({ duration }: { duration: number }) {
  const { time, running, start, pause, reset } = useTimer(duration);
  const pct = (time / duration) * 100;
  const col = time <= 10 ? "#FF6B6B" : "#00D4AA";
  return (
    <div style={S.exTimer}>
      <div style={{...S.timerBar, width:`${pct}%`, background:col}} />
      <span style={S.timerTxt}>{fmt(time)}</span>
      <div style={{display:"flex",gap:"6px",marginLeft:"auto",position:"relative",zIndex:1}}>
        {running
          ? <button style={S.sm} onClick={pause}>⏸</button>
          : <button style={{...S.sm, background:"rgba(0,212,170,0.4)"}} onClick={start}>▶</button>}
        <button style={{...S.sm, background:"rgba(255,107,107,0.3)"}} onClick={reset}>↺</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKOUT SESSION COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function ExCard({ ex, color, done, onSet }: { ex: Exercise; color: string; done: number; onSet: (i: number) => void }) {
  const [open, setOpen] = useState(false);
  const [showRest, setShowRest] = useState(false);
  return (
    <>
      {showRest && <RestTimerModal seconds={ex.rest||90} onClose={()=>setShowRest(false)} />}
      <div style={{...S.card, borderColor:`${color}44`}}>
        <div style={S.cardHead}>
          <div style={{flex:1}}>
            <p style={S.exName}>{ex.name}</p>
            <p style={S.exMeta}>{ex.sets} serie · {ex.reps} rip.{ex.rest>0?` · rec.${ex.rest}s`:""}</p>
          </div>
          <button style={{...S.infoBtn, borderColor:`${color}66`, color}} onClick={()=>setOpen(!open)}>
            {open?"✕":"ℹ"}
          </button>
        </div>
        {open && (
          <div style={{...S.desc, borderColor:`${color}33`}}>
            <p style={S.descTxt}>{ex.description}</p>
          </div>
        )}
        {ex.isTime && ex.duration && <ExTimer duration={ex.duration} />}
        <div style={S.sets}>
          {Array.from({length:ex.sets}).map((_,i)=>(
            <button key={i}
              style={{...S.dot, background:done>i?color:"rgba(255,255,255,0.08)",
                borderColor:done>i?color:"rgba(255,255,255,0.2)",
                boxShadow:done>i?`0 0 10px ${color}88`:"none"}}
              onClick={()=>onSet(i)}>
              {done>i?"✓":i+1}
            </button>
          ))}
          {ex.rest>0&&(
            <button style={{...S.restBtn, borderColor:`${color}55`, color}} onClick={()=>setShowRest(true)}>
              ⏱ Recupero
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function Group({ group, color, completedSets, onSetComplete }: { group: ExerciseGroup; color: string; completedSets: number[]; onSetComplete: (exIdx: number, setIdx: number) => void }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"2px"}}>
        <span style={{fontSize:"20px"}}>{group.icon}</span>
        <span style={{fontSize:"16px",fontWeight:"700",color}}>{group.name}</span>
      </div>
      {group.exercises.map((ex,i)=>(
        <ExCard key={ex.name} ex={ex} color={color} done={completedSets[i]}
          onSet={si=>onSetComplete(i, si)} />
      ))}
    </div>
  );
}

function WorkoutSession({ session, onFinish }: { session: Session; onFinish: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [completedSets, setCompletedSets] = useState(
    () => (session.groups ?? []).map(g => g.exercises.map(() => 0))
  );
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(()=>{
    if(running) ref.current=setInterval(()=>setElapsed((e: number)=>e+1),1000);
    else { if(ref.current) clearInterval(ref.current); }
    return ()=>{ if(ref.current) clearInterval(ref.current); };
  },[running]);

  const handleSetComplete = (groupIdx: number, exIdx: number, setIdx: number) => {
    setCompletedSets(prev => {
      const next = prev.map(g => [...g]);
      const current = next[groupIdx][exIdx];
      next[groupIdx][exIdx] = current >= setIdx + 1 ? setIdx : setIdx + 1;
      return next;
    });
  };

  const handleFinish = () => {
    const exercises = [];
    session.groups.forEach((group, gIdx) => {
      group.exercises.forEach((ex, eIdx) => {
        exercises.push({
          name: ex.name,
          setsCompleted: completedSets[gIdx][eIdx],
          setsTotal: ex.sets,
          reps: ex.reps,
        });
      });
    });

    const totalSets = exercises.reduce((sum: number, ex: ExerciseRecord) => sum + ex.setsTotal, 0);
    const doneSets = exercises.reduce((sum: number, ex: ExerciseRecord) => sum + ex.setsCompleted, 0);

    const workout = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      sessionId: session.id,
      sessionName: session.label,
      duration: elapsed,
      completed: true,
      exercises,
      totalSets,
      completedSets: doneSets,
    };

    saveWorkout(workout);
    onFinish();
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
      <div style={{...S.watch, borderColor:`${session.color}44`, boxShadow:`0 0 30px ${session.glow}`}}>
        <div>
          <p style={S.wLabel}>Durata sessione</p>
          <p style={{...S.wTime, color:session.color}}>{fmt(elapsed)}</p>
        </div>
        <div style={S.row}>
          {running
            ? <button style={{...S.btn, background:"rgba(255,255,255,0.1)"}} onClick={()=>setRunning(false)}>⏸ Pausa</button>
            : <button style={{...S.btn, background:`${session.color}99`}} onClick={()=>setRunning(true)}>▶ {elapsed===0?"Inizia":"Riprendi"}</button>}
          <button style={{...S.btn, background:"rgba(255,107,107,0.3)"}} onClick={()=>{setRunning(false);setElapsed(0);}}>↺ Reset</button>
        </div>
      </div>

      {session.groups.map((g, gIdx)=>(
        <Group key={g.name} group={g} color={session.color}
          completedSets={completedSets[gIdx]}
          onSetComplete={(exIdx, setIdx) => handleSetComplete(gIdx, exIdx, setIdx)} />
      ))}

      <button style={{...S.finishBtn, background:`${session.color}99`}} onClick={handleFinish}>
        ✅ Completa Sessione
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXTRA ACTIVITIES SESSION
// ═══════════════════════════════════════════════════════════════════════════

function ExtraActivitiesSession({ session, onFinish }: { session: Session; onFinish: () => void }) {
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(()=>{
    if(running) ref.current=setInterval(()=>setElapsed((e: number)=>e+1),1000);
    else { if(ref.current) clearInterval(ref.current); }
    return ()=>{ if(ref.current) clearInterval(ref.current); };
  },[running]);

  const handleStart = (activity: Activity) => {
    setActiveActivity(activity);
    setElapsed(0);
    setRunning(true);
  };

  const handleFinish = () => {
    if (!activeActivity) return;

    const workout = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      sessionId: session.id,
      sessionName: `${session.label} - ${activeActivity.name}`,
      activityType: activeActivity.name,
      duration: elapsed,
      completed: true,
      exercises: [],
      totalSets: 0,
      completedSets: 0,
    };

    saveWorkout(workout);
    setActiveActivity(null);
    setElapsed(0);
    setRunning(false);
    onFinish();
  };

  if (activeActivity) {
    return (
      <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
        <div style={{...S.card, borderColor:`${session.color}44`}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"}}>
            <span style={{fontSize:"36px"}}>{activeActivity.icon}</span>
            <div>
              <h3 style={{margin:0,fontSize:"20px",fontWeight:"700",color:session.color}}>{activeActivity.name}</h3>
              <p style={{margin:"4px 0 0",fontSize:"13px",color:"rgba(255,255,255,0.55)"}}>{activeActivity.description}</p>
            </div>
          </div>

          <div style={{...S.watch, borderColor:`${session.color}44`, boxShadow:`0 0 30px ${session.glow}`, marginTop:"16px"}}>
            <div>
              <p style={S.wLabel}>Durata attività</p>
              <p style={{...S.wTime, color:session.color}}>{fmt(elapsed)}</p>
            </div>
            <div style={S.row}>
              {running
                ? <button style={{...S.btn, background:"rgba(255,255,255,0.1)"}} onClick={()=>setRunning(false)}>⏸ Pausa</button>
                : <button style={{...S.btn, background:`${session.color}99`}} onClick={()=>setRunning(true)}>▶ Riprendi</button>}
              <button style={{...S.btn, background:"rgba(255,107,107,0.3)"}} onClick={()=>{setRunning(false);setElapsed(0);}}>↺ Reset</button>
            </div>
          </div>
        </div>

        <button style={{...S.finishBtn, background:`${session.color}99`}} onClick={handleFinish}>
          ✅ Completa Attività
        </button>
        <button style={{...S.btn, background:"rgba(255,255,255,0.08)",width:"100%",padding:"12px"}} 
          onClick={()=>{setActiveActivity(null);setElapsed(0);setRunning(false);}}>
          ← Torna alla selezione
        </button>
      </div>
    );
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
      <p style={{fontSize:"15px",color:"rgba(255,255,255,0.65)",margin:"0 0 8px"}}>
        Seleziona un'attività per iniziare il timer:
      </p>
      {session.activities.map(activity => (
        <div key={activity.name} style={{...S.card, borderColor:`${session.color}44`, cursor:"pointer"}}
          onClick={() => handleStart(activity)}>
          <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
            <span style={{fontSize:"42px"}}>{activity.icon}</span>
            <div style={{flex:1}}>
              <h3 style={{margin:0,fontSize:"18px",fontWeight:"700",color:"#fff"}}>{activity.name}</h3>
              <p style={{margin:"4px 0 0",fontSize:"13px",color:"rgba(255,255,255,0.55)",lineHeight:"1.5"}}>{activity.description}</p>
            </div>
            <span style={{fontSize:"24px",color:session.color}}>▶</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

function Dashboard({ onBack }: { onBack: () => void }) {
  const history = getWorkoutHistory();
  const [filter, setFilter] = useState("all"); // all, 7d, 30d, 90d, year
  const [showHistory, setShowHistory] = useState(false);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = {
      exportDate: new Date().toISOString(),
      appVersion: "v3",
      workouts: history,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `workout_backup_${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        let workouts = [];
        if (Array.isArray(parsed)) {
          workouts = parsed;
        } else if (parsed.workouts && Array.isArray(parsed.workouts)) {
          workouts = parsed.workouts;
        } else {
          setImportMsg({ ok: false, text: "❌ File non valido" });
          return;
        }
        // Merge: skip duplicates by id
        const existing = getWorkoutHistory();
        const existingIds = new Set(existing.map(w => w.id));
        const newOnes = workouts.filter(w => !existingIds.has(w.id));
        const merged = [...existing, ...newOnes].sort((a, b) => new Date(a.date) - new Date(b.date));
        localStorage.setItem("workoutHistory", JSON.stringify(merged));
        setImportMsg({ ok: true, text: `✅ Importati ${newOnes.length} allenamenti (${workouts.length - newOnes.length} già presenti)` });
        setTimeout(() => window.location.reload(), 1800);
      } catch {
        setImportMsg({ ok: false, text: "❌ Errore nel parsing del file" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Calculate stats
  const now = new Date();
  const filterDays = { "7d": 7, "30d": 30, "90d": 90, "year": 365 };
  const cutoff = filter === "all" ? null : new Date(now - filterDays[filter] * 24 * 60 * 60 * 1000);
  
  const filtered = cutoff 
    ? history.filter(w => new Date(w.date) >= cutoff)
    : history;

  const totalWorkouts = filtered.length;
  const totalSets = filtered.reduce((sum: number, w: WorkoutRecord) => sum + (w.completedSets || 0), 0);
  const avgDuration = totalWorkouts > 0 
    ? Math.round(filtered.reduce((sum: number, w: WorkoutRecord) => sum + w.duration, 0) / totalWorkouts)
    : 0;

  // Streak calculation
  const sortedDates = history
    .map(w => new Date(w.date).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => new Date(b) - new Date(a));
  
  let streak = 0;
  let currentDate = new Date();
  for (let date of sortedDates) {
    const diff = Math.floor((currentDate - new Date(date)) / (24 * 60 * 60 * 1000));
    if (diff === streak) streak++;
    else break;
  }

  // Sessions distribution
  const sessionCounts = filtered.reduce((acc, w) => {
    const key = w.sessionId || "other";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // Exercise frequency
  const exerciseFreq = {};
  filtered.forEach(w => {
    if (w.exercises) {
      w.exercises.forEach(ex => {
        exerciseFreq[ex.name] = (exerciseFreq[ex.name] || 0) + ex.setsCompleted;
      });
    }
  });
  const topExercises = Object.entries(exerciseFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const statCards = [
    { label: "Streak 🔥", value: `${streak} giorni`, color: "#FF6B6B" },
    { label: "Allenamenti", value: totalWorkouts, color: "#6C63FF" },
    { label: "Serie Totali", value: totalSets, color: "#00D4AA" },
    { label: "Durata Media", value: fmt(avgDuration), color: "#FFA500" },
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"20px",paddingBottom:"40px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <h2 style={{margin:0,fontSize:"24px",fontWeight:"800",color:"#fff"}}>📊 Dashboard</h2>
        <button style={{...S.btn, background:"rgba(255,255,255,0.08)"}} onClick={onBack}>
          ← Allenamenti
        </button>
      </div>

      {/* Backup / Restore */}
      <div style={{...S.card, borderColor:"rgba(255,165,0,0.3)", background:"rgba(255,165,0,0.06)"}}>
        <p style={{margin:"0 0 12px",fontSize:"13px",fontWeight:"700",color:"#FFA500",letterSpacing:"0.05em"}}>
          💾 BACKUP DATI
        </p>
        <p style={{margin:"0 0 12px",fontSize:"12px",color:"rgba(255,255,255,0.5)",lineHeight:"1.6"}}>
          Esporta un file JSON con tutto lo storico — copialo su Google Drive per non perderlo.
        </p>
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
          <button style={{...S.btn, background:"rgba(255,165,0,0.5)", padding:"10px 20px", fontSize:"13px"}}
            onClick={handleExport}>
            ⬇️ Salva Dati (JSON)
          </button>
          <button style={{...S.btn, background:"rgba(108,99,255,0.4)", padding:"10px 20px", fontSize:"13px"}}
            onClick={() => fileInputRef.current?.click()}>
            ⬆️ Importa Dati
          </button>
          <input ref={fileInputRef} type="file" accept=".json" style={{display:"none"}} onChange={handleImport} />
        </div>
        {importMsg && (
          <p style={{margin:"10px 0 0",fontSize:"13px",fontWeight:"600",
            color: importMsg.ok ? "#00D4AA" : "#FF6B6B"}}>
            {importMsg.text}
          </p>
        )}
      </div>

      {/* Filter buttons */}
      <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
        {["all", "7d", "30d", "90d", "year"].map(f => (
          <button key={f}
            style={{...S.btn, 
              background: filter === f ? "rgba(108,99,255,0.6)" : "rgba(255,255,255,0.08)",
              border: filter === f ? "1px solid #6C63FF" : "none"}}
            onClick={() => setFilter(f)}>
            {f === "all" ? "Tutto" : f === "7d" ? "7 giorni" : f === "30d" ? "30 giorni" : f === "90d" ? "90 giorni" : "Anno"}
          </button>
        ))}
      </div>

      {/* Stats cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"12px"}}>
        {statCards.map(card => (
          <div key={card.label} style={{...S.card, borderColor:`${card.color}44`, padding:"16px"}}>
            <p style={{margin:"0 0 4px",fontSize:"11px",color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:"0.05em"}}>
              {card.label}
            </p>
            <p style={{margin:0,fontSize:"26px",fontWeight:"800",color:card.color}}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Session distribution */}
      <div style={{...S.card, borderColor:"rgba(255,255,255,0.12)"}}>
        <h3 style={{margin:"0 0 16px",fontSize:"16px",fontWeight:"700"}}>Distribuzione Sessioni</h3>
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          {Object.entries(sessionCounts).map(([id, count]) => {
            const session = sessions.find(s => s.id === parseInt(id));
            const label = session ? session.label : "Altre attività";
            const color = session ? session.color : "#999";
            const pct = (count / totalWorkouts * 100).toFixed(0);
            return (
              <div key={id} style={{display:"flex",alignItems:"center",gap:"12px"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                    <span style={{fontSize:"13px",fontWeight:"600",color}}>{label}</span>
                    <span style={{fontSize:"12px",color:"rgba(255,255,255,0.5)"}}>{count} × ({pct}%)</span>
                  </div>
                  <div style={{height:"6px",background:"rgba(255,255,255,0.08)",borderRadius:"3px",overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:color,transition:"width 0.3s"}} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top exercises */}
      {topExercises.length > 0 && (
        <div style={{...S.card, borderColor:"rgba(255,255,255,0.12)"}}>
          <h3 style={{margin:"0 0 16px",fontSize:"16px",fontWeight:"700"}}>Top 5 Esercizi</h3>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {topExercises.map(([name, sets], idx) => (
              <div key={name} style={{display:"flex",alignItems:"center",gap:"12px"}}>
                <span style={{fontSize:"18px",fontWeight:"700",color:"rgba(255,255,255,0.3)",minWidth:"24px"}}>
                  #{idx + 1}
                </span>
                <div style={{flex:1}}>
                  <p style={{margin:"0 0 2px",fontSize:"14px",fontWeight:"600",color:"#fff"}}>{name}</p>
                  <p style={{margin:0,fontSize:"12px",color:"rgba(255,255,255,0.5)"}}>{sets} serie</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History toggle */}
      <button style={{...S.btn, background:"rgba(108,99,255,0.3)",width:"100%",padding:"12px"}}
        onClick={() => setShowHistory(!showHistory)}>
        {showHistory ? "Nascondi Storico ▲" : "Mostra Storico ▼"}
      </button>

      {/* History list */}
      {showHistory && (
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          {history.slice().reverse().map(w => {
            const session = sessions.find(s => s.id === w.sessionId);
            const color = session ? session.color : "#999";
            const date = new Date(w.date);
            const dateStr = date.toLocaleDateString("it-IT", {day:"numeric",month:"short",year:"numeric"});
            const timeStr = date.toLocaleTimeString("it-IT", {hour:"2-digit",minute:"2-digit"});
            
            return (
              <div key={w.id} style={{...S.card, borderColor:`${color}33`, padding:"14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
                  <div>
                    <p style={{margin:"0 0 2px",fontSize:"14px",fontWeight:"700",color}}>{w.sessionName}</p>
                    <p style={{margin:0,fontSize:"11px",color:"rgba(255,255,255,0.45)"}}>
                      {dateStr} · {timeStr}
                    </p>
                  </div>
                  <button style={{...S.sm, background:"rgba(255,107,107,0.3)",width:"28px",height:"28px",fontSize:"12px"}}
                    onClick={() => {
                      if (confirm("Eliminare questo allenamento?")) {
                        deleteWorkout(w.id);
                        window.location.reload();
                      }
                    }}>
                    🗑
                  </button>
                </div>
                <div style={{display:"flex",gap:"16px",fontSize:"12px",color:"rgba(255,255,255,0.55)"}}>
                  <span>⏱ {fmt(w.duration)}</span>
                  {w.completedSets > 0 && <span>💪 {w.completedSets} serie</span>}
                </div>
              </div>
            );
          })}
          {history.length === 0 && (
            <p style={{textAlign:"center",color:"rgba(255,255,255,0.45)",padding:"20px"}}>
              Nessun allenamento registrato
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════

export default function App() {
  const [view, setView] = useState("tabs"); // tabs | session | dashboard
  const [activeSession, setActiveSession] = useState(0);

  const handleSessionSelect = (idx: number) => {
    setActiveSession(idx);
    setView("session");
  };

  const handleFinish = () => {
    alert("✅ Sessione salvata!");
    setView("tabs");
  };

  if (view === "dashboard") {
    return (
      <div style={S.root}>
        <div style={S.b1}/><div style={S.b2}/><div style={S.b3}/>
        <div style={S.wrap}>
          <Dashboard onBack={() => setView("tabs")} />
        </div>
      </div>
    );
  }

  if (view === "session") {
    const session = sessions[activeSession];
    return (
      <div style={S.root}>
        <div style={S.b1}/><div style={S.b2}/><div style={S.b3}/>
        <div style={S.wrap}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px"}}>
            <h2 style={{margin:0,fontSize:"20px",fontWeight:"700",color:session.color}}>
              {session.icon} {session.label}
            </h2>
            <button style={{...S.btn, background:"rgba(255,255,255,0.08)"}} 
              onClick={() => setView("tabs")}>
              ← Indietro
            </button>
          </div>
          {session.type === "extra" ? (
            <ExtraActivitiesSession session={session} onFinish={handleFinish} />
          ) : (
            <WorkoutSession session={session} onFinish={handleFinish} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={S.root}>
      <div style={S.b1}/><div style={S.b2}/><div style={S.b3}/>
      <div style={S.wrap}>
        <div style={{textAlign:"center",marginBottom:"28px"}}>
          <h1 style={S.title}>🏋️ Scheda Allenamento</h1>
          <p style={{color:"rgba(255,255,255,0.45)",fontSize:"13px",margin:0}}>
            3 sessioni + Attività Extra
          </p>
        </div>

        <div style={{display:"flex",gap:"10px",marginBottom:"24px",justifyContent:"center"}}>
          <button style={{...S.btn, background:"rgba(108,99,255,0.5)",padding:"10px 20px"}}
            onClick={() => setView("dashboard")}>
            📊 Dashboard
          </button>
        </div>

        <div style={S.tabs}>
          {sessions.map((s,i)=>(
            <button key={s.id} style={{...S.tab,
              background:`linear-gradient(135deg,${s.color}66,${s.color}33)`,
              borderColor:`${s.color}88`}}
              onClick={()=>handleSessionSelect(i)}>
              <span style={{fontSize:"32px",marginBottom:"4px"}}>{s.icon}</span>
              <span style={{fontSize:"14px",fontWeight:"700",color:"#fff"}}>{s.label}</span>
              <span style={{fontSize:"11px",color:"rgba(255,255,255,0.65)",textAlign:"center",marginTop:"2px"}}>
                {s.subtitle}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const S: Record<string, CSSProperties> = {
  root:{minHeight:"100vh",background:"linear-gradient(135deg,#0a0a1a 0%,#0d1224 50%,#0a0a1a 100%)",fontFamily:"'Segoe UI',system-ui,sans-serif",color:"#fff",position:"relative",overflowX:"hidden"},
  b1:{position:"fixed",top:"-120px",left:"-120px",width:"420px",height:"420px",borderRadius:"50%",background:"radial-gradient(circle,rgba(108,99,255,0.18) 0%,transparent 70%)",pointerEvents:"none",zIndex:0},
  b2:{position:"fixed",bottom:"-100px",right:"-100px",width:"380px",height:"380px",borderRadius:"50%",background:"radial-gradient(circle,rgba(255,107,107,0.15) 0%,transparent 70%)",pointerEvents:"none",zIndex:0},
  b3:{position:"fixed",top:"40%",left:"50%",transform:"translate(-50%,-50%)",width:"300px",height:"300px",borderRadius:"50%",background:"radial-gradient(circle,rgba(0,212,170,0.08) 0%,transparent 70%)",pointerEvents:"none",zIndex:0},
  wrap:{position:"relative",zIndex:1,maxWidth:"760px",margin:"0 auto",padding:"24px 16px 64px"},
  title:{fontSize:"clamp(22px,5vw,34px)",fontWeight:"800",margin:"0 0 6px",background:"linear-gradient(90deg,#6C63FF,#FF6B6B,#00D4AA)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},
  tabs:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"12px"},
  tab:{display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",padding:"20px 12px",border:"1px solid",borderRadius:"16px",cursor:"pointer",transition:"all 0.25s cubic-bezier(.4,0,.2,1)",backdropFilter:"blur(14px)"},
  watch:{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px",background:"rgba(255,255,255,0.05)",backdropFilter:"blur(20px)",border:"1px solid",borderRadius:"20px",padding:"18px 20px"},
  wLabel:{margin:"0 0 4px",fontSize:"12px",color:"rgba(255,255,255,0.5)",letterSpacing:"0.05em",textTransform:"uppercase"},
  wTime:{margin:0,fontSize:"36px",fontWeight:"800",fontFamily:"monospace",letterSpacing:"2px"},
  card:{background:"rgba(255,255,255,0.05)",backdropFilter:"blur(16px)",border:"1px solid",borderRadius:"16px",padding:"16px"},
  cardHead:{display:"flex",alignItems:"flex-start",gap:"12px"},
  exName:{margin:"0 0 4px",fontSize:"15px",fontWeight:"700",color:"#fff"},
  exMeta:{margin:0,fontSize:"12px",color:"rgba(255,255,255,0.45)"},
  infoBtn:{width:"32px",height:"32px",borderRadius:"50%",border:"1px solid",background:"transparent",cursor:"pointer",fontSize:"14px",fontWeight:"700",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"},
  desc:{background:"rgba(255,255,255,0.04)",border:"1px solid",borderRadius:"10px",padding:"12px 14px",margin:"12px 0 8px"},
  descTxt:{margin:0,fontSize:"13px",lineHeight:"1.65",color:"rgba(255,255,255,0.75)"},
  exTimer:{position:"relative",height:"38px",background:"rgba(255,255,255,0.06)",borderRadius:"10px",margin:"10px 0 2px",display:"flex",alignItems:"center",padding:"0 12px",gap:"10px",overflow:"hidden"},
  timerBar:{position:"absolute",left:0,top:0,height:"100%",borderRadius:"10px",opacity:0.15,transition:"width 0.9s linear,background 0.3s"},
  timerTxt:{fontFamily:"monospace",fontWeight:"700",fontSize:"16px",color:"#fff",zIndex:1},
  sets:{display:"flex",flexWrap:"wrap",gap:"8px",alignItems:"center",marginTop:"12px"},
  dot:{width:"38px",height:"38px",borderRadius:"50%",border:"2px solid",cursor:"pointer",fontSize:"13px",fontWeight:"700",color:"#fff",transition:"all 0.2s cubic-bezier(.4,0,.2,1)",display:"flex",alignItems:"center",justifyContent:"center"},
  restBtn:{padding:"6px 14px",borderRadius:"20px",border:"1px solid",background:"transparent",cursor:"pointer",fontSize:"12px",fontWeight:"700",marginLeft:"auto"},
  overlay:{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center"},
  modalCard:{background:"rgba(255,255,255,0.08)",backdropFilter:"blur(28px)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"24px",padding:"32px 28px",textAlign:"center",minWidth:"260px",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"},
  modalTitle:{margin:"0 0 16px",fontSize:"18px",fontWeight:"700",color:"rgba(255,255,255,0.85)"},
  btn:{padding:"8px 16px",borderRadius:"20px",border:"none",cursor:"pointer",color:"#fff",fontSize:"13px",fontWeight:"600"},
  sm:{width:"32px",height:"32px",borderRadius:"50%",border:"none",cursor:"pointer",color:"#fff",fontSize:"14px",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.1)"},
  row:{display:"flex",gap:"8px",justifyContent:"center",flexWrap:"wrap",marginTop:"14px"},
  finishBtn:{width:"100%",padding:"14px",borderRadius:"16px",border:"none",cursor:"pointer",color:"#fff",fontSize:"15px",fontWeight:"700",boxShadow:"0 4px 20px rgba(0,0,0,0.3)"},
};
