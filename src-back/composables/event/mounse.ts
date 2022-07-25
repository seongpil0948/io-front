// mouse.js
import { ref } from "vue";
import { useEventListener } from "./common";

// example
// const mouse = reactive(useMouse())
// const { x, y } = useMouse()
// The recommended convention is to always return an object of refs from composables,
// so that it can be destructured in components while retaining reactivity:
export function useMouse() {
  const x = ref(0);
  const y = ref(0);
  useEventListener(
    () => window,
    "mousemove",
    (event: MouseEvent) => {
      x.value = event.pageX;
      y.value = event.pageY;
    }
  );

  return { x, y };
}
