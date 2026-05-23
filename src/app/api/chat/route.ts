import { NextRequest, NextResponse } from "next/server";
import { ProjectLinks } from "@/lib/data/projectLinks";
import { OpenSourceLinks } from "@/lib/data/openSourceLinks";
import OpenAI from "openai";

// Knowledge base about Andor
const KNOWLEDGE_BASE = {
  identity: {
    name: "Andor Kesselman",
    company: "Andor Labs / Henosisknot LLC",
    role: "Trusted Agentic Web Consultant",
    contact: {
      email: "contact@andor.us",
      calendly: "https://calendly.com/andor-us/initial-introduction-meeting",
      github: "https://github.com/andorsk",
      linkedin: "https://linkedin.com/in/andorsk"
    }
  },
  expertise: [
    "Agentic Identity & Delegation",
    "Agentic Governance & Policy Management",
    "Agent Infrastructure & Protocols (DIDComm, Verifiable Credentials, Trust Over IP)",
    "Decentralized Web Nodes",
    "Technical Due Diligence for M&A",
    "Engineering Leadership & Startup Experience"
  ],
  experience: {
    years: "10+",
    highlights: [
      "Built HiJenny - AI home renovation assistant, raised $6M, grew to 20-person team with hundreds of projects",
      "Chair of the Trusted AI Agents Working Group at DIF",
      "Co-Chair of Decentralized Web Node Working Group at DIF",
      "Technical Steering Committee Chair at DIF",
      "Co-Lead of Trust Registry Task Force at Trust Over IP",
      "Founder of DIF Labs",
      "Bay Area Chapter Lead of Project NANDA",
      "Founding Engineer at Pathr.ai",
      "CTO/Co-Founder of Benri",
      "Former CTO at Zion"
    ]
  },
  currentWork: {
    mainFocus: "Building trusted AI agent systems with proper identity, governance, and infrastructure",
    company: "AgentOverlay - Building the infrastructure for the agentic web",
    consulting: "Helping startups, enterprises, and investors create, evaluate, and govern AI Agents"
  },
  projects: ProjectLinks,
  openSource: OpenSourceLinks
};

// Guardrails: Keywords that indicate the question is in scope
const IN_SCOPE_KEYWORDS = [
  // Identity
  "who", "name", "andor", "background", "experience", "bio",
  // Work/Projects
  "work", "project", "built", "building", "done", "working",
  "open source", "opensource", "github", "repository",
  // Expertise
  "ai agent", "agentic", "decentralized identity", "did", "verifiable credential",
  "trust", "governance", "delegation", "web5", "dwn", "toip",
  "identity", "protocol", "infrastructure",
  // Contact
  "contact", "email", "reach", "calendly", "call", "meeting", "hire", "consult",
  // Companies/Organizations
  "dif", "pathr", "benri", "zion", "agentoverlay", "trust over ip",
  // Roles
  "chair", "lead", "founder", "cto", "engineer"
];

function isQuestionInScope(question: string): boolean {
  const lowerQuestion = question.toLowerCase();
  return IN_SCOPE_KEYWORDS.some(keyword => lowerQuestion.includes(keyword));
}

interface Source {
  label: string;
  url: string;
}

interface ResponseWithSources {
  response: string;
  sources: Source[];
}

