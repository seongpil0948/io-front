import { Timestamp } from "@firebase/firestore";
import { format, subDays, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { ref } from "vue";

type TIME_FORMATS = "DAY" | "MIN";
const TIME_FORMATS = Object.freeze({
  DAY: "yyyy-MM-dd",
  MIN: "yyyy-MM-dd HH:mm",
});

export const formatDate = (t: Date, f: TIME_FORMATS = "DAY") =>
  format(t, TIME_FORMATS[f], { locale: ko });
export const getCurrDate = (f: TIME_FORMATS = "DAY") =>
  formatDate(new Date(), f);
export const timeToDate = (t: any, f: TIME_FORMATS = "DAY") =>
  formatDate(new Date(t), f);

export function dateToTimeStamp(d: Date | undefined): Timestamp {
  if (!d) {
    d = new Date();
  } else if (!(d instanceof Date)) {
    d = new Date(d);
  }
  return Timestamp.fromDate(d);
}
export function loadDate(
  d: Date | { [x: string]: number } | string | undefined
): Date {
  if (!d) return new Date();
  else if (d instanceof Date) return d;
  else if (typeof d === "string") return parseISO(d);
  // else if (d.seconds && d.constructor.name === "ut")
  // return new Date(d.seconds * 1000 + 60 * 60 * 9);
  // else if (d.seconds) return new Date(d.seconds * 1000);
  else if (d.seconds && d.constructor.name === "ut")
    return new Timestamp(d.seconds + 60 * 60 * 15, d.nanoseconds).toDate();
  else if (d.seconds) return new Timestamp(d.seconds, d.nanoseconds).toDate();
  else throw Error("Fail to load Date");
}

// export const commonTime = () => {
//   const currDate = moment().format(TimeFormat);
//   const defaultDate = currDate;
//   const defaultEDate = currDate;
//   const defaultSDate = moment(defaultEDate, TimeFormat)
//     .subtract(7, "days")
//     .format(TimeFormat);
//   return {
//     timeToDate: (t: any, format?: string) =>
//       moment(t).format(format ?? TimeFormat), // str -> moment
//     timeFormat: TimeFormat,
//     currDate,
//     defaultDate,
//     defaultEDate,
//     defaultSDate,
//   };
// };

// export function dateComposition() {
//   const { defaultDate } = commonTime();
//   const timestamp = ref(moment(defaultDate).valueOf()); // ms for v-model
//   const date = ref(moment(defaultDate).format(TimeFormat));
//   const updateDate = function (ms: any) {
//     date.value = moment(new Date(ms)).format(TimeFormat); // ms Number -> moment
//   };
//   return {
//     timestamp,
//     date,
//     updateDate,
//   };
// }

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
