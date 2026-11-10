"use client";

// "work" tab: Claude Code tasks running on Andor's server, each in its own git worktree.
// Start a task (repo + prompt, typed or spoken), watch what Claude does, and keep talking to it.
import { ArrowLeft, ArrowUp, GitBranch, Plus, Square } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MicButton } from "@/components/anton-chat";
import { Button } from "@/components/ui/button";
import { ChatContainerContent, ChatContainerRoot, ChatContainerScrollAnchor } from "@/components/ui/chat-container";
import { Loader } from "@/components/ui/loader";
import { Markdown } from "@/components/ui/markdown";
import { PromptInput, PromptInputAction, PromptInputActions, PromptInputTextarea } from "@/components/ui/prompt-input";
import { useDictation } from "@/hooks/use-dictation";

type Api = (path: string, init?: RequestInit) => Promise<any>;
type Task = {
  id: string; title: string; repo: string; branch: string; path: string; status: string;
  created: string; updated: string; last?: string; cost_usd?: number; diffstat?: string;
};
type Ev = { kind: "user" | "text" | "tool" | "result" | "error"; text: string; ts: string };

const STATUS: Record<string, string> = {
  running: "bg-paper-accent animate-pulse", done: "bg-emerald-400/80", error: "bg-paper-stamp", stopped: "bg-white/30", new: "bg-white/30",
};

function ago(iso?: string) {
  if (!iso) return "";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  return m < 60 ? `${m}m` : m < 2880 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`;
}

function Composer({ placeholder, busy, onSend }: { placeholder: string; busy?: boolean; onSend: (t: string) => void | Promise<void> }) {
  const [text, setText] = useState("");
  const voice = useDictation((t) => setText((x) => (x ? `${x} ${t}` : t)));
  const send = () => {
    const t = text.trim();
    if (!t || busy) return;
    voice.stop();
    setText("");
    void onSend(t);
  };
  return (
    <PromptInput value={text} onValueChange={setText} onSubmit={send} isLoading={busy}
      className="rounded-xl border border-dashed border-white/30 bg-transparent p-2">
      <PromptInputTextarea placeholder={placeholder} className="text-base text-white placeholder:text-paper-muted" />
      <PromptInputActions className="flex items-center justify-between pt-2">
        <div className="flex min-w-0 items-center gap-1">
          <MicButton voice={voice} />
          {voice.listening ? <span className="truncate text-sm text-paper-muted">{voice.interim || "listening…"}</span> : null}
        </div>
        <PromptInputAction tooltip="Send">
          <Button size="icon" className="h-9 w-9 rounded-full" onClick={send} disabled={busy || !text.trim()} aria-label="Send">
            <ArrowUp className="h-4 w-4" />
          </Button>
        </PromptInputAction>
      </PromptInputActions>
    </PromptInput>
  );
}

export default function WorkPanel({ api, fill = false }: { api: Api; fill?: boolean }) {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      setTasks((await api("/api/work/tasks")).tasks);
      setErr("");
    } catch (e) {
      setErr((e as Error).message);
    }
  }, [api]);

  useEffect(() => {
    void load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  if (open) return <TaskView api={api} id={open} fill={fill} onBack={() => { setOpen(null); void load(); }} />;
  if (creating) return <NewTask api={api} onCancel={() => setCreating(false)} onCreated={(id) => { setCreating(false); setOpen(id); }} />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-paper-muted">Claude Code on your server, one git worktree per task.</p>
        <button onClick={() => setCreating(true)} className="flex items-center gap-1 rounded-md border border-paper-accent px-3 py-1.5 text-sm text-paper-accent hover:bg-paper-accent hover:text-black">
          <Plus className="h-4 w-4" /> new
        </button>
      </div>
      {err ? <p className="mt-3 text-sm text-paper-stamp">{err}</p> : null}
      {!tasks ? (
        <p className="mt-4 text-paper-muted">loading…</p>
      ) : !tasks.length ? (
        <p className="mt-4 text-paper-muted">No tasks yet. Tap “new” and tell Claude what to build.</p>
      ) : (
        <ul className="mt-3 divide-y divide-dashed divide-white/10">
          {tasks.map((t) => (
            <li key={t.id}>
              <button className="flex w-full items-start gap-2.5 py-2.5 text-left" onClick={() => setOpen(t.id)}>
                <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${STATUS[t.status] ?? STATUS.new}`} title={t.status} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base text-white">{t.title}</span>
                  <span className="block truncate text-sm text-paper-muted">
                    {t.repo} · {t.status} · {ago(t.updated)}
                    {t.diffstat ? ` · ${t.diffstat}` : ""}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <Worktrees api={api} />
    </div>
  );
}