function generateResponse(question: string): ResponseWithSources {
  const lowerQuestion = question.toLowerCase();

  // Who are you / Background
  if (lowerQuestion.includes("who are you") || lowerQuestion.includes("who is andor")) {
    return {
      response: `I'm Andor Kesselman, a Trusted Agentic Web consultant with over 10 years of engineering startup experience. I help startups, enterprises, and investors create, evaluate, and govern AI Agents that can be trusted.

Recently, I built HiJenny - an AI home renovation assistant with a multi-agent system that raised $6M, grew to 20 people, and secured partnerships like Lowes.

I'm currently:
- Chair of the Trusted AI Agents Working Group at the Decentralized Identity Foundation (DIF)
- Technical Steering Committee Chair at DIF
- Co-Chair of the Decentralized Web Node Working Group at DIF
- Co-Lead of the Trust Registry Task Force at Trust Over IP
- Bay Area Chapter Lead of Project NANDA
- Building AgentOverlay, the infrastructure for the agentic web

My focus is on the critical infrastructure needed for trustworthy AI agents: identity, governance, delegation, and secure communication protocols.`,
      sources: [
        { label: "HiJenny", url: "https://hijenny.ai/home" },
        { label: "DIF Trusted AI Agents WG", url: "https://identity.foundation/working-groups/trusted-agents.html" },
        { label: "AgentOverlay", url: "https://agentoverlay.com" },
        { label: "LinkedIn Profile", url: "https://linkedin.com/in/andorsk" },
        { label: "GitHub", url: "https://github.com/andorsk" }
      ]
    };
  }

  // What have you done / Projects / Experience
  if (lowerQuestion.includes("what have you done") ||
      lowerQuestion.includes("projects") ||
      lowerQuestion.includes("built") ||
      lowerQuestion.includes("experience")) {

    const projectHighlights = [
      "HiJenny - AI home renovation assistant with multi-agent system. Raised $6M from HF0, grew to 20-person team, secured Lowes partnership. Created dual reasoning layer, part of XAI's Startup Program",
      "AgentOverlay - Building infrastructure for the agentic web",
      "Project NANDA (Bay Area Chapter Lead) - Building the Internet of Agents",
      "DIF Trusted AI Agents Working Group (Chair) - Defining governance standards for AI Agents",
      "DIF Labs (Co-Founder) - Incubation community for new ideas in decentralized identity",
      "Pathr.ai (Founding Engineer) - Spatial intelligence and retail analytics",
      "Benri (CTO/Co-Founder) - SSI Console and Web5 tools",
      "Zion (Former CTO) - Peer-governed social network"
    ];

    return {
      response: `Here are some key projects and experiences:

**Leadership Roles:**
${KNOWLEDGE_BASE.experience.highlights.map(h => `- ${h}`).join('\n')}

**Notable Projects:**
${projectHighlights.map(p => `- ${p}`).join('\n')}

I've also contributed to many open-source specifications and tools in the decentralized identity space, including work on DIDComm, Verifiable Credentials, Trust Over IP protocols, and more.`,
      sources: [
        { label: "HiJenny", url: "https://hijenny.ai/home" },
        { label: "Full Project Portfolio", url: "https://andor.us/projects" },
        { label: "Open Source Work", url: "https://andor.us/opensource" },
        { label: "AgentOverlay", url: "https://agentoverlay.com" },
        { label: "Project NANDA", url: "https://projectnanda.org/" },
        { label: "DIF Labs", url: "https://labs.identity.foundation/" }
      ]
    };
  }

  // How to contact
  if (lowerQuestion.includes("contact") ||
      lowerQuestion.includes("reach") ||
      lowerQuestion.includes("email") ||
      lowerQuestion.includes("call") ||
      lowerQuestion.includes("meeting") ||
      lowerQuestion.includes("hire") ||
      lowerQuestion.includes("consult")) {

    return {
      response: `You can reach me through:

📧 Email: contact@andor.us
📅 Book a consultation: https://calendly.com/andor-us/initial-introduction-meeting
💼 LinkedIn: https://linkedin.com/in/andorsk
💻 GitHub: https://github.com/andorsk

I'm always happy to discuss projects related to trusted AI agents, decentralized identity, and agentic infrastructure!`,
      sources: [
        { label: "Book a Call", url: "https://calendly.com/andor-us/initial-introduction-meeting" },
        { label: "Email Me", url: "mailto:contact@andor.us" },
        { label: "LinkedIn", url: "https://linkedin.com/in/andorsk" },
        { label: "GitHub", url: "https://github.com/andorsk" }
      ]
    };
  }

  // Expertise / What do you do
  if (lowerQuestion.includes("expertise") ||
      lowerQuestion.includes("specialize") ||
      lowerQuestion.includes("what do you do") ||
      lowerQuestion.includes("skills")) {

    return {
      response: `My expertise focuses on the Trusted Agentic Web:

**Core Areas:**
${KNOWLEDGE_BASE.expertise.map(e => `- ${e}`).join('\n')}

**Services:**
- Technical evaluation and due diligence for M&A targets
- Engineering & product stabilization for early-stage startups
- Building trusted AI agent systems with proper governance
- Standards development and protocol design
- Engineering leadership and team building

I help organizations navigate the complex challenges of building AI agents that can be trusted, focusing on identity, delegation, policy management, and secure communication.`,
      sources: [
        { label: "Services Page", url: "https://andor.us/services" },
        { label: "DIF Trusted AI Agents", url: "https://identity.foundation/working-groups/trusted-agents.html" },
        { label: "Book Consultation", url: "https://calendly.com/andor-us/initial-introduction-meeting" }
      ]
    };
  }

  // Agent/AI related
  if (lowerQuestion.includes("ai agent") ||
      lowerQuestion.includes("agentic") ||
      lowerQuestion.includes("trusted agent")) {

    return {
      response: `I specialize in Trusted AI Agents - building systems where AI agents can be verified, governed, and trusted.

**Key challenges I help solve:**
- **Identity**: How do we know who/what an agent represents?
- **Delegation**: How do we grant and revoke authority to agents?
- **Governance**: What guardrails and policies should agents follow?
- **Infrastructure**: What protocols enable secure agent-to-agent communication?

**My work includes:**
- Chairing the DIF Trusted AI Agents Working Group to define governance standards
- Building AgentOverlay, infrastructure for the agentic web
- Leading Project NANDA's Bay Area chapter to create the Internet of Agents
- Developing protocols for service discovery, trust registries, and agent communication

The goal is to make AI agents that organizations can actually trust to act autonomously.`,
      sources: [
        { label: "DIF Trusted AI Agents WG", url: "https://identity.foundation/working-groups/trusted-agents.html" },
        { label: "AgentOverlay", url: "https://agentoverlay.com" },
        { label: "Project NANDA", url: "https://projectnanda.org/" },
        { label: "Agentic Internet Workshop", url: "https://agenticinternetworkshop.org/" }
      ]
    };
  }

  // Decentralized Identity / DID / Verifiable Credentials
  if (lowerQuestion.includes("decentralized identity") ||
      lowerQuestion.includes("did") ||
      lowerQuestion.includes("verifiable credential") ||
      lowerQuestion.includes("web5") ||
      lowerQuestion.includes("dwn")) {

    return {
      response: `I'm deeply involved in the decentralized identity space:

**Leadership Roles:**
- Technical Steering Committee Chair at DIF (Decentralized Identity Foundation)
- Co-Chair of Decentralized Web Node Working Group at DIF
- Co-Lead of Trust Registry Task Force at Trust Over IP
- Editor of Technology Architecture Task Force at Trust Over IP

**Key Work:**
- Decentralized Web Nodes (DWNs) - Mesh-like datastores for decentralized data
- Trust Registries - Enabling interoperability between trust systems
- Service Discovery - Finding services in decentralized contexts
- Protocol development for DIDComm, Verifiable Credentials, and ToIP stack

This work forms the foundation for trusted AI agents - giving them verifiable identities, secure data storage, and the ability to prove their authority and credentials.`,
      sources: [
        { label: "DWN Specification", url: "https://identity.foundation/decentralized-web-node/spec/" },
        { label: "Trust Registry Task Force", url: "https://wiki.trustoverip.org/display/HOME/Trust+Registry+Task+Force" },
        { label: "DIF Working Groups", url: "https://identity.foundation/" },
        { label: "Service Discovery Task Force", url: "https://wiki.trustoverip.org/pages/viewpage.action?pageId=74875289" }
      ]
    };
  }

  // Default in-scope but not matched
  return {
    response: `I can help answer questions about:
- My background and experience
- My work in AI agents and decentralized identity
- Projects I've built or contributed to
- How to get in touch

What would you like to know?`,
    sources: [
      { label: "Projects", url: "https://andor.us/projects" },
      { label: "Open Source", url: "https://andor.us/opensource" },
      { label: "Contact", url: "mailto:contact@andor.us" }
    ]
  };
}

