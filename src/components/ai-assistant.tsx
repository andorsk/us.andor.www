"use client";
import "@/styles/ai-assistant.css";

import React, { useState, useEffect, useRef } from "react";

export const AIAssistant = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: "user",
    };
    const aiResponse = {
      id: messages.length + 2,
      text: "Processing...",
      sender: "ai",
    };

    setMessages([...messages, userMessage, aiResponse]);
    setInput("");

    setTimeout(() => {
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.slice(0, -1);
        const aiResponse = {
          id: messages.length + 2,
          text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          sender: "ai",
        };
        return [...updatedMessages, aiResponse];
      });
    }, 1000);
  };

  return (
    <div className="font-sans flex flex-col items-center w-1/2">
      <div className="w-full">
        <form onSubmit={handleSubmit} className="flex mb-2.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me something..."
            className="flex-1 mr-2.5 p-2.5 text-black rounded border border-gray-300"
          />
          <button type="submit" className="p-2.5 rounded  cursor-pointer">
            Ask Virtual Me
          </button>
          <button
            type="submit"
            className="px-5 mx-5 p-2.5 rounded cursor-pointer"
          >
            Ask Me Over DWN
          </button>
        </form>
        <div className="text-center max-h-40 overflow-y-auto ">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`m-2.5 text-left ${
                message.sender === "user" ? "text-right" : ""
              }`}
            >
              {message.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};
