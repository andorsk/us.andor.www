"use client";

// Unlocks a private shared page in the browser. The page data is AES-256-GCM ciphertext; the key is
// PBKDF2-SHA256(passcode, salt, iter). Nothing readable is in the published site or the repo.
import { useCallback, useEffect, useState } from "react";
import type { EncryptedPayload } from "@/lib/shares";

type Unlocked = { title: string; description?: string; html: string };

const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function decrypt(payload: EncryptedPayload, passcode: string): Promise<Unlocked> {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey("raw", enc.encode(passcode.trim().toLowerCase()), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: b64(payload.salt), iterations: payload.iter, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(payload.iv) }, key, b64(payload.ct));
  return JSON.parse(new TextDecoder().decode(plain)) as Unlocked;
}

export default function PrivateShare({ payload }: { payload: EncryptedPayload }) {
  const [page, setPage] = useState<Unlocked | null>(null);
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const attempt = useCallback(
    async (code: string, quiet = false) => {
      setBusy(true);
      setError("");
      try {
        const result = await decrypt(payload, code);
        try {
          sessionStorage.setItem(`anton:${location.pathname}`, code);
        } catch {}
        document.title = `${result.title} - Andor Labs`;
        setPage(result);
      } catch {
        if (!quiet) setError("That passcode didn't work.");
      } finally {
        setBusy(false);
      }
    },
    [payload],
  );

  useEffect(() => {
    const fromHash = new URLSearchParams(location.hash.slice(1)).get("pass");
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(`anton:${location.pathname}`);
    } catch {}
    if (fromHash || saved) void attempt((fromHash || saved)!, true);
  }, [attempt]);

  if (page) {
    return (
      <>
        <h1 className="mt-1 font-hand text-5xl font-bold leading-none text-white sm:text-6xl">{page.title}</h1>
        {page.description ? <p className="mt-4 text-paper-body">{page.description}</p> : null}
        <article className="mdx share-article mt-10" dangerouslySetInnerHTML={{ __html: page.html }} />
      </>
    );
  }

  return (
    <form
      className="mt-6 max-w-sm"
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        void attempt(pass);
      }}
    >
      <h1 className="font-hand text-5xl font-bold leading-none text-white sm:text-6xl">private page</h1>
      <p className="mt-4 text-paper-body">Enter the passcode you were given to read this.</p>
      <input
        type="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        placeholder="passcode"
        aria-label="Passcode"
        autoFocus
        className="mt-6 w-full rounded-md border border-dashed border-white/30 bg-transparent px-3 py-2 font-mono text-base text-white placeholder:text-paper-muted focus:border-paper-accent focus:outline-none"
      />
      <button
        type="submit"
        disabled={busy || !pass}
        className="mt-3 rounded-md border border-paper-accent px-4 py-2 text-base text-paper-accent transition hover:bg-paper-accent hover:text-black disabled:opacity-50"
      >
        {busy ? "unlocking…" : "unlock"}
      </button>
      <div role="alert" className="mt-3 min-h-[1.5em] text-base text-paper-stamp">
        {error}
      </div>
    </form>
  );
}
