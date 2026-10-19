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
          href: "/about",
        },
      ],
    },
    {
      title: "Blog",
      items: [
        {
          title: "About",
          href: "/about",
          disabled: true,
        },
      ],
    },
  ],
};
