const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

// vue.config.js
module.exports = {
  devServer: {
    port: 3000,
  },
  configureWebpack: {
    plugins: [
      // Copy over media resources from the Blockly package
      new CopyPlugin([
        {
          from: path.resolve(__dirname, "./node_modules/blockly/media"),
          to: path.resolve(__dirname, "dist/media"),
        },
      ]),
    ],
  },
  chainWebpack: (config) => {
    config.resolve.alias.set(
      "vue$",
      // If using the runtime only build
      path.resolve(__dirname, "node_modules/vue/dist/vue.runtime.esm.js")
      // Or if using full build of Vue (runtime + compiler)
      // path.resolve(__dirname, 'node_modules/vue/dist/vue.esm.js')
    );
  },
};
