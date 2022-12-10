<script setup lang="ts">
import { IoPartner, loadPartnerVendors } from "@/composable";
import { useAuthStore } from "@/store";
import { getUserName, IoUser, USER_DB } from "@io-boxies/js-lib";
import { onBeforeMount, shallowRef } from "vue";

const auth = useAuthStore();

const partners = shallowRef<IoPartner[]>([]);
const vendorById = shallowRef<{ [userId: string]: IoUser }>({});
onBeforeMount(async () => {
  partners.value = await loadPartnerVendors(auth.currUser.userInfo.userId);
  const vendors = await USER_DB.getUserByIds(
    partners.value.map((x) => x.vendorId)
  );
  vendorById.value = vendors.reduce((acc: any, user: any) => {
    acc[user.userInfo.userId] = user;
    return acc;
  }, {} as { [userId: string]: IoUser });
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
              getUserName(vendorById[partner.vendorId])
            }}</n-text>
          </n-space>
          <n-space justify-between>
            <n-text>email</n-text>
            <n-text type="info">{{
              vendorById[partner.vendorId].userInfo.email
            }}</n-text>
          </n-space>
          <n-space justify-between>
            <n-text>연락처</n-text>
            <n-text type="info">{{
              vendorById[partner.vendorId].userInfo.phone ??
              vendorById[partner.vendorId].companyInfo?.companyPhone
            }}</n-text>
          </n-space>
          <n-space justify-between>
            <n-text>미결제 금액</n-text>
            <n-text type="info">{{ partner.credit.toLocaleString() }}</n-text>
          </n-space>
          <user-locate-list
            :readonly="true"
            :info="vendorById[partner.vendorId].companyInfo!"
          />
        </n-space>
      </n-card>
    </n-space>
  </n-card>
</template>
