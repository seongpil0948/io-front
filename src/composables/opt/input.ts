import {
  CATEGORIES,
  FreeSize,
  GarmentSize,
  GENDOR,
  PART,
  PROD_SIZE,
  ShoesSize,
} from "@/types";

export const gendorOpts = Object.keys(GENDOR).map((x) => {
  return { label: x, value: x };
});
export const partOpts = Object.keys(PART).map((x) => {
  return { label: x, value: x };
});

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
