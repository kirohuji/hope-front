import { isSameDay, isSameMonth, getYear } from 'date-fns';
// utils
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export function shortDateLabel(startDate, endDate) {
  const getCurrentYear = new Date().getFullYear();

  const startDateYear = startDate ? getYear(startDate) : null;

  const endDateYear = endDate ? getYear(endDate) : null;

  const currentYear = getCurrentYear === startDateYear && getCurrentYear === endDateYear;

  const sameDay = startDate && endDate ? isSameDay(new Date(startDate), new Date(endDate)) : false;

  const sameMonth =
    startDate && endDate ? isSameMonth(new Date(startDate), new Date(endDate)) : false;

  if (currentYear) {
    if (sameMonth) {
      if (sameDay) {
        return fDate(endDate, 'yy 年 MM月 dd日');
      }
      return `${fDate(startDate, 'yy 年 MM月 dd日')} 到 ${fDate(endDate, 'dd日')}`;
    }
    return `${fDate(startDate, 'yy年MM月dd日')} 到 ${fDate(endDate, 'MM月dd日')}`;
  }

  return `${fDate(startDate, 'yy年MM月dd日')} 到 ${fDate(endDate, 'yy年MM月dd日')}`;
}
