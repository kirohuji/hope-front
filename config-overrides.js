// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require("webpack");

module.exports = function override (config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: require.resolve("crypto-browserify"), // require.resolve("crypto-browserify") can be polyfilled here if needed
    stream: require.resolve("stream-browserify"), // require.resolve("stream-browserify") can be polyfilled here if needed
    assert: require.resolve("assert"), // require.resolve("assert") can be polyfilled here if needed
    http: require.resolve("stream-http"), // require.resolve("stream-http") can be polyfilled here if needed
    https: require.resolve("https-browserify"), // require.resolve("https-browserify") can be polyfilled here if needed
    os: require.resolve("os-browserify"), // require.resolve("os-browserify") can be polyfilled here if needed
    url: require.resolve("url"), // require.resolve("url") can be polyfilled here if needed
    zlib: require.resolve("browserify-zlib"), // require.resolve("browserify-zlib") can be polyfilled here if needed
    path: require.resolve("path-browserify"),
    net: require.resolve("net-browserify"),
    tls: require.resolve("tls-browserify"),
    fs: require.resolve("browserify-fs"),
    util: require.resolve("util/"),
    async_hooks: require.resolve("async_hooks"),
  });
  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ]);
  config.ignoreWarnings = [/Failed to parse source map/];
  config.module.rules.push({
    test: /\.(js|mjs|jsx)$/,
    enforce: "pre",
    loader: require.resolve("source-map-loader"),
    resolve: {
      fullySpecified: false,
    },
  });
  
  // Add markdown file support
  config.module.rules.push({
    test: /\.md$/,
    type: 'asset/source'
  });
  
  return config;
};