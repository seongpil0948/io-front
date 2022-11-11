import { USER_DB, IoUser } from "@/composable";
import { ref, computed, watch } from "vue";
import { useAuthStore } from "@/store";

export function useContactUncle() {
  const auth = useAuthStore();
  const u = auth.currUser;
  const targetUncleId = ref<string | null>(null);
  const contractUncles = ref<IoUser[]>([]);
  const uncleUserIds = computed(() => u.shopInfo!.uncleUserIds);
  watch(
    () => uncleUserIds.value,
    async function (ids, prev) {
      if (ids === prev) return;
      contractUncles.value = await USER_DB.getUserByIds(ids);
    },
    { immediate: true }
  );

  const contactUncleOpts = computed(() =>
    contractUncles.value.map((x) => {
      return { value: x.userInfo.userId, label: x.name };
    })
  );

  return {
    targetUncleId,
    contactUncleOpts,
    contractUncles,
  };
}
