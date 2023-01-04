import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import eslintPlugin from "vite-plugin-eslint";
import vueJsx from "@vitejs/plugin-vue-jsx";

export default defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  optimizeDeps: {
    exclude: [
      // 여기에 넣으면 모듈을 아예 불러오질 못함..
      // "danfojs",
      // "firebase"
      "firebase-admin",
    ],
    include: ["@io-boxies/js-lib", "@io-boxies/vue-lib"],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@io-boxies/js-lib")) {
            return "@io-boxies/js-lib";
          } else if (id.includes("lodash")) {
            return "lodash";
          } else if (id.includes("axios")) {
            return "axios";
          } else if (id.includes("date-fns")) {
            return "date-fns";
          } else if (id.includes("naive-ui")) {
            return "naive-ui";
          } else if (id.includes("bootpay")) {
            return "bootpay";
          } else if (id.includes("editorjs")) {
            return "editorjs";
          } else if (id.includes("vicons")) {
            return "vicons";
          } else if (id.includes("danfojs")) {
            return "danfojs";
          } else if (id.includes("mathjs")) {
            return "mathjs";
          } else if (id.includes("table/dist")) {
            return "table";
          } else if (id.includes("juggle")) {
            return "juggle";
          } else if (id.includes("/@vue/")) {
            return "vue";
          } else if (id.includes("vue-logger-plugin")) {
            return "vue-logger-plugin";
          } else if (id.includes("tensorflow")) {
            return "tensorflow";
          } else if (id.includes("xlsx")) {
            return "xlsx";
          } else if (id.includes("babel")) {
            return "babel";
          } else if (id.includes("seedrandom")) {
            return "seedrandom";
          } else if (id.includes("node_modules")) {
            // console.log("id: ", id);
            return "node_modules";
          }
        },
      },
    },
  },
  plugins: [
    vue(),
    vueJsx(),
    Components({
      extensions: ["vue", "md", "svg", "tsx"],
      // directoryAsNamespace: true,
      dts: true,
      // globalNamespaces: ["global"],
      dirs: ["src/component", "src/view"],
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
      include: [/\.vue$/, /\.md$/, /\.vue\?vue/, /\.tsx/],
      resolvers: [
        NaiveUiResolver(),
        // (name) => {
        //   console.log("name:", name);
        //   if (name === "MyCustom")
        //     return path
        //       .resolve(__dirname, "src/CustomResolved.vue")
        //       .replaceAll("\\", "/");
        // },
        // IconsResolver({
        //   componentPrefix: "i",
        // }),
      ],
    }),
    eslintPlugin(),
  ],
});
// const chunkModules = [
//   "lodash",
//   "axios",
//   "date-fns",
//   "naive-ui",
//   "bootpay",
//   "editorjs",
//   "vicons",
//   "danfojs",
//   "mathjs",
//   "table/dist",
//   "juggle",
//   "@vue",
//   "tensorflow",
//   "xlsx",
//   "babel",
//   "seedrandom",
//   "node_modules",
//   "sass",
//   "prettier",
//   "typescript",
//   "vite",
// ];
