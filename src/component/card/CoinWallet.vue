<script setup lang="ts">
import { computed, ref } from "vue";
import { useAuthStore } from "@/store";
import { QuestionCircleRegular } from "@vicons/fa";
import { ReqEncash, useUserPay } from "@/composable";
// import { Bootpay } from "@bootpay/client-js";
import { uuidv4 } from "@firebase/util";
// import { useLogger } from "vue-logger-plugin";
import { useMessage, NSpace, NText } from "naive-ui";
// import { formatDate, loadDate, locateToStr } from "@io-boxies/js-lib";
import { getIoCollection, ioFireStore } from "@/plugin/firebase";
import { doc, setDoc } from "@firebase/firestore";
import { feeCharge, feeEncash } from "@/constants";

// const inst = getCurrentInstance();
// const APP_ID = "62b45e0fe38c3000215aec6b";
const authStore = useAuthStore();
const user = computed(() => authStore.currUser());
const { userPay } = useUserPay(user.value.userInfo.userId);
// const log = useLogger();
// const uid = user.value.userInfo.userId;
const msg = useMessage();
// const dialog = useDialog();
// With PG
// async function reqPay() {
//   const uuid = uuidv4();
//   const date = new Date();
//   const price = chargePrice.value;
//   try {
//     const resp = await Bootpay.requestPayment({
//       price,
//       application_id: APP_ID,
//       order_name: `order in-coin ${chargePrice.value} 개`,
//       order_id: "charge_" + uuid, //고유 주문번호로, 생성하신 값을 보내주셔야 합니다
//       uuid,
//       user: {
//         id: uid,
//         username: user.value.userInfo.userName,
//         email: user.value.userInfo.email,
//         addr: user.value.companyInfo?.shipLocate
//           ? locateToStr(user.value.companyInfo?.shipLocate)
//           : undefined,
//         phone: user.value.userInfo.phone ?? "",
//       },
//       metadata: {
//         uid,
//         m: ee(price),
//       },
//       extra: {
//         separately_confirmed: true, // 승인(done) 전 서버확인(confirm) 이벤트가 호출됨
//         display_error_result: true,
//         test_deposit: true,
//         deposit_expiration: date
//           .toLocaleDateString()
//           .split(".")
//           .filter((x) => x)
//           .map((x) => x.trim())
//           .join("-"),
//       },
//     });
//     console.log("bootpay resp ", resp);
//     const pre = "in Bootpay.requestPayment >";
//     if (resp.event === "issued") {
//       log.warn(uid, pre + "issued");
//     } else if (resp.event === "confirm") {
//       console.log("in confirm", resp.receipt_id, "\n", resp.order_id);
//       const http = inst?.appContext.config.globalProperties.$http;
//       if (!http) {
//         return log.error(uid, pre + "confirm, $http is null");
//       }
//       const verifyResp = await http.get(
//         `/payment/verifyReceipt?price=${price}&receiptId=${resp.receipt_id}&order_id=${resp.order_id}`
//       );
//       console.log(null, "/payment/verifyReceipt Response: ", verifyResp);
//       const ok = verifyResp.data === "sp"; // 재고 수량 관리 로직 혹은 다른 처리
//       if (ok) {
//         const confirmedResp = await Bootpay.confirm(); //결제를 승인한다
//         console.log("confirmedResp", confirmedResp);
//         if (confirmedResp.event === "done") {
//           fillCoin(confirmedResp.data);
//         } else if (confirmedResp.event === "error") {
//           log.error(uid, "error in confirmedResp: ", confirmedResp);
//         } else if (confirmedResp.event === "issued") {
//           // 가상계좌 발급
//           log.debug(null, pre + "issued: ", confirmedResp);
//           if (confirmedResp.data.vbank_data) {
//             const bank = confirmedResp.data.vbank_data;
//             dialog.info({
//               title: "입금정보(완료시 자동충전)",
//               content: () =>
//                 h(
//                   NSpace,
//                   {
//                     vertical: true,
//                     style: { "padding-left": "5%" },
//                   },
//                   {
//                     default: () => [
//                       h(
//                         NText,
//                         {
//                           type: "info",
//                         },
//                         {
//                           default: () => `은행: ${bank.bank_name}`,
//                         }
//                       ),
//                       h(
//                         NText,
//                         {
//                           type: "success",
//                         },
//                         {
//                           default: () => `계좌: ${bank.bank_account}`,
//                         }
//                       ),
//                       h(
//                         NText,
//                         {
//                           type: "warning",
//                         },
//                         {
//                           default: () => `금액: ${price.toLocaleString()}원`,
//                         }
//                       ),
//                       h(
//                         NText,
//                         {
//                           type: "error",
//                         },
//                         {
//                           default: () =>
//                             `기한: ${formatDate(loadDate(bank.expired_at))}`,
//                         }
//                       ),
//                     ],
//                   }
//                 ),
//             });
//           }
//         }
//       } else {
//         Bootpay.destroy(); //결제창을 닫는다.
//       }
//     } else {
//       console.error("unexpected response : ", resp);
//     }
//   } catch (e: any) {
//     console.log(e);
//     if (e.event === "error") {
//       // case "cancel": // 사용자가 결제창을 닫을때 호출
//       log.error(
//         null,
//         `pg_error_code: ${e.pg_error_code} \n e.error_code: ${e.error_code} \n e.message: ${e.message}`
//       );
//     }
//     Bootpay.destroy(); //결제창을 닫는다.
//   }
// }
// const fillCoin = (data: any) => {
//   const price = data.price;
//   const dPrice = dd(Number(data.metadata.m));
//   console.assert(price === dPrice, "invalid price in coin");
//   if (!userPay.value) {
//     return log.error(
//       uid,
//       `userPay is null in fillCoin, required charge coin is: ${price}`
//     );
//   }
//   userPay.value.budget += price;
//   userPay.value
//     .update()
//     .then(() => {
//       msg.info("충전완료!");
//     })
//     .catch(() => {
//       msg.error("충전실패!");
//     });
// };
// const minCharge = 100;
// const chargePrice = ref(minCharge);
// const chargeValidator = (x: number) => x % 10 === 0;
// const zz = 1224512435;
// const hh = 234567890987654;
// const ee = (p: number) => (Number(p) + zz) ^ hh;
// const dd = (p: number) => (Number(p) ^ hh) - zz;

