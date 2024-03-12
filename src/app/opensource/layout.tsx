import { GridBoxLayout } from "@/layouts/GridBoxLayout";

type Link = {
  url: string;
  label: string;
  description: string;
  organization?: string;
  dates?: string;
  role?: string;
};

const OpenSource = () => {
  const links: Link[] = [
    {
      url: "https://identity.foundation/decentralized-web-node/spec/",
      label: "Decentralized Web Node Working Group",
      organization: "DIF",
      dates: "2022-Present",
      role: "Co-Chair",
      description:
        "A Decentralized Web Node (DWN) is a data storage and message relay mechanism entities can use to locate public or private permissioned data related to a given Decentralized Identifier (DID). Decentralized Web Nodes are a mesh-like datastore construction that enable an entity to operate multiple nodes that sync to the same state across one another, enabling the owning entity to secure, manage, and transact their data with others without reliance on location or provider-specific infrastructure, interfaces, or routing mechanisms.",
    },
    {
      url: "https://blog.identity.foundation/dif-monthly-33/",
      label: "Technical Steering Committee Chair",
      organization: "DIF",
      dates: "2023-Present",
      role: "Chair",
      description:
        "Foundational components of an open, standards-based, decentralized identity ecosystem for people, organizations, apps, and devices.",
    },
    {
      url: "https://wiki.trustoverip.org/display/HOME/Trust+Registry+Task+Force",
      organization: "Trust Over IP",
      label: "Trust Registry Task Force",
      role: "Co-Lead",
      dates: "2023-Present",
      description:
        "The primary objective of this Task Force is to develop the ToIP Trust Registry Protocol as a ToIP Specification. The purpose of this deliverable to enable interoperability between ToIP-compliant trust registries.",
    },
    {
      url: "https://wiki.trustoverip.org/display/HOME/Technology+Architecture+Task+Force",
      organization: "Trust Over IP",
      label: "Technology Architecture Task Force",
      role: "Editor",
      dates: "2022-Present",
      description:
        "The Technology Architecture Task Force (TATF) is a task force of the ToIP Technology Stack Working Group. The mission of the TATF is to draft the ToIP Technology Architecture Specification that defines the overall technical requirements for the four layers of the ToIP stack. Note: this specification is intended to serve as a direct a counterpart to the ToIP Governance Architecture Specification deliverable from the GSWG Governance Architecture TF. (The full set of first-generation ToIP Governance Stack specifications are described in this ToIP blog post.",
    },
    {
      url: "https://wiki.trustoverip.org/pages/viewpage.action?pageId=74875289",
      label: "Service Discovery Task Force",
      organization: "Trust Over IP",
      dates: "2024-Present",
      role: "Co-Lead and Founder",
      description:
        "The mission of the Service Discovery Task Force (SDTF) is to develop specifications that enable discoverability of services in a decentralized context. This includes but is not limited to helping ToIP endpoint systems learn about the services that are available to them, and how to interact with them.",
    },
  ];

  const header =
    "Note: See my github for other open source projects. These are specifically collaborations I made in the open source community.";

  return (
    <div>
      <GridBoxLayout
        header={header}
        links={links.map((item) => {
          return {
            url: item.url,
            label: item.label,
            description: item.description,
            sublabel:
              item.role +
              "@" +
              item.organization +
              (item.dates ? " " + item.dates : ""),
          };
        })}
      ></GridBoxLayout>
    </div>
  );
};

export default OpenSource;
