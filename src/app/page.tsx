"use client";
import { AIAssistant } from "@/components/ai-assistant";
import { UseWeb5 } from "@/components/web5";
import DefaultLayout from "@/layouts/DefaultLayout";
import ThreeScene from "@/components/sim/sim";

export default function Home() {
  const links: HomeLink[] = [
    {
      url: "/blog",
      label: "Blog",
      description: "My personal blog.",
    },
    {
      url: "/blog/about",
      label: "About",
      description: "About this site.",
    },
    {
      url: "/projects",
      label: "Projects",
      description: "View my some projects",
    },
    {
      url: "/opensource",
      label: "Open Source",
      description: "Open Source Specifications and Standards I Work On",
    },
    {
      url: "/contact",
      label: "Contact",
      description: "Contact Me",
    },
  ];

  return (
    <main className=" w-full">
      <DefaultLayout>
        <div>
          <div>
            <ThreeScene />
          </div>
          <div className="flex w-full flex-col items-center py-10 text-center">
            <div className="grid w-full grid-cols-3 text-center py-5">
              {links.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  className="group  rounded-lg border border-transparent p-5 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
                  rel="noopener noreferrer"
                >
                  <div className="flex h-full flex-col items-center justify-center">
                    <h2 className={`mb-3 text-2xl font-semibold`}>
                      {item.label}{" "}
                    </h2>
                    <p className={`m-0 text-sm opacity-50`}>
                      {item.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </DefaultLayout>
    </main>
  );
}
