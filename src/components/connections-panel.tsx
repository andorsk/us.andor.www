"use client";

// Connections tab: people Andor keeps tabs on. For each: when they last wrote, when he last wrote back,
// and whose move it is. Optional "keep in touch every N days" flags a check-in. Tap a person for their
// recent threads (tap one to read, draft and reply), notes, emails and cadence.
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Bomb as BombIcon, Check, Loader2, Plus, RotateCcw, Search, Timer, Trash2, X } from "lucide-react";
import { ThreadView } from "@/components/inbox-panel";

type Api = (path: string, init?: RequestInit) => Promise<any>;
type Last = { id: string; thread_id: string; subject: string; snippet: string; at: string } | null;
type Person = {
  id: number; name: string; emails: string[]; note: string; cadence_days: number | null; last_in: Last; last_out: Last;
  last_contact: string | null; days_since: number | null; move: "you" | "them" | null; waiting_days: number | null;
  due: boolean; refreshed_at: string | null; needs_email: boolean; talked_at: string | null; talked_via: string | null;
  next_due: string | null; due_in: number | null;
};
type ThreadRow = { id: string; thread_id: string; subject: string; snippet: string; at: string; from: string; mine: boolean };
type Suggestion = { email: string; name: string; count: number; last: string };

const CADENCES: [number, string][] = [
  [0, "off"], [7, "weekly"], [14, "2 weeks"], [30, "monthly"], [60, "2 months"], [90, "3 months"], [180, "6 months"],
];
const VIA = ["call", "text", "video", "in person"];

function every(n: number | null) {
  if (!n) return "no schedule";
  if (n === 7) return "weekly";
  if (n === 30) return "monthly";
  if (n % 30 === 0) return `every ${n / 30} months`;
  if (n % 7 === 0) return `every ${n / 7} weeks`;
  return `every ${n} days`;
}

