// Shared pages published by Anton (Andor's AI agent) live as JSON in content/shares/<slug>.json.
// Public pages carry pre-rendered HTML; private pages carry only AES-GCM ciphertext that the
// browser decrypts with the passcode (see src/components/private-share.tsx).
import fs from "node:fs";
import path from "node:path";

export type EncryptedPayload = { v: number; iter: number; salt: string; iv: string; ct: string };

export type Share = {
  slug: string;
  title: string;
  description?: string;
  date: string;
  visibility: "public" | "private";
  indexable?: boolean;
  html?: string; // public pages
  payload?: EncryptedPayload; // private pages
};

const DIR = path.join(process.cwd(), "content", "shares");

export function allShareSlugs(): string[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

export function getShare(slug: string): Share | null {
  if (!/^[a-z0-9][a-z0-9-]{0,60}$/.test(slug)) return null;
  const file = path.join(DIR, `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as Share;
}
