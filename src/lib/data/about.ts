// Copy for the About page (lab notes).

export const thesis = [
  "Multi-founder CTO focused on aligning a world full of agents with a world full of humans.",
  "Agents are starting to act for us: booking, buying, deciding. Making them capable is the easy part. Making them accountable to the people they act for is the hard part, and it's what I work on: identity, delegation, policy, and keeping a human in the loop.",
];

export type Milestone = {
  when?: string;
  name: string;
  url?: string;
  note: string;
  stamp?: string;
};

// One throughline: systems that understand people → systems people can trust → agents that act for people.
export const timeline: Milestone[] = [
  { when: "'14", name: "Claremont McKenna", note: "Technology Policy. Fell for the overlap of technology and human behavior." },
  {
    name: "RetailNext",
    url: "https://www.qualcomm.com/content/dam/qcomm-martech/dm-assets/documents/snapdragon_retailnext_case_study_0.pdf",
    note: "Helped launch Aurora, a camera that processed human patterns at the edge.",
  },
  {
    name: "Pathr.ai",
    url: "https://pathr.ai/products-technology/",
    note: "Led engineering on spatial intelligence: SensorLayer v1 and v2.",
    stamp: "Acquired",
  },
  {
    name: "R-K Diagrams",
    url: "https://arxiv.org/abs/2201.06923",
    note: "Invented a topological graph method for finding the shape of complex data.",
    stamp: "Inventor",
  },
  { name: "Losci", note: "Advisor to a digital twin for retail stores, built on my technology.", stamp: "Acquired" },
  {
    name: "Decentralized identity",
    url: "/opensource",
    note: "Chair of DIF's Trusted AI Agents WG and Technical Steering Committee, trust registries at Trust Over IP, CTO at Zion.",
  },
  {
    name: "Benri",
    url: "https://developer.tbd.website/blog/ssi-console/",
    note: "Founder and CTO. Decentralized, portable data stores: Decentralized Web Nodes, SSI Console, a Web5 protocol registry.",
    stamp: "Founder / CTO",
  },
  {
    when: "now",
    name: "HiJenny",
    url: "https://www.hijenny.ai",
    note: "Building a personal assistant for homes and families. HF0 W26, raised $7M, 27+ people. Alongside: AgentOverlay and the Ayra Forum.",
    stamp: "HF0 W26",
  },
];

export const questions = [
  { q: "What's the optimal team structure for AI and human efficiency?", tag: "teams" },
  { q: "How do we represent human intent better?", tag: "intent" },
  { q: "How can we align VC markets with responsible AI?", tag: "capital" },
  { q: "Who is accountable when an agent acts on your behalf?", tag: "accountability" },
  { q: "How do we measure whether AI actually made someone's life better?", tag: "outcomes" },
  { q: "What does trust between agents look like at internet scale?", tag: "trust" },
];

export const howIWork = [
  "0 → 1 CTO, more than once.",
  "Built HiJenny's engineering team to 15+.",
  "Called in when engineering teams vanish: I stabilize the product and get it shipping again.",
  "I help write the standards, not just follow them.",
];

export const offTheClock = [
  { label: "learning Kannada", url: "https://github.com/andorsk/learn_kannada" },
  { label: "tracking Starbucks mugs", url: "https://starbucks.andor.us" },
  { label: "d2-mode for Emacs", url: "https://github.com/andorsk/d2-mode" },
  { label: "my mother-in-law's recipes", url: "https://mangaloremom.com/en/" },
];
