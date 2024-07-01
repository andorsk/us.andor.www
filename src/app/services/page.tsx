"use client";
import React, { useEffect, useRef } from "react";
import { serviceDescriptions } from "@/lib/data/serviceDescriptions";
import { ServiceDescription } from "@/lib/types";
import styles from "./services.module.css";

export default function ServicePage() {
  const serviceRefs = useRef<(HTMLSpanElement | null)[]>([]);
  useEffect(() => {
    const intervalId = setInterval(() => {
      const time = Date.now() * 0.001; // Use time in seconds
      serviceRefs.current.forEach((element) => {
        if (element) {
          const hue = Math.sin(time) * 0.1 + 0.1;
          const hslColor = `hsl(${hue * 360}, 50%, 50%)`;
          element.style.color = hslColor;
        }
      });
    }, 100);

    return () => clearInterval(intervalId); // Cleanup the interval on component unmount
  }, []);
  return (
    <div>
      <div className="px-10 m-10 flex justify-center items-center">
        Services
        <div className="w-full">
          {serviceDescriptions.map(
            (service: ServiceDescription, index: number) => (
              <div key={service.id}>
                <div className="flex flex-col text-left m-10">
                  <div className="flex flex-col justify-center w-full">
                    <div className="group rounded-lg border border p-5 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
                      <span
                        ref={(el) => (serviceRefs.current[index] = el)}
                        className="text-2xl font-bold"
                      >
                        {service.name}
                      </span>
                      <p className={styles.normaltext}>{service.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
