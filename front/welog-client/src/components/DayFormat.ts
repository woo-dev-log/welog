import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const DayFormat = (date: Date) => {
    const now = dayjs().tz('Asia/Seoul');
    const localDate = dayjs(date).tz('Asia/Seoul');

    if (now.diff(localDate, 'year') !== 0 || now.diff(localDate, 'month') > 1) {
        return localDate.format('YY.MM.DD HH:mm');
    }

    const diffInSeconds = now.diff(localDate, 'second');
    const diffInMinutes = now.diff(localDate, 'minute');
    const diffInHours = now.diff(localDate, 'hour');
    const diffInDays = now.diff(localDate, 'day');

    if (diffInSeconds < 60) {
        return `${diffInSeconds}초 전`;
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
        return `${diffInHours}시간 전`;
    } else if (diffInDays < 31) {
        return `${diffInDays}일 전`;
    }
}

export default DayFormat;