import DefaultLayout from "@/layouts/DefaultLayout";
type DocsLayoutProps = {
  children: React.ReactNode;
};

// removed container
export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <DefaultLayout>
      <div className="flex min-h-screen mt-5 flex-col">
        <div className=" flex-1">{children}</div>
      </div>
    </DefaultLayout>
  );
}
