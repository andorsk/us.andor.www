"use client";

// Inbox tab: triaged email as sections of cards (done ▸ to do ▸ backlog ▸ ignored) over a time range,
// and a follow-ups view (emails you sent that are waiting on someone). Tap a card to read the thread,
// have Anton draft (or redraft) a reply, edit it, and send it, or move it between sections.
import { useCallback, useEffect, useState } from "react";
import {
  Archive, ArrowLeft, Check, ChevronRight, Eye, EyeOff, Inbox as InboxIcon, Loader2, RotateCcw, Send, Sparkles, X,
} from "lucide-react";
import { MicButton } from "@/components/anton-chat";
import { useDictation } from "@/hooks/use-dictation";

type Api = (path: string, init?: RequestInit) => Promise<any>;
type State = "todo" | "done" | "backlog" | "ignored";
type Card = {
  id: string; thread_id: string; subject: string; from: string; from_email: string; summary: string; priority: string;
  category: string; at: string; state: State; why: string; draft: boolean; todos: string[];
  tickets: { id: string; url: string }[]; link: string; watching: string | null; carried?: boolean;
};
type InboxData = { range: string; counts: Record<State, number> } & Record<State, Card[]>;
type Followup = {
  thread_id: string; message_id: string; recipient: string; to: string; subject: string; sent_at: string; due_at: string;
  status: string; reason: string; link: string;
};
type Followups = { overdue: Followup[]; watching: Followup[]; replied: Followup[]; stopped: Followup[] };
type Msg = { id: string; from: string; from_email: string; to: string; date: string; mine: boolean; body: string };
type Thread = {
  thread_id: string; subject: string; link: string; message_id: string; state: State | null; summary: string;
  draft: string; to: string; followup: Followup | null; messages: Msg[];
};

const RANGES: [string, string][] = [["today", "today"], ["yesterday", "yesterday"], ["3w", "3 weeks"], ["month", "month"]];
const DOT: Record<string, string> = {
  urgent: "bg-paper-stamp", high: "bg-paper-accent", normal: "bg-white/50", low: "bg-white/20",
};
const chip = (on: boolean) =>
  `rounded-full border px-3 py-1 text-sm transition ${on ? "border-paper-accent bg-paper-accent text-black" : "border-white/20 text-paper-muted hover:text-paper-accent"}`;
const pill = "rounded border border-white/20 px-1.5 text-[11px] leading-4 text-paper-muted";
const act =
  "flex items-center gap-1 rounded-md border border-white/20 px-2.5 py-1.5 text-sm text-paper-body hover:border-paper-accent hover:text-paper-accent disabled:opacity-40";

