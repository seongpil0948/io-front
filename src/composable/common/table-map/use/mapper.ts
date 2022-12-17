import { makeMsgOpt } from "@/util";
import { useMessage } from "naive-ui";
import { ref, onBeforeMount } from "vue";
import { useLogger } from "vue-logger-plugin";
import { Mapper } from "../model";

export function useMapper(uid: string) {
  const msg = useMessage();
  const log = useLogger();

  const mapper = ref<Mapper | null>(null);
  onBeforeMount(async () => {
    mapper.value = await Mapper.getIoMapper(uid);
  });

  async function mapperUpdate() {
    mapper.value
      ?.update()
      .then(() => msg.success("업데이트 성공", makeMsgOpt()))
      .catch((err) => {
        const message = `업데이트 실패 ${
          err instanceof Error ? err.message : JSON.stringify(err)
        }`;
        msg.error(message, makeMsgOpt());
        log.error(uid, message, err);
      });
  }
  return { mapper, mapperUpdate };
}
