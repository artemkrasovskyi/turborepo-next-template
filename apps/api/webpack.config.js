const { resolve } = require('path');

module.exports = function (options) {
  return {
    ...options,
    resolve: {
      ...options.resolve,
      alias: {
        // Resolve @repo/shared TypeScript source directly so ts-loader compiles it
        '@repo/shared': resolve(__dirname, '../../packages/shared/src'),
        // Resolve @repo/types TypeScript source directly so ts-loader compiles it
        '@repo/types': resolve(__dirname, '../../packages-types/src'),
      },
    },
    externals: [
      // Mark everything except @repo/* workspace packages as external.
      // nodeExternals is not used here because it scans only apps/api/node_modules
      // and misses packages hoisted to the monorepo root node_modules.
      function ({ request }, callback) {
        if (!request) return callback();
        // Bundle @repo/* workspace packages (TypeScript source via alias above)
        if (/^@repo\//.test(request)) return callback();
        // Bundle relative and absolute paths
        if (/^[./]/.test(request)) return callback();
        // Treat everything else as a CommonJS external
        callback(null, `commonjs ${request}`);
      },
    ],
  };
};
