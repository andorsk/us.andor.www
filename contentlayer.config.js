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
  filePathPattern: `blog/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
    },
    date: {
      type: "date",
      required: true,
    },
    published: {
      type: "boolean",
      default: true,
    },
    author: {
      type: "string",
      required: false,
    },
    featured: {
      type: "boolean",
      default: false,
    },
  },
  computedFields,
}));

export const Article = defineDocumentType(() => ({
  name: "Article",
  filePathPattern: `blog/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
    },
    date: {
      type: "date",
      required: true,
    },
    published: {
      type: "boolean",
      default: true,
    },
    author: {
      type: "string",
      required: false,
    },
    featured: {
      type: "boolean",
      default: false,
    },
  },
  computedFields,
}));

export default makeSource({
  contentDirPath: "./content",
  documentTypes: [Doc, Article],
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
