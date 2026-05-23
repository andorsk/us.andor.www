export type Link = {
  url: string;
  label: string;
  description: string;
  organization?: string;
  affiliation?: string;
  role?: string;
  dates?: string;
};

export const ProjectLinks: Link[] = [
  {
    url: "https://hijenny.ai/home",
    label: "HiJenny",
    organization: "HiJenny",
    description:
      "iOS and web app with multi-agent system across multiple modalities focused on AI-powered home renovation and servicing. Raised $6M from HF0, grew team to 20 people with hundreds of projects created in first 4 weeks. Secured key partnerships like Lowes. Created dual reasoning layer with voice capabilities as part of XAI's Startup Program.",
  },
  {
    url: "https://agentoverlay.com",
    label: "AgentOverlay",
    organization: "Agent Overlay, Inc",
    description:
      "Building the infrastructure for the agentic web - enabling AI agents to discover, connect, and collaborate across decentralized networks.",
  },
  {
    url: "https://projectnanda.org/",
    label: "Project NANDA : Bay Area Chapter",
    organization: "Bay Area Chapter",
    description:
      "Leading the Bay Area Chapter of Project NANDA, building the Internet of Agents.",
  },
  {
    url: "https://identity.foundation/working-groups/trusted-agents.html",
    label: "Trusted AI Agents Working Group",
    organization: "Decentralized Identity Foundation",
    description:
      "Chair of the Trusted AI Agents Working Group at DIF, defining governance standards for AI Agents.",
  },
  {
    url: "https://agenticinternetworkshop.org/#",
    label: "Agentic Internet Workshop",
    organization: "Internet Identity Workshop",
    description:
      "Workshop focused on building the foundational infrastructure for agentic internet systems.",
  },
  {
    url: "https://luma.com/home?period=past&e=evt-0zQJsVa7iC7V3h5",
    label: "AI Agent Unconference: Lightning Talks & Discussions",
    organization: "AI Alliance",
    description:
      "Community unconference featuring lightning talks and discussions about AI agents and their future.",
  },
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
    url: "https://www.dazzagreenwood.com/p/ai-agents-x-law-initiative",
    label: "AI Agents x Law Initiative",
    organization: "Stanford CodeX, MIT Computational Law Report, Stanford HAI Digital Economy Lab, and Consumer Reports Innovation Lab",
    dates: "2025-Present",
    role: "Presenter",
    description:
      "Initiative focused on building the foundational infrastructure for agentic internet systems.",
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
    url: "https://protocols.andor.us/",
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
    label: "Awesome Decentralized Community",
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

export default ProjectLinks;
