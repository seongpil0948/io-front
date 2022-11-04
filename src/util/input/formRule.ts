import type { FormRules } from "naive-ui";
import {
  email as emailValidator,
  password as pwValidator,
  length as lenValidator,
  checkInRange,
  checkNotNull,
  okNullPassword,
  lengthEqual,
} from "./validators";

export const nameLenRule = {
  validator: (rule: FormRules, value: string) => lenValidator(value),
  required: true,
  trigger: ["blur", "input"],
  message: "필수 입력 사항 입니다.",
};
export const strLenRule = (len: number) => {
  return {
    validator: (rule: FormRules, value: string) => lenValidator(value, len),
    required: true,
    trigger: ["blur", "input"],
    message: `${len} 이상의 길이여야 합니다.`,
  };
};
export const strLenEqualRule = (len: number) => {
  return {
    validator: (rule: FormRules, value: string) => lengthEqual(value, len),
    required: true,
    trigger: ["blur", "input"],
    message: `${len} 길이여야 합니다.`,
  };
};
export const pwRule = {
  validator: (rule: FormRules, value: string) => pwValidator(value),
  required: true,
  trigger: ["blur", "input"],
  message: "영문, 숫자 포함 6자리 이상만 가능합니다.",
};
export const okNullPwRule = {
  validator: (rule: FormRules, value: string) => okNullPassword(value),
  required: true,
  trigger: ["blur", "input"],
  message: "빈 값 혹은 영문, 숫자 포함 6자리 이상만 가능합니다.",
};
export const pwLenRule = {
  validator: (rule: FormRules, value: string) => lenValidator(value),
  required: true,
  trigger: ["blur", "input"],
  message: "1개 이상의 값을 입력 해주세요.",
};
export const emailLenRule = {
  validator: (rule: FormRules, value: string) => emailValidator(value),
  required: true,
  trigger: ["blur", "input"],
  message: "유효한 이메일 주소를 입력 해주세요.",
};
export const emailRule = {
  validator: (rule: FormRules, value: string) => emailValidator(value),
  required: true,
  trigger: ["blur", "input"],
  message: "유효한 이메일 주소를 입력 해주세요.",
};
export const range100Rule = {
  validator: (rule: FormRules, value: number) => checkInRange(value, 0, 100),
  required: true,
  trigger: ["blur", "input"],
  message: "0 ~ 100 사이의 숫자를 입력 해주세요.",
};
export const range1to100Rule = {
  validator: (rule: FormRules, value: number) => checkInRange(value, 1, 100),
  required: true,
  trigger: ["blur", "input"],
  message: "1 ~ 100 사이의 숫자를 입력 해주세요.",
};
export const range60Rule = {
  validator: (rule: FormRules, value: number) => checkInRange(value, 0, 60),
  required: true,
  trigger: ["blur", "input"],
  message: "0 ~ 60 사이의 숫자를 입력 해주세요.",
};
export const range1to60Rule = {
  validator: (rule: FormRules, value: number) => checkInRange(value, 1, 60),
  required: true,
  trigger: ["blur", "input"],
  message: "1 ~ 60 사이의 숫자를 입력 해주세요.",
};
export const range15to45Rule = {
  validator: (rule: FormRules, value: number) => checkInRange(value, 15, 45),
  required: true,
  trigger: ["blur", "input"],
  message: "15 ~ 45 사이의 숫자를 입력 해주세요.",
};
export const range12to36Rule = {
  validator: (rule: FormRules, value: number) => checkInRange(value, 12, 36),
  required: true,
  trigger: ["blur", "input"],
  message: "12 ~ 36 사이의 숫자를 입력 해주세요.",
};
export const range10to100Rule = {
  validator: (rule: FormRules, value: number) => checkInRange(value, 10, 100),
  required: true,
  trigger: ["blur", "input"],
  message: "10 ~ 100 사이의 숫자를 선택 해주세요.",
};
export const range5Rule = {
  validator: (rule: FormRules, value: number) => checkInRange(value, 0, 5),
  required: true,
  trigger: ["blur", "input"],
  message: "0 ~ 5 사이의 숫자를 입력 해주세요.",
};
export const arrLenRule = (len: number) => {
  return {
    validator: (rule: FormRules, value: string) => lenValidator(value, len),
    required: true,
    trigger: ["blur", "input"],
    message: `${len}개 이상의 값을 입력 해주세요.`,
  };
};
export const notNullRule = {
  validator: (rule: FormRules, value: string) => checkNotNull(value),
  required: true,
  trigger: ["blur", "input"],
  message: "값을 입력 해주세요.",
};

export const biggerThanNRule = (n: number) => {
  return {
    validator: (rule: FormRules, value: string) => {
      try {
        const inputN = parseInt(value);
        return inputN > n;
      } catch (e) {
        return false;
      }
    },
    required: true,
    trigger: ["blur", "input"],
    message: `${n}초과의 값을 입력 해주세요.`,
  };
};
