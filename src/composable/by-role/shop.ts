import { ref, computed } from "vue";
import { useAuthStore } from "@/store";
import { storeToRefs } from "pinia";
import { getUserName } from "..";

export function useContactUncle() {
  const auth = useAuthStore();
  const { contractUncles } = storeToRefs(auth);
  const targetUncleId = ref<string | null>(null);
  const contactUncleOpts = computed(() =>
    contractUncles.value.map((x) => {
      return { value: x.userInfo.userId, label: getUserName(x) };
    })
  );

  return {
    targetUncleId,
    contactUncleOpts,
    contractUncles,
  };
}
