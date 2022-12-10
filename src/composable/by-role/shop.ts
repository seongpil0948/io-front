import { ref, computed, watch } from "vue";
import { useAuthStore } from "@/store";
import { IoUser, USER_DB, getUserName } from "@io-boxies/js-lib";

export function useContactUncle() {
  const auth = useAuthStore();
  const u = auth.currUser;
  const targetUncleId = ref<string | null>(null);
  const contractUncles = ref<IoUser[]>([]);
  const uncleUserIds = computed(() => u.shopInfo?.uncleUserIds ?? []);
  watch(
    () => uncleUserIds.value,
    async function (ids, prev) {
      if (ids === prev) return;
      contractUncles.value = await USER_DB.getUserByIds(ids);
    },
    { immediate: true, deep: true }
  );

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
