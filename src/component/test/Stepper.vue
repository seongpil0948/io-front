<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <button data-cy="decrement" @click="decrement">-</button>
    <span data-cy="counter">{{ count }}</span>
    <button data-cy="increment" @click="increment">+</button>
  </div>

  <div class="content">
    <n-h2>test slot</n-h2>
    <slot />
    <header>
      <slot name="header" />
    </header>
    <footer>
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  initial?: number;
}>();
const emit = defineEmits(["change"]);

const count = ref(props.initial || 0);

const increment = () => {
  count.value++;
  emit("change", count.value);
};

const decrement = () => {
  count.value--;
  emit("change", count.value);
};
</script>
