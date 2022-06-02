<script setup lang="ts"></script>
<template>
  <n-space vertical>
    <n-layout>
      <layout-header />
      <n-layout style="min-height: 95vh"><router-view /> </n-layout>

      <!-- <n-layout-footer bordered> Footer Footer Footer </n-layout-footer> -->
    </n-layout>
  </n-space>
</template>
