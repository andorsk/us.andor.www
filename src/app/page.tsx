"use client";

import DefaultLayout from "@/layouts/DefaultLayout";
import React, { useEffect, useRef, useState } from "react";

// Enhanced Animated network nodes component with more connections
const NetworkAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Node system for animated network
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      trusted: boolean;
      pulse: number;
    }> = [];

    // Floating particles for background effect
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      opacity: number;
      size: number;
    }> = [];

    // Create nodes
    for (let i = 0; i < 20; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        trusted: i === 9 || i === 15, // Two highlighted "trusted" nodes
        pulse: Math.random() * Math.PI * 2
      });
    }

    // Create floating particles
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.3 + 0.1,
        size: Math.random() * 2 + 1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw floating particles
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges for particles
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.fillStyle = `rgba(34, 197, 94, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Update and draw nodes
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.04;

        // Bounce off edges with padding
        const padding = 30;
        if (node.x <= padding || node.x >= canvas.width - padding) node.vx *= -1;
        if (node.y <= padding || node.y >= canvas.height - padding) node.vy *= -1;

        // Draw connections with increased connectivity
        nodes.forEach(other => {
          const dist = Math.sqrt((node.x - other.x) ** 2 + (node.y - other.y) ** 2);
          if (dist < 200) { // Increased connection distance
            const opacity = (1 - dist / 200) * 0.5; // Increased opacity
            ctx.strokeStyle = node.trusted || other.trusted ? 
              `rgba(34, 197, 94, ${opacity})` : 
              `rgba(156, 163, 175, ${opacity * 0.7})`;
            ctx.lineWidth = node.trusted || other.trusted ? 2.5 : 1.5; // Thicker lines
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });

        // Draw node with pulsing effect
        const pulseSize = node.trusted ? 1 + Math.sin(node.pulse) * 0.4 : 1;
        const nodeSize = (node.trusted ? 10 : 6) * pulseSize; // Larger nodes
        
        // Node glow effect for trusted nodes
        if (node.trusted) {
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 20;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fillStyle = node.trusted ? '#22c55e' : '#9ca3af';
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Reset shadow
        ctx.shadowBlur = 0;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-50"
    />
  );
};

// Hero Banner Component with Enhanced Word-by-Word Text Animations
const HeroBanner = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-navy-900 overflow-hidden">
      <NetworkAnimation />
      
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            <span className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>Andor </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>Labs </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>: </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>Trusted </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>Agentic </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '700ms' }}>Web </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '800ms' }}>Consulting</span>
          </h1>
        </div>
        
        <div className="mb-8">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            <span className="animate-fade-in-up" style={{ animationDelay: '900ms' }}>Building </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '1000ms' }}>AI </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '1100ms' }}>Agents </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '1200ms' }}>is </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '1300ms' }}>easy.</span>
            <br />
            <br />
            <span className="text-green-400 animate-fade-in-up" style={{ animationDelay: '1400ms' }}>Building </span>
            <span className="text-green-400 animate-fade-in-up" style={{ animationDelay: '1500ms' }}>Trusted </span>
            <span className="text-green-400 animate-fade-in-up" style={{ animationDelay: '1600ms' }}>AI </span>
            <span className="text-green-400 animate-fade-in-up" style={{ animationDelay: '1700ms' }}>Agents </span>
            <span className="text-green-400 animate-fade-in-up" style={{ animationDelay: '1800ms' }}>, not </span>
            <span className="text-green-400 animate-fade-in-up" style={{ animationDelay: '1900ms' }}>so </span>
            <span className="text-green-400 animate-fade-in-up" style={{ animationDelay: '2000ms' }}>much.</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
            <span className="animate-fade-in-up" style={{ animationDelay: '2100ms' }}>I </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '2150ms' }}>help </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '2200ms' }}>startups, </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '2250ms' }}>enterprises, </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '2300ms' }}>and </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '2350ms' }}>investors </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '2400ms' }}>create, </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '2450ms' }}>evaluate, </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '2500ms' }}>and </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '2550ms' }}>govern </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '2600ms' }}>AI </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '2650ms' }}>Agents </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '2700ms' }}>that </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '2750ms' }}>can </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '2800ms' }}>be </span>
            <span className="animate-fade-in-up" style={{ animationDelay: '2850ms' }}>trusted.</span>
          </p>
        </div>
        
        <a 
          href="https://calendly.com/andor-us/initial-introduction-meeting"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-500 hover:bg-green-600 text-white text-xl font-semibold py-4 px-8 rounded-lg transition-colors duration-300 transform hover:scale-105 animate-fade-in-up"
          style={{ animationDelay: '2900ms' }}
        >
          👉 Book a Consultation
        </a>
      </div>
    </div>
  );
};

// Problem Statement Section - Challenges of the Agentic Web
const ProblemStatement = () => {
  const challenges = [
    {
      icon: "🤖",
      title: "Autonomous Decision Making",
      description: "Act with autonomy and make decisions",
      delay: "400"
    },
    {
      icon: "🕸️",
      title: "Multi-Agent Orchestration",
      description: "Multiply complexity in multi-agent orchestration",
      delay: "500"
    },
    {
      icon: "🏗️",
      title: "New Infrastructure Layers",
      description: "Require new layers: identity, governance, registries, storage, and secure communication",
      delay: "600"
    }
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-white to-orange-100 animate-gradient-x">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center animate-fade-in-up" style={{ animationDelay: '100ms' }}>Challenges Of the Agentic Web</h2>
        
        <div className="text-center mb-12">
          <p className="text-xl text-gray-700 mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            AI Agents represent a <strong>new challenge for organizations</strong>. Unlike traditional apps, they:
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {challenges.map((challenge, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl p-6 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-xl animate-fade-in-up border border-slate-200`}
              style={{ animationDelay: `${challenge.delay}ms` }}
            >
              <div className="text-4xl mb-4">{challenge.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{challenge.title}</h3>
              <p className="text-gray-600">{challenge.description}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-r-lg transform transition-all duration-700 hover:shadow-xl animate-fade-in-up backdrop-blur-sm" style={{ animationDelay: '700ms' }}>
          <p className="text-xl font-semibold text-red-700 italic text-center">
            ⚠️ Without trust, AI Agents risk becoming opaque, unreliable, and even dangerous.
          </p>
        </div>
      </div>
    </div>
  );
};

