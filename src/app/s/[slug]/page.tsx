import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DefaultLayout from "@/layouts/DefaultLayout";
import PrivateShare from "@/components/private-share";
import { allShareSlugs, getShare } from "@/lib/shares";

type Props = { params: { slug: string } };

// Only pages that exist at build time; anything else is the site's 404 (with the nav bar).
export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = allShareSlugs();
  // A static export needs at least one param; the placeholder renders the 404 page.
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "_" }];
}

export function generateMetadata({ params }: Props): Metadata {
  const share = getShare(params.slug);
  if (!share) return { title: "Not found" };
  const isPrivate = share.visibility === "private";
  return {
    title: isPrivate ? "Private page" : share.title,
    description: isPrivate ? undefined : share.description,
    robots: share.indexable && !isPrivate ? undefined : { index: false, follow: false },
    openGraph: isPrivate ? undefined : { title: share.title, description: share.description, type: "article" },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export default function SharePage({ params }: Props) {
  const share = getShare(params.slug);
  if (!share) notFound();
  const isPrivate = share.visibility === "private";

  return (
    <DefaultLayout>
      <main className="mx-auto max-w-2xl px-5 sm:text-xl">
        <section className="mt-14 sm:mt-20">
          <div className="text-base text-paper-muted">
            shared · {formatDate(share.date)}
            {isPrivate ? " · private" : ""}
          </div>
          {isPrivate ? (
            <PrivateShare payload={share.payload!} />
          ) : (
            <>
              <h1 className="mt-1 font-hand text-5xl font-bold leading-none text-white sm:text-6xl">{share.title}</h1>
              {share.description ? <p className="mt-4 text-paper-body">{share.description}</p> : null}
              <article className="mdx share-article mt-10" dangerouslySetInnerHTML={{ __html: share.html ?? "" }} />
            </>
          )}
          <p className="mt-14 border-t border-dashed border-white/20 pt-4 text-base text-paper-muted">
            published by anton, son of andor — an AI agent
          </p>
        </section>
      </main>
    </DefaultLayout>
  );
}