function Worktrees({ api }: { api: Api }) {
  const [rows, setRows] = useState<{ repo: string; path: string; branch: string; main: boolean }[] | null>(null);
  return (
    <details className="mt-6" onToggle={(e) => { if ((e.target as HTMLDetailsElement).open && !rows) api("/api/work/worktrees").then((d) => setRows(d.worktrees)).catch(() => setRows([])); }}>
      <summary className="cursor-pointer select-none text-sm text-paper-muted">all worktrees</summary>
      <ul className="mt-2 space-y-1.5 text-sm">
        {(rows ?? []).map((w, i) => (
          <li key={i} className="flex items-center gap-2 text-paper-body">
            <GitBranch className="h-3.5 w-3.5 shrink-0 text-paper-muted" />
            <span className="truncate">{w.repo}</span>
            <span className="truncate font-mono text-xs text-paper-muted">{w.branch}{w.main ? " (main)" : ""}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

function NewTask({ api, onCancel, onCreated }: { api: Api; onCancel: () => void; onCreated: (id: string) => void }) {
  const [repos, setRepos] = useState<string[]>([]);
  const [repo, setRepo] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => {
    api("/api/work/repos")
      .then((d) => {
        setRepos(d.repos);
        setRepo((r) => r || d.repos[0] || "");
      })
      .catch((e) => setErr((e as Error).message));
  }, [api]);
  return (
    <div>
      <button onClick={onCancel} className="mb-3 flex items-center gap-1 text-sm text-paper-muted hover:text-paper-accent">
        <ArrowLeft className="h-4 w-4" /> tasks
      </button>
      <label className="block text-sm text-paper-muted" htmlFor="repo">repo</label>
      <select id="repo" value={repo} onChange={(e) => setRepo(e.target.value)}
        className="mb-3 mt-1 w-full rounded-md border border-dashed border-white/30 bg-paper-bg px-3 py-2 text-base text-white">
        {repos.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      <Composer
        placeholder="what should Claude do? (it gets its own branch and worktree)"
        busy={busy}
        onSend={async (prompt) => {
          setBusy(true);
          setErr("");
          try {
            const t = await api("/api/work/tasks", { method: "POST", body: JSON.stringify({ repo, prompt }) });
            onCreated(t.id);
          } catch (e) {
            setErr((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      />
      {err ? <p className="mt-3 text-sm text-paper-stamp">{err}</p> : null}
    </div>
  );
}

function TaskView({ api, id, fill, onBack }: { api: Api; id: string; fill: boolean; onBack: () => void }) {
  const [task, setTask] = useState<Task | null>(null);
  const [events, setEvents] = useState<Ev[]>([]);
  const [err, setErr] = useState("");
  const next = useRef(0);

  const poll = useCallback(async () => {
    try {
      const d = await api(`/api/work/tasks/${id}?since=${next.current}`);
      next.current = d.next;
      setTask(d);
      if (d.events?.length) setEvents((x) => [...x, ...d.events]);
    } catch (e) {
      setErr((e as Error).message);
    }
  }, [api, id]);

  useEffect(() => {
    next.current = 0;
    setEvents([]);
    void poll();
  }, [poll]);
  useEffect(() => {
    const t = setInterval(poll, task?.status === "running" ? 2500 : 10000);
    return () => clearInterval(t);
  }, [poll, task?.status]);

  const running = task?.status === "running";
  return (
    <div className={`flex flex-col ${fill ? "h-full" : ""}`}>
      <div className="flex items-start gap-2">
        <button onClick={onBack} aria-label="Back to tasks" className="mt-0.5 text-paper-muted hover:text-paper-accent">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base text-white">{task?.title ?? "…"}</div>
          <div className="truncate text-xs text-paper-muted">
            {task ? `${task.repo} · ${task.branch} · ${task.status}${task.diffstat ? ` · ${task.diffstat}` : ""}${task.cost_usd ? ` · $${task.cost_usd.toFixed(2)}` : ""}` : ""}
          </div>
        </div>
        {running ? (
          <button onClick={() => api(`/api/work/tasks/${id}/stop`, { method: "POST" }).then(poll)}
            className="flex items-center gap-1 rounded-md border border-paper-stamp/60 px-2 py-1 text-sm text-paper-stamp">
            <Square className="h-3.5 w-3.5" /> stop
          </button>
        ) : null}
      </div>
      {err ? <p className="mt-2 text-sm text-paper-stamp">{err}</p> : null}
      <ChatContainerRoot className={`mt-3 flex-col ${fill ? "min-h-0 flex-1" : "max-h-[32rem]"}`}>
        <ChatContainerContent className="space-y-3 py-1">
          {events.map((e, i) =>
            e.kind === "user" ? (
              <div key={i} className="ml-auto max-w-[85%] rounded-md border border-dashed border-white/20 px-3 py-2 text-base text-paper-body">{e.text}</div>
            ) : e.kind === "tool" ? (
              <div key={i} className="truncate font-mono text-xs text-paper-muted">› {e.text}</div>
            ) : e.kind === "error" ? (
              <div key={i} className="whitespace-pre-wrap text-sm text-paper-stamp">{e.text}</div>
            ) : (
              <Markdown key={i} className="cp-md">{e.text}</Markdown>
            ),
          )}
          {running ? (
            <div className="flex items-center gap-2 text-sm text-paper-muted">
              <Loader variant="typing" size="sm" /> claude is working…
            </div>
          ) : null}
        </ChatContainerContent>
        <ChatContainerScrollAnchor />
      </ChatContainerRoot>
      <div className="mt-3">
        <Composer
          placeholder={running ? "wait for Claude to finish, or stop it…" : "tell Claude what to do next…"}
          busy={running}
          onSend={async (text) => {
            try {
              await api(`/api/work/tasks/${id}/message`, { method: "POST", body: JSON.stringify({ text }) });
              await poll();
            } catch (e) {
              setErr((e as Error).message);
            }
          }}
        />
      </div>
    </div>
  );
}
