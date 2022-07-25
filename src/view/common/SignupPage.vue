<script setup lang="ts"></script>
<template>
  <n-space id="signup-page-container" vertical><n-h1>SignUp</n-h1> </n-space>
</template>

<style>
#signup-page-container {
  justify-content: center !important;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #ffc800;
}
.one-enter-active,
.one-leave-active {
  transition: opacity 1s ease;
}
.one-enter-from,
.one-leave-to {
  opacity: 0;
}

.two-enter-active {
  transition: opacity 1s ease 2s;
}
.two-enter-from {
  opacity: 0;
}
.txt {
  color: dimgray;
}

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
