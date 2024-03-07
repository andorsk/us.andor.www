import DocumentLayout from "@/layouts/DocumentLayout";

type Link = {
  url: string;
  label: string;
  description: string;
};

const ProjectLayout = () => {
  const links: Link[] = [
    {
      url: "https://starbucks.andor.us",
      label: "Starbucks Mug Tracker",
      description:
        "A fun little data project to help me figure out which starbucks mugs I was missing, and view starbucks mug collection from around the world...",
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
      description: "D2 Mode For Emacs. Listed by d2 and on MELPA",
    },
    {
      url: "https://protocols.benri.io/",
      label: "Web5 Protocols",
      description:
        "A public registry/tool I put together for Decentralized Web Node Protocol Specifications while working with Benri",
    },
    {
      url: "https://arxiv.org/abs/2201.06923",
      label:
        "A Novel Approach to Topological Graph Theory with R-K Diagrams and Gravitational Wave Analysis",
      description:
        "A academic project I worked on with a friend focusing on Topology and Gravitational Wave Analysis.",
    },
    {
      url: "/opensource",
      label: "Other Open Source Projects",
      description:
        "Check out my other open source projects specifications/projects I lead.",
    },
    {
      url: "https://mangaloremom.com/en/",
      label: "Managlore Mom",
      description:
        "A website I help put together for my mother in law to list her recipes",
    },
    {
      url: "/projects",
      label: "Stealth",
      description:
        "A new project I'm working on. I'll be able to share more soon.",
    },
    {
      url: "/projects",
      label: "Stealth",
      description:
        "Another new project I'm working on. I'll be able to share more soon.",
    },
  ];

  return (
    <DocumentLayout>
      <div className="flex w-full flex-col items-center py-10 text-center">
        A lot of projects I`&aposve worked on are not published. Here are a few
        that have been:
        <div className="grid w-full grid-cols-3 text-center py-5">
          {links.map((item, index) => (
            <a
              key={index}
              href={item.url}
              className="group  rounded-lg border border-transparent p-5 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
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
    </DocumentLayout>
  );
};

export default ProjectLayout;
