import { onSnapshot } from "@firebase/firestore";
import { computed, ref } from "vue";
import { useMessage } from "naive-ui";
import { onFirestoreErr, onFirestoreCompletion } from "../common";
import {
  getIoCollection,
  Locate,
  locateFireConverter,
} from "@io-boxies/js-lib";
import { ioFireStore } from "@/plugin/firebase";
export function usePickArea() {
  const msg = useMessage();
  const locates = ref<Locate[]>([]);

  function addPickArea(pickId: string) {
    const target = locates.value.find((x) => getPickId(x) === pickId);
    if (!target) {
      msg.error("올바르게 지역을 선택 해주세요.");
    }
    return target;
  }

  const locateCollection = getIoCollection(ioFireStore, {
    c: "PICKUP_LOCATES",
  }).withConverter(locateFireConverter);
  const name = "pickupArea snapshot";
  const unsubscribe = onSnapshot(
    locateCollection,
    (snapshot) => {
      locates.value = [];
      snapshot.forEach((s) => {
        const data = s.data();
        if (data) {
          locates.value.push(data);
        }
      });
    },
    async (err) => {
      await onFirestoreErr(name, err);
      throw err;
    },
    () => onFirestoreCompletion(name)
  );

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
        value: getPickId(x),
      };
    })
  );
  return {
    areaOpt,
    officeOpt,
    locates,
    addPickArea,
    getPickId,
    unsubscribe,
  };
}

export const getPickId = (x: Locate) => `${x.code}__${x.alias}`;
export const isSamePickLocate = (a: Locate, b: Locate) =>
  getPickId(a) === getPickId(b);

export function uncleAvailShip(uncleL: Locate, clientL: Locate) {
  if (uncleL.city && uncleL.county && uncleL.town) {
    return (
      uncleL.city === clientL.city &&
      uncleL.county === clientL.county &&
      uncleL.town === clientL.town
    );
  } else if (uncleL.city && uncleL.county) {
    return uncleL.city === clientL.city && uncleL.county === clientL.county;
  } else if (uncleL.city) {
    return uncleL.city === clientL.city;
  }
  return false;
}
