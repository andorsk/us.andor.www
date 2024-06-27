import DefaultLayout from "@/layouts/DefaultLayout";
type ServiceLayoutProps = {
  children: React.ReactNode;
};

export default function ServiceLayoutProps({ children }: ServiceLayoutProps) {
  return (
    <>
      <DefaultLayout>{children}</DefaultLayout>
    </>
  );
}
