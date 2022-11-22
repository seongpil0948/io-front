import { formatDate, timeToDate } from "@io-boxies/js-lib";
import { subDays } from "date-fns";
import { ref } from "vue";

export function dateRanges(useDefault = false) {
  // const defaultEDate = getCurrDate();
  const defaultEDate = new Date();
  const defaultSDate = subDays(new Date(), 7);
  const dateRangeTime = useDefault
    ? ref([
        defaultSDate.valueOf(), // ms
        defaultEDate.valueOf(),
      ])
    : ref(null);
  const startDate = useDefault ? ref(formatDate(defaultSDate)) : ref(null);
  const endDate = useDefault ? ref(formatDate(defaultEDate)) : ref(null);

  const updateDate = () => {
    startDate.value = dateRangeTime.value
      ? timeToDate(dateRangeTime.value[0])
      : null;
    endDate.value = dateRangeTime.value
      ? timeToDate(dateRangeTime.value[1])
      : null;
  };

  function updateRangeNaive(value: [string, string] | null) {
    if (value) {
      startDate.value = value[0];
      endDate.value = value[1];
    }
  }
  return {
    dateRangeTime,
    startDate,
    endDate,
    updateDate,
    updateRangeNaive,
  };
}
