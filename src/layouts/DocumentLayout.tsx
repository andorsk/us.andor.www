import DefaultLayout from "./DefaultLayout";

type DocumentLayoutProps = {
  children: React.ReactNode;
};

// removed container
export default function DocumentLayout({ children }: DocumentLayoutProps) {
  return (
    <div>
      <DefaultLayout>{children}</DefaultLayout>
    </div>
  );
}
