import type { DateTime } from "luxon";

const getDateBasedOnIndexOfCalendar = (
  index: number, dateTime: DateTime
): { month: number; year: number; day: number } => {
  const firstDayOfMonth = dateTime.startOf('month').weekday;
  const totalDaysOfMonth = dateTime.daysInMonth || [];
  if (index + 1 < firstDayOfMonth) {
    const displayDate = dateTime.startOf('month').minus({ days: firstDayOfMonth - index - 1 });
    return { day: displayDate.day, month: displayDate.month, year: displayDate.year };
  }
  const dayOfMonth = index - firstDayOfMonth + 2;
  if (dayOfMonth > totalDaysOfMonth) {
    const displayDate = dateTime.plus({ month: 1 });
    return {
      day: index - totalDaysOfMonth - firstDayOfMonth + 2,
      month: displayDate.month,
      year: displayDate.year
    };
  }
  return { day: dayOfMonth, month: dateTime.month, year: dateTime.year };
};

export default function getCalendarDatesObject(dateTime: DateTime) {
  const calendarDatesObject = [];
  const dateCardLength = dateTime.startOf('month').weekday + dateTime.daysInMonth - 1 > 35 ? 42 : 35;
  for (let index = 0; index < dateCardLength; index++) {
    calendarDatesObject.push(getDateBasedOnIndexOfCalendar(index, dateTime));
    // console.log('test here', index, getDateBasedOnIndexOfCalendar(index));
  }
  return calendarDatesObject;
}