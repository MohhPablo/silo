export const CATEGORIES = [
  { id: 'food', label: 'Food', color: '#ff9f0a' },
  { id: 'transport', label: 'Transport', color: '#5e5ce6' },
  { id: 'shopping', label: 'Shopping', color: '#ff375f' },
  { id: 'bills', label: 'Bills', color: '#30d158' },
  { id: 'other', label: 'Other', color: '#8e8e93' },
];

const byId = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export function getCategory(id) {
  return byId[id] || byId.other;
}

export function getCategoryColor(id) {
  return (byId[id] || byId.other).color;
}

export function getCategoryLabel(id) {
  return (byId[id] || byId.other).label;
}

export function getCategoryColorClass(id) {
  return { backgroundColor: getCategoryColor(id) };
}

export function getCategoryBgClass(id) {
  const color = getCategoryColor(id);
  return `${color}1A`;
}

export function getCategoryColorHex(id) {
  return getCategoryColor(id);
}
