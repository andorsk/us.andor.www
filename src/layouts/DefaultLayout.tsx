"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { homeLinks as links } from "@/lib/data/routes";
import Linkedin from "@/components/icons/Linkedin";
import Github from "@/components/icons/Github";

type DefaultLayoutProps = {
  children: React.ReactNode;
};

export type HomeLink = {
  url: string;
  label: string;
  description: string;
};

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  const [isNavOpen, setNavOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  const toggleNav = () => {
    setNavOpen(!isNavOpen);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let hideTimeoutId: NodeJS.Timeout;

    // Show header initially, then hide after 3 seconds
    if (window.innerWidth >= 640) {
      setIsHeaderVisible(true);
      hideTimeoutId = setTimeout(() => {
        setIsHeaderVisible(false);
      }, 3000);
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Show header if mouse is near the top (within 50px)
      if (e.clientY < 50) {
        setIsHeaderVisible(true);
        setIsHeaderHovered(true);
      } else {
        // Hide header after a delay when mouse moves away
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setIsHeaderHovered(false);
          if (e.clientY > 100) {
            setIsHeaderVisible(false);
          }
        }, 300);
      }
    };

    // Only apply auto-hide on desktop
    if (window.innerWidth >= 640) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeoutId);
      clearTimeout(hideTimeoutId);
    };
  }, []);

  return (
    <div className="flex dark min-h-screen flex-col">
      {/* Header with auto-hide on desktop */}
      <header
        className={`fixed top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur-sm transition-transform duration-300 ${
          isHeaderVisible || isHeaderHovered ? "translate-y-0" : "sm:-translate-y-full"
        }`}
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        <div className="px-5 flex h-14 items-center justify-between">
          {/* Mobile menu button */}
          <div className="sm:hidden">
            <button
              className="text-white p-2"
              onClick={toggleNav}
              aria-label="Toggle Navigation"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isNavOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden sm:flex space-x-2">
            {links.map((item, index) => (
              <Link
                className="px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                key={index}
                href={item.url}
              >
                {item.icon ? (
                  <img className="h-5" src={item.icon} alt={item.label} />
                ) : (
                  <span>{item.label}</span>
                )}
              </Link>
            ))}
          </div>

          {/* Social icons */}
          <div className="flex items-center space-x-2">
            <Github />
            <Linkedin />
          </div>
        </div>

        {/* Mobile navigation */}
        {isNavOpen && (
          <div className="sm:hidden border-t border-gray-800 bg-black">
            <nav className="flex flex-col p-2">
              {links.map((item, index) => (
                <Link
                  className="px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-900 transition-colors"
                  key={index}
                  href={item.url}
                  onClick={() => setNavOpen(false)}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main content - no top margin needed since header is auto-hiding */}
      <div>{children}</div>

      <Footer />
    </div>
  );
}

const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/20 text-white py-6 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <p className="text-sm text-gray-400">© 2024 Henosisknot LLC</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/blog/about" className="text-sm text-gray-400 hover:text-white transition-colors">
            About
          </Link>
          <Link href="/services" className="text-sm text-gray-400 hover:text-white transition-colors">
            Services
          </Link>
          <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
};
