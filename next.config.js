/** @type {import('next').NextConfig} */
const nextConfig = {
  // react-dom/server.node needs the full React build (which has ReactCurrentDispatcher).
  // By default Next.js bundles react-dom into its RSC bundle using the restricted
  // react-server export condition, which lacks those internals.
  // Marking react-dom as an external package makes Next.js load it at runtime via
  // Node require(), where it picks up the full build from node_modules.
  serverExternalPackages: ['react-dom'],
};

module.exports = nextConfig;
