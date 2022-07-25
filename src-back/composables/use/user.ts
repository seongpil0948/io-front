import { getUserByIds } from "@/plugins/firebase";
import { type Ref, ref, watchEffect } from "vue";
import type { IoUser } from "../model";

export function useUsers(userIds: Ref<string[]>) {
  const users = ref<IoUser[]>([]);
  watchEffect(async () => (users.value = await getUserByIds(userIds.value)));

  return { users };
}
