import { GridBoxLayout } from "@/layouts/GridBoxLayout";
import DocumentLayout from "@/layouts/DocumentLayout";

type Link = {
  url: string;
  label: string;
  description: string;
  affiliation?: string;
  dates?: string;
};

const ProjectLayout = () => {
  const links: Link[] = [
    {
      url: "/opensource",
      label: "Open Source Working Groups",
      description:
        "Check out my other open source projects specifications/projects I lead.",
    },
    {
      url: "https://pathr.ai/products-technology/",
      label: "SensorLayer v1.0 and v2.0",
      affiliation: "Pathr.ai",
      description:
        "Pathr.ai is transforming how companies understand their physical locations – through the power of spatial intelligence. I led engineering while I was there. ",
    },
    {
      url: "https://www.qualcomm.com/content/dam/qcomm-martech/dm-assets/documents/snapdragon_retailnext_case_study_0.pdf",
      affiliation: "RetailNext",
      label: "Aurora Sensor",
      description:
        "Part of the team that launched the first Aurora, a camera that processed human patterns at the edge.",
    },
    {
      url: "https://developer.tbd.website/blog/ssi-console/",
      affiliation: "Benri",
      label: "SSI Console",
      description: "Storage for Decentralized Web Nodes",
    },
    {
      url: "https://www.zion.fyi/",
      label: "Zion Project",
      affiliation: "Zion",
      description:
        "Zion is a peer-governed social network where members are the true owners of their data. I was CTO  while I was there.",
    },
    {
      url: "https://starbucks.andor.us",
      label: "Starbucks Mug Tracker",
      affiliation: "Personal",
      description:
        "A fun little data project to help me figure out which starbucks mugs I was missing, and view starbucks mug collection from around the world...",
    },
    {
      url: "https://tabata.andor.us",
      label: "Web5 Tabata App",
      affiliation: "Personal",
      description:
        "no ads. open source. personal use. no tracking. free. no paywall. own your workout data with a web5 based tabata timer.",
    },
    {
      url: "https://service-profiles.andor.us",
      label: "Service Profiles",
      affiliation: "Henosisknot LLC",
      description:
        "A tool I put together that implements a decentralized service discovery specifcations I lead at Trust Over IP.",
    },
    {
      url: "https://github.com/andorsk/d2-mode",
      label: "D2 Mode For Emacs",
      affiliation: "Personal",
      description: "D2 Mode For Emacs. Listed by d2 and on MELPA",
    },
    {
      url: "https://protocols.benri.io/",
      label: "Web5 Protocol Repository",
      affiliation: "Benri",
      description:
        "A public registry/tool I put together for Decentralized Web Node Protocol Specifications while working with Benri",
    },
    {
      url: "https://arxiv.org/abs/2201.06923",
      label:
        "A Novel Approach to Topological Graph Theory with R-K Diagrams and Gravitational Wave Analysis",
      affiliation: "Pathr.ai",
      description:
        "A academic project I worked on with a friend focusing on Topology and Gravitational Wave Analysis.",
    },
    {
      url: "https://mangaloremom.com/en/",
      label: "Mangalore Mom",
      description:
        "A website I help put together for my mother in law to list her recipes",
    },
    {
      url: "https://github.com/andorsk/awesome-trust-registries",
      label: "Awesome Trust Registries",
      affiliation: "Personal",
      description: "A curated list of trust registries",
    },
    {
      url: "https://github.com/andorsk/awesome-pds",
      label: "Awesome Personal Datastores",
      affiliation: "Personal",
      description: "A curated list of trust personal data stores",
    },
    {
      url: "https://github.com/andorsk/awesome-decentralized-community",
      label: "Awesome Decentralized Identity Community",
      affiliation: "Personal",
      description: "A curated list of trust personal data stores",
    },
    {
      url: "https://github.com/andorsk/daily_wisdom",
      label: "Daily Wisdom",
      description: "Random facts and information pushed to my slack daily",
    },
    {
      url: "https://github.com/andorsk/hugo-doom-emacs-theme",
      label: "Hugo Doom Emacs",
      description: "Emulator for Emacs Doom on Hugo",
    },
    {
      url: "https://github.com/andorsk/learn_kannada",
      label: "Kannada ",
      description:
        "A website to help me learn Kannada, a language from my wife's home town.",
    },
    {
      url: "https://ybr.andor.us",
      label: "Yellow Brick Road",
      description:
        "A personal finance tool for finding which account works best for you.",
    },
    {
      url: "/projects",
      label: "Codeshield",
      description: "Build test vectors and ship more reliably. Not open yet.",
    },
    {
      url: "https://github.com/andorsk/web5-calendar",
      label: "Web5 Calendar",
      description: "Privacy forward calendly competitor",
    },
  ];

  const header =
    "A lot of projects I worked on are not published. Here are a few that have been:";

  return (
    <div>
      <GridBoxLayout
        header={header}
        links={links.map((item) => {
          return {
            url: item.url,
            label: item.label,
            description: item.description,
            sublabel:
              (item.affiliation ? item.affiliation : "") +
              (item.dates ? " " + item.dates : ""),
          };
        })}
      ></GridBoxLayout>
    </div>
  );
};

export default ProjectLayout;
