<script setup lang="ts"></script>

<template>
  <div class="menu" onclick="this.classList.toggle('open')">
    <div class="button"></div>
    <div class="button"></div>
    <div class="button"></div>
  </div>
</template>

<style scoped lang="scss">
@import "../../asset/variables.scss";
.menu {
  position: absolute;
  bottom: 5%;
  right: 100px;
  background: $io-background;
  padding: 30px;
  border-radius: 100%;
  cursor: pointer;
  box-shadow: 7px 7px 15px rgba(55, 84, 170, 0.15),
    -7px -7px 20px rgba(255, 255, 255, 1),
    inset 0px 0px 4px rgba(255, 255, 255, 0.2),
    inset 7px 7px 15px rgba(55, 84, 170, 0),
    inset -7px -7px 20px rgba(255, 255, 255, 0),
    0px 0px 4px rgba(255, 255, 255, 0);
  &::before,
  &::after {
    content: "";
    background: $io-grey2;
    border-radius: 5px;
    width: 30px;
    height: 5px;
    position: absolute;
    left: 16px;
    top: 27px;
    transition: 0.2s ease;
    z-index: 1;
  }
  &::before {
    transform: rotate(0deg);
  }
  &::after {
    transform: rotate(-90deg);
  }
  &.open {
    opacity: 0.9;
    &::before {
      transform: rotate(45deg);
    }
    &::after {
      transform: rotate(-45deg);
    }
    .button {
      opacity: 1;
      pointer-events: auto;
      &:first-of-type {
        bottom: 40px;
        right: 70px;
        background: url("https://bassets.github.io/cam.svg") no-repeat 50%/50%
          $io-grey3;
      }
      &:nth-of-type(2) {
        bottom: 80px;
        background: url("https://bassets.github.io/img.svg") no-repeat 50%/ 50% $io-grey3;
        transition-delay: 0.05s;
      }
      &:last-of-type {
        bottom: 40px;
        right: -70px;
        background: url("https://bassets.github.io/music.svg") no-repeat 50% 45%/50%
          45% $io-grey3;
        transition-delay: 0.1s;
      }
    }
  }
}

.button {
  padding: 30px;
  border-radius: 50%;
  cursor: pointer;
  background: #e8e8f3;
  position: absolute;
  bottom: 0;
  right: 0;
  opacity: 0;
  pointer-events: none;
  box-shadow: inherit;
  transition: 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28), 0.2s ease opacity,
    0.2s cubic-bezier(0.08, 0.82, 0.17, 1) transform;
  &:hover {
    transform: scale(1.1);
  }
}
</style>
