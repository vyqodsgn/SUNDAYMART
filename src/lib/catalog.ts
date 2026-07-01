export interface CatalogOption {
  quantity: string;
  price: number;
}

export interface CatalogProduct {
  name: string;
  category: string;
  options: CatalogOption[];
}

export const PREDEFINED_PRODUCTS: CatalogProduct[] = [
  // Spices
  {
    name: 'Spicy Chilli Powder',
    category: 'Spices',
    options: [
      { quantity: '500 gm', price: 130 },
      { quantity: '200 gm', price: 65 }
    ]
  },
  {
    name: 'Kashmiri Chilli Powder',
    category: 'Spices',
    options: [
      { quantity: '500 gm', price: 195 },
      { quantity: '200 gm', price: 95 }
    ]
  },
  {
    name: 'Coriander Powder',
    category: 'Spices',
    options: [
      { quantity: '500 gm', price: 140 },
      { quantity: '200 gm', price: 56 }
    ]
  },
  {
    name: 'Turmeric Powder',
    category: 'Spices',
    options: [
      { quantity: '100 gm', price: 40 }
    ]
  },
  {
    name: 'Corn Powder',
    category: 'Spices',
    options: [
      { quantity: '500 gm', price: 60 }
    ]
  },
  // Snacks
  {
    name: 'Banana Chips',
    category: 'Snacks',
    options: [
      { quantity: '250 gm', price: 100 }
    ]
  },
  // Traditional Foods
  {
    name: 'Avalosu Powder',
    category: 'Traditional Foods',
    options: [
      { quantity: '250 gm', price: 100 }
    ]
  },
  // Pappadam
  {
    name: 'Pappadam',
    category: 'Pappadam',
    options: [
      { quantity: '8 Pieces', price: 10 },
      { quantity: '16 Pieces', price: 20 },
      { quantity: '25 Pieces', price: 35 },
      { quantity: '45 Pieces', price: 55 }
    ]
  },
  // Powders
  {
    name: 'Chutney Powder',
    category: 'Powders',
    options: [
      { quantity: '150 gm', price: 60 }
    ]
  },
  {
    name: 'Ginger Powder',
    category: 'Powders',
    options: [
      { quantity: '100 gm', price: 110 }
    ]
  },
  {
    name: 'Wheat Powder',
    category: 'Powders',
    options: [
      { quantity: '650 gm', price: 45 }
    ]
  },
  {
    name: 'Chammanthi Podi',
    category: 'Powders',
    options: [
      { quantity: '100 gm', price: 75 }
    ]
  },
  // Others
  {
    name: 'Spice Mix',
    category: 'Others',
    options: [
      { quantity: '1 Pack', price: 50 }
    ]
  },
  {
    name: 'Kalkandam White',
    category: 'Others',
    options: [
      { quantity: '500 gm', price: 55 }
    ]
  },
  {
    name: 'Kalkandam Gold',
    category: 'Others',
    options: [
      { quantity: '250 gm', price: 60 }
    ]
  },
  {
    name: 'Fresh Kanthari Chilli',
    category: 'Others',
    options: [
      { quantity: '100 gm', price: 80 }
    ]
  }
];

export const CATEGORIES = [
  'Spices',
  'Snacks',
  'Powders',
  'Pappadam',
  'Traditional Foods',
  'Others'
];
