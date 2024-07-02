import React, { useState } from "react";
import axios from "axios";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

//const apiURL = "https://crm-tool-gkdrocdrsq-uc.a.run.app/inquiry";

const apiURL = "http://localhost:8080";

function ContactForm() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    company_name: "",
    phone: "",
  });

  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(apiURL + "/inquiry", {
        record: formData,
      });
      if (response.status == 201) {
        setSuccess(true);
        setErrorMessage("");
      }
    } catch (error) {
      setErrorMessage("Failed to send message. Please try again later.");
    }
  };

  return (
    <div className="w-full mx-auto mt-10 items-center justify-center">
      Contact Form
      <form onSubmit={handleSubmit} className="p-8 rounded shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="shadow appearance-none text-black border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block  text-sm font-bold mb-2" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="shadow appearance-none text-black border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block  text-sm font-bold mb-2"
            htmlFor="company_name"
          >
            Company Name
          </label>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            className="shadow text-black appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label
            className="block  text-sm font-bold mb-2"
            htmlFor="phone_number"
          >
            Phone Number
          </label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="shadow text-black appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="flex items-center justify-center">
          <button
            type="submit"
            className="bg-white text-black hover:bg-gray-700  font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Send
          </button>
        </div>
      </form>
      {success && (
        <div className="mt-4 flex items-center text-shite text-green-500">
          <CheckBadgeIcon className="w-6 h-6 mr-2" />
          <span>Message sent, please check your inbox</span>
        </div>
      )}
      {errorMessage && (
        <div className="mt-4 text-red-500">
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

export default ContactForm;
