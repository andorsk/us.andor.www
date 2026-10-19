import { cvMarkdown } from "@/lib/data/cv";

export const dynamic = "force-static";

export function GET() {
  return new Response(cvMarkdown(), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