// >>> encashment >>>
const maxEncash = computed(
  () => userPay.value?.budget ?? 0 - (userPay.value?.pendingBudget ?? -1)
);
const encash = ref(2000);
async function reqEncashment() {
  if (!userPay.value) return msg.error("다시 시도해주세요");
  else if (maxEncash.value < encash.value)
    return msg.error(`${maxEncash.value}원 이하로 출금요청 가능합니다.`);
  else if (!user.value.userInfo.account || !user.value.userInfo.account.code) {
    return msg.error("계좌 정보를 업데이트 해주십시오.");
  }
  const obj: ReqEncash = {
    createdAt: new Date(),
    dbId: uuidv4(),
    amount: encash.value,
    userId: userPay.value!.userId,
    isDone: false,
  };
  await setDoc(
    doc(getIoCollection(ioFireStore, { c: "REQUEST_ENCASH" }), obj.dbId),
    obj
  );
  return msg.success(`${encash.value}원 출금요청 완료.`);
}

// >>> manual charge >>>
const charge = ref(2000);
async function reqCharge() {
  const obj: ReqEncash = {
    createdAt: new Date(),
    dbId: uuidv4(),
    amount: charge.value,
    userId: userPay.value!.userId,
    isDone: false,
  };
  await setDoc(
    doc(getIoCollection(ioFireStore, { c: "REQUEST_CHARGE" }), obj.dbId),
    obj
  );
  return msg.success(`${charge.value}원 출금요청 완료.`);
}
</script>
<template>
  <n-space v-if="userPay" vertical style="text-align: start">
    <n-h2>In-Coin 월렛</n-h2>
    <n-space justify="space-between">
      <n-text strong> 금액 보유량 : </n-text>
      <n-text type="info"> {{ userPay.budget.toLocaleString() }} 원 </n-text>
    </n-space>
    <n-divider />
    <n-space justify="space-between">
      <div style="position: relative">
        <n-tooltip trigger="hover" :width="400">
          <template #trigger>
            <n-button circle text style="position: absolute; left: -30%">
              <template #icon>
                <n-icon><QuestionCircleRegular /></n-icon>
              </template>
            </n-button>
          </template>
          <template #header> 보류 금액이란? </template>
          아직 완료되지 않은 주문건 혹은 샘플출고가 되었을 경우 보류금액이<br />
          발생됩니다. 주문 완료처리가 될 경우 샘플 결제가 될경우 출금 가능
          금액으로 변경 됩니다.
        </n-tooltip>
        <n-text strong> 보류 금액 : </n-text>
      </div>
      <n-text type="info"> {{ userPay.pendingBudget }} 원 </n-text>
    </n-space>
    <n-divider />
    <n-collapse arrow-placement="right" accordion>
      <!-- With PG
      <n-collapse-item name="1">
        <template #header>
          <n-text strong>금액충전</n-text>
        </template>
        <n-space vertical>
          <n-space justify="space-between">
            <n-text strong> 충전 금액 </n-text>
            <n-input-number
              v-model:value="chargePrice"
              :step="10"
              :min="minCharge"
              :validator="chargeValidator"
            />
          </n-space>
          <n-space justify="end">
            <n-text depth="3"> 10원 단위로 입력 </n-text>
          </n-space>
          <n-space justify="space-between">
            <n-button
              v-for="m in [100, 1000, 2000, 5000, 10000, 100000]"
              :key="m"
              @click="() => (chargePrice += m)"
            >
              {{ m.toLocaleString() }}
            </n-button>
          </n-space>
          <n-space justify="space-between" style="line-height: 2rem">
            <div>
              <n-text strong> 결제금액: </n-text>
              <n-text>{{ chargePrice?.toLocaleString() + " 원" }} </n-text>
            </div>

            <n-button @click="reqPay">
              충전하기<coin-image size="1.6rem" />
            </n-button>
          </n-space>
        </n-space>
      </n-collapse-item> -->
      <n-collapse-item name="1">
        <template #header>
          <n-text strong>금액충전</n-text>
        </template>
        <n-space vertical>
          <n-space justify="space-between">
            <div style="position: relative">
              <n-tooltip trigger="hover" :width="400">
                <template #trigger>
                  <n-button circle text style="position: absolute; left: -30%">
                    <template #icon>
                      <n-icon><QuestionCircleRegular /></n-icon>
                    </template>
                  </n-button>
                </template>
                <template #header> 주의 사항 </template>
                요청 후 10분 이내로 결제가 되어야 원활하게 충전이 됩니다.<br />
                10분이 초과될 경우 010-8070-8600 해당 번호의 카카오톡으로 문의를
                남겨주세요.<br />
                또 입금 완료 후 30분 이내로 충전이 완료됩니다.<br />
              </n-tooltip>
              <n-text strong> IBK / 송준회 </n-text>
            </div>
            <n-text type="info">12345-21251513531</n-text>
          </n-space>
          <n-divider></n-divider>
          <n-space justify="space-between">
            <n-text strong> 요청금액 </n-text>
            <n-input-number v-model:value="charge" :step="100" :min="2000" />
          </n-space>
          <n-space justify="space-between" style="line-height: 2rem">
            <div style="position: relative">
              <n-tooltip trigger="hover" :width="400">
                <template #trigger>
                  <n-button circle text style="position: absolute; left: -30%">
                    <template #icon>
                      <n-icon><QuestionCircleRegular /></n-icon>
                    </template>
                  </n-button>
                </template>
                결제 수수로(PG) {{ feeCharge }}%가 별도 부과됩니다.
              </n-tooltip>
              <n-text strong> 결제금액 </n-text>
            </div>
            <n-text type="info">
              {{ (charge + charge * (feeCharge / 100)).toLocaleString() }} 원
            </n-text>
            <n-button @click="reqCharge">
              충전 요청<coin-image size="1.6rem" />
            </n-button>
          </n-space>
        </n-space>
      </n-collapse-item>
      <n-collapse-item name="2">
        <template #header>
          <n-text strong>출금하기</n-text>
        </template>
        <n-space v-if="user?.userInfo.account" vertical>
          <n-space justify="space-between">
            <n-text strong>
              {{ user.userInfo.account.bank }} /
              {{ user.userInfo.account.accountName }}
            </n-text>
            <n-text type="info">{{
              user.userInfo.account.accountNumber
            }}</n-text>
          </n-space>

          <n-divider></n-divider>
          <n-space justify="space-between">
            <n-text strong> 출금 가능 금액 </n-text>
            <n-text type="info">{{ maxEncash < 0 ? 0 : maxEncash }} </n-text>
          </n-space>
          <n-space justify="space-between">
            <n-text strong> 출금 금액 </n-text>
            <n-input-number
              v-model:value="encash"
              :step="100"
              :min="2000"
              :max="maxEncash"
            />
          </n-space>
          <n-space justify="space-between" style="line-height: 2rem">
            <div style="position: relative">
              <n-tooltip trigger="hover" :width="400">
                <template #trigger>
                  <n-button circle text style="position: absolute; left: -30%">
                    <template #icon>
                      <n-icon><QuestionCircleRegular /></n-icon>
                    </template>
                  </n-button>
                </template>
                송금 안전 서비스 {{ feeEncash }}원이 제외된 나머지 금액이 출금
                됩니다.
              </n-tooltip>
              <n-text strong> 정산 금액 </n-text>
            </div>
            <n-text type="info">
              {{ (encash - feeEncash).toLocaleString() }} 원
            </n-text>
            <n-button @click="reqEncashment">
              출금 요청<coin-image size="1.6rem" />
            </n-button>
          </n-space>
        </n-space>
      </n-collapse-item>
    </n-collapse>
  </n-space>
</template>
