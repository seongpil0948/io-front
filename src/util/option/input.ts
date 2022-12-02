import { GENDER, PART } from "./../../composable/product/domain";
import {
  CATEGORIES,
  CtgrDict,
  FreeSize,
  GarmentSize,
  LOCALE,
  PartDict,
  PRODUCT_SIZE,
  ShoesSize,
} from "@/composable";
import { PAY_METHOD } from "@/composable/payment/domain";
import { range } from "lodash";
import { computed } from "vue";
import { LocateType, SHIP_METHOD } from "@io-boxies/js-lib";

export const genderOpts = Object.keys(GENDER).map((x) => {
  return { label: x, value: x };
});
export const partOpts = (locale: LOCALE = "ko") =>
  Object.keys(PART).map((x) => {
    return { label: PartDict[locale][x as PART], value: x };
  });

export function rangeOpts(
  start: number,
  end: number,
  label: (n: number) => void
) {
  return computed(() =>
    range(1, 32).map((x) => {
      return { label: label(x), value: x };
    })
  );
}

export const getCtgrOpts = (part: PART, locale: LOCALE = "ko") =>
  Object.keys(CATEGORIES[part]).map((x) => {
    return { label: CtgrDict[locale][x], value: x };
  });
export const getSizeOpts = (part: PART) => {
  let obj: PRODUCT_SIZE[] = [];
  if (
    part === PART.TOP ||
    part === PART.BOTTOM ||
    part === PART.DRESS ||
    part === PART.OUTER ||
    part === PART.HAT
  ) {
    obj = GarmentSize;
  } else if (part === PART.SHOES) {
    obj = ShoesSize;
  } else {
    obj = FreeSize;
  }
  return obj.map((x) => {
    return { label: x, value: x };
  });
};

export const saleAvgOpt = computed(() =>
  ["0~300", "300~1,000", "1,000~5,000", "5,000~10,000", "10,000~"].map((k) => {
    return { label: k, value: k };
  })
);
export const newProdQuantityOpt = computed(() =>
  ["10~100", "100~300", "300~1000", "1,000~3,000", "3,000~"].map((k) => {
    return { label: k, value: k };
  })
);
export const shipMethodOpt = computed(() =>
  Object.keys(SHIP_METHOD).map((k) => {
    return {
      label: SHIP_METHOD[k as SHIP_METHOD],
      value: SHIP_METHOD[k as SHIP_METHOD],
    };
  })
);

export const locateTypeOpt = computed(() =>
  Object.keys(LocateType).map((l: string) => {
    return { label: LocateType[l as LocateType], value: l };
  })
);

export const deadOpt = rangeOpts(1, 32, (n) => `${n}일`);

export const payMethodOpts = [
  {
    label: "현금",
    value: PAY_METHOD.CASH,
  },
  {
    label: "입금",
    value: PAY_METHOD.DEPOSIT,
  },
];
