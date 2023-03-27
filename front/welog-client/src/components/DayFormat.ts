import dayjs from "dayjs";

const DayFormat = (date: string) => {
    const now = {
        year: dayjs().get("year"),
        month: dayjs().get("month") + 1,
        day: dayjs().get("date"),
        hour: dayjs().get("hour"),
        minute: dayjs().get("minute"),
        second: dayjs().get("second")
    }

    const localDate = dayjs(date).subtract(9, "hour");
    const rgstrDate = {
        year: dayjs(localDate).get("year"),
        month: dayjs(localDate).get("month") + 1,
        day: dayjs(localDate).get("date"),
        hour: dayjs(localDate).get("hour"),
        minute: dayjs(localDate).get("minute"),
        second: dayjs(localDate).get("second")
    }
    if (now.year !== rgstrDate.year) return localDate.format('YY.MM.DD HH:mm');
    if (dayjs().diff(localDate, "day") > 31) return localDate.format('YY.MM.DD HH:mm');
    if (now.day !== rgstrDate.day) return now.day - rgstrDate.day + "일전";

    if (now.hour === rgstrDate.hour) {
        if(now.minute === rgstrDate.minute) return now.second - rgstrDate.second + "초전";
        return now.minute - rgstrDate.minute + "분전";
    } else {
        return now.hour - rgstrDate.hour + "시간전";
    }
}

export default DayFormat;