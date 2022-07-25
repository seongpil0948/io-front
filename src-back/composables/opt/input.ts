import {
  CATEGORIES,
  FreeSize,
  GarmentSize,
  GENDOR,
  LocateType,
  PART,
  PROD_SIZE,
  SHIP_METHOD,
  ShoesSize,
} from "@/types";
import { computed } from "vue";
import { range } from "../common";

export const gendorOpts = Object.keys(GENDOR).map((x) => {
  return { label: x, value: x };
});
export const partOpts = Object.keys(PART).map((x) => {
  return { label: x, value: x };
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

export const getCtgrOpts = (part: PART) =>
  Object.keys(CATEGORIES[part]).map((x) => {
    return { label: x, value: x };
  });
export const getSizeOpts = (part: PART) => {
  let obj: PROD_SIZE[] = [];
  if (
    part === PART.TOP ||
    part === PART.BOTTOM ||
    part === PART.DRESS ||
    part === PART.OUTER
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
  ["100~500", "500~1,000", "1,000~3,000", "3,000~"].map((k) => {
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
  Object.keys(LocateType).map((l) => {
    return { label: LocateType[l], value: l };
  })
);

export const deadOpt = rangeOpts(1, 32, (n) => `${n}일`);
