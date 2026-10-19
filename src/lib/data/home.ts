// Copy for the home page notebook.

export const intro =
  "Multi-founder CTO focused on aligning a world full of agents with a world full of humans.";

export type Work = {
  name: string;
  url?: string;
  tag: string;
  line: string;
  stack?: string[];
};

export const work: Work[] = [
  {
    name: "HiJenny",
    url: "https://www.hijenny.ai",
    tag: "Founder · HF0 W26",
    line: "An AI personal assistant for homes and families: tasks, inventory, home services, renovation. Raised $7M and built a 27-person team.",
    stack: ["Computer Vision", "Voice Pipelines", "Duplex Models", "Agentic Orchestration", "Delegation Frameworks", "Human in the Loop", "RL", "Topology", "Voice-First Evals"],
  },
  {
    name: "AgentOverlay",
    url: "https://agentoverlay.com",
    tag: "Founder",
    line: "A small runtime policy decision point (PDP) for agents. It decides, in the moment, what an agent is allowed to do.",
    stack: ["Runtime Authorization", "Agent Policy", "Delegation"],
  },
  {
    name: "Trusted AI Agents WG",
    url: "https://identity.foundation/working-groups/trusted-agents.html",
    tag: "Chair · DIF",
    line: "Writing the standards for how AI agents are identified, trusted, and governed.",
    stack: ["Agent Identity", "Delegation", "Governance"],
  },
  {
    name: "Ayra Forum",
    url: "https://ayra.forum",
    tag: "Technical Lead",
    line: "Trust infrastructure that lets digital identity ecosystems recognize each other.",
    stack: ["Ayra Trust Network", "Trust Registries"],
  },
  {
    name: "Benri",
    url: "https://developer.tbd.website/blog/ssi-console/",
    tag: "Founder / CTO",
    line: "Decentralized, portable data stores: your data travels with you, not with the app.",
    stack: ["Decentralized Web Nodes", "SSI Console", "Web5 Protocols"],
  },
  {
    name: "AI Agents x Law",
    url: "https://www.dazzagreenwood.com/p/ai-agents-x-law-initiative",
    tag: "Presenter · Stanford CodeX",
    line: "A workshop on what the law expects when AI agents act on someone's behalf.",
    stack: ["Stanford CodeX", "MIT Computational Law Report", "Stanford HAI", "Consumer Reports"],
  },
  {
    name: "R-K Diagrams",
    url: "https://arxiv.org/abs/2201.06923",
    tag: "Inventor",
    line: "A topological graph method for finding the shape of complex data, demonstrated on gravitational-wave analysis.",
    stack: ["Topology", "Graph Theory", "arXiv 2201.06923"],
  },
  {
    name: "Pathr.ai",
    url: "https://pathr.ai/products-technology/",
    tag: "Led Engineering · Acquired",
    line: "Spatial intelligence: understanding how people move through physical spaces.",
    stack: ["SensorLayer v1 & v2", "Computer Vision", "Behavioral Analysis"],
  },
  {
    name: "Losci",
    tag: "Advisor · Acquired",
    line: "A digital twin for retail stores, built on my technology. Advised the team through its acquisition.",
    stack: ["Digital Twin", "Retail"],
  },
];

export const nav = [
  { label: "About", url: "/about" },
  { label: "Projects", url: "/projects" },
  { label: "Open Source", url: "/opensource" },
];

export const social = [
  { label: "Email", url: "mailto:contact@andor.us", text: "contact@andor.us" },
  { label: "GitHub", url: "https://github.com/andorsk", text: "github.com/andorsk" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/andorsk/", text: "in/andorsk" },
];
