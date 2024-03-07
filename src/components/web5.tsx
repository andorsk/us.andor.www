"use client";
import { Web5 } from "@web5/api";
import { useEffect, useState } from "react";

const shortenDID = (did: string): string => {
  return did !== "" ? did.split(":", 3).join(":") : "DID not found";
};

export const UseWeb5 = () => {
  const [did, setMyDid] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [web5, setWeb5] = useState();

  useEffect(() => {
    const initWeb5 = async () => {
      // @ts-ignore
      const { Web5 } = await import("@web5/api/browser");

      try {
        const { web5, did } = await Web5.connect();
        // @ts-ignore
        setWeb5(web5);
        setMyDid(did);
        setIsLoading(false);
        if (web5 && did) {
          console.log("Web5 initialized");
        }
      } catch (error) {
        console.error("Error initializing Web5:", error);
      }
    };
    initWeb5();
  }, []);
  return (
    <div>
      <h1>{!isLoading ? shortenDID(did) : "Loading DID..."}</h1>
    </div>
  );
};
