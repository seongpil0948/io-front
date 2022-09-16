import { Timestamp } from "@firebase/firestore";
import moment from "moment";
import { ref } from "vue";

export function dateToTimeStamp(d: Date | undefined): Timestamp {
  if (!d) {
    d = new Date();
  } else if (!(d instanceof Date)) {
    d = new Date(d);
  }
  return Timestamp.fromDate(d);
}
export function loadDate(d: Date | { [x: string]: number } | string): Date {
  if (!d) return new Date();
  else if (d instanceof Date) return d;
  else if (typeof d === "string") return new Date(d);
  else if (d.seconds) return new Date(d.seconds * 1000);
  else throw Error("Fail to load Date");
}

const TimeFormat = "YYYY-MM-DD";

export const commonTime = () => {
  const currDate = moment().format(TimeFormat);
  const defaultDate = currDate;
  const defaultEDate = currDate;
  const defaultSdate = moment(defaultEDate, TimeFormat)
    .subtract(7, "days")
    .format(TimeFormat);
  return {
    timeToDate: (t: any) => moment(t).format(TimeFormat), // str -> moment
    timeFormat: TimeFormat,
    currDate,
    defaultDate,
    defaultEDate,
    defaultSdate,
  };
};

export function dateComposition() {
  const { defaultDate } = commonTime();
  const timestamp = ref(moment(defaultDate).valueOf()); // ms for v-model
  const date = ref(moment(defaultDate).format(TimeFormat));
  const updateDate = function (ms: any) {
    date.value = moment(new Date(ms)).format(TimeFormat); // ms Number -> moment
  };
  return {
    timestamp,
    date,
    updateDate,
  };
}

export function dateRanges(useDefault = false) {
  const { defaultSdate, defaultEDate } = commonTime();
  const dateRangeTime = useDefault
    ? ref([
        moment(defaultSdate, TimeFormat).valueOf(), // ms
        moment(defaultEDate, TimeFormat).valueOf(),
      ])
    : ref(null);
  const startDate = useDefault ? ref(defaultSdate) : ref(null);
  const endDate = useDefault ? ref(defaultEDate) : ref(null);

  const updateDate = () => {
    startDate.value = dateRangeTime.value
      ? commonTime().timeToDate(dateRangeTime.value[0])
      : null;
    endDate.value = dateRangeTime.value
      ? commonTime().timeToDate(dateRangeTime.value[1])
      : null;
  };

  return {
    dateRangeTime,
    startDate,
    endDate,
    updateDate,
    diableGenerator:
      ({ maxDate = 7 }) =>
      (time: any) => {
        const t = moment(time);
        return !(
          !t.isAfter(moment()) && t.isAfter(moment().subtract(maxDate, "days"))
        );
      },
    // Range, whatever today
    // (time, phase, range) => {
    //   const mmt = moment(time);
    //   if (phase === "start" && range !== null) {
    //     const diffD = moment(range[1]).diff(mmt, "days");
    //     return diffD < 0 || diffD >= maxDate;
    //   }
    //   if (phase === "end" && range !== null) {
    //     const diffD = mmt.diff(moment(range[0]), "days");
    //     return diffD < 0 || diffD >= maxDate;
    //   }
    // },
  };
}
