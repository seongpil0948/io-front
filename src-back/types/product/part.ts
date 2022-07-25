type GENDOR = "MALE" | "FEMALE" | "UNISEX";
const GENDOR: { [key in GENDOR]: GENDOR } = Object.freeze({
  MALE: "MALE",
  FEMALE: "FEMALE",
  UNISEX: "UNISEX",
  KIDS: "KIDS",
});

type PART = "TOP" | "BOTTOM" | "OUTER" | "DRESS" | "SHOES" | "BAG" | "ETC";
const PART: { [key in PART]: PART } = Object.freeze({
  TOP: "TOP",
  BOTTOM: "BOTTOM",
  OUTER: "OUTER",
  DRESS: "DRESS",
  SHOES: "SHOES",
  BAG: "BAG",
  ETC: "ETC",
});
const CATEGORIES: { [key in PART]: { [ctgr: string]: string } } = Object.freeze(
  {
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
    },
    BOTTOM: {
      JEAN: "JEANS",
      LEGGINGS: "LEGGINGS",
      PANTS: "PANTS",
      SHORTS: "SHORTS",
      SKIRTS: "SKIRTS",
      TRAINNING_PANT: "TRAINNING_PANT",
    },
    OUTER: {
      BLAZER: "BLAZER",
      CARDIGAN: "CARDIGAN",
      COAT: "COAT",
      JACKET: "JACKET",
      PUFFER_DOWN: "PUFFER_DOWN",
      VEST: "VEST",
    },
    DRESS: {
      DRESS: "DRESS",
      JUMP_SUIT: "JUMP_SUIT",
      WEDDING_DRESS: "WEDDING_DRESS",
    },
    SHOES: {
      SLIPPERS: "SLIPPERS", // 슬리퍼
      SANDALS: "SANDALS", // 샌달
      BOOTS: "BOOTS", // 부츠
      PUMPS: "PUMPS", // 고리나 끈, 잠금 장치 등이 없고 발등 부분이 드러나게 깊이 파져 있는 여성용 구두.
      FLATS: "FLATS",
      LOAFERS: "LOAFERS",
      ATHLETIC: "ATHLETIC",
    },
    BAG: {
      BACKPACK: "BACKPACK",
      CROSS: "CROSS",
      HANDBAG: "HANDBAG",
      MINIBAG: "MINIBAG",
      TOD_BAG: "TOD_BAG",
      ECO_BAG: "ECO_BAG",
    },
    ETC: {
      NECKLASE: "NECKLASE",
      RING: "RING",
      WATCH: "WATCH",
      SCARP: "SCARP",
      ETC: "ETC",
    },
  }
);
export { PART, CATEGORIES, GENDOR };
