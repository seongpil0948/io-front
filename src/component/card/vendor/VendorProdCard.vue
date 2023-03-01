<script setup lang="ts">
import { VendorGarment } from "@/composable";
import { toRefs } from "vue";

const props = defineProps<{
  prod: VendorGarment;
}>();
const { prod } = toRefs(props);
</script>
<template>
  <n-card style="width: 300px">
    <n-carousel show-arrow>
      <img
        v-for="(src, idx) in [...prod.titleImgs, ...prod.bodyImgs]"
        :key="idx"
        class="carousel-img"
        :src="src"
      />
    </n-carousel>
    <n-descriptions :column="2" :title="prod.vendorProdName">
      <n-descriptions-item label="color">
        {{ prod.color }}
      </n-descriptions-item>
      <n-descriptions-item label="size">
        {{ prod.size }}
      </n-descriptions-item>
      <n-descriptions-item label="price">
        {{ prod.vendorPrice }}
      </n-descriptions-item>
      <n-descriptions-item label="part">
        {{ prod.part }}
      </n-descriptions-item>
      <n-descriptions-item label="category">
        {{ prod.ctgr }}
      </n-descriptions-item>
    </n-descriptions>
  </n-card>
</template>

<style scoped>
.carousel-img {
  width: 280px;
  height: 280px;
  object-fit: contain;
}
</style>
