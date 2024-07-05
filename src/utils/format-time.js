import { format, getTime, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// ----------------------------------------------------------------------

export function fDate (date, newFormat) {
  // const fm = newFormat || 'dd MMM yyyy';
  const fm = newFormat || 'yyyy年MM月dd日';

  return date ? format(new Date(date), fm, {
    locale: zhCN
  }) : '';
}

export function fDateTime (date, newFormat) {
  const fm = newFormat || 'yyyy年MM月dd日 HH:mm';

  return date ? format(new Date(date), fm, {
    locale: zhCN
  }) : '';
}

export function fTimestamp (date) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow (date) {
  return date
    ? formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: zhCN
    })
    : '';
}
