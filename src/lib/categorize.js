const KEYWORD_MAP = [
  {
    category: 'bills',
    keywords: [
      'airtime', 'data', 'mtn', 'airtel', 'glo', '9mobile',
      'bills', 'subscription', 'netflix', 'spotify', 'apple music',
      'utility', 'electricity', 'rent', 'internet', 'wifi',
      'dstv', 'gotv', 'showmax', 'water', 'gas bill',
    ],
  },
  {
    category: 'transport',
    keywords: [
      'uber', 'bolt', 'taxi', 'transport', 'fuel', 'gas',
      'bus', 'train', 'parking', 'okada', 'keke', 'tricycle',
      'fare', 'commute', 'petrol', 'diesel', 'toll',
    ],
  },
  {
    category: 'food',
    keywords: [
      'restaurant', 'food', 'lunch', 'dinner', 'breakfast',
      'groceries', 'snack', 'coffee', 'drink', 'pizza',
      'burger', 'rice', 'chicken', 'suya', 'jollof',
      'supermarket', 'shoprite', 'spar',
    ],
  },
  {
    category: 'shopping',
    keywords: [
      'amazon', 'jiji', 'jumia', 'clothes', 'shoes', 'gadget',
      'shopping', 'mall', 'phone', 'laptop', 'accessories',
      'fashion', 'bag', 'watch', 'jewelry',
    ],
  },
];

export function detectCategory(note) {
  if (!note || !note.trim()) return null;
  const lower = note.toLowerCase();

  for (const { category, keywords } of KEYWORD_MAP) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return category;
    }
  }

  return null;
}
