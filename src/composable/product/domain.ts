import { OutputData } from "@editorjs/editorjs/types/data-formats";
import { ShopGarment, VendorGarment } from ".";

export type PROD_TYPE = "GARMENT" | "GROCERY";

export interface ProductCrt {
  createdAt?: Date;
  updatedAt?: Date;
  info: string | OutputData;
  description: string;
  TBD: { [k: string]: any };
  prodType: PROD_TYPE;
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

export interface ShopVendorGarment {
  vendorGarment: VendorGarment;
  shopGarment: ShopGarment;
}

export const GarmentSize: PRODUCT_SIZE[] = [
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
export const ShoesSize: PRODUCT_SIZE[] = [
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
export const FreeSize: PRODUCT_SIZE[] = ["FREE"];
export type PRODUCT_SIZE =
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

export const PRODUCT_SIZE: { [key in PRODUCT_SIZE]: PRODUCT_SIZE } =
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
  | "HAT"
  | "ETC";
export const PART: { [key in PART]: PART } = Object.freeze({
  TOP: "TOP",
  BOTTOM: "BOTTOM",
  OUTER: "OUTER",
  DRESS: "DRESS",
  SHOES: "SHOES",
  BAG: "BAG",
  HAT: "HAT",
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
      SLACKS: "SLACKS",
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
      SUIT: "SUIT",
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
      WEDGE_HEEL: "WEDGE_HEEL",
      HAND_MADE: "HAND_MADE",
      DRESS: "DRESS",
      ETC: "ETC",
    },
    BAG: {
      BACKPACK: "BACKPACK",
      LEATHER: "LEATHER",
      CROSS: "CROSS",
      CLUTCH: "CLUTCH",
      HANDBAG: "HANDBAG",
      MINI_BAG: "MINI_BAG",
      TOD_BAG: "TOD_BAG",
      ECO_BAG: "ECO_BAG",
      SHOULDER: "SHOULDER",
      WALLET: "WALLET",
      ETC: "ETC",
    },
    ACCESSORY: {
      NECKLACE: "NECKLACE",
      RING: "RING",
      WATCH: "WATCH",
      SCARP: "SCARP",
      ETC: "ETC",
      BELT: "BELT",
      BAND: "BAND",
      GLASSES: "GLASSES",
      SUN_GLASSES: "SUN_GLASSES",
    },
    HAT: {
      ETC: "ETC",
      CAP: "CAP",
      FEDORA: "FEDORA",
      BERET: "BERET",
      FLOPPY: "FLOPPY",
      SNAPBACK: "SNAPBACK",
      BEANIE: "BEANIE",
      CLOCHE: "CLOCHE",
      TRAPPER: "TRAPPER",
      BUCKET: "BUCKET",
      BOATER: "BOATER",
    },
    ETC: {
      ETC: "ETC",
      TOP_BOTTOM_SET: "TOP_BOTTOM_SET",
      SUIT_SET: "SUIT_SET",
      BIG_SIZE: "BIG_SIZE",
      MATERNITY: "MATERNITY",
    },
  });
