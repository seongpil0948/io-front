import { shipAreas } from "@/asset/administrationAreas";
import { uniqueFilter } from "@/util";
import { computed } from "vue";

export function useAdminArea() {
  const codes = computed(() => uniqueFilter(shipAreas.map((x) => x.code)));
  const cities = computed(() => uniqueFilter(shipAreas.map((x) => x.city)));
  const counties = computed(() => uniqueFilter(shipAreas.map((x) => x.county)));
  const towns = computed(() => uniqueFilter(shipAreas.map((x) => x.town)));

  const areaDict = computed(() =>
    shipAreas.reduce((acc, curr) => {
      if (!acc[curr.city]) {
        acc[curr.city] = {};
        acc[curr.city][curr.county] = [curr.town];
      } else if (!acc[curr.city][curr.county]) {
        acc[curr.city][curr.county] = [curr.town];
      } else {
        acc[curr.city][curr.county].push(curr.town);
      }
      return acc;
    }, {} as { [city: string]: { [county: string]: string[] } })
  );
  return {
    areaDict,
    codes,
    counties,
    towns,
    cities,
  };
}

export function usePickArea() {
  // 추후 픽업지역 관리자페이지에서 등록 가능하도록.
  const data = new Array(10).fill(1).map((x, idx) => {
    return {
      city: "지역" + idx,
      alias: "건물" + idx,
    };
  });
  const areaOpt = computed(() =>
    data.map((x) => {
      return {
        label: x.city,
        value: x.city,
      };
    })
  );
  const officeOpt = computed(() =>
    data.map((x) => {
      return {
        label: x.alias,
        value: x.alias,
      };
    })
  );
  return { areaOpt, officeOpt };
}
