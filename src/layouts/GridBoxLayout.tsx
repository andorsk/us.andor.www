import DocumentLayout from "./DocumentLayout";

type Link = {
  url: string;
  label: string;
  description: string;
  sublabel?: string;
};

type GridBoxLayoutProps = {
  header: string;
  links: Link[];
  children?: React.ReactNode;
};

const GridBoxLayout = (props: GridBoxLayoutProps) => {
  return (
    <DocumentLayout>
      <div className="flex w-full m-5 flex-col items-center p-10 text-center">
        {props.header}
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-center py-5">
          {props.links.map((item, index) => (
            <a
              key={index}
              href={item.url}
              className="group rounded-lg border border-transparent p-5 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex h-full flex-col items-center justify-start">
                <h2 className={`mb-3 text-2xl font-semibold`}>{item.label} </h2>
                <p className={`m-2 text-md text-right px-5 w-full opacity-50`}>
                  {item.sublabel}
                </p>
                <p className={`m-0 text-sm opacity-50`}>{item.description}</p>
              </div>
            </a>
          ))}
        </div>
        <div className=" flex-1">{props.children}</div>
      </div>
    </DocumentLayout>
  );
};

export default GridBoxLayout;
