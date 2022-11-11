<script setup lang="ts">
import { UserAvatarFilled } from "@vicons/carbon";
import { MoneyBillWave, ExclamationTriangle } from "@vicons/fa";
import { LocalShippingFilled } from "@vicons/material";
import { Box24Filled } from "@vicons/fluent";
import { renderIcon, renderRoute, getScreenSize, isMobile } from "@/util";
import type { MenuOption } from "naive-ui";
import { useAuthStore, useUncleOrderStore } from "@/store";
import { onBeforeMount, h } from "vue";
import { People16Regular, News16Regular } from "@vicons/fluent";
import LogoImageVue from "@/component/common/LogoImage.vue";
import { useRouter } from "vue-router";
const minHeight = "100vh";
const router = useRouter();
const menuOptions: MenuOption[] = [
  {
    label: "픽업관리",
    key: "PickupManage",
    icon: renderIcon(Box24Filled),
    children: [
      {
        label: () => renderRoute("통합 조회", "PickupTotalList"),
        key: "PickupTotalList",
      },
      {
        label: () => renderRoute("거래 내역", "RequestHistory"),
        key: "RequestHistory",
      },
      {
        label: () => renderRoute("담당 관리", "MngInCharge"),
        key: "MngInCharge",
      },
    ],
  },
  {
    label: "정산관리",
    key: "CalcManage",
    icon: renderIcon(MoneyBillWave),
    children: [
      {
        label: () => renderRoute("결제 관리", "BillingManage"),
        key: "BillingManage",
      },
      {
        label: () => renderRoute("급여 관리", "MngSalary"),
        key: "MngSalary",
      },
      {
        key: "MngMaintainCost",
        label: () => renderRoute("유지 관리비", "MngMaintainCost"),
      },
    ],
  },
  {
    label: "배송관리",
    key: "ShipManage",
    icon: renderIcon(LocalShippingFilled),
    children: [
      {
        label: () => renderRoute("차량 관리", "VehicleManage"),
        key: "VehicleManage",
      },
      {
        label: () => renderRoute("배송지 관리", "ShipAreaManage"),
        key: "ShipAreaManage",
      },
      {
        label: () => renderRoute("배송 내역", "ShipHistory"),
        key: "ShipHistory",
      },
    ],
  },
  {
    label: () => renderRoute("고객지원", "CsHome"),
    key: "CsHome",
    icon: renderIcon(News16Regular),
  },
  {
    label: () => renderRoute("거래처 관리", "UnclePartnerManage"),
    key: "UnclePartnerManage",
    icon: renderIcon(People16Regular),
  },
  {
    label: "엉클관리",
    key: "UncleWorkerManage",
    icon: renderIcon(UserAvatarFilled),
    children: [
      {
        label: () => renderRoute("신규등록", "WorkerRegister"),
        key: "WorkerRegister",
      },
      {
        label: () => renderRoute("활동 조회", "WorkerHistory"),
        key: "WorkerHistory",
      },
    ],
  },
  {
    label: "사고관리",
    key: "AccidentManage",
    icon: renderIcon(ExclamationTriangle),
    children: [
      {
        label: () => renderRoute("사고접수", "AccidentManage"),
        key: "AccidentManage",
      },
      {
        label: () => renderRoute("사고 내역", "AccidentHistory"),
        key: "AccidentHistory",
      },
    ],
  },
];
const user = useAuthStore().currUser;
const mobileOpts = [
  {
    key: "home",
    icon: () =>
      h(LogoImageVue, {
        size: "1.8rem",
        style: { "margin-top": "23%" },
        onclick: () => {
          router.goHome(user);
        },
      }),
  },
  ...menuOptions,
];

onBeforeMount(() => useUncleOrderStore().init(user.userInfo.userId));
</script>
<template>
  <n-layout
    v-if="getScreenSize() === 'S' || isMobile()"
    :style="`height: ${minHeight}`"
  >
    <n-layout-header>
      <n-menu
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="mobileOpts"
        mode="horizontal"
      />
    </n-layout-header>
    <n-space
      vertical
      justify="space-between"
      align="center"
      style="padding: 2%; width: 100%"
    >
      <router-view />
      <io-footer />
    </n-space>
  </n-layout>
  <n-layout v-else has-sider sider-placement="right">
    <n-layout has-sider :style="`min-height: ${minHeight}`">
      <io-sider
        :style="`min-height: ${minHeight}`"
        :menuOptions="menuOptions"
      />
      <n-space
        vertical
        justify="space-between"
        style="padding: 2%; width: 100%; overflow: auto"
      >
        <router-view />
        <io-footer />
      </n-space>
    </n-layout>
    <team-uncle-sider />
  </n-layout>
</template>
