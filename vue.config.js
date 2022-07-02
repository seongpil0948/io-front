const { defineConfig } = require("@vue/cli-service");
const { NaiveUiResolver } = require("unplugin-vue-components/resolvers");

const path = require("path");

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    config.module
      .rule("vue")
      .use("vue-loader")
      .tap((options) => {
        console.log("vue-loader options: ", options);
        return options;
      });
  },
  configureWebpack: {
    output: {
      filename: "[name].js",
    },
    resolve: {
      alias: {
        "@": path.join(__dirname, "src/"),
      },
    },
    devtool: "source-map",
    plugins: [
      require("unplugin-vue-components/webpack")({
        extensions: ["vue"],
        resolvers: [NaiveUiResolver()],
        dts: true,
        dirs: ["src/components", "src/views"],
        include: [/\.vue$/, /\.vue\?vue/],
        deep: true,
        exclude: [
          /[\\/]node_modules[\\/]/,
          /[\\/]\.git[\\/]/,
          /[\\/]\.nuxt[\\/]/,
          /[\\/]\.public[\\/]/,
          /[\\/]\.vscode[\\/]/,
          /[\\/]\.plugins[\\/]/,
          /[\\/]\.assets[\\/]/,
          /[\\/]\.store[\\/]/,
        ],
      }),
    ],
  },
  pwa: {
    appleMobileWebAppCapable: "yes",
    name: "inout-box",
    workboxPluginMode: "GenerateSW",
  },
});
