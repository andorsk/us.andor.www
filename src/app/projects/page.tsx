import { GridBoxLayout } from "@/layouts/GridBoxLayout";
import { ProjectLinks } from "@/lib/data/projectLinks";

const Projects = () => {
  const header =
    "A lot of projects I worked on are not published. Here are a few that have been:";

  return (
    <div>
      <GridBoxLayout
        header={header}
        links={ProjectLinks.map((item) => {
          return {
            url: item.url,
            label: item.label,
            description: item.description,
            sublabel:
              (item.organization || item.affiliation ? (item.organization || item.affiliation) : "") +
              (item.dates ? " " + item.dates : ""),
          };
        })}
      ></GridBoxLayout>
    </div>
  );
};

export default Projects;