import { OutputData } from "@editorjs/editorjs/types/data-formats";

export interface ProductCrt {
  createdAt?: Date;
  updatedAt?: Date;
  info: string | OutputData;
  description: string;
  TBD: { [k: string]: any };
}
export interface VendorProdCrt extends ProductCrt {
  vendorId: string;
  vendorProdId: string;
  vendorProdPkgId: string;
  vendorPrice: number;
  stockCnt: number;
  vendorProdName: string;
  titleImgs: string[];
  bodyImgs: string[];
}

export const GarmentSize: GARMENT_SIZE[] = [
  "FREE",
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
];
export const ShoesSize: GARMENT_SIZE[] = [
  "200",
  "205",
  "210",
  "215",
  "220",
  "225",
  "230",
  "235",
  "240",
  "245",
  "250",
  "255",
  "260",
  "265",
  "270",
  "275",
  "280",
  "285",
  "290",
  "295",
  "300",
];
export const FreeSize: GARMENT_SIZE[] = ["FREE"];
export type GARMENT_SIZE =
  | "FREE"
  | "XXXS"
  | "XXS"
  | "XS"
  | "S"
  | "M"
  | "L"
  | "XL"
  | "XXL"
  | "XXXL"
  | "200"
  | "205"
  | "210"
  | "215"
  | "220"
  | "225"
  | "230"
  | "235"
  | "240"
  | "245"
  | "250"
  | "255"
  | "260"
  | "265"
  | "270"
  | "275"
  | "280"
  | "285"
  | "290"
  | "295"
  | "300"
  | "44"
  | "55"
  | "66"
  | "77"
  | "88";

export const GARMENT_SIZE: { [key in GARMENT_SIZE]: GARMENT_SIZE } =
  Object.freeze({
    FREE: "FREE",
    XXXS: "XXXS",
    XXS: "XXS",
    XS: "XS",
    S: "S",
    M: "M",
    L: "L",
    XL: "XL",
    XXL: "XXL",
    XXXL: "XXXL",
    "200": "200",
    "205": "205",
    "210": "210",
    "215": "215",
    "220": "220",
    "225": "225",
    "230": "230",
    "235": "235",
    "240": "240",
    "245": "245",
    "250": "250",
    "255": "255",
    "260": "260",
    "265": "265",
    "270": "270",
    "275": "275",
    "280": "280",
    "285": "285",
    "290": "290",
    "295": "295",
    "300": "300",
    "44": "44",
    "55": "55",
    "66": "66",
    "77": "77",
    "88": "88",
  });

export type GENDER = "MALE" | "FEMALE" | "UNISEX" | "KIDS";
export const GENDER: { [key in GENDER]: GENDER } = Object.freeze({
  MALE: "MALE",
  FEMALE: "FEMALE",
  UNISEX: "UNISEX",
  KIDS: "KIDS",
});

export type PART =
  | "TOP"
  | "BOTTOM"
  | "OUTER"
  | "DRESS"
  | "SHOES"
  | "BAG"
  | "ETC";
export const PART: { [key in PART]: PART } = Object.freeze({
  TOP: "TOP",
  BOTTOM: "BOTTOM",
  OUTER: "OUTER",
  DRESS: "DRESS",
  SHOES: "SHOES",
  BAG: "BAG",
  ETC: "ETC",
});
export const CATEGORIES: { [key in PART]: { [ctgr: string]: string } } =
  Object.freeze({
    TOP: {
      T_SHIRT: "T_SHIRT",
      BLOUSE: "BLOUSE",
      HOODIE: "HOODIE",
      SHIRT: "SHIRT",
      SLEEVELESS: "SLEEVELESS",
      KNIT: "KNIT",
      SWEATER: "SWEATER",
      SWEAT_SHIRT: "SWEAT_SHIRT",
      CARDIGAN: "CARDIGAN",
      KNIT_CARDIGAN: "KNIT_CARDIGAN",
      KNIT_T_SHIRT: "KNIT_T_SHIRT",
      ETC: "ETC",
    },
    BOTTOM: {
      JEAN: "JEANS",
      LEGGINGS: "LEGGINGS",
      PANTS: "PANTS",
      SHORTS: "SHORTS",
      SKIRTS: "SKIRTS",
      TRAINING_PANT: "TRAINING_PANT",
      ETC: "ETC",
    },
    OUTER: {
      BLAZER: "BLAZER",
      CARDIGAN: "CARDIGAN",
      COAT: "COAT",
      JACKET: "JACKET",
      PUFFER_DOWN: "PUFFER_DOWN",
      VEST: "VEST",
      ETC: "ETC",
    },
    DRESS: {
      DRESS: "DRESS",
      ONE_PIECE: "ONE_PIECE",
      JUMP_SUIT: "JUMP_SUIT",
      WEDDING_DRESS: "WEDDING_DRESS",
      ETC: "ETC",
    },
    SHOES: {
      SLIPPERS: "SLIPPERS", // 슬리퍼
      SANDALS: "SANDALS", // 샌달
      BOOTS: "BOOTS", // 부츠
      PUMPS: "PUMPS", // 고리나 끈, 잠금 장치 등이 없고 발등 부분이 드러나게 깊이 파져 있는 여성용 구두.
      FLATS: "FLATS",
      LOAFERS: "LOAFERS",
      ATHLETIC: "ATHLETIC",
      ETC: "ETC",
    },
    BAG: {
      BACKPACK: "BACKPACK",
      CROSS: "CROSS",
      HANDBAG: "HANDBAG",
      MINI_BAG: "MINI_BAG",
      TOD_BAG: "TOD_BAG",
      ECO_BAG: "ECO_BAG",
      ETC: "ETC",
    },
    ETC: {
      NECKLACE: "NECKLACE",
      RING: "RING",
      WATCH: "WATCH",
      SCARP: "SCARP",
      ETC: "ETC",
    },
  });
