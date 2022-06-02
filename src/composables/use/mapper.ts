import { onBeforeMount, ref } from "vue";
import { Mapper } from "@/composables";

export function useMapper(uid: string) {
  const mapper = ref<Mapper | null>(null);
  onBeforeMount(async () => {
    mapper.value = await Mapper.getIoMapper(uid);
  });
  return { mapper };
}
