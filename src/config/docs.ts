import { DocsConfig } from "@/types";

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: "Blog",
      href: "/docs",
    },
  ],
  sidebarNav: [
    {
      title: "Documentation",
      items: [
        {
          title: "About",
          href: "/blog/about",
        },
      ],
    },
    {
      title: "Blog",
      items: [
        {
          title: "Introduction",
          href: "/docs/in-progress",
          disabled: true,
        },
        {
          title: "Build your own",
          href: "/docs/in-progress",
          disabled: true,
        },
        {
          title: "Writing Posts",
          href: "/docs/in-progress",
          disabled: true,
        },
      ],
    },
  ],
};
