export const getLabelFromValue = (value, mapping) => {
  const mappingItem = mapping.find((item) => item.value === value);
  return mappingItem ? mappingItem.label : '未知';
};
