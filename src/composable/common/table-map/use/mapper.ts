import { ref, onBeforeMount } from "vue";
import { Mapper } from "../model";

export function useMapper(uid: string) {
  const mapper = ref<Mapper | null>(null);
  onBeforeMount(async () => {
    mapper.value = await Mapper.getIoMapper(uid);
  });
  return { mapper };
}
