/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15 bundles React 19 internally (next/dist/compiled/react) for the RSC
  // pipeline, but node_modules/react is React 18. renderToStaticMarkup in
  // react-dom/server.node can only handle elements created by the same React build it
  // was compiled against. Externalising both packages forces every import of 'react'
  // and 'react-dom' in the server bundle to resolve to node_modules at runtime,
  // guaranteeing a single shared React 18 instance across createElement, the JSX
  // transform inside QuestionPaperPrintLayout, and renderToStaticMarkup.
  serverExternalPackages: ['react', 'react-dom'],
};

module.exports = nextConfig;