// Project Links Section
const ProjectLinksSection = () => {
  // Featured project examples
  const featuredProjects = [
    {
      url: "https://agentoverlay.com",
      label: "Agent Overlay",
      organization: "Agent Overlay, Inc",
      description: "Building the infrastructure for the agentic web - enabling AI agents to discover, connect, and collaborate across decentralized networks.",
    },
    {
      url: "https://identity.foundation/working-groups/trusted-agents.html",
      label: "Trusted AI Agents WG",
      organization: "DIF",
      role: "Chair",
      description: "Chair of the Trusted AI Agents Working Group at DIF, defining governance standards for AI Agents.",
    },
    {
      url: "https://agenticinternetworkshop.org/#",
      label: "Agentic Internet Workshop",
      organization: "Internet Identity Workshop",
      description: "Workshop focused on building the foundational infrastructure for agentic internet systems.",
    },
    {
      url: "https://projectnanda.org/",
      label: "Project NANDA : Bay Area Chapter",
      organization: "Bay Area Chapter",
      role: "Chapter Lead",
      description: "Leading the Bay Area Chapter of Project NANDA, building the Internet of Agents.",
    },
    {
      url: "https://labs.identity.foundation/",
      label: "DIF Labs",
      organization: "Decentralized Identity Foundation",
      role: "Co-Lead and Founder",
      description: "An incubation community within DIF that encourages development and collaboration on new ideas and projects.",
    },
  ];

  // Featured open source examples
  const featuredOpenSource = [
    {
      url: "https://identity.foundation/working-groups/trusted-agents.html",
      label: "Trusted AI Agents WG",
      organization: "DIF",
      role: "Chair",
      description: "Chair of the Trusted AI Agents Working Group at DIF, defining governance standards for AI Agents.",
    },
    {
      url: "https://identity.foundation/decentralized-web-node/spec/",
      label: "Decentralized Web Node Working Group",
      organization: "DIF",
      role: "Co-Chair",
      description: "A Decentralized Web Node (DWN) is a data storage and message relay mechanism entities can use to locate public or private permissioned data related to a given Decentralized Identifier (DID).",
    },
    {
      url: "https://wiki.trustoverip.org/display/HOME/Trust+Registry+Task+Force",
      label: "Trust Registry Task Force",
      organization: "Trust Over IP",
      role: "Co-Lead",
      description: "The primary objective of this Task Force is to develop the ToIP Trust Registry Protocol as a ToIP Specification.",
    },
  ];

  return (
    <div className="relative py-20 bg-gradient-to-br from-white via-blue-50 to-blue-100 animate-gradient-x overflow-hidden">
      <NetworkAnimation />
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center animate-fade-in-up" style={{ animationDelay: '100ms' }}>My Work</h2>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-200/50 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">🚀 Projects</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Explore my technical projects, consulting work, and engineering solutions in the Trusted Agentic Web space.
            </p>
            <a 
              href="/projects" 
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 transform hover:scale-105"
            >
              View All Projects
            </a>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-200/50 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">🌐 Open Source Leadership</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              See my contributions to open source projects, community leadership roles, and standards development work.
            </p>
            <a 
              href="/opensource" 
              className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 transform hover:scale-105"
            >
              View All Open Source
            </a>
          </div>
        </div>

        {/* Featured Examples */}
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Featured Projects</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...featuredProjects, ...featuredOpenSource].map((project, index) => (
              <a
                key={index}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white/60 backdrop-blur-sm rounded-lg p-4 hover:bg-white/80 hover:shadow-lg transition-all duration-300 border border-slate-200/50 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {project.label}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">{project.organization || project.affiliation}</span>
                      {project.role && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-500">{project.role}</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{project.description}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Focus Areas Section with Text Animations
const FocusAreas = () => {
  const areas = [
    {
      title: "Agentic Identity",
      icon: "🔐",
      items: [
        { title: "Delegation", description: "Securely granting and revoking authority between agents." },
        { title: "Proof of Personhood", description: "Ensuring agents are tied to real, verifiable individuals." },
        { title: "Reputation", description: "Building trust through verifiable track records." }
      ]
    },
    {
      title: "Agentic Governance", 
      icon: "⚖️",
      items: [
        { title: "Agentic Access Management Policies", description: "OPA, Cedar, and other policy frameworks." },
        { title: "Policy Management", description: "Runtime guardrails to prevent rogue behavior." },
        { title: "Agentic Commerce", description: "Enabling safe economic transactions between agents." }
      ]
    },
    {
      title: "Agentic Infrastructure",
      icon: "🏗️", 
      items: [
        { title: "Registries", description: "Publishing and resolving agent facts." },
        { title: "Communication", description: "Secure, interoperable protocols for agent-to-agent interaction." },
        { title: "Storage", description: "Verifiable, privacy-respecting data management for agents." }
      ]
    },
    {
      title: "Agentic Protocol Development",
      icon: "📜", 
      items: [
        { title: "DIDComm", description: "Secure messaging protocol for decentralized identity." },
        { title: "Verifiable Credentials", description: "Standards for digital credential exchange." },
        { title: "Trust Over IP (ToIP)", description: "Protocol stack for internet-scale digital trust." },
        { title: "OpenID Connect for VCs", description: "Integration of verifiable credentials with OIDC." }
      ]
    }
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center animate-fade-in-up" style={{ animationDelay: '100ms' }}>Where I Focus</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {areas.map((area, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-200/50 animate-fade-in-up" style={{ animationDelay: `${200 + index * 100}ms` }}>
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">{area.icon}</div>
                <h3 className="text-xl font-bold text-gray-900">{area.title}</h3>
              </div>
              
              <div className="space-y-3">
                {area.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <h4 className="font-semibold text-gray-800 mb-1 text-sm">{item.title}</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-lg text-gray-700 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            👉 <em>Want to learn more? Watch my talk here:</em>{" "}
            <a href="https://www.youtube.com/live/SJ8rFKJ8NHw?t=2235s" className="text-blue-600 hover:underline font-semibold">
              Watch on YouTube
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

// Call to Action Section with Text Animations
const CallToAction = () => {
  return (
    <div className="py-20 bg-gradient-to-br from-slate-900 via-indigo-900 to-black">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-white mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>Ready to Build Trusted AI Agents?</h2>
        
        <a 
          href="https://calendly.com/andor-us/initial-introduction-meeting"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-500 hover:bg-green-600 text-white text-2xl font-semibold py-6 px-12 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          👉 Book a Consultation
        </a>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <DefaultLayout>
      <div className="flex flex-col">
        <HeroBanner />
        <ProblemStatement />
        <ProjectLinksSection />
        <FocusAreas />
        <CallToAction />
      </div>
    </DefaultLayout>
  );
}
