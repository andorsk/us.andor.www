export type HomeLink = {
  url: string;
  label: string;
  description: string;
  organization?: string;
  affiliation?: string;
  role?: string;
  dates?: string;
};

export const homeLinks: HomeLink[] = [
  {
    url: "/",
    label: "Home",
    description: "Learn about &&||",
  },
  {
    url: "/blog/about",
    label: "About",
    description: "Learn about &&||",
  },
  {
    url: "/projects",
    label: "Projects",
    description: "Some of the projects I've worked on in the past",
  },
  {
    url: "/opensource",
    label: "Open Source",
    description: "Open Source Specifications and Standards I Work On",
  },
  {
    url: "/contact",
    label: "Contact",
    description: "Contact Me",
  },
  {
    url: "/services",
    label: "Services",
    description: "Services I Offer",
  },
  {
    url: "/blog/testimonials",
    label: "Testimonials",
    description: "Testmonials from clients",
  },
];
