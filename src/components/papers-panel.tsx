"use client";

// Papers tab: the whole "one paper a day" reading plan, by section, with what's read and the takeaways.
// Everything (plan, progress, copy) comes from Anton's GET /api/papers; checking one off or saving a takeaway is
// POST /api/papers/done, the same call the app and the widget use, so all three stay in step.
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";

type Api = (path: string, init?: RequestInit) => Promise<any>;
type Paper = {
  day: number; date: string; section: string; title: string; question: string; url: string; read: boolean; takeaway: string;
};
type Summary = {
  current: Paper | null; done: number; total: number; planned: number; heading: string; note: string; empty: string;
  suggested_day: number; read_today: boolean; papers: Paper[];
};

const act =
  "flex items-center gap-1 rounded-md border border-white/20 px-2.5 py-1.5 text-sm text-paper-body hover:border-paper-accent hover:text-paper-accent disabled:opacity-40";
const fmt = (d: string) => new Date(d + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

export default function PapersPanel({ api }: { api: Api }) {
  const [s, setS] = useState<Summary | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  const load = useCallback(() => {
    api("/api/papers").then(setS).catch((e) => setErr(String(e.message || e)));
  }, [api]);
  useEffect(() => load(), [load]);

  const send = async (day: number, body: Record<string, unknown>) => {
    setBusy(day);
    setErr("");
    try {
      setS(await api("/api/papers/done", { method: "POST", body: JSON.stringify({ day, ...body }) }));
      setOpen(null);
    } catch (e: any) {
      setErr(String(e.message || e));
    } finally {
      setBusy(null);
    }
  };

  if (!s) return err ? <p className="text-base text-paper-stamp">{err}</p> : <Loader2 className="h-5 w-5 animate-spin text-paper-muted" />;

  const sections: [string, Paper[]][] = [];
  for (const p of s.papers) {
    const last = sections[sections.length - 1];
    if (last && last[0] === p.section) last[1].push(p);
    else sections.push([p.section, [p]]);
  }
  const pct = Math.round((100 * s.done) / Math.max(1, s.total));

  return (
    <div className="text-base">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-paper-body">{s.heading}</p>
        <p className="text-sm text-paper-muted">{s.note || `Plan day ${s.suggested_day}`}</p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded bg-white/10" aria-label={`${pct}% read`}>
        <div className="h-full bg-paper-accent" style={{ width: `${pct}%` }} />
      </div>
      {err ? <p className="mt-3 text-paper-stamp">{err}</p> : null}

      {s.current ? (
        <div className="mt-5 rounded-lg border border-paper-accent/60 p-4">
          <p className="text-sm text-paper-muted">Today · day {s.current.day} · {s.current.section}</p>
          <a href={s.current.url} target="_blank" rel="noreferrer" className="mt-1 flex items-start gap-1 text-lg text-paper-accent hover:underline">
            {s.current.title} <ArrowUpRight className="mt-1 h-4 w-4 shrink-0" />
          </a>
          <p className="mt-1 text-paper-body">{s.current.question}</p>
        </div>
      ) : (
        <p className="mt-5 text-paper-muted">{s.empty}</p>
      )}

      {sections.map(([name, ps]) => (
        <section key={name} className="mt-8">
          <h3 className="text-sm uppercase tracking-wide text-paper-muted">
            {name} · {ps.filter((p) => p.read).length}/{ps.length}
          </h3>
          <ol className="mt-2 divide-y divide-white/10">
            {ps.map((p) => (
              <li key={p.day} id={`day-${p.day}`} className={`py-3 ${s.current?.day === p.day ? "bg-white/5" : ""}`}>
                <div className="flex items-start gap-3">
                  <button
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${p.read ? "border-paper-accent bg-paper-accent text-black" : "border-white/30 text-transparent hover:text-paper-muted"}`}
                    aria-label={p.read ? `Mark day ${p.day} unread` : `Mark day ${p.day} read`}
                    disabled={busy === p.day}
                    onClick={() => send(p.day, p.read ? { undo: true } : {})}
                  >
                    {busy === p.day ? <Loader2 className="h-3.5 w-3.5 animate-spin text-paper-muted" /> : <Check className="h-3.5 w-3.5" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-paper-muted">Day {p.day} · {fmt(p.date)}</p>
                    <a href={p.url} target="_blank" rel="noreferrer" className={`hover:text-paper-accent hover:underline ${p.read ? "text-paper-muted" : "text-paper-body"}`}>
                      {p.title}
                    </a>
                    <p className="text-sm text-paper-muted">{p.question}</p>
                    {p.takeaway && open !== p.day ? <p className="mt-1 text-sm text-paper-body">→ {p.takeaway}</p> : null}
                    {open === p.day ? (
                      <div className="mt-2 flex flex-col gap-2">
                        <textarea
                          className="w-full rounded-md border border-white/20 bg-transparent p-2 text-sm text-paper-body"
                          rows={2} value={draft} placeholder="One-line takeaway" onChange={(e) => setDraft(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button className={act} disabled={!draft.trim() || busy === p.day} onClick={() => send(p.day, { takeaway: draft })}>
                            <Check className="h-4 w-4" /> Save
                          </button>
                          <button className={act} onClick={() => setOpen(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button className="mt-1 text-xs text-paper-muted hover:text-paper-accent"
                        onClick={() => { setOpen(p.day); setDraft(p.takeaway); }}>
                        {p.takeaway ? "edit takeaway" : "add takeaway"}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
      {s.planned < s.total ? (
        <p className="mt-8 text-sm text-paper-muted">
          Days {s.planned + 1}–{s.total} appear here once theyonce they're addedapos;re added to the plan.
        </p>
      ) : null}
    </div>
  );
}
