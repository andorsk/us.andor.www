"use client";

import { useState } from "react";
import jsQR from "jsqr";

export default function Verification() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] || null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setMessage("Please upload a PNG file.");
      return;
    }

    if (file.type !== "image/png") {
      setMessage("Please upload a PNG file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const image = new Image();
      image.src = reader.result as string;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        if (!context) return;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        );
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          verifyCredential(code.data);
        } else {
          setMessage("No QR code found in the image.");
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const verifyCredential = async (qrData: string) => {
    const request = { credentialJWT: qrData };

    try {
      const response = await fetch("/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error("Failed to verify credential");
      }

      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div className="h-screen w-full text-black flex items-center justify-center">
      <div className="p-4 bg-white shadow-lg rounded-lg">
        <h1 className="text-xl text-black font-bold mb-4">
          Upload PNG with QR Code for Verification
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="file"
              accept="image/png"
              onChange={handleFileChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Verify
          </button>
        </form>
        {message && <p className="mt-4">{message}</p>}
      </div>
    </div>
  );
}
