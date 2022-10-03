import { getIoCollection } from "@/util";
import { onSnapshot } from "@firebase/firestore";
import { computed, ref, Ref } from "vue";
import { Locate } from ".";
import { useMessage } from "naive-ui";
import { useLogger } from "vue-logger-plugin";

export interface CA {
  code: string | null;
  alias: string | null;
}
export function usePickArea(model: Ref<CA>) {
  const msg = useMessage();
  const locates = ref<Locate[]>([]);
  const logger = useLogger();
  // >>> for select logic >>>

  function addPickArea() {
    const v = model.value;
    const target = locates.value.find((x) => isSameLocate(x, v as CA));
    if (!target) {
      msg.error("올바르게 지역을 선택 해주세요.");
      logger.error(
        null,
        "city or alias not matched in usePickArea, is there any duplicate code?" +
          JSON.stringify(v)
      );
    }
    return target;
  }
  // <<< for select logic <<<

  const locateCollection = getIoCollection({
    c: "PICKUP_LOCATES",
  }).withConverter(Locate.fireConverter());

  onSnapshot(locateCollection, (snapshot) => {
    locates.value = [];
    snapshot.forEach((s) => {
      const data = s.data();
      if (data) {
        locates.value.push(data);
      }
    });
  });

  // const getPickId = (x: CA) => `${x.code}__${x.alias}`;
  const getPickId = (x: CA) => x.alias;
  const isSameLocate = (a: CA, b: CA) => getPickId(a) === getPickId(b);
  const areaOpt = computed(() =>
    locates.value.map((x) => {
      return {
        label: `${x.city} ${x.county} ${x.town}`,
        value: x.code,
      };
    })
  );

  const officeOpt = computed(() =>
    locates.value.map((x) => {
      return {
        label: x.alias,
        value: x.alias,
      };
    })
  );
  return {
    areaOpt,
    officeOpt,
    isSameLocate,
    getPickId,
    locates,
    addPickArea,
  };
}
