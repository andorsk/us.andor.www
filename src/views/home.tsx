"use client";

type HomeLink = {
  url: string;
  label: string;
};

export const Home = () => {
  const links: HomeLink[] = [
    {
      url: "/blog",
      label: "Blog",
      description: "My personal blog.",
    },
    {
      url: "/about",
      label: "About",
      description: "About this site.",
    },
    {
      url: "/projects",
      label: "Projects",
      description: "View my some projects",
    },
    {
      contact: "/contact",
      label: "Contact",
      description: "Contact Me",
    },
  ];

  return (
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
  );
};
