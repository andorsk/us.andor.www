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

// Hero Banner Component
const HeroBanner = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-navy-900 overflow-hidden">
      <NetworkAnimation />
      
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Andor Labs : Trusted Agentic Web Consulting
          </h1>
        </div>
        
        <div className="mb-8">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Building AI Agents is hard.<br />
            <span className="text-green-400">Building Trusted AI Agents is even harder.</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
            I help startups, enterprises, and investors create, evaluate, and govern AI Agents that can be trusted.
          </p>
        </div>
        
        <a 
          href="https://calendly.com/andor-us/initial-introduction-meeting"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-500 hover:bg-green-600 text-white text-xl font-semibold py-4 px-8 rounded-lg transition-colors duration-300 transform hover:scale-105"
        >
          👉 Book a Consultation
        </a>
      </div>
    </div>
  );
};

// Problem Statement Section with Cards and Gradient Background
const ProblemStatement = () => {
  const challenges = [
    {
      icon: "🤖",
      title: "Autonomous Decision Making",
      description: "Act with autonomy and make decisions",
      delay: "0"
    },
    {
      icon: "🕸️",
      title: "Multi-Agent Orchestration",
      description: "Multiply complexity in multi-agent orchestration",
      delay: "100"
    },
    {
      icon: "🏗️",
      title: "New Infrastructure Layers",
      description: "Require new layers: identity, governance, registries, storage, and secure communication",
      delay: "200"
    }
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Why I Exist</h2>
        
        <div className="text-center mb-12">
          <p className="text-xl text-gray-700 mb-6">
            AI Agents represent a <strong>new challenge for organizations</strong>. Unlike traditional apps, they:
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {challenges.map((challenge, index) => (
            <div
              key={index}
              className={`bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:bg-white animate-fade-in-up border border-slate-200`}
              style={{ animationDelay: `${challenge.delay}ms` }}
            >
              <div className="text-4xl mb-4">{challenge.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{challenge.title}</h3>
              <p className="text-gray-600">{challenge.description}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-r-lg transform transition-all duration-700 hover:shadow-xl animate-fade-in-up backdrop-blur-sm" style={{ animationDelay: '400ms' }}>
          <p className="text-xl font-semibold text-red-700 italic text-center">
            ⚠️ Without trust, AI Agents risk becoming opaque, unreliable, and even dangerous.
          </p>
        </div>
      </div>
    </div>
  );
};

// Why Work With Me Section with Animated Square Cards
const WhyWorkWithMe = () => {
  const credentials = [
    {
      icon: "⚖️",
      title: "Chair, Trusted AI Agents WG",
      org: "DIF",
      description: "Defining governance standards for AI Agents",
      color: "green",
      delay: "0"
    },
    {
      icon: "📋",
      title: "Chair, Trust Registry Task Force",
      org: "ToIP",
      description: "Advancing registry standards for ecosystems",
      color: "green",
      delay: "100"
    },
    {
      icon: "🔬",
      title: "Chair, DIF Labs",
      org: "DIF",
      description: "Leading open-source experimentation in decentralized identity and trust",
      color: "green",
      delay: "200"
    },
    {
      icon: "🎯",
      title: "Co-Chair, Technical Steering Committee",
      org: "DIF",
      description: "Shaping decentralized identity protocols",
      color: "green",
      delay: "300"
    },
    {
      icon: "🤖",
      title: "Project NANDA",
      org: "Bay Area Chapter",
      description: "Leading the Bay Area Chapter",
      color: "blue",
      delay: "400"
    },
    {
      icon: "🚀",
      title: "CTO & Founding Engineer",
      org: "Experience",
      description: "10+ years leading startups",
      color: "blue",
      delay: "500"
    },
    {
      icon: "💡",
      title: "Deep Technical Expertise",
      org: "Core Skills",
      description: "Decentralized Identity, Trust Registries, Multi-Agent Orchestration",
      color: "blue",
      delay: "600"
    },
    {
      icon: "👥",
      title: "Community Leader",
      org: "Events & Initiatives",
      description: "Leading community events and initiatives",
      color: "blue",
      delay: "700"
    }
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Why Work With Me</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {credentials.map((cred, index) => (
            <div
              key={index}
              className={`bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md hover:shadow-2xl transform transition-all duration-500 hover:-translate-y-3 hover:scale-105 cursor-pointer animate-fade-in-up group border border-slate-200/50`}
              style={{ animationDelay: `${cred.delay}ms` }}
            >
              <div className="text-center">
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{cred.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{cred.title}</h3>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                  cred.color === 'green' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {cred.org}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{cred.description}</p>
              </div>
              
              {/* Enhanced animated border effect */}
              <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
                cred.color === 'green'
                  ? 'bg-gradient-to-r from-green-400 via-green-500 to-green-600'
                  : 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600'
              } -z-10 blur-sm`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Focus Areas Section
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
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Where I Focus</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {areas.map((area, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-200/50">
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
          <p className="text-lg text-gray-700">
            👉 <em>See my talk on these focus areas here:</em>{" "}
            <a href="#" className="text-blue-600 hover:underline font-semibold">
              Watch on YouTube
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

// Skills & Expertise Section
const SkillsExpertise = () => {
  const skillCategories = [
    {
      icon: "💻",
      title: "Engineering Excellence",
      description: "Full-stack development, system architecture, and technical leadership",
      skills: ["Distributed Systems", "Protocol Design", "Security Architecture", "API Design"]
    },
    {
      icon: "👥",
      title: "Community Building",
      description: "Creating and nurturing technical communities at scale",
      skills: ["Technical Evangelism", "Open Source Strategy", "Developer Relations", "Community Management"]
    },
    {
      icon: "🎆",
      title: "Event Leadership",
      description: "Organizing and speaking at industry conferences and meetups",
      skills: ["Conference Speaking", "Workshop Facilitation", "Event Strategy", "Thought Leadership"]
    },
    {
      icon: "🚀",
      title: "Engineering Leadership",
      description: "Building and scaling high-performance engineering teams",
      skills: ["Team Building", "Technical Strategy", "Product Development", "Agile Practices"]
    }
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Skills & Expertise</h2>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            As an experienced founder, I've built a diverse skillset that allows me to 
            <strong> go both broad and deep</strong> where required. From hands-on engineering 
            to strategic leadership, I adapt to what each situation demands.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {skillCategories.map((category, index) => (
            <div 
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-200/50 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{category.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{category.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill, skillIndex) => (
                      <span 
                        key={skillIndex}
                        className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm font-medium rounded-full hover:from-blue-200 hover:to-indigo-200 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200/50">
            <p className="text-lg text-gray-700 font-medium">
              🎯 <strong>Founder's Advantage:</strong> Having built companies from the ground up, 
              I understand both the technical depth and business breadth required to succeed in today's market.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Call to Action Section
const CallToAction = () => {
  return (
    <div className="py-20 bg-gradient-to-br from-slate-900 via-indigo-900 to-black">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-white mb-8">Ready to Build Trusted AI Agents?</h2>
        
        <a 
          href="https://calendly.com/andor-us/initial-introduction-meeting"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-500 hover:bg-green-600 text-white text-2xl font-semibold py-6 px-12 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
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
        <WhyWorkWithMe />
        <FocusAreas />
        <SkillsExpertise />
        <CallToAction />
      </div>
    </DefaultLayout>
  );
}
