"use client";

import DefaultLayout from "@/layouts/DefaultLayout";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

// Message type with sources
interface Message {
  role: "user" | "assistant" | "contact-form";
  content: string;
  sources?: Array<{ label: string; url: string }>;
}

// Helper function to convert URLs and markdown links in text to clickable links
const formatMessageContent = (content: string) => {
  // First handle markdown links [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  // Then handle plain URLs
  const urlRegex = /(https?:\/\/[^\s\)]+)/g;

  let processedContent = content;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  // Process markdown links first
  const markdownMatches: Array<{text: string, url: string, start: number, end: number}> = [];
  while ((match = markdownLinkRegex.exec(content)) !== null) {
    markdownMatches.push({
      text: match[1],
      url: match[2],
      start: match.index,
      end: match.index + match[0].length
    });
  }

  // Sort by position
  markdownMatches.sort((a, b) => a.start - b.start);

  // Build elements array with markdown links and plain text
  markdownMatches.forEach((mdMatch, idx) => {
    // Add text before this markdown link
    if (mdMatch.start > lastIndex) {
      const textBefore = content.substring(lastIndex, mdMatch.start);
      // Process plain URLs in this text
      const urlMatches = textBefore.match(urlRegex);
      if (urlMatches) {
        const parts = textBefore.split(urlRegex);
        parts.forEach((part, partIdx) => {
          if (part.match(urlRegex)) {
            elements.push(
              <a
                key={`${idx}-${partIdx}-url`}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                {part}
              </a>
            );
          } else if (part) {
            elements.push(<span key={`${idx}-${partIdx}-text`}>{part}</span>);
          }
        });
      } else {
        elements.push(<span key={`${idx}-text`}>{textBefore}</span>);
      }
    }

    // Add the markdown link
    elements.push(
      <a
        key={`${idx}-md`}
        href={mdMatch.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline"
      >
        {mdMatch.text}
      </a>
    );

    lastIndex = mdMatch.end;
  });

  // Add remaining text after last markdown link
  if (lastIndex < content.length) {
    const remaining = content.substring(lastIndex);
    const urlMatches = remaining.match(urlRegex);
    if (urlMatches) {
      const parts = remaining.split(urlRegex);
      parts.forEach((part, partIdx) => {
        if (part.match(urlRegex)) {
          elements.push(
            <a
              key={`end-${partIdx}-url`}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              {part}
            </a>
          );
        } else if (part) {
          elements.push(<span key={`end-${partIdx}-text`}>{part}</span>);
        }
      });
    } else {
      elements.push(<span key="end-text">{remaining}</span>);
    }
  }

  // If no markdown links were found, fall back to simple URL parsing
  if (elements.length === 0) {
    const parts = content.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  }

  return elements;
};

