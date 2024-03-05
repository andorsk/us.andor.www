type DocsLayoutProps = {
  children: React.ReactNode;
};

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex flex-1 items-center space-x-4 sm:justify-end">
            <nav className="flex space-x-4">
              <span className="sr-only">GitHub</span>
              asdfasdfasf
            </nav>
          </div>
        </div>
      </header>
      <div className="container flex-1">{children}</div>
    </div>
  );
}
