interface DocsLayoutProps {
  children: React.ReactNode;
}

// Single centered notebook column; the old sidebar only ever held one link.
export default function DocsLayout({ children }: DocsLayoutProps) {
  return <div className="mx-auto w-full max-w-5xl px-0 sm:px-5">{children}</div>;
}