function ago(iso?: string) {
  if (!iso) return "";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 0) return `in ${Math.round(-m / 1440)}d`;
  return m < 60 ? `${m}m` : m < 2880 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`;
}

function useRemembered<T extends string>(key: string, fallback: T): [T, (v: T) => void] {
  const [v, setV] = useState<T>(fallback);
  useEffect(() => {
    try {
      const s = localStorage.getItem(key);
      if (s) setV(s as T);
    } catch {}
  }, [key]);
  return [v, (x: T) => {
    setV(x);
    try {
      localStorage.setItem(key, x);
    } catch {}
  }];
}

export default function InboxPanel({ api }: { api: Api }) {
  const [view, setView] = useRemembered<"inbox" | "followups">("anton:inbox-view", "inbox");
  const [range, setRange] = useRemembered<string>("anton:inbox-range", "today");
  const [data, setData] = useState<InboxData | null>(null);
  const [fu, setFu] = useState<Followups | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setErr("");
    try {
      if (view === "inbox") setData(await api(`/api/inbox?range=${range}`));
      else setFu(await api("/api/followups"));
    } catch (e) {
      setErr((e as Error).message);
    }
  }, [api, view, range]);

  useEffect(() => {
    void load();
  }, [load]);

  const move = async (c: Card, state: State) => {
    // Optimistic: move the card now, tell Anton after.
    setData((d) => {
      if (!d) return d;
      const out = { ...d, counts: { ...d.counts } } as InboxData;
      out[c.state] = d[c.state].filter((x) => x.id !== c.id);
      out[state] = [{ ...c, state }, ...d[state]];
      out.counts[c.state] -= 1;
      out.counts[state] += 1;
      return out;
    });
    try {
      await api(`/api/inbox/${c.id}/state`, { method: "POST", body: JSON.stringify({ state }) });
    } catch (e) {
      setErr((e as Error).message);
      void load();
    }
  };

  if (open) return <ThreadView api={api} id={open} onBack={() => { setOpen(null); void load(); }} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button className={chip(view === "inbox")} onClick={() => setView("inbox")}>inbox</button>
        <button className={chip(view === "followups")} onClick={() => setView("followups")}>
          follow-ups{fu?.overdue.length ? ` · ${fu.overdue.length}` : ""}
        </button>
        <button onClick={load} className="ml-auto p-1 text-paper-muted hover:text-paper-accent" aria-label="Reload" title="Reload">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
      {view === "inbox" ? (
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {RANGES.map(([id, label]) => (
            <button key={id} className={`${chip(range === id)} shrink-0 text-xs`} onClick={() => setRange(id)}>{label}</button>
          ))}
        </div>
      ) : null}
      {err ? <p className="text-sm text-paper-stamp">{err}</p> : null}

      {view === "inbox" ? (
        !data ? <p className="text-paper-muted">loading…</p> : (
          <div className="space-y-5">
            <Fold title="done" count={data.counts.done} startOpen={false}>
              {data.done.map((c) => <EmailCard key={c.id} c={c} onOpen={setOpen} onMove={move} />)}
            </Fold>
            <Fold title="to do" count={data.counts.todo} startOpen accent>
              {data.todo.length ? data.todo.map((c) => <EmailCard key={c.id} c={c} onOpen={setOpen} onMove={move} />) : (
                <p className="py-2 text-paper-muted">Nothing needs you{range === "today" ? " today" : ""}. </p>
              )}
            </Fold>
            <Fold title="backlog" count={data.counts.backlog} startOpen={data.counts.backlog > 0 && data.counts.backlog <= 5}>
              {data.backlog.map((c) => <EmailCard key={c.id} c={c} onOpen={setOpen} onMove={move} />)}
            </Fold>
            <Fold title="ignored" count={data.counts.ignored} startOpen={false}>
              {data.ignored.map((c) => <EmailCard key={c.id} c={c} onOpen={setOpen} onMove={move} compact />)}
            </Fold>
          </div>
        )
      ) : !fu ? <p className="text-paper-muted">loading…</p> : (
        <div className="space-y-5">
          <p className="text-sm text-paper-muted">Emails you sent that are waiting on a reply. Anton nudges you when they go quiet.</p>
          <Fold title="needs a nudge" count={fu.overdue.length} startOpen accent>
            {fu.overdue.length ? fu.overdue.map((f) => <FollowCard key={f.thread_id} f={f} onOpen={setOpen} />) : (
              <p className="py-2 text-paper-muted">Nobody is overdue.</p>
            )}
          </Fold>
          <Fold title="watching" count={fu.watching.length} startOpen>
            {fu.watching.map((f) => <FollowCard key={f.thread_id} f={f} onOpen={setOpen} />)}
          </Fold>
          <Fold title="replied" count={fu.replied.length} startOpen={false}>
            {fu.replied.map((f) => <FollowCard key={f.thread_id} f={f} onOpen={setOpen} />)}
          </Fold>
          <Fold title="stopped" count={fu.stopped.length} startOpen={false}>
            {fu.stopped.map((f) => <FollowCard key={f.thread_id} f={f} onOpen={setOpen} />)}
          </Fold>
        </div>
      )}
    </div>
  );
}

function Fold({ title, count, startOpen, accent, children }: {
  title: string; count: number; startOpen: boolean; accent?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(startOpen);
  useEffect(() => setOpen(startOpen), [startOpen]);
  return (
    <section>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 py-1 text-left">
        <ChevronRight className={`h-4 w-4 text-paper-muted transition ${open ? "rotate-90" : ""}`} />
        <span className={`text-sm uppercase tracking-widest ${accent ? "text-paper-accent" : "text-paper-muted"}`}>{title}</span>
        <span className="text-sm text-paper-muted">{count}</span>
      </button>
      {open ? <div className="mt-2 space-y-2">{children}</div> : null}
    </section>
  );
}

function EmailCard({ c, onOpen, onMove, compact }: {
  c: Card; onOpen: (thread: string) => void; onMove: (c: Card, s: State) => void; compact?: boolean;
}) {
  const quick: [State, string, React.ReactNode][] = (
    {
      todo: [["done", "done", <Check key="d" className="h-4 w-4" />], ["backlog", "later", <Archive key="b" className="h-4 w-4" />]],
      done: [["todo", "to do", <InboxIcon key="t" className="h-4 w-4" />]],
      backlog: [["todo", "to do", <InboxIcon key="t" className="h-4 w-4" />], ["done", "done", <Check key="d" className="h-4 w-4" />]],
      ignored: [["todo", "to do", <InboxIcon key="t" className="h-4 w-4" />]],
    } as Record<State, [State, string, React.ReactNode][]>
  )[c.state];
  return (
    <div className={`rounded-lg border border-dashed border-white/15 bg-white/[0.02] ${compact ? "px-3 py-1.5" : "px-3 py-2.5"}`}>
      <div className="flex items-start gap-2.5">
        <button className="min-w-0 flex-1 text-left" onClick={() => onOpen(c.thread_id)}>
          <span className="flex items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${DOT[c.priority] ?? DOT.low}`} title={c.priority} />
            <span className="truncate text-base leading-snug text-white">{c.subject}</span>
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-sm text-paper-muted">
            <span className="truncate">{c.from}</span>
            <span className="shrink-0">· {ago(c.at)}</span>
            {c.draft && c.state === "todo" ? <span className={pill}>draft</span> : null}
            {c.watching ? <span className={pill}>watching</span> : null}
            {c.carried ? <span className={pill}>older</span> : null}
            {c.state === "done" && c.why && c.why !== "owner" ? <span className={pill}>{c.why}</span> : null}
          </span>
          {!compact && c.summary ? <span className="mt-1 block truncate text-sm text-paper-body">{c.summary}</span> : null}
          {!compact && c.todos.length ? (
            <span className="mt-0.5 block truncate text-xs text-paper-accent">to do: {c.todos.join(" · ")}</span>
          ) : null}
        </button>
        <div className="flex shrink-0 gap-1">
          {quick.map(([s, label, icon]) => (
            <button key={s} onClick={() => onMove(c, s)} title={label} aria-label={label}
              className="rounded-md border border-white/15 p-1 text-paper-muted hover:border-paper-accent hover:text-paper-accent">
              {icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FollowCard({ f, onOpen }: { f: Followup; onOpen: (thread: string) => void }) {
  const overdue = f.due_at && new Date(f.due_at).getTime() < Date.now();
  return (
    <button onClick={() => onOpen(f.thread_id)} className="block w-full rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-3 text-left">
      <span className="block truncate text-base text-white">{f.subject || "(no subject)"}</span>
      <span className="mt-0.5 block truncate text-sm text-paper-muted">
        to {f.to} · sent {ago(f.sent_at)} ago
        {f.status === "waiting" || f.status === "nudged" ? (
          <span className={overdue ? "text-paper-stamp" : ""}> · {overdue ? `due ${ago(f.due_at)} ago` : `nudge ${ago(f.due_at)}`}</span>
        ) : null}
      </span>
      {f.reason ? <span className="mt-1 block truncate text-sm text-paper-body">{f.reason}</span> : null}
    </button>
  );
}

export function ThreadView({ api, id, onBack }: { api: Api; id: string; onBack: () => void }) {
  const [t, setT] = useState<Thread | null>(null);
  const [body, setBody] = useState("");
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [watch, setWatch] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const voice = useDictation((x) => setInstruction((v) => (v ? `${v} ${x}` : x)));

  const load = useCallback(async () => {
    try {
      const d: Thread = await api(`/api/thread/${id}`);
      setT(d);
      setBody((b) => b || d.draft);
    } catch (e) {
      setErr((e as Error).message);
    }
  }, [api, id]);
  useEffect(() => {
    void load();
  }, [load]);

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    setErr("");
    setNote("");
    try {
      await fn();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy("");
    }
  };

  const draft = () => run("draft", async () => {
    voice.stop();
    const d = await api(`/api/thread/${id}/draft`, { method: "POST", body: JSON.stringify({ instruction, current: body }) });
    setBody(d.draft);
    setInstruction("");
  });
  const send = () => {
    if (!t || !body.trim()) return;
    if (!window.confirm(`Send this reply to ${t.to}?`)) return;
    void run("send", async () => {
      const r = await api(`/api/thread/${id}/send`, { method: "POST", body: JSON.stringify({ body, watch_days: watch ? 3 : 0 }) });
      setNote(`Sent to ${r.to}.${watch ? " Watching for a reply." : ""}`);
      setBody("");
      await load();
    });
  };
  const saveDraft = () => run("save", async () => {
    await api(`/api/thread/${id}/save`, { method: "POST", body: JSON.stringify({ body }) });
    setNote("Saved to Gmail drafts.");
  });
  const setState = (state: State) => run(state, async () => {
    if (!t) return;
    await api(`/api/inbox/${t.message_id}/state`, { method: "POST", body: JSON.stringify({ state }) });
    onBack();
  });
  const follow = (action: string) => run(action, async () => {
    if (action === "watch") await api(`/api/thread/${id}/watch`, { method: "POST", body: JSON.stringify({ days: 3 }) });
    else await api(`/api/followups/${id}/${action}`, { method: "POST", body: JSON.stringify({ days: 3 }) });
    await load();
  });

  const msgs = t?.messages ?? [];
  const shown = showAll ? msgs : msgs.slice(-2);
  const fu = t?.followup;
  const live = fu && (fu.status === "waiting" || fu.status === "nudged");

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <button onClick={onBack} aria-label="Back" className="mt-1 text-paper-muted hover:text-paper-accent">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-lg leading-snug text-white">{t?.subject ?? "…"}</div>
          {t?.summary ? <p className="mt-1 text-sm text-paper-muted">{t.summary}</p> : null}
        </div>
        {t ? (
          <a href={t.link} target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm text-paper-muted underline decoration-dotted underline-offset-4">
            gmail
          </a>
        ) : null}
      </div>
      {err ? <p className="text-sm text-paper-stamp">{err}</p> : null}
      {!t && !err ? <p className="text-paper-muted">loading…</p> : null}

      {t ? (
        <>
          {msgs.length > 2 && !showAll ? (
            <button onClick={() => setShowAll(true)} className="text-sm text-paper-muted underline decoration-dotted underline-offset-4">
              {msgs.length - 2} earlier messages
            </button>
          ) : null}
          <div className="space-y-2">
            {shown.map((m) => (
              <details key={m.id} open={m.id === msgs[msgs.length - 1]?.id}
                className={`rounded-lg border border-dashed px-3 py-2 ${m.mine ? "border-paper-accent/30" : "border-white/15"}`}>
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-2 text-sm [&::-webkit-details-marker]:hidden">
                  <span className={`truncate ${m.mine ? "text-paper-accent" : "text-white"}`}>{m.mine ? "you" : m.from}</span>
                  <span className="shrink-0 text-xs text-paper-muted">{m.date.replace(/:\d\d [+-]\d{4}.*$/, "")}</span>
                </summary>
                <div className="mt-2 max-h-72 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-paper-body">
                  {m.body.trim()}
                </div>
              </details>
            ))}
          </div>

          <div className="space-y-2 rounded-xl border border-dashed border-white/30 p-2">
            <div className="flex items-center justify-between px-1 text-xs text-paper-muted">
              <span className="truncate">reply to {t.to}</span>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="write a reply, or have Anton draft one…"
              rows={Math.min(12, Math.max(4, body.split("\n").length + 1))}
              className="w-full resize-y rounded-md bg-transparent px-1 text-base leading-relaxed text-white outline-none placeholder:text-paper-muted"
            />
            <div className="flex items-center gap-1 border-t border-dashed border-white/15 pt-2">
              <input
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void draft(); } }}
                placeholder={voice.listening ? voice.interim || "listening…" : body ? "how should Anton change it?" : "what should it say? (optional)"}
                className="min-w-0 flex-1 bg-transparent px-1 text-base text-white outline-none placeholder:text-paper-muted"
              />
              <MicButton voice={voice} bare />
              <button onClick={draft} disabled={!!busy} className={act}>
                {busy === "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {body ? "redraft" : "draft"}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button onClick={send} disabled={!!busy || !body.trim()}
                className="flex items-center gap-1.5 rounded-md border border-paper-accent bg-paper-accent px-3 py-1.5 text-sm text-black disabled:opacity-40">
                {busy === "send" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} send
              </button>
              <button onClick={saveDraft} disabled={!!busy || !body.trim()} className={act}>save to gmail</button>
              <label className="ml-auto flex items-center gap-1.5 text-sm text-paper-muted">
                <input type="checkbox" checked={watch} onChange={(e) => setWatch(e.target.checked)} className="accent-[#fbb040]" />
                watch for reply
              </label>
            </div>
          </div>
          {note ? <p className="text-sm text-emerald-400/90">{note}</p> : null}

          <div className="flex flex-wrap gap-2">
            {t.state && t.state !== "done" ? (
              <button onClick={() => setState("done")} disabled={!!busy} className={act}><Check className="h-4 w-4" /> done</button>
            ) : null}
            {t.state && t.state !== "backlog" ? (
              <button onClick={() => setState("backlog")} disabled={!!busy} className={act}><Archive className="h-4 w-4" /> later</button>
            ) : null}
            {t.state && t.state !== "ignored" ? (
              <button onClick={() => setState("ignored")} disabled={!!busy} className={act}><X className="h-4 w-4" /> ignore</button>
            ) : null}
            {t.state && t.state !== "todo" ? (
              <button onClick={() => setState("todo")} disabled={!!busy} className={act}><InboxIcon className="h-4 w-4" /> to do</button>
            ) : null}
            {live ? (
              <>
                <button onClick={() => follow("snooze")} disabled={!!busy} className={act}>snooze 3d</button>
                <button onClick={() => follow("replied")} disabled={!!busy} className={act}><Check className="h-4 w-4" /> got a reply</button>
                <button onClick={() => follow("stop")} disabled={!!busy} className={act}><EyeOff className="h-4 w-4" /> stop watching</button>
              </>
            ) : (
              <button onClick={() => follow("watch")} disabled={!!busy} className={act}><Eye className="h-4 w-4" /> watch for reply</button>
            )}
          </div>
          {fu ? (
            <p className="text-xs text-paper-muted">
              follow-up: {fu.status}{live && fu.due_at ? ` · nudge ${new Date(fu.due_at).toLocaleDateString()}` : ""}
              {fu.reason ? ` · ${fu.reason}` : ""}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
