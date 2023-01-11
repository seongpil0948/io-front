import { defineComponent, ref } from "vue";
import {
  NSpace,
  NImage,
  NH2,
  NButton,
  NForm,
  NFormItem,
  FormInst,
  NInput,
  FormRules,
  NIcon,
  NAvatar,
  NTooltip,
} from "naive-ui";
import { EmailOutlined } from "@vicons/material";
import { GoogleOutlined } from "@vicons/antd";
import { type IO_ENV } from "@io-boxies/js-lib";
import {
  LoginReturn,
  emailRule,
  pwRule,
  useEventListener,
} from "@io-boxies/vue-lib";
import { ioFireStore } from "@/plugin/firebase";
import { useLogin } from "./login";

export default defineComponent({
  name: "LoginView",
  props: {
    kakaoImgOtherPath: {
      type: String,
      required: true,
    },
    kakaoImgPath: {
      type: String,
      required: true,
    },
    logoImgPath: {
      type: String,
      required: true,
    },
    env: {
      type: String,
      required: true,
    },
    logoStyle: {
      type: Object,
      default: () => {},
    },
    customTokenUrl: {
      type: String,
      required: true,
    },
  },
  emits: {
    onLogin(data: LoginReturn | undefined) {
      return data !== undefined && data !== null;
    },
    onInternalError(data: any) {
      return data;
    },
  },
  setup(props, { emit }) {
    const { onKakaoLogin, googleLogin, emailLogin } = useLogin(
      props.env as IO_ENV,
      props.customTokenUrl
    );
    const formRef = ref<FormInst | null>(null);
    const modelRef = ref<ModelType>({
      email: null,
      password: null,
    });
    const rules = {
      email: emailRule,
      password: pwRule,
    };
    async function onEmailSubmit() {
      formRef.value?.validate(async (errors) => {
        if (errors || !modelRef.value.email || !modelRef.value.password)
          throw new Error("올바르게 작성 해주세요");
        const defaultResult: LoginReturn = {
          toSignup: false,
          noConfirm: false,
          wrongPassword: false,
          params: {
            providerId: "EMAIL",
            email: modelRef.value.email,
            password: modelRef.value.password,
          },
        };
        const result = await emailLogin(
          ioFireStore,
          modelRef.value.email,
          modelRef.value.password
        );
        if (result) emit("onLogin", result);
        else emit("onLogin", defaultResult);
      });
    }
    useEventListener(
      () => document.querySelector("#app"),
      "keyup",
      async (evt: KeyboardEvent) => {
        if (evt.key === "Enter") {
          await onEmailSubmit();
        }
      }
    );

    return {
      onKakaoLogin,
      googleLogin,
      modelRef,
      rules,
      onEmailSubmit,
      formRef,
    };
  },
  render() {
    const {
      kakaoImgPath,
      logoImgPath,
      onKakaoLogin,
      googleLogin,
      modelRef,
      rules,
      onEmailSubmit,
      kakaoImgOtherPath,
    } = this;
    const logoStyle = Object.assign(
      { width: "150px", height: "150px" },
      this.logoStyle
    );
    return (
      <NSpace
        vertical
        align="center"
        justify="center"
        style={{ width: "90vw", "text-align": "center" }}
        itemStyle={{ width: "100%" }}
      >
        {{
          default: () => [
            <NImage style={logoStyle} src={logoImgPath} />,
            <NH2 style={{ "font-size": "3rem" }}>
              {{ default: () => "IN OUT BOX" }}
            </NH2>,
            <NForm
              ref="formRef"
              model={modelRef}
              rules={rules as unknown as FormRules}
            >
              {{
                default: () => [
                  <NFormItem first path="email" showLabel={false}>
                    <NInput
                      size="large"
                      round
                      placeholder="이메일 입력"
                      value={modelRef.email}
                      onUpdateValue={(val) => (modelRef.email = val)}
                      data-test="input-email"
                    ></NInput>
                  </NFormItem>,
                  <NFormItem showLabel={false} path="password">
                    <NInput
                      size="large"
                      round
                      placeholder="비밀번호 입력"
                      value={modelRef.password}
                      onUpdateValue={(val) => (modelRef.password = val)}
                      type="password"
                      data-test="input-pw"
                    ></NInput>
                  </NFormItem>,
                  <NButton
                    class="text-login-btn"
                    onClick={onEmailSubmit}
                    ghost={true}
                    style={{
                      height: "4vw",
                      "max-height": "3vw",
                      width: "10vw",
                      "min-height": "40px",
                      "min-width": "100px",
                      "margin-bottom": "3%",
                    }}
                    size="large"
                    data-test="email-submit"
                  >
                    {{
                      default: () => "로그인",
                    }}
                  </NButton>,
                ],
              }}
            </NForm>,
            <NSpace justify="center">
              {{
                default: () => [
                  <NTooltip>
                    {{
                      trigger: () => (
                        <NButton
                          circle
                          class="email-btn login-btn"
                          onClick={onEmailSubmit}
                          color="rgba(255, 255, 47, 0.7)"
                          style={loginBtnStyle}
                          size="large"
                        >
                          {{
                            icon: () => (
                              <NIcon size="35" component={EmailOutlined} />
                            ),
                          }}
                        </NButton>
                      ),
                      default: () => "이메일로 로그인",
                    }}
                  </NTooltip>,
                  <NTooltip>
                    {{
                      trigger: () => (
                        <NButton
                          circle
                          class="login-btn google-login-btn"
                          style={loginBtnStyle}
                          onClick={async () => {
                            try {
                              this.$emit(
                                "onLogin",
                                await googleLogin(ioFireStore)
                              );
                            } catch (e) {
                              this.$emit("onInternalError", e);
                            }
                          }}
                          color="rgba(255, 255, 47, 0.7)"
                          size="large"
                        >
                          {{
                            icon: () => (
                              <NIcon size="35" component={GoogleOutlined} />
                            ),
                          }}
                        </NButton>
                      ),
                      default: () => "구글 로그인",
                    }}
                  </NTooltip>,
                  <NTooltip>
                    {{
                      trigger: () => (
                        <NAvatar
                          round
                          class="login-btn kakao-login-btn"
                          style={kakaoBtnStyle}
                          onClick={async () => {
                            try {
                              this.$emit(
                                "onLogin",
                                await onKakaoLogin(ioFireStore, "login")
                              );
                            } catch (e) {
                              this.$emit("onInternalError", e);
                            }
                          }}
                          size="large"
                          src={kakaoImgPath}
                        />
                      ),
                      default: () => "카카오톡 로그인",
                    }}
                  </NTooltip>,
                  <NTooltip>
                    {{
                      trigger: () => (
                        <NAvatar
                          round
                          class="login-btn kakao-login-btn kakao-login-btn-other"
                          style={kakaoBtnStyle}
                          onClick={async () => {
                            try {
                              this.$emit(
                                "onLogin",
                                await onKakaoLogin(ioFireStore, "loginForm")
                              );
                            } catch (e) {
                              this.$emit("onInternalError", e);
                            }
                          }}
                          size="large"
                          src={kakaoImgOtherPath}
                        />
                      ),
                      default: () => "카카오톡 다른계정으로 로그인",
                    }}
                  </NTooltip>,
                ],
              }}
            </NSpace>,

            // <NImage
            //   onClick={async () => this.$emit("onLogin", await googleLogin())}
            //   previewDisabled
            //   objectFit="contain"
            //   class="login-btn google-login-btn"
            //   src={googleImgPath}
            // ></NImage>,
            // <NImage
            //   onClick={async () =>
            //     this.$emit("onLogin", await onKakaoLogin("login"))
            //   }
            //   previewDisabled
            //   class="login-btn kakao-login-btn"
            //   src={kakaoImgPath}
            // ></NImage>,
          ],
        }}
      </NSpace>
    );
  },
});

interface ModelType {
  email: string | null;
  password: string | null;
}

const kakaoBtnStyle = {
  "background-color": "rgba(255, 255, 47, 0.7)",
  padding: "0.7rem",
  cursor: "pointer",
};
const loginBtnStyle = {
  padding: "2rem",
};
