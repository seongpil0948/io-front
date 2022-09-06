import { IoUser } from "../../../../src/composable/auth/model/user";

export const getMockShops = () => [
  new IoUser({
    userInfo: {
      displayName: "성필",
      role: "SHOP",
      passed: true,
      email: "qwepoi3218@naver.com",
      userName: "성필 소매",
      profileImg:
        "http://k.kakaocdn.net/dn/K9jx2/btrEZc1wp4r/ryTD2FVs9nS8mOsprKn8Ik/img_640x640.jpg",

      providerId: "KAKAO",
      fcmTokens: [],
      emailVerified: false,
      userId: "2285273867",
    },
    companyInfo: {
      companyPhone: "ㄴㅇ",
      ceoName: "ㅁㄴㅇ",
      companyCertificate: [
        "https://firebasestorage.googleapis.com/v0/b/io-box.appspot.com/o/userId%2F2285273867%2Fce38be78-3c58-4c23-a5a6-927e719e4891?alt=media&token=b977ed64-2638-43cd-ae58-515388bfbd6f",
      ],
      ceoPhone: "ㅁㄴㅇ",
      companyNo: "231450152",
      locations: [],
      shopLink: "ㅁㄴㅇ",
      managerName: "ㅍㅌ",
      emailTax: "inoutbox@gmail.com",
      companyName: "쇼핑상호",
      managerPhone: "ㅇ",
    },
    operInfo: {
      saleAverage: "300~1,000",
      purchaseMethod: "엉클",
    },
    preferDark: true,
  }),
];
