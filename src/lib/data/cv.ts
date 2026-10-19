// CV data. Rendered at /cv (notebook on screen, plain on print) and /cv.md.

export type Role = {
  org: string;
  url?: string;
  title: string;
  dates: string;
  location?: string;
  tag?: string;
  bullets: string[];
};

export const cv = {
  name: "Andor Kesselman",
  headline: "Co-Founder & CTO · aligning a world full of agents with a world full of humans",
  location: "Presidio, San Francisco",
  contact: [
    { label: "Email", text: "andor@andor.us", url: "mailto:andor@andor.us" },
    { label: "Phone", text: "310-936-8535", url: "tel:+13109368535" },
    { label: "LinkedIn", text: "linkedin.com/in/andorsk", url: "https://www.linkedin.com/in/andorsk/" },
    { label: "Web", text: "andor.us", url: "https://andor.us" },
  ],
  summary:
    "Multi-founder CTO with 10+ years taking AI and multi-agent systems from zero to production. Co-founded HiJenny, one of 10 companies selected from 45,000 applications (a 0.02% acceptance rate) to HF0 (W26), the world's most exclusive incubator. Raised $7M, built a 27+ person company with 15+ engineers, and put 1,000+ homes on the platform. Founding engineer through acquisition at Pathr.ai, and technical advisor through acquisition at Losci. Founder and chair of agent-trust standards at the Decentralized Identity Foundation.",
  impact: [
    "Selected for HF0 W26: 10 slots from 45,000 applications, a 0.02% acceptance rate.",
    "Built HiJenny's engineering org to 15+ engineers (27+ company) and raised $7M in under a year, bringing in $1M+ from my own network.",
    "Brought in HiJenny's Lowe's partnership, a key partnership for the fundraise and our competitive moat.",
    "Architected an AI calling system capable of millions of calls per hour, with human operator controls.",
    "Built an AI intern program from scratch: 3 converted to full-time engineers (all master's and PhD grads), and alumni went on to NVIDIA, Wasmer, and others. Graduates recommended it to their friends, creating a recruiting flywheel.",
    "Two exits as an early technical leader: Pathr.ai and Losci, both acquired.",
    "Founded DIF's Trusted AI Agents WG; chaired DIF's Technical Steering Committee 2023–2026.",
  ],
  experience: [
    {
      org: "HiJenny",
      url: "https://www.hijenny.ai",
      title: "Co-Founder & CTO",
      dates: "Jan 2026 – present",
      location: "San Francisco",
      tag: "HF0 W26",
      bullets: [
        "Lead a 15+ engineer team in a 27+ person company, including building a 10+ person team in Poland. Raised $7M, including $1M+ brought in from my own network.",
        "AI personal assistant for homes and families covering tasks, inventory, home services, and renovation. Shipped the iOS app; 1,000+ homes on the platform.",
        "AI calling system capable of millions of calls per hour, with human operator controls.",
        "Home-specific context and reasoning layer built on ontology and topology. Computer vision, voice pipelines, duplex models, agentic orchestration, delegation frameworks, human in the loop, RL, voice-first evals.",
        "Brought in the Lowe's partnership, key to the fundraise and our competitive moat. XAI Startup Program.",
      ],
    },
    {
      org: "Agent Overlay",
      url: "https://agentoverlay.com",
      title: "Founder & CEO",
      dates: "Jun 2025 – Jan 2026",
      location: "Palo Alto",
      bullets: [
        "Built a runtime agentic policy decision point (PDP) that decides, live, what an AI agent may do. Worked closely with agentic gateway technology.",
        "Secured key paying clients across multiple contracts, then moved to co-found HiJenny on a venture-backed opportunity.",
      ],
    },
    {
      org: "Andor Labs",
      title: "Fractional CTO",
      dates: "Jul 2023 – Jul 2024",
      bullets: [
        "Built the Ayra Association (ayra.forum), an international trust organization, from the ground up alongside another CTO, and led its technical workstream.",
        "Stabilized engineering and product for early-stage startups; technical due diligence for M&A.",
      ],
    },
    {
      org: "Benri.io",
      title: "Co-Founder & CTO",
      dates: "Feb 2022 – Jan 2024",
      bullets: [
        "Decentralized, portable data stores. Built Decentralized Web Node tooling (SSI Console, featured on TBD's developer blog) and a Web5 protocol registry.",
      ],
    },
    {
      org: "Pathr.ai",
      url: "https://pathr.ai",
      title: "Founding Engineer (ML) → Principal Engineer; led engineering",
      dates: "Mar 2019 – Jan 2023",
      tag: "Acquired",
      bullets: [
        "Spatial intelligence platform. Built the ML pipelines, then led engineering through SensorLayer v1 and v2.",
      ],
    },
    {
      org: "Losci",
      title: "Technical Advisor",
      dates: "Jan 2021 – Jan 2023",
      tag: "Acquired",
      bullets: ["Retail digital twin built on my technology. Advised the team through acquisition."],
    },
    {
      org: "Henosisknot LLC",
      title: "AI / Engineering Consultant",
      dates: "Mar 2017 – 2021",
      bullets: [],
    },
    {
      org: "RetailNext",
      title: "Customer Experience Analyst → R&D Engineer",
      dates: "2014 – 2017",
      location: "San Jose",
      bullets: ["Helped launch Aurora, an edge camera that processed human patterns at the edge."],
    },
  ] as Role[],
  standards: [
    "Decentralized Identity Foundation: Trusted AI Agents WG, Founder & Chair (2025–) · DIF Labs, Founder & Chair (2024–26) · Technical Steering Committee Chair (2023–26) · Decentralized Web Node WG Chair (2022–25)",
    "Trust Over IP: Trust Registry Task Force Chair (2023–26)",
    "Ayra Association: Lead of Technical Workstream (2024–25)",
    "Agentic Internet Workshop: Co-Founder (2025–)",
    "Project NANDA: Bay Area Chapter (2025–26)",
  ],
  research: [
    {
      text: "Inventor of R-K Diagrams (independent research): A Novel Approach to Topological Graph Theory with R-K Diagrams and Gravitational Wave Analysis (arXiv 2201.06923)",
      url: "https://arxiv.org/abs/2201.06923",
    },
    { text: "AI Agents x Law, Stanford CodeX (2025)", url: "https://www.dazzagreenwood.com/p/ai-agents-x-law-initiative" },
    { text: "AI Agent Unconference, organizer (2024)", url: "https://luma.com/home?period=past&e=evt-0zQJsVa7iC7V3h5" },
  ],
  education: [
    "Claremont McKenna College: B.A., Science, Technology & Society and Public Policy Analysis (2011–2014)",
    "MicroMasters in Artificial Intelligence",
    "Towards Agentic Intelligence: Architectures for Multi-Agent AI Systems",
  ],
  skills: [
    { label: "Leadership", items: "0→1 engineering orgs, building competitive AI-focused teams, R&D, hiring, fundraising, M&A diligence" },
    { label: "AI", items: "multi-agent systems, voice and duplex models, computer vision, RL, evals" },
    { label: "Trust", items: "identity, delegation, runtime policy" },
    { label: "Stack", items: "Go, Python, TypeScript, Rust, GCP/AWS, Kubernetes, Terraform" },
  ],
  languages: "English (native) · Japanese (limited working) · Kannada (elementary)",
};

export function cvMarkdown(): string {
  const lines: string[] = [];
  lines.push(`# ${cv.name}`, "", cv.headline, "", `${cv.location} · ${cv.contact.map((c) => c.text).join(" · ")}`, "");
  lines.push("## Summary", "", cv.summary, "");
  lines.push("## Selected impact", "", ...cv.impact.map((i) => `- ${i}`), "");
  lines.push("## Experience", "");
  for (const r of cv.experience) {
    const meta = [r.dates, r.location, r.tag].filter(Boolean).join(" · ");
    lines.push(`### ${r.org}: ${r.title}`, `_${meta}_`, "", ...r.bullets.map((b) => `- ${b}`), "");
  }
  lines.push("## Standards & leadership", "", ...cv.standards.map((s) => `- ${s}`), "");
  lines.push("## Research & speaking", "", ...cv.research.map((r) => `- [${r.text}](${r.url})`), "");
  lines.push("## Education & certifications", "", ...cv.education.map((s) => `- ${s}`), "");
  lines.push("## Skills", "", ...cv.skills.map((s) => `- **${s.label}:** ${s.items}`), "");
  lines.push("## Languages", "", cv.languages, "");
  return lines.join("\n");
}
