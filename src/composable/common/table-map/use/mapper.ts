import { ioFireStore } from "@/plugin/firebase";
import { makeMsgOpt } from "@/util";
import { doc, onSnapshot } from "@firebase/firestore";
import { getIoCollection } from "@io-boxies/js-lib";
import { useMessage } from "naive-ui";
import { shallowRef, onBeforeUnmount } from "vue";
import { useLogger } from "vue-logger-plugin";
import { Mapper } from "../model";

export function useMapper(uid: string) {
  const msg = useMessage();
  const log = useLogger();

  const mapper = shallowRef<Mapper | null>(null);
  const mapperDoc = doc(
    getIoCollection(ioFireStore, { c: "MAPPER" }),
    uid
  ).withConverter(Mapper.fireConverter());
  const unsubscribe = onSnapshot(mapperDoc, (doc) => {
    mapper.value = doc.data() ?? null;
  });
  onBeforeUnmount(() => unsubscribe());

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
