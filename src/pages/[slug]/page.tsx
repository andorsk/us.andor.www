import { useRouter } from "next/router";
import { FC } from "react";

const Page: FC = () => {
  const router = useRouter();
  const { slug } = router.query; // Access the dynamic route parameter `slug`

  return (
    <div>
      <h1>Page</h1>
      {slug}
    </div>
  );
};

export default Page;
