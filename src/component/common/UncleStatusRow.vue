<script setup lang="ts"></script>
<template>
  <n-space
    size="large"
    inline
    style="
      border-radius: 22px;
      background-color: dimgrey;
      width: 133%;
      padding: 3%;
      font-size: 1rem;
      align-items: center;
    "
    justify="space-around"
  >
    <uncle-status-icon status="grey" />
    <n-avatar
      round
      size="small"
      src="http://k.kakaocdn.net/dn/K9jx2/btrEZc1wp4r/ryTD2FVs9nS8mOsprKn8Ik/img_640x640.jpg"
      fallback-src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg"
    />
    <n-text> 엉클 </n-text>
    <n-text> 155/200 </n-text>
  </n-space>
</template>
