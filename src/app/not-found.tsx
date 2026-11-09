import Link from "next/link";
import DefaultLayout from "@/layouts/DefaultLayout";

// Site-wide 404 (static export writes this to 404.html, which GitHub Pages serves for unknown paths).
export default function NotFound() {
  return (
    <DefaultLayout>
      <main className="mx-auto max-w-2xl px-5 sm:text-xl">
        <section className="mt-14 sm:mt-20">
          <div className="text-base text-paper-muted">lab notes · 404</div>
          <h1 className="mt-1 font-hand text-6xl font-bold leading-none text-white sm:text-7xl">page not found</h1>
          <p className="mt-6 leading-relaxed text-paper-body">
            This page doesn&apos;t exist, or it was taken down. If someone shared a link with you, check that you have the
            whole thing.
          </p>
          <p className="mt-6">
            <Link href="/" className="text-paper-accent underline decoration-wavy underline-offset-4">
              back home
            </Link>
          </p>
        </section>
      </main>
    </DefaultLayout>
  );
}
