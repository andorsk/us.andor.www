import React from "react";
import { serviceDescriptions } from "@/lib/data/serviceDescriptions";
import { ServiceDescription } from "@/lib/types";
import styles from "./services.module.css";

export default function ServicePage() {
  return (
    <div>
      <div className="px-10 m-10 flex justify-center items-center">
        Services
        <div className="w-full">
          {serviceDescriptions.map((service: ServiceDescription) => (
            <div key={service.id}>
              <div className="flex flex-col text-left m-10">
                <div className="flex flex-col justify-center w-full">
                  <div className="group rounded-lg border border p-5 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
                    <span className={`${styles.title} `}>{service.name}</span>
                    <p className={styles.normaltext}>{service.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
