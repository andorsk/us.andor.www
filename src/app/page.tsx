"use client";

import DefaultLayout from "@/layouts/DefaultLayout";
import ThreeSceneWrapper from "@/components/sim/sim-wrapper";
import styles from "@/styles/HomePage.module.css";
import { ProjectLinks } from "@/lib/data/projectLinks";
import { OpenSourceLinks } from "@/lib/data/openSourceLinks";
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

type Link = {
  url?: string;
  label: string;
  description: string;
  affiliation?: string;
  dates?: string;
  image: string;
};

type CardProps = {
  link: Link;
};

const Avatar: React.FC<CardProps> = ({ link }) => {
  return (
    <div className="w-full flex items-center justify-center rounded-lg shadow-lg p-5 box-border transform transition-transform duration-300 mb-5 md:mb-0 md:ml-5">
      <div className="flex flex-col items-center">
        <img
          className="rounded-full mx-auto mb-4"
          src={link.image}
          alt={link.label}
        />
        <div className="text-xl font-bold text-center">{link.label}</div>
        <div className="mt-2 text-center">{link.description}</div>
      </div>
    </div>
  );
};

const ServicesView = () => {
  return (
    <div className="flex flex-col m-5 p-5 bg-gray-900 items-center">
      <h2 className="text-3xl text-center font-bold text-white mb-8">
        Services
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {serviceDescriptions.map((service) => (
          <div
            key={service.id}
            className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            <img
              src={service.picture}
              alt={service.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-2xl font-semibold text-white mb-2">
                {service.name}
              </h3>
              <p className="text-gray-300">{service.description}</p>
            </div>
          </div>
        ))}
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

    const numStars = 100;
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
    <div className="flex text-yellow bg-black flex-col text-2xl h-screen justify-center items-center relative overflow-hidden">
      <div
        ref={containerRef}
        className="w-full h-full z-0 absolute hyperspeed-animation"
      ></div>
      <div className="warpscene">
        <div className="wrap">
          <div className="wall wall-right"></div>
          <div className="wall wall-left"></div>
          <div className="wall wall-top"></div>
          <div className="wall wall-bottom"></div>
          <div className="wall wall-back"></div>
        </div>
        <div className="wrap">
          <div className="wall wall-right"></div>
          <div className="wall wall-left"></div>
          <div className="wall wall-top"></div>
          <div className="wall wall-bottom"></div>
          <div className="wall wall-back"></div>
        </div>
      </div>
      {pitchData.map((item, index) => (
        <div
          key={index}
          className={`text-center p-4 z-10 outlined-text opacity-0 transition-opacity duration-500 ${
            index <= visibleIndex ? "opacity-100" : ""
          }`}
        >
          <h2 className="text-3xl font-bold">{item.headline}</h2>
          {item.subheadline && <p>{item.subheadline}</p>}
        </div>
      ))}
      <button className="text-3xl border py-2 px-4 rounded-lg hover:bg-black transition duration-300 z-10">
        <a href="/blog/about">Learn More</a>
      </button>
    </div>
  );
}

const TestimonialView = () => {
  type Testimonial = {
    content: string;
    who: string;
    active: boolean;
  };

  const testimonial: Testimonial[] = [
    {
      content:
        "We hired Andor to fix a number of critical bugs in our platform that had built up after a prior development team had offboarded. In spite of there being minimal existing documentation or technical handover available, Andor quickly dug in to our systems and resolved the issues. He also proactively set up new systems, testing, and documentation to assist handover to an incoming BAU development team. Andor was great to work with and was an excellent communicator. He kept us in the loop with everything he did, proactively flagging roadblocks and any trade-off decisions required. His depth of experience and knowledge of industry best practices has been very helpful to us in determining the next steps for our system architecture. His passion for his work is very strong and this shows through in the level of care he puts into his work and the expectations he sets for those around him.",
      who: "David Kim (CEO Rethinkable)",
      active: true,
    },
    {
      content:
        "As the Head of R&D at RetailNext, I had the pleasure of working with Andor quite a bit as he transitioned to a role split between the Customer Experience Team and the R&D Team. Watching him learn quickly and grow into this role for which he had no formal training was impressive, to say the least. Andor is intelligent, well educated, and carries himself well, but more importantly he possesses the most important trait for a technological innovator: insatiable curiosity. His motivation comes from within and he refuses to let up until he's achieved the (often Herculean) goals he's set out for himself.",
      who: "George Shaw (CEO of Pathr)",
      active: false,
    },
  ];

  const link = {
    label: "Andor Kesselman",
    description: "Fun fact: This was my attire for my wedding.",
    image:
      "https://media.licdn.com/dms/image/C4D03AQH-nNtREKGefQ/profile-displayphoto-shrink_800_800/0/1609844548992?e=1724889600&v=beta&t=oG1DqyoCbFsX9mDXbZN4hUkfObaosycfFDonWyaBlx0",
  };

  return (
    <div className="flex flex-col md:flex-row m-5 p-5 bg-gray-900 items-center md:items-start">
      <div className="flex flex-col md:flex-col md:w-1/2 mb-5 md:mb-0">
        <h2 className="text-white text-center text-3xl mb-4">Testimonials</h2>
        {testimonial
          .filter((item) => item.active)
          .map((item, index) => (
            <div className="flex flex-col mb-5 shadow-lg" key={index}>
              <div className="quote-container text-white">
                <div className="quote-content max-w-full overflow-hidden overflow-ellipsis whitespace-pre-wrap">
                  {item.content}
                </div>
                <div className="quote-author">- {item.who}</div>
              </div>
            </div>
          ))}
      </div>
      <div className="flex  flex-col md:flex-row md:w-1/2 justify-center md:justify-end md:items-center">
        <Avatar link={link} />
      </div>
    </div>
  );
};

const ProjectsView = () => {
  return (
    <div className="flex w-full flex-col items-center py-10 text-center">
      <div className="text-4xl font-semibold">Sample Projects</div>
      <div className=" font-semibold text-gray-500">
        Just some examples of things I have worked on{" "}
      </div>

      <div className="grid w-full grid-cols-1 md:grid-cols-3 text-center py-5">
        {ProjectLinks.slice(0, 15).map((item, index) => (
          <a
            key={index}
            href={item.url}
            className="group rounded-lg border border-transparent p-5 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex h-full flex-col items-center justify-center">
              <h2 className={`mb-3 text-2xl font-semibold`}>{item.label} </h2>
              <p className={`m-0 text-sm opacity-50`}>{item.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

const OpenSourceGroups = () => {
  return (
    <div className="flex w-full flex-col items-center py-10 text-center bg-gray-900">
      <div className="text-4xl font-semibold">OpenSource Activity</div>
      <div className="grid w-full grid-cols-1 md:grid-cols-3 text-center py-5">
        {OpenSourceLinks.map((item, index) => (
          <a
            key={index}
            href={item.url}
            className="group rounded-lg border border-transparent p-5 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex h-full flex-col items-center justify-center">
              <h2 className={`mb-3 text-2xl font-semibold`}>{item.label} </h2>
              <p className={`mb-5 text-sm opacity-50`}>
                {" "}
                {item.role +
                  "@" +
                  item.organization +
                  (item.dates ? " " + item.dates : "")}
              </p>
              <p className={`m-0 text-sm opacity-50`}>{item.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

const SkillsView = () => {
  return (
    <div className="w-full h-screen text-center m-10">
      <div className="text-4xl">Skill Tetris</div>
      <div className=" w-full p-10 h-full">
        <TetrisGame />
      </div>
    </div>
  );
};

const ContactView = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen items-center justify-center w-full">
      <div className="text-center m-4">
        Want to talk more? All you need to do is click this button.
        <br />
        <button className="bg-gray-900 p-5 m-4 rounded-lg"> Contact Me </button>
      </div>
    </div>
  );
};

function MainView() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <div className="text-center flex flex-col items-center justify-center w-full absolute z-50">
        <div className="text-4xl flex flex-col">Andor Labs</div>
        <div className="m-4 flex flex-col">
          <p>
            I revive startup engineering teams and help evaluate technical
            acquisitions.
          </p>
          <p>Focused on the Decentalized Tech and Retail AI Space.</p>
        </div>
      </div>
      <div className="text-center flex items-center justify-center h-full w-full absolute z-10">
        <ThreeSceneWrapper />
      </div>
    </div>
  );
}
function SampleView() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-orange-500"></div>
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
    <DefaultLayout>
      <div className="flex flex-col overflow-auto">
        <div>
          <MainView />
          <ScrollDownIndicator />
        </div>

        <ServicesView />
        <PitchView />

        <TestimonialView />
        <ProjectsView />
        <OpenSourceGroups />
        {/* <SkillsView /> */}
        {/* <ContactView /> */}
      </div>
    </DefaultLayout>
  );
}
