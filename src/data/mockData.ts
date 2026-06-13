import { Product, CustomerRequest, VillageRoute } from '../types';

export const INITIAL_VILLAGES: VillageRoute[] = [
  { id: 'v1', name: 'Rampur', visitDay: 'Monday', distance: '12 km' },
  { id: 'v2', name: 'Sunderpur', visitDay: 'Wednesday', distance: '18 km' },
  { id: 'v3', name: 'Chandanpur', visitDay: 'Friday', distance: '8 km' },
  { id: 'v4', name: 'Gopalpur', visitDay: 'Saturday', distance: '15 km' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Sparkly Floral Frock Party Dress',
    gender: 'Girls',
    ageGroup: 'Kids (5-12)',
    category: 'Frocks & Dresses',
    priceMin: 550,
    priceMax: 680,
    likes: 42,
    sizes: ['6-7Y', '8-9Y', '10-12Y'],
    colors: ['Pink', 'Rose Gold', 'Peach'],
    images: [
      'https://images.unsplash.com/photo-1622290291468-a28f7a7ac6a8?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&auto=format&fit=crop&q=80'
    ],
    imageColor: 'bg-rose-100 text-rose-700',
    status: 'listed'
  },
  {
    id: 'p2',
    name: 'Traditional Festival Silk Lehenga',
    gender: 'Girls',
    ageGroup: 'Teens (12-18)',
    category: 'Ethnic Wear',
    priceMin: 1200,
    priceMax: 1450,
    likes: 56,
    sizes: ['13-14Y', '15-16Y', '17-18Y'],
    colors: ['Ruby Red', 'Maroon', 'Golden Green'],
    images: [
      'https://images.unsplash.com/photo-1540479859555-17af45c78602?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&auto=format&fit=crop&q=80'
    ],
    imageColor: 'bg-purple-100 text-purple-700',
    status: 'listed'
  },
  {
    id: 'p3',
    name: 'Pastel Baby Romper 3-Pack',
    gender: 'Unisex',
    ageGroup: 'Baby (0-2)',
    category: 'Rompers & Sets',
    priceMin: 320,
    priceMax: 410,
    likes: 18,
    sizes: ['0-6M', '6-12M', '12-18M'],
    colors: ['Mint', 'Lemon Yellow', 'Sky Blue'],
    images: [
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622290291468-a28f7a7ac6a8?w=600&auto=format&fit=crop&q=80'
    ],
    imageColor: 'bg-teal-100 text-teal-700',
    status: 'listed'
  },
  {
    id: 'p4',
    name: 'Cute Cotton Sunflower Jumpsuit',
    gender: 'Girls',
    ageGroup: 'Toddler (2-5)',
    category: 'Jumpsuits',
    priceMin: 450,
    priceMax: 499,
    likes: 29,
    sizes: ['2-3Y', '3-4Y', '4-5Y'],
    colors: ['Sunshine Yellow', 'Bright Orange', 'Beige'],
    images: [
      'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&auto=format&fit=crop&q=80'
    ],
    imageColor: 'bg-amber-100 text-amber-700',
    status: 'listed'
  },
  {
    id: 'p5',
    name: 'Super Champion Sports Jersey',
    gender: 'Boys',
    ageGroup: 'Kids (5-12)',
    category: 'T-Shirts & Tops',
    priceMin: 280,
    priceMax: 350,
    likes: 15,
    sizes: ['5-6Y', '7-8Y', '9-10Y', '11-12Y'],
    colors: ['Athletic Blue', 'Neon Green', 'Crimson Red'],
    images: [
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&auto=format&fit=crop&q=80'
    ],
    imageColor: 'bg-blue-100 text-blue-700',
    status: 'listed'
  },
  {
    id: 'p6',
    name: 'Royal Heritage Velvet Sherwani',
    gender: 'Boys',
    ageGroup: 'Kids (5-12)',
    category: 'Ethnic Wear',
    priceMin: 1100,
    priceMax: 1390,
    likes: 38,
    sizes: ['6-7Y', '8-9Y', '10-12Y'],
    colors: ['Royal Blue', 'Golden Ivory'],
    images: [
      'https://images.unsplash.com/photo-1540479859555-17af45c78602?w=600&auto=format&fit=crop&q=80'
    ],
    imageColor: 'bg-yellow-100 text-yellow-800',
    status: 'listed'
  }
];

export const INITIAL_REQUESTS: CustomerRequest[] = [
  {
    id: 'r1',
    customerName: 'Sunita Devi',
    phone: '9876543210',
    email: 'sunita.devi@gmail.com',
    village: 'Rampur',
    productId: 'p1',
    productName: 'Sparkly Floral Frock Party Dress',
    requestedSize: '8-9Y',
    requestedColor: 'Pink',
    requestedAgeGroup: 'Kids (5-12)',
    dateRequested: '2026-06-11',
    status: 'Allocated',
    notes: 'Needs it for her daughter\'s school annual day. Pink is highly preferred!'
  },
  {
    id: 'r2',
    customerName: 'Anil Kumar',
    phone: '9432109876',
    email: 'anil.kumar@yahoo.com',
    village: 'Sunderpur',
    productId: 'p5',
    productName: 'Super Champion Sports Jersey',
    requestedSize: '9-10Y',
    requestedColor: 'Athletic Blue',
    requestedAgeGroup: 'Kids (5-12)',
    dateRequested: '2026-06-13',
    status: 'Pending',
    notes: 'Please bring with blue stripes! Kid is waiting since last week.'
  }
];