// The time bomb: how long until Andor should next talk to them.
function Bomb({ p }: { p: Person }) {
  if (p.due_in === null) return null;
  const late = p.due_in < 0;
  const text = late ? `${-p.due_in}d late` : p.due_in === 0 ? "today" : `${p.due_in}d`;
  const tone = late
    ? "border-paper-stamp bg-paper-stamp/15 text-paper-stamp"
    : p.due_in <= 3 ? "border-paper-accent text-paper-accent" : "border-white/20 text-paper-muted";
  return (
    <span className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${tone}`} title={`talk ${every(p.cadence_days)}`}>
      {late ? <BombIcon className="h-3.5 w-3.5" /> : <Timer className="h-3.5 w-3.5" />}
      {text}
    </span>
  );
}
const btn =
  "flex items-center gap-1 rounded-md border border-white/20 px-2.5 py-1.5 text-sm text-paper-body hover:border-paper-accent hover:text-paper-accent disabled:opacity-40";
const input = "w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-base text-white placeholder:text-paper-muted focus:border-paper-accent focus:outline-none";
const chip = (on: boolean) =>
  `rounded-full border px-3 py-1 text-sm transition ${on ? "border-paper-accent bg-paper-accent text-black" : "border-white/20 text-paper-muted hover:text-paper-accent"}`;

function days(iso?: string | null) {
  if (!iso) return "";
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d}d ago`;
}

function status(p: Person): { text: string; tone: string } {
  const talked = p.talked_at && (!p.last_contact || p.talked_at >= p.last_contact);
  if (talked && p.move !== "you") return { text: `${p.talked_via || "talked"} ${days(p.talked_at)}`, tone: "text-paper-muted" };
  if (p.needs_email) return { text: p.cadence_days ? "no contact logged yet" : "add an email to start tracking", tone: "text-paper-muted" };
  if (p.move === "you") return { text: `wrote ${days(p.last_in?.at)} · your move`, tone: "text-paper-stamp" };
  if (p.move === "them") return { text: `you wrote ${days(p.last_out?.at)} · waiting on them`, tone: "text-paper-muted" };
  return { text: "no email with them yet", tone: "text-paper-muted" };
}

export default function ConnectionsPanel({ api }: { api: Api }) {
  const [people, setPeople] = useState<Person[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [view, setView] = useState<"next" | "frequency">("next");
  useEffect(() => {
    try {
      if (localStorage.getItem("anton:people-view") === "frequency") setView("frequency");
    } catch {}
  }, []);
  const pickView = (v: "next" | "frequency") => {
    setView(v);
    try {
      localStorage.setItem("anton:people-view", v);
    } catch {}
  };
  const talked = async (id: number) => {
    await api(`/api/connections/${id}/talked`, { method: "POST", body: JSON.stringify({ via: "talked" }) });
    await load();
  };

  const load = useCallback(async () => {
    try {
      const d = await api("/api/connections");
      setPeople(d.connections);
      setRefreshing(d.refreshing);
      setErr("");
    } catch (e) {
      setErr((e as Error).message);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);
  // While Anton is pulling fresh dates from Gmail, check back.
  useEffect(() => {
    if (!refreshing) return;
    const t = setTimeout(load, 4000);
    return () => clearTimeout(t);
  }, [refreshing, load]);

  if (open !== null)
    return <PersonView api={api} id={open} onBack={() => { setOpen(null); void load(); }} />;

  const byDue = (a: Person, b: Person) => (a.due_in ?? 1e9) - (b.due_in ?? 1e9) || a.name.localeCompare(b.name);
  let groups: [string, Person[]][] = [];
  if (people && view === "next") {
    groups = [
      ["overdue", people.filter((p) => p.due)],
      ["your move", people.filter((p) => !p.due && p.move === "you")],
      ["coming up", people.filter((p) => !p.due && p.move !== "you" && p.due_in !== null)],
      ["no schedule", people.filter((p) => !p.due && p.move !== "you" && p.due_in === null)],
    ];
  } else if (people) {
    const cadences = Array.from(new Set(people.map((p) => p.cadence_days ?? 0))).sort((a, b) => (a || 1e9) - (b || 1e9));
    groups = cadences.map((c) => [every(c || null), people.filter((p) => (p.cadence_days ?? 0) === c).sort(byDue)]);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-paper-muted">
          {people ? `${people.length} ${people.length === 1 ? "person" : "people"}` : "…"}
          {refreshing ? <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin" /> : null}
        </p>
        <div className="flex gap-2">
          <button className={btn} onClick={() => { void api("/api/connections/refresh", { method: "POST" }).then(() => setRefreshing(true)); }}
            aria-label="Refresh from Gmail" title="Refresh from Gmail">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button className={btn} onClick={() => setAdding(!adding)}>
            {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {adding ? "cancel" : "add person"}
          </button>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button className={chip(view === "next")} onClick={() => pickView("next")}>next up</button>
        <button className={chip(view === "frequency")} onClick={() => pickView("frequency")}>by frequency</button>
      </div>
      {err ? <p className="mt-3 text-paper-stamp">{err}</p> : null}
      {adding ? (
        <AddPerson api={api} onDone={(p) => { setAdding(false); void load(); if (p) setOpen(p.id); }} />
      ) : null}
      {people && !people.length && !adding ? (
        <p className="mt-6 text-paper-muted">Nobody yet. Add the people you want to keep tabs on.</p>
      ) : null}
      <div className="mt-4 space-y-6">
        {groups.map(([name, list]) =>
          list.length ? (
            <div key={name}>
              <h3 className={`mb-2 flex items-center gap-1.5 text-sm uppercase tracking-widest ${name === "overdue" ? "text-paper-stamp" : "text-paper-accent"}`}>
                {name === "overdue" ? <BombIcon className="h-4 w-4" /> : null}
                {name} <span className="ml-1 text-paper-muted">{list.length}</span>
              </h3>
              <ul className="space-y-2">
                {list.map((p) => <PersonCard key={p.id} p={p} onOpen={() => setOpen(p.id)} onTalked={() => talked(p.id)} />)}
              </ul>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-sm text-paper-accent">
      {initials}
    </span>
  );
}

function PersonCard({ p, onOpen, onTalked }: { p: Person; onOpen: () => void; onTalked: () => void }) {
  const s = status(p);
  const last = p.move === "you" ? p.last_in : p.last_out ?? p.last_in;
  const [busy, setBusy] = useState(false);
  return (
    <li className={`flex items-stretch rounded-lg border ${p.due ? "border-paper-stamp/50" : "border-white/10"} hover:border-paper-accent/60`}>
      <button onClick={onOpen} className="flex min-w-0 flex-1 items-start gap-3 p-3 text-left">
        <Avatar name={p.name} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-base text-white">{p.name}</span>
            <Bomb p={p} />
          </span>
          <span className={`block text-sm ${s.tone}`}>{s.text}</span>
          {last ? <span className="block truncate text-sm text-paper-muted">“{last.subject}”</span> : null}
          {p.cadence_days ? <span className="block text-xs text-paper-muted/80">{every(p.cadence_days)}</span> : null}
        </span>
      </button>
      <button className="flex w-14 shrink-0 flex-col items-center justify-center gap-0.5 border-l border-white/10 text-[11px] text-paper-muted hover:text-paper-accent disabled:opacity-40"
        disabled={busy} aria-label={`Talked to ${p.name} today`} title="talked today (resets the clock)"
        onClick={async () => { setBusy(true); try { await onTalked(); } finally { setBusy(false); } }}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        talked
      </button>
    </li>
  );
}

function useSuggestions(api: Api, q: string) {
  const [list, setList] = useState<Suggestion[] | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (q.trim().length < 2) {
      setList(null);
      return;
    }
    setBusy(true);
    const t = setTimeout(() => {
      api(`/api/connections/suggest?q=${encodeURIComponent(q.trim())}`)
        .then((d) => setList(d.suggestions))
        .catch(() => setList([]))
        .finally(() => setBusy(false));
    }, 500);
    return () => clearTimeout(t);
  }, [api, q]);
  return { list, busy };
}

function Suggestions({ list, busy, onPick, exclude = [] }: {
  list: Suggestion[] | null; busy: boolean; onPick: (s: Suggestion) => void; exclude?: string[];
}) {
  if (busy) return <p className="mt-2 text-sm text-paper-muted"><Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" />looking in your mail…</p>;
  if (!list) return null;
  const shown = list.filter((s) => !exclude.includes(s.email));
  if (!shown.length) return <p className="mt-2 text-sm text-paper-muted">No matches in your mail. Type their email instead.</p>;
  return (
    <ul className="mt-2 divide-y divide-white/10 rounded-md border border-white/10">
      {shown.map((s) => (
        <li key={s.email}>
          <button className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-white/5" onClick={() => onPick(s)}>
            <span className="min-w-0">
              <span className="block truncate text-sm text-white">{s.name || s.email}</span>
              <span className="block truncate text-xs text-paper-muted">{s.email}</span>
            </span>
            <span className="shrink-0 text-xs text-paper-muted">{s.count}× · {days(s.last)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function AddPerson({ api, onDone }: { api: Api; onDone: (p: Person | null) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cadence, setCadence] = useState(0);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const { list, busy: looking } = useSuggestions(api, email ? "" : name);
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => nameRef.current?.focus(), []);

  const save = async () => {
    setBusy(true);
    try {
      const p = await api("/api/connections", {
        method: "POST",
        body: JSON.stringify({ name, emails: email.trim() ? [email.trim()] : [], cadence_days: cadence || null }),
      });
      onDone(p);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 space-y-3 rounded-lg border border-white/15 p-3">
      <input ref={nameRef} className={input} placeholder="Name (e.g. Kelly)" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-paper-muted" />
        <input className={`${input} pl-9`} placeholder="Email (or pick one below)" inputMode="email" autoCapitalize="off"
          value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      {!email ? (
        <Suggestions list={list} busy={looking} onPick={(s) => { setEmail(s.email); if (!name.trim() || s.name.toLowerCase().includes(name.trim().toLowerCase())) setName(s.name || name); }} />
      ) : null}
      <CadencePicker value={cadence} onChange={setCadence} />
      {err ? <p className="text-sm text-paper-stamp">{err}</p> : null}
      <button className={btn} disabled={!name.trim() || busy} onClick={save}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} add
      </button>
    </div>
  );
}

function CadencePicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const preset = CADENCES.some(([n]) => n === value);
  const [custom, setCustom] = useState(preset ? "" : String(value || ""));
  return (
    <div>
      <p className="mb-1.5 text-sm text-paper-muted">Talk at least</p>
      <div className="flex flex-wrap gap-2">
        {CADENCES.map(([n, label]) => (
          <button key={n} className={chip(value === n)} onClick={() => { setCustom(""); onChange(n); }}>{label}</button>
        ))}
      </div>
      <form className="mt-2 flex flex-wrap items-center gap-2 text-sm text-paper-muted"
        onSubmit={(e) => { e.preventDefault(); const n = parseInt(custom, 10); if (n > 0) onChange(n); }}>
        or every
        <input className="w-16 rounded-md border border-white/20 bg-transparent px-2 py-1 text-center text-base text-white placeholder:text-paper-muted focus:border-paper-accent focus:outline-none" inputMode="numeric" placeholder="days" value={custom}
          onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))}
          onBlur={() => { const n = parseInt(custom, 10); if (n > 0 && n !== value) onChange(n); }} />
        days
        {!preset && value ? <span className="text-paper-accent">({every(value)})</span> : null}
      </form>
    </div>
  );
}

function PersonView({ api, id, onBack }: { api: Api; id: number; onBack: () => void }) {
  const [p, setP] = useState<(Person & { threads: ThreadRow[] }) | null>(null);
  const [err, setErr] = useState("");
  const [thread, setThread] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [saved, setSaved] = useState("");
  const { list, busy: looking } = useSuggestions(api, p?.needs_email ? p.name : "");

  const load = useCallback(async () => {
    try {
      const d = await api(`/api/connections/${id}`);
      setP(d);
      setNote(d.note);
    } catch (e) {
      setErr((e as Error).message);
    }
  }, [api, id]);
  useEffect(() => {
    void load();
  }, [load]);

  const update = async (fields: Partial<Person>, label = "saved") => {
    try {
      await api(`/api/connections/${id}`, { method: "POST", body: JSON.stringify(fields) });
      setSaved(label);
      setTimeout(() => setSaved(""), 1500);
      await load();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const talk = async (via: string, ago: number) => {
    try {
      const when = new Date(Date.now() - ago * 86400000).toISOString();
      await api(`/api/connections/${id}/talked`, { method: "POST", body: JSON.stringify({ via, when }) });
      setSaved(`logged: ${via}`);
      setTimeout(() => setSaved(""), 1500);
      await load();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  if (thread) return <ThreadView api={api} id={thread} onBack={() => setThread(null)} />;

  const back = (
    <button className="flex items-center gap-1 text-sm text-paper-muted hover:text-paper-accent" onClick={onBack}>
      <ArrowLeft className="h-4 w-4" /> people
    </button>
  );
  if (!p) return <div>{back}{err ? <p className="mt-3 text-paper-stamp">{err}</p> : <p className="mt-4 text-paper-muted">…</p>}</div>;
  const s = status(p);

  return (
    <div>
      {back}
      <div className="mt-4 flex items-center gap-3">
        <Avatar name={p.name} />
        <div className="min-w-0">
          <h2 className="truncate text-xl text-white">{p.name}</h2>
          <p className={`text-sm ${s.tone}`}>{s.text}</p>
        </div>
      </div>
      {err ? <p className="mt-3 text-paper-stamp">{err}</p> : null}

      <div className={`mt-4 rounded-lg border p-3 ${p.due ? "border-paper-stamp/60" : "border-white/10"}`}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-paper-muted">
            {p.due_in === null ? "No schedule — pick how often below."
              : p.due ? `${-p.due_in}d late — talk ${every(p.cadence_days)}`
              : `Next talk due in ${p.due_in}d (${new Date(p.next_due!).toLocaleDateString("en-US", { month: "short", day: "numeric" })})`}
          </p>
          <Bomb p={p} />
        </div>
        <p className="mt-3 text-sm text-paper-muted">Talked to them? Resets the clock.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {VIA.map((v) => (
            <button key={v} className={btn} onClick={() => talk(v, 0)}><Check className="h-4 w-4" /> {v}</button>
          ))}
          <button className={btn} onClick={() => talk("talked", 1)}>yesterday</button>
        </div>
        {p.talked_at ? <p className="mt-2 text-xs text-paper-muted">last logged: {p.talked_via} {days(p.talked_at)}</p> : null}
      </div>

      <div className="mt-4">
        <CadencePicker value={p.cadence_days ?? 0} onChange={(n) => update({ cadence_days: n || null } as Partial<Person>, `now ${every(n || null)}`)} />
        <p className="h-5 text-xs text-paper-accent">{saved !== "saved" ? saved : ""}</p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-md border border-white/10 p-2">
          <dt className="text-paper-muted">they last wrote</dt>
          <dd className="text-white">{p.last_in ? days(p.last_in.at) : "—"}</dd>
        </div>
        <div className="rounded-md border border-white/10 p-2">
          <dt className="text-paper-muted">you last wrote</dt>
          <dd className="text-white">{p.last_out ? days(p.last_out.at) : "—"}</dd>
        </div>
      </dl>

      <h3 className="mb-2 mt-6 text-sm uppercase tracking-widest text-paper-accent">recent threads</h3>
      {p.threads.length ? (
        <ul className="divide-y divide-white/10">
          {p.threads.map((t) => (
            <li key={t.thread_id}>
              <button className="flex w-full items-start gap-2 py-2 text-left" onClick={() => setThread(t.thread_id)}>
                <ArrowUpRight className={`mt-1 h-4 w-4 shrink-0 ${t.mine ? "text-paper-muted" : "rotate-180 text-paper-accent"}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base text-white">{t.subject}</span>
                  <span className="block truncate text-sm text-paper-muted">{t.mine ? "you" : t.from.split("<")[0].trim()} · {days(t.at)} · {t.snippet}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-paper-muted">{p.needs_email ? "Add an email below to see your threads." : "No email threads found."}</p>
      )}

      <h3 className="mb-2 mt-6 text-sm uppercase tracking-widest text-paper-accent">emails</h3>
      <div className="flex flex-wrap gap-2">
        {p.emails.map((e) => (
          <span key={e} className="flex items-center gap-1 rounded-full border border-white/20 py-1 pl-3 pr-1.5 text-sm text-paper-body">
            {e}
            <button aria-label={`Remove ${e}`} className="text-paper-muted hover:text-paper-stamp"
              onClick={() => update({ emails: p.emails.filter((x) => x !== e) })}>
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
      <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (newEmail.trim()) void update({ emails: [...p.emails, newEmail.trim()] }).then(() => setNewEmail("")); }}>
        <input className={input} placeholder="add an email" inputMode="email" autoCapitalize="off" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
        <button className={btn} disabled={!newEmail.trim()}>add</button>
      </form>
      {p.needs_email ? (
        <>
          <p className="mt-3 text-sm text-paper-muted">From your mail, matching “{p.name}”:</p>
          <Suggestions list={list} busy={looking} exclude={p.emails} onPick={(sg) => update({ emails: [...p.emails, sg.email] })} />
        </>
      ) : null}


      <h3 className="mb-2 mt-6 text-sm uppercase tracking-widest text-paper-accent">notes</h3>
      <textarea className={`${input} min-h-[5rem]`} placeholder="What you're keeping tabs on, context, next step…" value={note}
        onChange={(e) => setNote(e.target.value)} onBlur={() => note !== p.note && update({ note })} />
      <p className="h-5 text-xs text-paper-muted">{saved === "saved" ? saved : ""}</p>

      <button className={`${btn} mt-4`} onClick={async () => {
        if (!window.confirm(`Stop tracking ${p.name}?`)) return;
        await api(`/api/connections/${id}/delete`, { method: "POST" });
        onBack();
      }}>
        <Trash2 className="h-4 w-4" /> stop tracking
      </button>
    </div>
  );
}
