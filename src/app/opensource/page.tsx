import { GridBoxLayout } from "@/layouts/GridBoxLayout";
import { OpenSourceLinks } from "@/lib/data/openSourceLinks";

const OpenSource = () => {
  const header =
    "Note: See my github for other open source projects. These are specifically collaborations I made in the open source community.";

  return (
    <div>
      <GridBoxLayout
        header={header}
        links={OpenSourceLinks.map((item) => {
          return {
            url: item.url,
            label: item.label,
            description: item.description,
            sublabel:
              item.role +
              "@" +
              item.organization +
              (item.dates ? " " + item.dates : ""),
          };
        })}
      ></GridBoxLayout>
    </div>
  );
};

export default OpenSource;
