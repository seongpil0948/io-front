<script setup lang="ts">
import { IoPartner, loadPartnerVendors } from "@/composable";
import { useAuthStore, useVendorsStore } from "@/store";
import { getUserName } from "@io-boxies/js-lib";
import { onBeforeMount, ref } from "vue";

const auth = useAuthStore();
const vendorStore = useVendorsStore();

const partners = ref<IoPartner[]>([]);
onBeforeMount(async () => {
  partners.value = await loadPartnerVendors(auth.currUser.userInfo.userId);
});
</script>
<template>
  <n-card title="거래처 관리">
    <n-space>
      <n-card
        v-for="(partner, i) in partners"
        :key="i"
        style="width: 15vw; height: 15vw"
      >
        <n-space vertical>
          <n-space justify-between>
            <n-text>파트너명</n-text>
            <n-text type="info">{{
              getUserName(vendorStore.vendorById[partner.vendorId])
            }}</n-text>
          </n-space>
          <n-space justify-between>
            <n-text>email</n-text>
            <n-text type="info">{{
              vendorStore.vendorById[partner.vendorId].userInfo.email
            }}</n-text>
          </n-space>
          <n-space justify-between>
            <n-text>연락처</n-text>
            <n-text type="info">{{
              vendorStore.vendorById[partner.vendorId].userInfo.phone ??
              vendorStore.vendorById[partner.vendorId].companyInfo?.companyPhone
            }}</n-text>
          </n-space>
          <n-space justify-between>
            <n-text>미결제 금액</n-text>
            <n-text type="info">{{ partner.credit.toLocaleString() }}</n-text>
          </n-space>
          <user-locate-list
            :readonly="true"
            :info="vendorStore.vendorById[partner.vendorId].companyInfo!"
          />
        </n-space>
      </n-card>
    </n-space>
  </n-card>
</template>
