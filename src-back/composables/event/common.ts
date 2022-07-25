// event.js
import { onMounted, onUnmounted } from "vue";

export function useEventListener<T extends EventTarget, E extends Event>(
  target: () => T | null,
  event: string,
  handler: (this: T, evt: E) => void
) {
  // if you want, you can also make this
  // support selector strings as target
  onMounted(() => {
    target()?.addEventListener(event, handler as (evt: Event) => void, {
      passive: true,
    });
  });
  onUnmounted(() =>
    target()?.removeEventListener(event, handler as (evt: Event) => void)
  );
}
