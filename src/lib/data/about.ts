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

// The andorvector: one direction through every role. Systems that understand people →
// systems people can trust → agents that act for people.
export const timeline: Milestone[] = [
  { when: "2014", name: "Claremont McKenna", note: "B.A., Science, Technology & Society and Public Policy Analysis." },
  {
    when: "2014–17",
    name: "RetailNext",
    url: "https://www.qualcomm.com/content/dam/qcomm-martech/dm-assets/documents/snapdragon_retailnext_case_study_0.pdf",
    note: "Analyst → R&D Engineer. Helped launch Aurora, a camera that processed human patterns at the edge.",
  },
  {
    when: "2019–23",
    name: "Pathr.ai",
    url: "https://pathr.ai/products-technology/",
    note: "Founding Engineer → Principal Engineer; led engineering on spatial intelligence (SensorLayer v1 and v2).",
    stamp: "Acquired",
  },
  { when: "2021–23", name: "Losci", note: "Technical Advisor. A retail digital twin built on my technology.", stamp: "Acquired" },
  {
    when: "2022–24",
    name: "Benri",
    url: "https://developer.tbd.website/blog/ssi-console/",
    note: "Co-Founder & CTO. Decentralized, portable data stores: Decentralized Web Nodes, SSI Console, a Web5 protocol registry.",
    stamp: "Bootstrapped",
  },
  {
    when: "2023–24",
    name: "Andor Labs",
    url: "https://ayra.forum",
    note: "Fractional CTO. Built the Ayra Association, an international trust organization, from the ground up alongside another CTO.",
  },
  {
    when: "2025",
    name: "Agent Overlay",
    url: "https://agentoverlay.com",
    note: "Founder & CEO. A runtime policy decision point for agents; paying clients across multiple contracts.",
    stamp: "Bootstrapped",
  },
  {
    when: "now",
    name: "HiJenny",
    url: "https://www.hijenny.ai",
    note: "Co-Founder & CTO. A personal assistant for homes and families. HF0 W26, raised $7M, 27+ people.",
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
  "0 → 1 CTO. The companies I've built have been acquired on the strength of their IP.",
  "I build AI + human teams that scale what each person can do.",
  "Speed is king.",
  "Novelty matters more than ever.",
  "I've automated most of my own workflows, so I can work from anywhere, on the go.",
];

export const offTheClock = [
  { label: "learning Kannada", url: "https://github.com/andorsk/learn_kannada" },
  { label: "tracking Starbucks mugs", url: "https://starbucks.andor.us" },
  { label: "d2-mode for Emacs", url: "https://github.com/andorsk/d2-mode" },
  { label: "my mother-in-law's recipes", url: "https://mangaloremom.com/en/" },
];

export const dog = {
  name: "Legend",
  breed: "giant schnauzer",
  url: "https://www.instagram.com/legend.logs/",
  photo: "/imgs/legend.jpg",
};
