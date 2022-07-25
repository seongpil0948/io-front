// import { getIoCollectionGroup } from "@/plugins/firebase";
// import { ShopReqOrder } from "@/composables";
// import { ORDER_STATE, ORDER_OPERATE } from "@/types";

// /*  FIXME migrate shopReqOrder to Block
// 1. Firebase Plugins - 주문 데이터 관련 데이터 저장장소를 blocks 의 initial로 변경
// 2. Firebase Plugins - 주문 데이터 관련 데이터 가져오는 로직을 blocks 의 last block.info 변경
// 3. Firebase Plugins - 그외 유틸들 변경
// 4. composable등 주문 데이터 관련 모듈에서 FB 모듈 사용외에 직접적으로 사용하는  모듈들 수정
// */

// // export function useOrderBlocks() {
// //   const blocks: { [dbId: string]: OrderBlock[] } = {};
// //   function fillBlocks(dbIds: string[]) {
// //     bs.forEach((b) => {

// //     })
// //   }
// //   function getUserBlocks () {
// //     getIoCollectionGroup()
// //   }
// // }

// export interface OrderBlockCRT {
//   createdAt: Date;
//   fromState: ORDER_OPERATE & ORDER_STATE;
//   toState: ORDER_OPERATE & ORDER_STATE;
//   info: ShopReqOrder;
//   isLast: boolean; // is last block
// }
// export class OrderBlock {
//   createdAt: Date;
//   fromState: ORDER_OPERATE & ORDER_STATE;
//   toState: ORDER_OPERATE & ORDER_STATE;
//   info: ShopReqOrder;
//   isLast: boolean; // is last block
//   constructor(d: OrderBlockCRT) {
//     this.createdAt = d.createdAt;
//     this.fromState = d.fromState;
//     this.toState = d.toState;
//     this.info = d.info;
//     this.isLast = d.isLast;
//   }
// }
