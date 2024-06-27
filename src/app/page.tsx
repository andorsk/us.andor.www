"use client";

import DefaultLayout from "@/layouts/DefaultLayout";
import ThreeSceneWrapper from "@/components/sim/sim-wrapper";
import styles from "@/styles/HomePage.module.css";
import "@/styles/hyperspeed.css";

import TetrisGame from "@/components/tetris/TetrisGame";

import React, { useEffect, useRef, useState } from "react";

import { serviceDescriptions } from "@/lib/data/serviceDescriptions";
import { ServiceDescription } from "@/lib/types";

type HomeLink = {
  label: string;
  url: string;
  description: string;
};

const ServicesView = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="w-full flex flex-col items-center justify-center bg-yellow-500 relative p-6 space-y-4">
        <div className="rounded-lg w-full p-6 flex-col flex h-screen items-center justify-center">
          <h2 className="text-2xl font-bold mb-4 text-center text-black w-full">
            Services
          </h2>
          {serviceDescriptions.map((service) => (
            <div
              className="w-full flex justify-center mb-4 w-full"
              key={service.id}
            >
              <div className="text-black w-full p-4 rounded-lg shadow-md w-full">
                <button className="w-full text-2xl text-left w-full">
                  {service.name}
                </button>
                {service.description}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full flex items-center h-screen bg-gray-900 p-4 justify-center">
        <div className="custom-animation justify-center">
          <div className="w-16 h-16 bg-white rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

function PitchView() {
  type PitchData = {
    headline: string;
    subheadline?: string;
  };

  const [visibleIndex, setVisibleIndex] = useState(-1);
  const pitchData: PitchData[] = [
    {
      headline: "Over 10+ years of Engineering Startup Experience",
      subheadline: "Pushing the limits of what's possible",
    },
    {
      headline: "Founding Engineer of 2 Startups",
      subheadline: "Founding Engineer of Pathr.ai, and CTO/Co-Founder of Benri",
    },
    {
      headline: "Leader of the Decentralized Identity Space",
      subheadline:
        "Co-Chair of the Technical Steering Committee At Decentralized Identity Foundation",
    },
    {
      headline: "Everything on this website was built by me!",
      subheadline: "I don't subcontract my work",
    },
    {
      headline: "20+ Engineering Projects",
      subheadline: "I'm a builder and a doer.",
    },
  ];

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const numStars = 1000;
    for (let i = 0; i < numStars; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      container.appendChild(star);
    }
    pitchData.forEach((_, index) => {
      setTimeout(() => {
        setVisibleIndex(index);
      }, index * 500); // delay each item by 500ms
    });
  }, []);

  return (
    <div className="flex flex-col h-screen  justify-center items-center relative overflow-hidden">
      <div
        ref={containerRef}
        className="w-full h-full z-0 absolute hyperspeed-animation"
      ></div>
      <div class="warpscene">
        <div class="wrap">
          <div class="wall wall-right"></div>
          <div class="wall wall-left"></div>
          <div class="wall wall-top"></div>
          <div class="wall wall-bottom"></div>
          <div class="wall wall-back"></div>
        </div>
        <div class="wrap">
          <div class="wall wall-right"></div>
          <div class="wall wall-left"></div>
          <div class="wall wall-top"></div>
          <div class="wall wall-bottom"></div>
          <div class="wall wall-back"></div>
        </div>
      </div>

      {pitchData.map((item, index) => (
        <div
          key={index}
          className={`text-white text-center p-4 z-10 opacity-0 transition-opacity duration-500 ${
            index <= visibleIndex ? "opacity-100" : ""
          }`}
        >
          <h2 className="text-xl font-bold">{item.headline}</h2>
          {item.subheadline && <p>{item.subheadline}</p>}
        </div>
      ))}
    </div>
  );
}

const TestimonialView = () => {
  type Testimonial = {
    content: string;
    who: string;
  };

  const testimonial: Testimonial[] = [
    {
      content:
        "We hired Andor to fix a number of critical bugs in our platform that had built up after a prior development team had offboarded. In spite of there being minimal existing documentation or technical handover available, Andor quickly dug in to our systems and resolved the issues. He also proactively set up new systems, testing, and documentation to assist handover to an incoming BAU development team. Andor was great to work with and was an excellent communicator. He kept us in the loop with everything he did, proactively flagging roadblocks and any trade-off decisions required. His depth of experience and knowledge of industry best practices has been very helpful to us in determining the next steps for our system architecture. His passion for his work is very strong and this shows through in the level of care he puts into his work and the expectations he sets for those around him.",
      who: "David Kim (CEO Rethinkable)",
    },
    {
      content:
        "As the Head of R&D at RetailNext, I had the pleasure of working with Andor quite a bit as he transitioned to a role split between the Customer Experience Team and the R&D Team. Watching him learn quickly and grow into this role for which he had no formal training was impressive, to say the least. Andor is intelligent, well educated, and carries himself well, but more importantly he possesses the most important trait for a technological innovator: insatiable curiosity. His motivation comes from within and he refuses to let up until he's achieved the (often Herculean) goals he's set out for himself.",
      who: "George Shaw (CEO of Pathr)",
    },
  ];

  return (
    <div className="flex flex-col md:flex-col m-5 p-5 bg-gray-900 items-center">
      <h2>Testimonials </h2>
      {testimonial.map((item, index) => {
        return (
          <div className="flex flex-col mb-5">
            <div className="quote-container text-white">
              <div className="quote-content">{item.content}</div>
              <div className="quote-author">- {item.who}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ProjectsView = () => {
  return <div className="flex flex-col md:flex-row h-screen"></div>;
};

const SkillsView = () => {
  return (
    <div className=" flex-col justify-center items-center h-screen flex w-full relative">
      Skill Tetris
      <TetrisGame />
    </div>
  );
};

const ContactView = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen items-center justify-center w-full">
      <div className="text-center">
        Want to talk more? All you need to do is click this button.
        <br />
        <button className="bg-gray-900 p-5 rounded-lg"> Contact Me </button>
      </div>
    </div>
  );
};

function MainView() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <div className="text-center flex items-center justify-center w-full">
        <ThreeSceneWrapper />
      </div>
      <div className="text-center flex items-center justify-center w-full">
        Andor Labs
      </div>
    </div>
  );
}
export default function Home() {
  const ScrollDownIndicator = () => {
    return (
      <div className="fixed bottom-4 left-4 flex flex-col items-center animate-bounce">
        <div className="relative mb-2">
          <svg
            className="w-10 h-10 text-white"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50 50m-45 0a45 45 0 1 0 90 0 45 45 0 1 0-90 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 2"
            />
          </svg>
          <div className="absolute inset-0 flex justify-center items-center text-white">
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 12a1 1 0 01-.7-.3l-3-3a1 1 0 011.4-1.4l1.3 1.3V4a1 1 0 112 0v4.6l1.3-1.3a1 1 0 011.4 1.4l-3 3a1 1 0 01-.7.3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <span className="text-white">Scroll Down</span>
      </div>
    );
  };

  return (
    <main>
      <DefaultLayout>
        <div className="m-5">
          <div className={styles.glitch}>
            <MainView />
            <ScrollDownIndicator />
          </div>
          <PitchView />
          <ServicesView />
          <ProjectsView />
          <TestimonialView />
          <SkillsView />
          <ContactView />
        </div>
      </DefaultLayout>
    </main>
  );
}
