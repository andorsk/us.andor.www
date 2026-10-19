import DocumentLayout from "./DocumentLayout";

type Link = {
  url: string;
  label: string;
  description: string;
  sublabel?: string;
};

type GridBoxLayoutProps = {
  title?: string;
  header: string;
  links: Link[];
  children?: React.ReactNode;
};

// Notebook list: each link is a numbered entry with a stamped sublabel.
export const GridBoxLayout = (props: GridBoxLayoutProps) => {
  return (
    <DocumentLayout>
      <main className="mx-auto max-w-3xl px-5 pt-12 sm:pt-16">
        {props.title && <h1 className="font-hand text-5xl font-bold text-white sm:text-6xl">{props.title}</h1>}
        <p className="mt-3 text-base text-paper-muted">{props.header}</p>
        <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {props.links.map((item, index) => (
            <li key={index}>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="group block hover:text-inherit">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="text-sm text-paper-muted">no. {String(index + 1).padStart(2, "0")}</span>
                  <span className="font-hand text-3xl font-bold leading-tight text-white group-hover:text-paper-accent">
                    {item.label}
                  </span>
                </div>
                {item.sublabel?.trim() && (
                  <span className="mt-1 inline-block -rotate-1 rounded-md border-2 border-paper-stamp px-1.5 text-sm text-paper-stamp">
                    {item.sublabel}
                  </span>
                )}
                <p className="mt-2 text-base leading-relaxed text-paper-body">{item.description}</p>
              </a>
            </li>
          ))}
        </ul>
        {props.children}
      </main>
    </DocumentLayout>
  );
};
