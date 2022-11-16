import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";

export default defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  optimizeDeps: {
    // exclude: ["danfojs"],
  },
  build: {
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
        } else if (id.includes("firebase/messaging")) {
          return "firebase/messaging";
        } else if (id.includes("firebase/firestore")) {
          return "firebase/firestore";
        } else if (id.includes("firebase/storage")) {
          return "firebase/storage";
        } else if (id.includes("firebase/analytics")) {
          return "firebase/analytics";
        } else if (id.includes("node_modules")) {
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
  ],
});
