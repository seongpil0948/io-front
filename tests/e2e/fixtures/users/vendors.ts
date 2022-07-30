import { IoUser } from "@/composable/auth/model";

export const getMockVendors = () => [
  new IoUser({
    userInfo: {
      passed: true,
      userId: "2302292996",
      userName: "성필 도매",
      fcmTokens: [],
      profileImg:
        "http://k.kakaocdn.net/dn/dpk9l1/btqmGhA2lKL/Oz0wDuJn1YV2DIn92f6DVK/img_640x640.jpg",
      providerId: "KAKAO",
      email: "seongpil0948@gmail.com",
      emailVerified: false,
      role: "VENDOR",
      displayName: "성필",
    },
    companyInfo: {
      companyNo: "01012310-49108",
      locations: [],
      companyPhone: "124214",
      emailTax: "seongpil0948@gmail.com",
      ceoName: "124124",
      companyCertificate: [
        "https://firebasestorage.googleapis.com/v0/b/io-box.appspot.com/o/userId%2F2302292996%2Fed2f5cc2-9a1f-4cf2-9d66-b1523c42edfa?alt=media&token=5b9169e2-5cd4-4b9e-9111-a49f642c39f1",
      ],
      managerPhone: "12412",
      managerName: "124142",
      companyName: "성필 코퍼",
      shopLink: "24145",
      ceoPhone: "21414",
    },
    operInfo: {
      taxDeadlineDay: 4,
      saleManageType: "수기",
      autoOrderApprove: false,
      expectNumProdMonthly: "100~500",
    },
    account: {
      account: "3520289183853",
      name: "최성필",
      bankName: "신한",
    },
    preferDark: true,
  }),
  new IoUser({
    userInfo: {
      userId: "2308576882",
      fcmTokens: [],
      userName: "dazzytest",
      displayName: "때찌테스트",
      email: "jiwooon0316@naver.com",
      profileImg:
        "http://k.kakaocdn.net/dn/bixNRa/btrpoVt3hGe/IBvB6VbOo28nRsTHgtk7Gk/img_640x640.jpg",
      providerId: "KAKAO",
      passed: true,
      role: "VENDOR",
      emailVerified: false,
    },
    companyInfo: {
      ceoName: " ",
      managerName: " ",
      ceoPhone: " ",
      locations: [],
      companyNo: " ",
      companyPhone: " ",
      managerPhone: " ",
      emailTax: "haifilm@naver.com",
      shopLink: " ",
      companyCertificate: [
        "https://firebasestorage.googleapis.com/v0/b/io-box.appspot.com/o/userId%2F2308576882%2Fd24cf8b6-82ea-498d-88d1-508422a2b73a?alt=media&token=deb0b92d-80c2-4b81-8858-91fc9eaee516",
      ],
      companyName: "때찌도매테스트",
    },
    operInfo: {
      taxDeadlineDay: 1,
      saleManageType: "수기",
      autoOrderApprove: false,
      expectNumProdMonthly: "100~500",
    },
    account: {
      account: "3520289183853",
      name: "최성필",
      bankName: "신한",
    },
    preferDark: true,
  }),
];
