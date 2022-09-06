import { IoUser } from "../../../../src/composable/auth/model/user";

export const getMockUncles = () => [
  new IoUser({
    userInfo: {
      passed: true,
      role: "UNCLE",
      updatedAt: new Date(),
      userName: "엉클매장",
      createdAt: new Date(),
      email: "haifilm@naver.com",
      providerId: "KAKAO",
      fcmTokens: [
        "cU0vn3g-v8obRu8xPVl1TX:APA91bFB4pIP0_RSEGcQtheARFL2XqVr-BOC9GzBvZDkJBJALbbPCR8rp-krpT63WHeamBwqACNiX_ij_aDoJr6MXIli4zxdR0rke4Ngcqyq5t9vgCCKf58C2ii4jziwUUmNxoqcBps3",
        "d3HyWEKvVjHiD_jeg2IHyS:APA91bGb7YMzRaBXV6oGKOLjcsYmS50WeunAfmk4L_YcaqOEEq21O3fiEB3wq_HbOuzCRJGaLUaRULq4Z-TMLgHCeuNyN_vo6Luz2T91FBYS54bPMXAafPWV_cXFPgvfSGJMZFvjj6o5",
      ],
      emailVerified: false,
      userId: "2301651985",
      profileImg:
        "http://k.kakaocdn.net/dn/b473Zh/btqWc9VKnOh/NfYC7DXUgjv9m0zWRPSlU0/img_640x640.jpg",
      displayName: "엉클닉네임",
    },
    companyInfo: {
      ceoName: "주네",
      managerPhone: "12421512",
      locations: [],
      managerName: "송주네",
      ceoPhone: "123214",
      companyName: "엉클상호",
      shopLink: "www.naver.com",
      companyCertificate: [
        "https://firebasestorage.googleapis.com/v0/b/io-box.appspot.com/o/userId%2F2301651985%2F7b681f46-2c62-4d2a-bade-5d8341881dba?alt=media&token=fa4f2fed-5a96-49bc-998a-79ac597ec29c",
      ],
      companyNo: "2314124124",
      emailTax: "inoutbox@gmail.com",
      companyPhone: "13124512",
    },
    operInfo: undefined,
    preferDark: true,
  }),
];
