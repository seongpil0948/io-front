import { FormInst } from "naive-ui";
import { ref } from "vue";

import { EmailModelType } from "@/component/common/login/login";
import { emailRule, pwRule } from "@io-boxies/vue-lib";
export function useEmailPwForm() {
  const emailFormRef = ref<FormInst | null>(null);
  const emailModel = ref<EmailModelType>({
    email: null,
    password: null,
  });
  const rules = {
    email: emailRule,
    password: pwRule,
  };
  return {
    emailFormRef,
    emailModel,
    rules,
  };
}
