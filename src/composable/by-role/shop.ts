import { ref, computed, watch } from "vue";
import { useAuthStore } from "@/store";
import { IoUser, USER_DB, getUserName } from "@io-boxies/js-lib";
import { ioFireStore } from "@/plugin/firebase";

export function useContactUncle() {
  const auth = useAuthStore();
  const u = auth.currUser();
  const targetUncleId = ref<string | null>(null);
  const contractUncles = ref<IoUser[]>([]);

  watch(
    () => u.shopInfo?.uncleUserIds,
    async function (ids, prev) {
      console.log("uncleUserIds: ", u, ids);
      if (!ids || ids === prev) return;
      contractUncles.value = await USER_DB.getUserByIds(ioFireStore, ids);
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
