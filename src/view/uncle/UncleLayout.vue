<script setup lang="ts">
import { UserAvatarFilled } from "@vicons/carbon";
import { MoneyBillWave, ExclamationTriangle } from "@vicons/fa";
import { LocalShippingFilled } from "@vicons/material";
import { Box24Filled } from "@vicons/fluent";
import { renderIcon, renderRoute } from "@/util";
import type { MenuOption } from "naive-ui";

const minHeight = "100vh";
const menuOptions: MenuOption[] = [
  {
    label: "픽업관리",
    key: "PickupManage",
    icon: renderIcon(Box24Filled),
    children: [
      {
        label: () => renderRoute("통합조회", "PickupTotalList"),
        key: "PickupTotalList",
      },
    ],
  },
  {
    label: "정산관리",
    key: "CalcManage",
    icon: renderIcon(MoneyBillWave),
    children: [
      {
        label: () => renderRoute("결제관리", "BillingManage"),
        key: "BillingManage",
      },
    ],
  },
  {
    label: "배송관리",
    key: "ShipManage",
    icon: renderIcon(LocalShippingFilled),
    children: [
      {
        label: () => renderRoute("차량관리", "VehicleManage"),
        key: "VehicleManage",
      },
      {
        label: () => renderRoute("활동지역관리", "ShipAreaManage"),
        key: "ShipAreaManage",
      },
    ],
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
    ],
  },
];
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
