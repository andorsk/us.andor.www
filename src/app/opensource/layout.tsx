import DocumentLayout from "@/layouts/DocumentLayout";

type Link = {
  url: string;
  label: string;
  description: string;
  organization?: string;
};

const OpenSource = () => {
  const links: Link[] = [
    {
      url: "https://identity.foundation/decentralized-web-node/spec/",
      label: "Decentralized Web Node Co-Chair",
      organization: "DIF",
      description:
        "A Decentralized Web Node (DWN) is a data storage and message relay mechanism entities can use to locate public or private permissioned data related to a given Decentralized Identifier (DID). Decentralized Web Nodes are a mesh-like datastore construction that enable an entity to operate multiple nodes that sync to the same state across one another, enabling the owning entity to secure, manage, and transact their data with others without reliance on location or provider-specific infrastructure, interfaces, or routing mechanisms.",
    },
    {
      url: "https://blog.identity.foundation/dif-monthly-33/",
      label: "Technical Steering Committee Chair",
      organization: "DIF",
      description:
        "Foundational components of an open, standards-based, decentralized identity ecosystem for people, organizations, apps, and devices.",
    },
    {
      url: "https://wiki.trustoverip.org/display/HOME/Trust+Registry+Task+Force",
      organization: "Trust Over IP",
      label: "Co-Lead of the Trust Registry Task Force",
      description:
        "The primary objective of this Task Force is to develop the ToIP Trust Registry Protocol as a ToIP Specification. The purpose of this deliverable to enable interoperability between ToIP-compliant trust registries.",
    },
    {
      url: "https://wiki.trustoverip.org/display/HOME/Technology+Architecture+Task+Force",
      organization: "Trust Over IP",
      label: "Technology Architecture Task Force Editor",
      description:
        "The Technology Architecture Task Force (TATF) is a task force of the ToIP Technology Stack Working Group. The mission of the TATF is to draft the ToIP Technology Architecture Specification that defines the overall technical requirements for the four layers of the ToIP stack. Note: this specification is intended to serve as a direct a counterpart to the ToIP Governance Architecture Specification deliverable from the GSWG Governance Architecture TF. (The full set of first-generation ToIP Governance Stack specifications are described in this ToIP blog post.",
    },
    {
      url: "https://wiki.trustoverip.org/pages/viewpage.action?pageId=74875289",
      label: "Founder/Co-Lead Service Discovery Task Force",
      organization: "Trust Over IP",
      description:
        "The mission of the Service Discovery Task Force (SDTF) is to develop specifications that enable discoverability of services in a decentralized context. This includes but is not limited to helping ToIP endpoint systems learn about the services that are available to them, and how to interact with them.",
    },
  ];

  return (
    <DocumentLayout>
      <div className="flex w-full flex-col items-center py-10 text-center">
        Note: See my github for other open source projects. These are
        specifically collaborations I made in the open source community.
        <div className="grid w-full grid-cols-3 text-center py-5">
          {links.map((item, index) => (
            <a
              key={index}
              href={item.url}
              className="group  rounded-lg border border-transparent p-5 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex h-full flex-col items-center justify-center">
                <h2 className={`mb-3 text-2xl font-semibold`}>{item.label} </h2>
                <p className={`m-2 text-md text-right px-5 w-full opacity-50`}>
                  {item.organization}
                </p>

                <p className={`m-0 text-sm opacity-50`}>{item.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </DocumentLayout>
  );
};

export default OpenSource;
