import { defineDocumentType, makeSource } from "contentlayer/source-files";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

/** @type {import('contentlayer/source-files').ComputedFields} */
const computedFields = {
  slug: {
    type: "string",
    resolve: (doc) => `/${doc._raw.flattenedPath}`,
  },
  slugAsParams: {
    type: "string",
    resolve: (doc) => doc._raw.flattenedPath.split("/").slice(1).join("/"),
  },
};

export const Doc = defineDocumentType(() => ({
  name: "Doc",
  filePathPattern: "blog/**/*.md",
  bodyType: "markdown",
  contentType: "markdown",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
      required: true,
    },
    flattenedPath: {
      type: "string",
      required: true,
    },
    date: {
      type: "string",
      required: true,
    },
    author: {
      type: "string",
      required: true,
    },
  },
  computedFields,
}));

export default makeSource({
  contentDirPath: "src/blog",
  documentTypes: [Doc],
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ["subheading-anchor"],
            ariaLabel: "Link to section",
          },
        },
      ],
      [
        rehypePrettyCode,
        {
          theme: "github-dark",
          highlightClassName: "highlight",
          lines: true,
          lineNumbers: true,
          lineNumbersClassName: "line-number",
          onVisitLine: (node) => {
            if (node.children.length === 0) {
              node.children.push({ type: "text", value: "\n" });
            }
          },
          onVisitHighlightedCode: (node) => {
            node.properties.className.push("line--highlighted");
          },
          onVisitHighlightedWord: (node) => {
            node.properties.className.push("word--highlighted");
          },
        },
      ],
    ],
  },
});
