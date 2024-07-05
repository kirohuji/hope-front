// ----------------------------------------------------------------------
import _ from 'lodash'

export default function flattenArray(list, key = 'children') {
  let children = [];

  const flatten = list?.map((item) => {
    if (item[key] && item[key].length) {
      children = [...children, ...item[key]];
    }
    return item;
  });

  return flatten?.concat(_.compact(children).length ? flattenArray(_.compact(children), key) : _.compact(children));
}
