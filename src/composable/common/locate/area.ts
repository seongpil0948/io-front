import { shipAreas } from "@/asset/administrationAreas";
import { uniqueFilter, choice } from "@/util";
import { computed } from "vue";
import { TreeSelectOption } from "naive-ui";

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
  const { codes } = useAdminArea();
  // 추후 픽업지역 관리자페이지에서 등록 가능하도록.
  const data = computed(() => {
    const d: { code: string; city: string; alias: string }[] = [];
    for (let i = 1; i < 5; i++) {
      const city = "지역" + i;
      for (let j = 1; j < 5; j++) {
        const alias = "건물" + j;
        d.push({ code: choice(codes.value), city, alias });
      }
    }
    return d;
  });

  const areaOpt = computed(() => [
    {
      label: "지역1",
      value: "지역1",
    },
    {
      label: "지역2",
      value: "지역2",
    },
    {
      label: "지역3",
      value: "지역3",
    },
    {
      label: "지역4",
      value: "지역4",
    },
  ]);
  const officeOpt = computed(() =>
    data.value.map((x) => {
      return {
        label: x.alias,
        value: x.alias,
      };
    })
  );
  const treeOpt = computed(() =>
    data.value.reduce((acc, curr) => {
      const child: TreeSelectOption = { label: curr.alias, value: curr.alias };
      const parent = acc.find((x) => x.value === curr.city);
      if (!parent) {
        const cityOpt: TreeSelectOption = {
          label: curr.city,
          key: curr.city,
          children: [child],
        };
        acc.push(cityOpt);
      } else {
        acc.push(child);
      }
      return acc;
    }, [] as TreeSelectOption[])
  );
  return { areaOpt, officeOpt, treeOpt, data };
}
