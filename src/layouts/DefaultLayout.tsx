"use client";

import { useState } from "react";
import Link from "next/link";
import { homeLinks as links } from "@/lib/data/routes";
import Linkedin from "@/components/icons/Linkedin";
import Github from "@/components/icons/Github";

//import InstallPWAButton from "@/components/install-pwa";
/* import Search from "@/components/ui/search";
 *  */
type DefaultLayoutProps = {
  children: React.ReactNode;
};

export type HomeLink = {
  url: string;
  label: string;
  description: string;
};

// removed container
export default function DefaultLayout({ children }: DefaultLayoutProps) {
  const [isNavOpen, setNavOpen] = useState(false);

  const toggleNav = () => {
    setNavOpen(!isNavOpen);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed top-0 z-40 w-full border-b bg-black">
        <div className="px-5 flex h-16 items-center space-x-2 sm:justify-between sm:space-x-0">
          <div className="sm:hidden">
            <button
              className="text-white"
              onClick={toggleNav}
              aria-label="Toggle Navigation"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </button>
          </div>
          <div className="hidden sm:flex space-x-4 mx-10">
            {links.map((item, index) => (
              <Link
                className="group button bg-gray-900 px-4 py-2 border text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                key={index}
                href={item.url}
                passHref
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          {isNavOpen && (
            <div className="absolute top-16 left-0 w-full shadow-lg sm:hidden">
              <nav className="flex flex-col items-start p-4 space-y-2">
                {links.map((item, index) => (
                  <Link
                    className="group button bg-gray-900 px-4 py-2 border text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    key={index}
                    href={item.url}
                    passHref
                  >
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}
          <div className="flex items-center space-x-2 justify-end">
            <nav className="flex space-x-4">
              {/* Potential Search Component */}
              {/* <Search /> */}
            </nav>
            <div className="flex space-x-2">
              <Github />
              <Linkedin />
            </div>
          </div>
        </div>
      </header>
      <div className="mt-16">{children}</div>
    </div>
  );
}