// Initialize OpenAI client lazily to avoid build-time errors when env vars are missing
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
}

// Create system prompt from knowledge base
const SYSTEM_PROMPT = `You are a helpful assistant answering questions about Andor Kesselman's professional work and background.

You should answer questions about:
- Andor's identity, background, and professional experience
- His work in AI agents, decentralized identity, and related technologies
- His projects (especially HiJenny, AgentOverlay, Project NANDA)
- His leadership roles at DIF, Trust Over IP, etc.
- How to contact or hire him
- His expertise in Agentic Web, DIDComm, Verifiable Credentials, Trust Registries, etc.

IMPORTANT: If someone asks about a general topic (like "security", "AI", "graph theory", "identity", etc.), you should answer it IN THE CONTEXT of Andor's work and expertise. For example:
- "What do you know about security?" → Talk about security in the context of decentralized identity, trusted AI agents, verifiable credentials, etc.
- "What do you know about AI?" → Discuss Andor's work with AI agents, multi-agent systems like HiJenny, etc.
- "What do you know about graph theory?" → If Andor has work related to this (check the knowledge base), mention it; otherwise politely say it's not directly related to his current focus areas.

Only respond with the off-topic message if the question is completely unrelated to technology, identity, AI, web, infrastructure, or any technical domain that might overlap with Andor's expertise.

For truly off-topic questions (like cooking, sports, entertainment), respond with: "I'm here to answer questions about Andor's work in trusted AI agents, decentralized identity, and his professional experience. I don't have information about other topics. Feel free to ask about his projects, expertise, or how to get in touch!"

Here's the knowledge base:

**Identity:**
${JSON.stringify(KNOWLEDGE_BASE.identity, null, 2)}

**Expertise:**
${KNOWLEDGE_BASE.expertise.join('\n')}

**Experience:**
Years: ${KNOWLEDGE_BASE.experience.years}
Highlights:
${KNOWLEDGE_BASE.experience.highlights.join('\n')}

**Current Work:**
${JSON.stringify(KNOWLEDGE_BASE.currentWork, null, 2)}

**Projects:**
${ProjectLinks.map(p => `- ${p.label} (${p.url}): ${p.description}`).join('\n')}

**Open Source:**
${OpenSourceLinks.map(l => `- ${l.label} (${l.url}): ${l.description}`).join('\n')}

When answering, be conversational and helpful. Include relevant URLs from the knowledge base in your response when appropriate.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid message" },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not configured");
      // Fallback to old system
      if (!isQuestionInScope(message)) {
        return NextResponse.json({
          response: "I'm here to answer questions about my work in trusted AI agents, decentralized identity, and my professional experience. I don't have information about other topics. Feel free to ask about my projects, expertise, or how to get in touch!",
          sources: [
            { label: "About Me", url: "https://andor.us/blog/about" },
            { label: "Contact", url: "mailto:contact@andor.us" }
          ]
        });
      }
      const { response, sources } = generateResponse(message);
      return NextResponse.json({ response, sources });
    }

    // Build conversation history for OpenAI
    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...history.map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      })),
      { role: "user" as const, content: message }
    ];

    // Call OpenAI
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    const responseText = completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.";

    // Extract URLs from the response as sources
    const urlRegex = /(https?:\/\/[^\s\)]+)/g;
    const urls = responseText.match(urlRegex) || [];
    const sources = urls.map(url => ({
      label: url.includes('hijenny') ? 'HiJenny' :
             url.includes('agentoverlay') ? 'AgentOverlay' :
             url.includes('linkedin') ? 'LinkedIn' :
             url.includes('github') ? 'GitHub' :
             url.includes('calendly') ? 'Book a Call' :
             url.includes('mailto') ? 'Email' :
             url.includes('identity.foundation') ? 'DIF' :
             url.includes('trustoverip') ? 'Trust Over IP' :
             url.includes('projectnanda') ? 'Project NANDA' :
             'Link',
      url: url.replace(/[.,;!?)]$/, '') // Remove trailing punctuation
    }));

    // Remove duplicates
    const uniqueSources = Array.from(new Map(sources.map(s => [s.url, s])).values());

    return NextResponse.json({
      response: responseText,
      sources: uniqueSources
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
