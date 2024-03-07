import InstallPWAButton from "@/components/install-pwa";
/* import Search from "@/components/ui/search";
 *  */
type DefaultLayoutProps = {
  children: React.ReactNode;
};

// removed container
export default function DefaultLayout({ children }: DefaultLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="pr-5 flex h-16 items-center space-x-2 sm:justify-between sm:space-x-0">
          <div className="mx-10">
            <a href="/">Home</a>
          </div>
          <div className="flex flex-1 items-center space-x-2 justify-end">
            <InstallPWAButton />
            <nav className="flex space-x-4">{/* <Search /> */}</nav>
            <a href="https://github.com/andorsk">Github</a>
          </div>
        </div>
      </header>
      <div className=" flex-1">{children}</div>
    </div>
  );
}
