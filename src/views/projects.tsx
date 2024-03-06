"use client";

type Link = {
  url: string;
  label: string;
  description: string;
};

export const ProjectPage = () => {
  const links: Link[] = [
    {
      url: "https://starbucks.andor.us",
      label: "Starbucks Mug Tracker",
      description: "My starbucks mug collection from around the world..",
    },
    {
      url: "https://service-profiles.andor.us",
      label: "Service Profiles",
      description:
        "A tool I put together that implements a decentralized service discovery specifcations I lead at Trust Over IP.",
    },
    {
      url: "https://github.com/andorsk/d2-mode",
      label: "D2 Mode For Emacs",
      description: "D2 Mode For Emacs",
    },
    {
      url: "https://protocols.benri.io/",
      label: "Web5 Protocols",
      description:
        "A regitry I put together for Decentralized Web Node Protocol Specifications",
    },
    {
      url: "https://github.com/andorsk/a_novel_approach_toward_tda_paper",
      label:
        "A Novel Approach to Topological Graph Theory with R-K Diagrams and Gravitational Wave Analysis",
      description: "A academic project I worked on with a friend",
    },
    {
      url: "/opensource",
      label: "Other Open Source Projects",
      description: "Check out my other open source projects.",
    },
  ];

  return (
    <div className="text-center justify-center">
      <div className="mb-32 flex flex-wrap justify-center gap-4 text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:justify-start lg:text-left">
        {links.map((item, index) => (
          <a
            key={index}
            href={item.url}
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              {item.label}{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              {item.description}
            </p>
          </a>
        ))}
      </div>
      <div
        className={`mb-32 flex flex-wrap justify-center gap-4 text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:justify-start lg:text-left`}
      >
        Powered by Web5
      </div>
    </div>
  );
};