// Inline Contact Form Component
const InlineContactForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    company_name: "",
    phone: "",
    message: "",
  });
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/contact", formData);
      if (response.status === 200) {
        setSuccess(true);
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      setErrorMessage("Failed to send. Please email contact@andor.us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex items-center gap-2 text-green-500 mb-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Message sent!</span>
        </div>
        <p className="text-sm text-gray-400">Thank you for reaching out. I'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
      <h3 className="text-white font-medium mb-3 text-sm">Send me a message</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Name *"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-white/5 text-white placeholder-gray-500 px-3 py-2 rounded border border-white/10 focus:outline-none focus:border-white/30 text-sm"
              required
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white/5 text-white placeholder-gray-500 px-3 py-2 rounded border border-white/10 focus:outline-none focus:border-white/30 text-sm"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              name="company_name"
              placeholder="Company"
              value={formData.company_name}
              onChange={handleChange}
              className="w-full bg-white/5 text-white placeholder-gray-500 px-3 py-2 rounded border border-white/10 focus:outline-none focus:border-white/30 text-sm"
            />
          </div>
          <div>
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-white/5 text-white placeholder-gray-500 px-3 py-2 rounded border border-white/10 focus:outline-none focus:border-white/30 text-sm"
            />
          </div>
        </div>
        <div>
          <textarea
            name="message"
            placeholder="Your message..."
            value={formData.message}
            onChange={handleChange}
            rows={3}
            className="w-full bg-white/5 text-white placeholder-gray-500 px-3 py-2 rounded border border-white/10 focus:outline-none focus:border-white/30 text-sm resize-none"
          />
        </div>
        {errorMessage && (
          <div className="text-xs text-red-400">{errorMessage}</div>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-white text-black hover:bg-gray-200 rounded font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
        <div className="text-xs text-gray-400 text-center">
          Or email <a href="mailto:contact@andor.us" className="text-blue-400 hover:text-blue-300">contact@andor.us</a>
        </div>
      </form>
    </div>
  );
};

// Main Hero Page with Overlay Chat
const HeroWithChat = () => {
  const [scrollY, setScrollY] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize speech recognition (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (!SpeechRecognition) return;

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    } catch (error) {
      console.error('Speech recognition initialization failed:', error);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const promptSuggestions = [
    "Who are you?",
    "What have you done?",
    "How do I contact you?"
  ];

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim()) return;

    // Expand the chat when a message is sent
    setIsExpanded(true);

    const userMessage: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Check if the message is asking about contact/reaching out
    const contactKeywords = ['contact', 'reach', 'email', 'call', 'meeting', 'hire', 'consult', 'get in touch', 'talk to'];
    const lowerText = text.toLowerCase();
    const isContactRequest = contactKeywords.some(keyword => lowerText.includes(keyword));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages })
      });

      if (!response.ok) {
        console.error("API response not OK:", response.status, response.statusText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.response) {
        console.error("No response in data:", data);
        throw new Error("No response from API");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        sources: data.sources || []
      };
      setMessages(prev => [...prev, assistantMessage]);

      // If this was a contact-related question, add the contact form to the chat
      if (isContactRequest) {
        setTimeout(() => {
          const contactFormMessage: Message = {
            role: "contact-form",
            content: ""
          };
          setMessages(prev => [...prev, contactFormMessage]);
        }, 500);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const fallbackMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try refreshing the page or reach out directly at contact@andor.us."
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleInputFocus = () => {
    setIsExpanded(true);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Parallax background */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/imgs/hero-speaking.jpg')",
          backgroundPosition: "center center", // Center on mobile and desktop
          transform: `translateY(${scrollY * 0.5}px) scaleX(-1)`,
          filter: "brightness(0.4)"
        }}
      />

      {/* Dark overlay - more transparent */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />

      {/* Title - Below header on mobile, Bottom Left on desktop */}
      <div className="absolute top-20 right-4 md:bottom-8 md:left-8 md:top-auto md:right-auto z-10">
        <h1 className="text-2xl md:text-6xl font-bold text-white mb-1 md:mb-2 tracking-tight text-right md:text-left">
          Andor Labs
        </h1>
        <p className="text-xs md:text-base text-gray-400 text-right md:text-left">
          Trusted Agentic Web Consulting
        </p>
      </div>

      {/* Chat Overlay - Bottom on mobile with more padding, Center Right on desktop */}
      <div className="absolute inset-x-0 bottom-0 md:inset-0 flex items-end md:items-center justify-center md:justify-end px-4 md:px-8 pb-6 md:pb-0 z-20">
        <div className="w-full max-w-md mb-safe">
          {/* Compact Chat - Expands on interaction */}
          <div className={`bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ${
            isExpanded ? 'h-auto' : 'h-auto'
          }`}>
            {/* Input Area at Top */}
            <div className="border-b border-white/20 p-3 bg-black/30">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={handleInputFocus}
                  placeholder="Chat with me..."
                  className="flex-1 bg-white/5 text-white placeholder-gray-500 px-3 py-2 rounded border border-white/10 focus:outline-none focus:border-white/30 text-sm transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`p-2 rounded border transition-all ${
                    isRecording
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                  title="Voice input"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-2 bg-white text-black hover:bg-gray-200 rounded font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Send
                </button>
              </form>
            </div>

            {/* Messages Area - Only shown when expanded */}
            {isExpanded && (
              <div className="h-[400px] overflow-y-auto px-4 py-4">
                <div className="space-y-4">
                  {messages.map((message, idx) => (
                    <div key={idx}>
                      {/* User Message */}
                      {message.role === "user" && (
                        <div className="flex justify-end">
                          <div className="max-w-[85%] bg-white text-black px-3 py-2 rounded-lg text-sm">
                            {message.content}
                          </div>
                        </div>
                      )}

                      {/* Assistant Message */}
                      {message.role === "assistant" && (
                        <div className="flex justify-start">
                          <div className="max-w-[85%]">
                            <div className="bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm">
                              <div className="whitespace-pre-wrap leading-relaxed">
                                {formatMessageContent(message.content)}
                              </div>
                            </div>

                            {/* Sources */}
                            {message.sources && message.sources.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {message.sources.map((source, sourceIdx) => (
                                  <a
                                    key={sourceIdx}
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-1 rounded transition-colors"
                                  >
                                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    <span>{source.label}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Contact Form */}
                      {message.role === "contact-form" && (
                        <div className="flex justify-start">
                          <div className="w-full max-w-[85%]">
                            <InlineContactForm />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Prompt Suggestions - Below messages/input */}
            <div className="border-t border-white/20 px-3 py-3 bg-black/20">
              <div className="flex flex-wrap gap-1.5 justify-center">
                {promptSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Page
export default function Home() {
  return (
    <DefaultLayout>
      <HeroWithChat />
    </DefaultLayout>
  );
}
