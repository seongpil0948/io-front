<template>
  <n-result
    title="준비중인 페이지입니다."
    description="기다려주실거죵..?"
    style="min-height: 50vh"
  >
    <template #icon>
      <n-image preview-disabled class="vibe" src="/logo.png" width="300" />
    </template>
  </n-result>
</template>

<script setup lang="ts"></script>

<style scoped>
.vibe:hover {
  animation-duration: 0.05s;
  animation-name: vibration;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

@keyframes vibration {
  from {
    margin-left: 5%;
  }

  to {
    margin-left: -5%;
  }
}
</style>
