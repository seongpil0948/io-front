import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import eslintPlugin from "vite-plugin-eslint";

export default defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  optimizeDeps: {
    // exclude: ["danfojs", "firebase"],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
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
        }
        // else if (id.includes("firebase/messaging")) {
        //   return "firebase";
        // } else if (id.includes("firebase/firestore")) {
        //   return "firebase";
        // } else if (id.includes("firebase/storage")) {
        //   return "firebase";
        // } else if (id.includes("firebase/analytics")) {
        //   return "firebase";
        // } else if (id.includes("firebase/auth")) {
        //   return "firebase";
        // }
        else if (id.includes("bootpay")) {
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
        } else if (id.includes("firebase")) {
          return "firebase/other";
        } else if (id.includes("node_modules")) {
          // console.log("id: ", id);
          return "node_modules";
        }
      },
    },
  },
  plugins: [
    vue(),
    Components({
      extensions: ["vue", "md", "svg"],
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
      include: [/\.vue$/, /\.md$/, /\.vue\?vue/],
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
