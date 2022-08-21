import { adminAreas } from "@/asset/administrationAreas";
import { uniqueFilter } from "@/util";
import { computed } from "vue";

export function useAdminArea() {
  const codes = computed(() => uniqueFilter(adminAreas.map((x) => x.code)));
  const cities = computed(() => uniqueFilter(adminAreas.map((x) => x.city)));
  const counties = computed(() =>
    uniqueFilter(adminAreas.map((x) => x.county))
  );
  const towns = computed(() => uniqueFilter(adminAreas.map((x) => x.town)));

  const areaDict = computed(() =>
    adminAreas.reduce((acc, curr) => {
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
