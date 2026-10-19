"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, social } from "@/lib/data/home";

type DefaultLayoutProps = {
  children: React.ReactNode;
};

export type HomeLink = {
  url: string;
  label: string;
  description: string;
};

// Notebook shell shared by every page: handwritten &&|| mark, lowercase nav, dashed footer.
export default function DefaultLayout({ children }: DefaultLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="relative flex min-h-screen flex-col text-paper-ink">
      <header className="relative z-10 mx-auto print:hidden flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-5 pt-8 sm:pt-12">
        <Link href="/" className="font-hand text-3xl font-bold text-paper-accent" aria-label="Home">
          &amp;&amp;||
        </Link>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-base text-paper-muted">
          {nav.map((n) => (
            <Link
              key={n.url}
              href={n.url}
              className={pathname === n.url ? "text-paper-accent underline decoration-wavy underline-offset-4" : ""}
            >
              {n.label.toLowerCase()}
            </Link>
          ))}
        </nav>
      </header>

      <div className="relative z-10 flex-1">{children}</div>

      <footer className="relative z-10 mx-auto print:hidden mt-16 w-full max-w-5xl px-5 pb-10">
        <div className="flex flex-col gap-2 border-t border-dashed border-white/20 pt-6 text-base text-paper-muted sm:flex-row sm:flex-wrap sm:gap-6">
          {social.map((s) => (
            <a key={s.label} href={s.url}>
              {s.label.toLowerCase()}: {s.text}
            </a>
          ))}
          <span className="sm:ml-auto">© {new Date().getFullYear()} Henosisknot LLC</span>
        </div>
      </footer>
    </div>
  );
}
