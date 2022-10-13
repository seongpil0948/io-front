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
        console.log("vue-loader tap options: ", options);
        return options;
      });
    config.module.rule("js").use("babel-loader");
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
        dirs: ["src/component", "src/view"],
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
