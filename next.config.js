/** @type {import('next').NextConfig} */

const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require("next/constants");

const { withContentlayer } = require("next-contentlayer");

const webpack = require("webpack");

// STATIC_EXPORT=true builds a static site for GitHub Pages (see .github/workflows/deploy.yml).
// Redirects aren't supported in a static export.
const isStaticExport = process.env.STATIC_EXPORT === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: isStaticExport ? "export" : undefined,
  ...(isStaticExport
    ? {}
    : {
        async redirects() {
          return [{ source: "/blog/about", destination: "/about", permanent: true }];
        },
      }),
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        stream: require.resolve("stream-browserify"),
        crypto: require.resolve("crypto-browserify"),
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          process: "process/browser",
        }),
        new webpack.NormalModuleReplacementPlugin(/node:crypto/, (resource) => {
          resource.request = resource.request.replace(/^node:/, "");
        }),
      );
    }
    return config;
  },
};

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
});

module.exports = (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    const withPWA = require("@ducanh2912/next-pwa").default({
      dest: "public",
    });

    //#ts-ignore
    return withPWA(withContentlayer(nextConfig));
  }
  return nextConfig;
};
