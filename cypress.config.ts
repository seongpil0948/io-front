import { defineConfig } from "cypress";

const viewportWidth = 1280;
const viewportHeight = 800;

export default defineConfig({
  component: {
    devServer: {
      framework: "vue",
      bundler: "vite",
    },
  },
  viewportWidth,
  viewportHeight,
  e2e: {
    // This will automatically prefix cy.visit() and cy.request() commands with this baseUrl.
    // FIXME: by Env
    // baseUrl: "http://localhost:5173",
    baseUrl: "https://io-box--dev-pcug7p0p.web.app",
    // modifyObstructiveCode: true,
    // testIsolation: false,
    setupNodeEvents(on, config) {
      on("before:browser:launch", (browser, launchOptions) => {
        if (browser.name === "chrome" && browser.isHeadless) {
          // fullPage screenshot size is 1400x1200 on non-retina screens
          // and 2800x2400 on retina screens
          launchOptions.args.push(
            `--window-size=${viewportWidth},${viewportHeight}`
          );

          // force screen to be non-retina (1400x1200 size)
          // launchOptions.args.push('--force-device-scale-factor=1')
        }

        if (browser.name === "electron" && browser.isHeadless) {
          // fullPage screenshot size is 1400x1200
          launchOptions.preferences.width = viewportWidth;
          launchOptions.preferences.height = viewportHeight;
        }

        if (browser.name === "firefox" && browser.isHeadless) {
          // menubars take up height on the screen
          // so fullPage screenshot size is 1400x1126
          launchOptions.args.push(`--width=${viewportWidth}`);
          launchOptions.args.push(`--height=${viewportHeight}`);
        }

        return launchOptions;
      });
    },
    // chromeWebSecurity: false,
  },
});
