"use client";

import React, { useState } from "react";
import axios from "axios";
import { CheckBadgeIcon, XMarkIcon } from "@heroicons/react/24/solid";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const apiURL = process.env.NEXT_PUBLIC_CRM_API_URL || "http://localhost:8080";

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(apiURL + "/inquiry", {
        record: formData,
      });
      if (response.status === 201) {
        setSuccess(true);
        setErrorMessage("");
        // Reset form after 2 seconds
        setTimeout(() => {
          setFormData({
            email: "",
            name: "",
            company_name: "",
            phone: "",
            message: "",
          });
          setSuccess(false);
          onClose();
        }, 2000);
      }
    } catch (error) {
      setErrorMessage(
        "Failed to send message. Please try emailing contact@andor.us directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-black border border-white/20 rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">Get in Touch</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-300 mb-1"
                  htmlFor="name"
                >
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-white/5 text-white placeholder-gray-500 px-3 py-2 rounded border border-white/10 focus:outline-none focus:border-white/30 text-sm transition-colors"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-300 mb-1"
                  htmlFor="email"
                >
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/5 text-white placeholder-gray-500 px-3 py-2 rounded border border-white/10 focus:outline-none focus:border-white/30 text-sm transition-colors"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-300 mb-1"
                  htmlFor="company_name"
                >
                  Company
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="w-full bg-white/5 text-white placeholder-gray-500 px-3 py-2 rounded border border-white/10 focus:outline-none focus:border-white/30 text-sm transition-colors"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-300 mb-1"
                  htmlFor="phone"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-white/5 text-white placeholder-gray-500 px-3 py-2 rounded border border-white/10 focus:outline-none focus:border-white/30 text-sm transition-colors"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-300 mb-1"
                  htmlFor="message"
                >
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-white/5 text-white placeholder-gray-500 px-3 py-2 rounded border border-white/10 focus:outline-none focus:border-white/30 text-sm transition-colors resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
                  {errorMessage}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded font-medium text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-white text-black hover:bg-gray-200 rounded font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          ) : (
            <div className="py-8 text-center">
              <CheckBadgeIcon className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Message Sent!
              </h3>
              <p className="text-sm text-gray-400">
                Thank you for reaching out. I'll get back to you soon.
              </p>
            </div>
          )}
        </div>

        {/* Quick Contact Options */}
        {!success && (
          <div className="p-4 border-t border-white/20 bg-white/5">
            <p className="text-xs text-gray-400 mb-2">Or contact directly:</p>
            <div className="flex flex-col gap-2">
              <a
                href="mailto:contact@andor.us"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                contact@andor.us
              </a>
              <a
                href="https://calendly.com/andor-us/initial-introduction-meeting"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Book a Call on Calendly
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
