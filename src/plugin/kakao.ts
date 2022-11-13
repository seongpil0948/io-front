import type { App } from "vue";
// https://github.com/eggplantiny/vue-kakao-sdk/blob/main/src/main.js
// https://developers.kakao.com/sdk/reference/js/release/Kakao.Auth.html

function initialized() {
  if (!window.Kakao) {
    return false;
  }

  if (Object.keys(window.Kakao).length === 0) {
    return false;
  }

  return window.Kakao.isInitialized();
}

function initializeScript(
  scriptUrl: string,
  scriptId: string,
  apiKey: string
): Promise<void> {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.defer = true;
    script.onload = () => {
      if (!initialized()) {
        window.Kakao.init(apiKey);
      }

      resolve();
    };

    script.onerror = (error) => {
      throw new Error(
        `Error while initializeScript(KAKAO) ERROR: ${JSON.stringify(error)}`
      );
    };
    script.id = scriptId;
    document.body.appendChild(script);
  });
}

export default {
  install(
    app: App,
    options: {
      apiKey: string;
      scriptUrl?: string;
      scriptId?: string;
      callback?: () => void;
    }
  ) {
    //https://devtalk.kakao.com/t/javascript-sdk-v1-notice-change-on-the-download-link-for-javascript-sdk-v1/125629
    const scriptUrl =
      options.scriptUrl ??
      "https://t1.kakaocdn.net/kakao_js_sdk/v1/kakao.min.js";
    const scriptId = options.scriptId ?? "kakao_script";
    const callback = options.callback ?? null;
    const initializedScript = initialized();

    if (!initializedScript) {
      initializeScript(scriptUrl, scriptId, options.apiKey)
        .then(() => {
          if (typeof callback === "function") {
            callback();
          }
        })
        .finally(() => {
          if (app && app.config && app.config.globalProperties) {
            app.config.globalProperties.$kakao = window.Kakao;
          }
        });
    }
  },
};
