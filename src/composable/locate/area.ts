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
