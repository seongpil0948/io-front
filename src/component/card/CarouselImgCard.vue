<template>
  <n-card content-style="padding: 0;">
    <n-space vertical justify="start" style="margin: 0">
      <div :style="`width: ${width}${unit}; height: ${height}${unit};`">
        <n-carousel
          ref="inst"
          autoplay
          show-arrow
          :show-dots="false"
          trigger="click"
          direction="horizontal"
        >
          <img
            v-for="(url, j) in imgUrls"
            :key="j"
            class="carousel-img"
            :src="url"
          />
        </n-carousel>
      </div>
      <n-space
        inline
        :style="`width: ${width}${unit}; overflow: auto;`"
        :wrap="false"
      >
        <img
          v-for="(url, i) in imgUrls"
          :key="i"
          :src="url"
          class="small io-img"
          @click="onClickSubImg(i)"
        />
      </n-space>
    </n-space>
  </n-card>
</template>
<script setup lang="ts">
import { ref, toRefs } from "vue";
import type { CarouselInst } from "naive-ui/es/carousel/src/interface.js";
const props = defineProps({
  imgUrls: {
    type: Array as () => Array<string>,
    default: () => [],
  },
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    default: () => "vw",
  },
});
const { imgUrls, width, height } = toRefs(props);
const inst = ref<CarouselInst | null>(null);
function onClickSubImg(idx: number) {
  if (!inst.value) return;
  inst.value.to(idx);
}
</script>

<style>
.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.small {
  width: 50px;
  height: 50px;
  cursor: pointer;
}
.io-img {
  border-radius: 5%;
}
</style>
