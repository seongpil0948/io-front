<script setup lang="ts">
import { locateToStr, IoUser } from "@io-boxies/js-lib";
import { h, ref, toRefs } from "vue";
import {
  NText,
  NButton,
  NCard,
  NModal,
  NDataTable,
  useMessage,
} from "naive-ui";
import { usePopSelTable } from "@/composable";
import { makeMsgOpt } from "@/util";

const props = defineProps<{
  virtualVendors: IoUser[];
}>();
const { virtualVendors } = toRefs(props);
// const auth = useAuthStore();
const msg = useMessage();
// const virVendorConverter = fireConverter<IoUser>();
// const virVendorC = getIoCollection(ioFireStore, {
//   uid: auth.uid,
//   c: "VIRTUAL_USER",
// }).withConverter(virVendorConverter);

const { optionCol } = usePopSelTable<IoUser>({
  onDelete: (p) => {
    console.log("onDelete: ", p);
    msg.info("준비중.. 찡끗 ㅇ_<", makeMsgOpt());
    return Promise.resolve();
    // FIXME: 주문건에 엮이면서 함부로 삭제 할 수 없다.
    // runTransaction(ioFireStore, async (t) => {
    //   const targetUid = p.userInfo.userId;
    //   const snap = await getDocs(
    //     query(
    //       getIoCollection(ioFireStore, { c: "SHOP_PROD" }).withConverter(
    //         fireConverter<ShopGarment>()
    //       ),
    //       where("visible", "==", "ME"),
    //       where("vendorId", "==", targetUid)
    //     )
    //   );
    //   const delProdIds: string[] = [];
    //   snap.forEach((doc) => {
    //     const data = doc.data();
    //     console.log("delete target vir prod: ", data);
    //     if (data) {
    //       delProdIds.push(data.shopProdId);
    //     }
    //   });
    //   await deleteVirGarments(auth.uid, delProdIds);
    //   t.delete(doc(virVendorC, targetUid));
    // });
  },

  onEdit: () => msg.info("준비중.. 찡끗 ㅇ_<", makeMsgOpt()),
});
const virVendorCols = [
  {
    title: "이름",
    key: "userInfo.displayName",
  },
  {
    title: "연락처",
    key: "userInfo.phone",
  },
  {
    title: "주소",
    key: "locate",
    render: (r: IoUser) =>
      h(
        NText,
        {},
        {
          default: () =>
            r.companyInfo?.shipLocate
              ? `${locateToStr(r.companyInfo.shipLocate)}, ${
                  r.companyInfo.shipLocate.detailLocate
                }`
              : "X",
        }
      ),
  },
  optionCol,
];

const showRegitVendor = ref(false);
</script>

<template>
  <n-card style="width: 100%">
    <template #header> 가상 도매처 관리 </template>
    <template #header-extra>
      <n-button @click="showRegitVendor = true"> 가상 도매처 추가 </n-button>
    </template>

    <n-data-table
      :columns="virVendorCols"
      :data="virtualVendors"
      :pagination="{
        showSizePicker: true,
        pageSizes: [5, 10, 25, 50, 100],
      }"
      :bordered="false"
    />
  </n-card>
  <n-modal v-model:show="showRegitVendor" style="margin: 0 5%">
    <n-card role="dialog" aria-modal="true">
      <virtual-vendor-form @submit-virtual-vendor="showRegitVendor = false" />
    </n-card>
  </n-modal>
</template>
