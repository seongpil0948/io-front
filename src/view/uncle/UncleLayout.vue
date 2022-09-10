<script setup lang="ts">
import { UserAvatarFilled } from "@vicons/carbon";
import { MoneyBillWave, ExclamationTriangle } from "@vicons/fa";
import { LocalShippingFilled } from "@vicons/material";
import { Box24Filled } from "@vicons/fluent";
import { renderIcon, renderRoute } from "@/util";
import type { MenuOption } from "naive-ui";
import { useAuthStore, useUncleOrderStore } from "@/store";
import { onBeforeMount } from "vue";
import { People16Regular, News16Regular } from "@vicons/fluent";
const minHeight = "100vh";
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
    label: () => renderRoute("공지사항", "NoticePage"),
    key: "NoticePage",
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
onBeforeMount(() =>
  useUncleOrderStore().init(useAuthStore().currUser.userInfo.userId)
);
</script>
<template>
  <n-space vertical>
    <n-layout has-sider sider-placement="right">
      <n-layout has-sider :style="`min-height: ${minHeight}`">
        <io-sider
          :style="`min-height: ${minHeight}`"
          :menuOptions="menuOptions"
        />
        <n-space
          vertical
          justify="space-between"
          style="padding: 2%; width: 100%"
        >
          <router-view />
          <io-footer />
        </n-space>
      </n-layout>
      <team-uncle-sider />
    </n-layout>
  </n-space>
</template>
