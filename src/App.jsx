import { useMemo, useState } from "react";
import "./App.css";

const DATA = {
  asOf: "2026-11-02T22:15:00+11:00",
  bots: [
    {
      name: "Dave",
      emoji: "🏪",
      role: "Store ops",
      status: "needs_you",
      needsYou: ["Approve Ballina roster (2 min)"],
      latest: "Monday store read done",
      updated: "2026-11-02T15:00:00+11:00",
    },
    {
      name: "Hugo",
      emoji: "🏠",
      role: "House lift",
      status: "ok",
      needsYou: [],
      latest: "Builder confirmed for Thursday",
      updated: "2026-11-01T18:00:00+11:00",
    },
    {
      name: "Ted",
      emoji: "🧢",
      role: "Backlog",
      status: "quiet",
      needsYou: [],
      latest: "No report yet",
      updated: "",
    },
  ],
  dates: [{ what: "Payroll", when: "2026-11-04", bot: "Rosie" }],
};

const PAPER = ["#fff3a8", "#ffd6e0", "#cdeeff", "#d9f6c4", "#ffe2bd"];
const TILT = [-1.4, 1, -0.7, 1.3, -1];

function ago(iso, now) {
  if (!iso) return "nothing yet";
  const mins = Math.max(0, Math.round((now - Date.parse(iso)) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d}d ago`;
}

function daysUntil(when, today) {
  return Math.round((Date.parse(when) - Date.parse(today)) / 86400000);
}

function dayWord(n) {
  if (n < 0) return "overdue";
  if (n === 0) return "today";
  if (n === 1) return "tomorrow";
  return `in ${n} days`;
}

function Stamp({ color, label, dashed }) {
  return (
    <span
      className="stamp"
      style={{
        color,
        border: `2px ${dashed ? "dashed" : "solid"} ${color}`,
      }}
    >
      {label}
    </span>
  );
}

export default function App() {
  const [open, setOpen] = useState(null);
  const [done, setDone] = useState([]);

  const now = useMemo(() => Date.parse(DATA.asOf), []);
  const today = DATA.asOf.slice(0, 10);
  const hour = Number(DATA.asOf.slice(11, 13));
  const greeting = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";

  const slips = useMemo(
    () =>
      DATA.bots.flatMap((b) =>
        b.needsYou.map((text) => ({
          key: `${b.name}:${text}`,
          emoji: b.emoji,
          bot: b.name,
          text,
        })),
      ),
    [],
  );
  const remaining = slips.filter((s) => !done.includes(s.key));
  const left = remaining.length;

  const toggle = (key) =>
    setDone((d) => (d.includes(key) ? d.filter((k) => k !== key) : [...d, key]));

  const quiet = DATA.bots.filter((b) => b.status === "quiet").map((b) => b.name);
  const next = [...DATA.dates].sort((a, b) => a.when.localeCompare(b.when))[0];
  const parts = [];
  if (left === 0) parts.push("You're all clear.");
  else if (left === 1) parts.push(`One thing needs you: ${remaining[0].text}.`);
  else parts.push(`${left} things need you.`);
  if (quiet.length) {
    parts.push(
      `${quiet.join(" and ")} ${quiet.length > 1 ? "haven't" : "hasn't"} checked in yet.`,
    );
  }
  if (next) {
    parts.push(`${next.what} is ${dayWord(daysUntil(next.when, today))}. ${next.bot}'s on it.`);
  }

  return (
    <main className="page">
      <section className="desk" aria-label="On your desk">
        <div className="greeting-note">
          <div className="greeting-title">
            {greeting}, Matt.
          </div>
          <div className="greeting-body">{parts.join(" ")}</div>
        </div>

        <div>
          <div className="mat-label">In tray</div>
          <div className="tray">
            {slips.map((s) => {
              const isDone = done.includes(s.key);
              return (
                <button
                  key={s.key}
                  type="button"
                  className={`slip${isDone ? " slip-done" : ""}`}
                  onClick={() => toggle(s.key)}
                >
                  <div className={`check${isDone ? " check-on" : ""}`}>
                    {isDone ? "✓" : ""}
                  </div>
                  <div className="slip-copy">
                    <div className={`slip-text${isDone ? " strike" : ""}`}>{s.text}</div>
                    <div className="slip-meta">
                      {s.emoji} {s.bot}
                    </div>
                  </div>
                </button>
              );
            })}
            {left === 0 && (
              <div className="tray-empty">Tray&apos;s empty. Nothing waiting on you. ☕</div>
            )}
          </div>
        </div>

        <div>
          <div className="mat-label">Your bots</div>
          <div className="bots-row">
            {DATA.bots.map((b, i) => {
              const isOpen = open === b.name;
              return (
                <button
                  key={b.name}
                  type="button"
                  className={`sticky${b.status === "quiet" ? " sticky-quiet" : ""}`}
                  style={{
                    background: PAPER[i % PAPER.length],
                    transform: `rotate(${isOpen ? 0 : TILT[i % TILT.length]}deg) scale(${isOpen ? 1.02 : 1})`,
                  }}
                  onClick={() => setOpen(isOpen ? null : b.name)}
                >
                  <span className="pin" aria-hidden="true" />
                  <div className="sticky-title">
                    {b.emoji} {b.name}
                  </div>
                  <div className="sticky-meta">
                    {b.role} · {ago(b.updated, now)}
                  </div>
                  <div className="sticky-latest">{b.latest}</div>
                  {b.status === "needs_you" && <Stamp color="#c0262d" label="NEEDS YOU" />}
                  {b.status === "ok" && <Stamp color="#2f7d32" label="ALL GOOD" />}
                  {b.status === "quiet" && <Stamp color="#6b6b6b" label="QUIET" dashed />}
                  {isOpen && (
                    <div className="sticky-detail">
                      {b.needsYou.length === 0 ? (
                        <div>Nothing needed from you.</div>
                      ) : (
                        b.needsYou.map((n) => <div key={n}>→ {n}</div>)
                      )}
                    </div>
                  )}
                </button>
              );
            })}

            <div className="calendar">
              <div className="calendar-head">Coming up</div>
              {DATA.dates.map((d) => {
                const dt = new Date(`${d.when}T00:00:00`);
                return (
                  <div key={d.what + d.when} className="calendar-row">
                    <div className="calendar-date">
                      <div className="calendar-day">{dt.getDate()}</div>
                      <div className="calendar-weekday">
                        {dt.toLocaleDateString("en-AU", { weekday: "short" })}
                      </div>
                    </div>
                    <div className="calendar-copy">
                      <div className="calendar-what">{d.what}</div>
                      <div className="calendar-meta">
                        {dayWord(daysUntil(d.when, today))} · {d.bot}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
