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
  },
  {
    id: 'p7',
    name: 'Cotton Comfort Multi-Pack Socks',
    gender: 'Unisex',
    ageGroup: 'All Age Groups',
    category: 'Accessories',
    priceMin: 120,
    priceMax: 180,
    likes: 31,
    sizes: ['Free Size', 'S', 'M', 'L'],
    colors: ['White', 'Navy Blue', 'Mixed Pack'],
    images: [
      'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=600&auto=format&fit=crop&q=80'
    ],
    imageColor: 'bg-emerald-100 text-emerald-800',
    status: 'listed'
  },
  {
    id: 'p8',
    name: 'Pure Cotton Handkerchiefs 5-Pack',
    gender: 'Unisex',
    ageGroup: 'All Age Groups',
    category: 'Accessories',
    priceMin: 150,
    priceMax: 220,
    likes: 19,
    sizes: ['Standard'],
    colors: ['White', 'Pastel Pink', 'Light Blue'],
    images: [
      'https://images.unsplash.com/photo-1613521131754-082006df677d?w=600&auto=format&fit=crop&q=80'
    ],
    imageColor: 'bg-slate-100 text-slate-705',
    status: 'listed'
  },
  {
    id: 'p9',
    name: 'Baby Boys Blue Cotton Denim Dungaree Suit',
    gender: 'Boys',
    ageGroup: 'Baby (0-2)',
    category: 'Rompers & Sets',
    priceMin: 420,
    priceMax: 540,
    likes: 24,
    sizes: ['6-12M', '12-18M', '18-24M'],
    colors: ['Denim Blue', 'Classic Indigo'],
    images: [
      'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&auto=format&fit=crop&q=80'
    ],
    imageColor: 'bg-sky-100 text-sky-800',
    status: 'listed'
  },
  {
    id: 'p10',
    name: 'Baby Girls Yellow Floral Tiered Dress',
    gender: 'Girls',
    ageGroup: 'Baby (0-2)',
    category: 'Frocks & Dresses',
    priceMin: 480,
    priceMax: 590,
    likes: 35,
    sizes: ['3-6M', '6-12M', '12-18M', '18-24M'],
    colors: ['Sunshine Yellow', 'Cream Floral'],
    images: [
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&auto=format&fit=crop&q=80'
    ],
    imageColor: 'bg-yellow-105 text-yellow-900',
    status: 'listed'
  },
  {
    id: 'p11',
    name: 'Newborn Soft Cotton Swaddle & Booties Set',
    gender: 'Unisex',
    ageGroup: 'Baby (0-2)',
    category: 'Rompers & Sets',
    priceMin: 220,
    priceMax: 290,
    likes: 12,
    sizes: ['Newborn', '0-3M'],
    colors: ['Buttercream', 'Mint green'],
    images: [
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&auto=format&fit=crop&q=80'
    ],
    imageColor: 'bg-neutral-100 text-neutral-800',
    status: 'listed'
  },
  {
    id: 'p12',
    name: 'Toddler Boys Classic Plaid Button-Up Shirt',
    gender: 'Boys',
    ageGroup: 'Toddler (2-5)',
    category: 'T-Shirts & Tops',
    priceMin: 299,
    priceMax: 380,
    likes: 21,
    sizes: ['2-3Y', '3-4Y', '4-5Y'],
    colors: ['Red-Blue Plaid', 'Green-Navy Plaid'],
    images: [
      'https://images.unsplash.com/photo-1613521131754-082006df677d?w=600&auto=format&fit=crop&q=80'
    ],
    imageColor: 'bg-red-50 text-red-800',
    status: 'listed'
  },
  {
    id: 'p13',
    name: 'Toddler Girls Floral Sundress',
    gender: 'Girls',
    ageGroup: 'Toddler (2-5)',
    category: 'Frocks & Dresses',
    priceMin: 390,
    priceMax: 470,
    likes: 47,
    sizes: ['2-3Y', '3-4Y', '4-5Y'],
    colors: ['Lavender Rose', 'Sky Blue Daisy'],
    images: [
      'https://images.unsplash.com/photo-1622290291468-a28f7a7ac6a8?w=600&auto=format&fit=crop&q=80'
    ],
    imageColor: 'bg-purple-50 text-purple-800',
    status: 'listed'
  },
  {
    id: 'p14',
    name: 'Toddler Cotton Dungarees Set',
    gender: 'Unisex',
    ageGroup: 'Toddler (2-5)',
    category: 'Jumpsuits',
    priceMin: 499,
    priceMax: 599,
    likes: 33,
    sizes: ['2-3Y', '3-4Y', '4-5Y'],
    colors: ['Fawn Brown', 'Mustard Yellow'],
    images: [
      'https://images.unsplash.com/photo-1540479859555-17af45c78602?w=600&auto=format&fit=crop&q=80'
    ],
    imageColor: 'bg-orange-50 text-orange-800',
    status: 'listed'
  },
  {
    id: 'p15',
    name: 'Boys Camouflage Cargo Shorts & Tee',
    gender: 'Boys',
    ageGroup: 'Kids (5-12)',
    category: 'Jumpsuits',
    priceMin: 420,
    priceMax: 520,
    likes: 27,
    sizes: ['5-6Y', '7-8Y', '9-10Y', '11-12Y'],
    colors: ['Jungle Camo', 'Desert Sand/Navy'],
    images: [
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&auto=format&fit=crop&q=80'
    ],
    imageColor: 'bg-green-100 text-green-800',
    status: 'listed'
  },
  {
    id: 'p16',
    name: 'Girls Embroidered Cotton Kurti',
    gender: 'Girls',
    ageGroup: 'Kids (5-12)',
    category: 'Ethnic Wear',
    priceMin: 590,
    priceMax: 780,
    likes: 64,
    sizes: ['5-6Y', '7-8Y', '9-10Y', '11-12Y'],
    colors: ['Earthy Fushia', 'Teal Blue', 'Marigold Yellow'],
    images: [
      'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&auto=format&fit=crop&q=80'
    ],
    imageColor: 'bg-pink-100 text-pink-800',
    status: 'listed'
  },
  {
    id: 'p17',
    name: 'Kids Fleece Hooded Sweatshirt',
    gender: 'Unisex',
    ageGroup: 'Kids (5-12)',
    category: 'Outerwear & Sweaters',
    priceMin: 360,
    priceMax: 450,
    likes: 19,
    sizes: ['5-6Y', '7-8Y', '9-10Y', '11-12Y'],
    colors: ['Heather Grey', 'Charcoal Black', 'Cherry Red'],
    images: [
      'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=600&auto=format&fit=crop&q=80'
    ],
    imageColor: 'bg-slate-200 text-slate-800',
    status: 'listed'
  },
  {
    id: 'p18',
    name: 'Teens Casual Denim Jacket',
    gender: 'Boys',
    ageGroup: 'Teens (12-18)',
    category: 'Outerwear & Sweaters',
    priceMin: 850,
    priceMax: 1100,
    likes: 52,
    sizes: ['S', 'M', 'L'],
    colors: ['Stone-Wash Blue', 'Vintage Black'],
    images: [
      'https://images.unsplash.com/photo-1613521131754-082006df677d?w=600&auto=format&fit=crop&q=80'
    ],
    imageColor: 'bg-cyan-50 text-cyan-800',
    status: 'listed'
  },
  {
    id: 'p19',
    name: 'Teens High-Waist Denim Skirt',
    gender: 'Girls',
    ageGroup: 'Teens (12-18)',
    category: 'T-Shirts & Tops',
    priceMin: 450,
    priceMax: 580,
    likes: 41,
    sizes: ['26', '28', '30', '32'],
    colors: ['Ice Blue', 'Solid Jet-Black'],
    images: [
      'https://images.unsplash.com/photo-1622290291468-a28f7a7ac6a8?w=600&auto=format&fit=crop&q=80'
    ],
    imageColor: 'bg-indigo-50 text-indigo-800',
    status: 'listed'
  },
  {
    id: 'p20',
    name: 'Teens Oversized Graphic Hoodie',
    gender: 'Unisex',
    ageGroup: 'Teens (12-18)',
    category: 'Outerwear & Sweaters',
    priceMin: 699,
    priceMax: 899,
    likes: 49,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Forest Green', 'Off-White', 'Sunset Peach'],
    images: [
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&auto=format&fit=crop&q=80'
    ],
    imageColor: 'bg-green-50 text-green-950',
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
  },
  {
    id: 'r3',
    customerName: 'Kamal Kishor',
    phone: '9555123456',
    email: 'kamal.kishor@outlook.com',
    village: 'Gopalpur',
    productId: 'p7',
    productName: 'Cotton Comfort Multi-Pack Socks',
    requestedSize: 'L',
    requestedColor: 'Navy Blue',
    requestedAgeGroup: 'All Age Groups',
    dateRequested: '2026-06-12',
    status: 'Allocated',
    notes: 'Needs durable socks for walking near the paddy fields. Free size/L'
  },
  {
    id: 'r4',
    customerName: 'Rinki Yadav',
    phone: '9822334455',
    email: 'rinki.yadav@gmail.com',
    village: 'Chandanpur',
    productId: 'p10',
    productName: 'Baby Girls Yellow Floral Tiered Dress',
    requestedSize: '12-18M',
    requestedColor: 'Sunshine Yellow',
    requestedAgeGroup: 'Baby (0-2)',
    dateRequested: '2026-06-13',
    status: 'Pending',
    notes: 'Gift for sibling\'s birthday celebration scheduled in winter. Warm layered feel!'
  },
  {
    id: 'r5',
    customerName: 'Karan Sharma',
    phone: '9900881122',
    email: 'karan.sharma2@gmail.com',
    village: 'Sunderpur',
    productId: 'p18',
    productName: 'Teens Casual Denim Jacket',
    requestedSize: 'M',
    requestedColor: 'Stone-Wash Blue',
    requestedAgeGroup: 'Teens (12-18)',
    dateRequested: '2026-06-12',
    status: 'Allocated',
    notes: 'Teen requested classical faded denim color specifically.'
  },
  {
    id: 'r6',
    customerName: 'Shanti Patra',
    phone: '9123456789',
    email: 'shanti.patra@yahoo.com',
    village: 'Rampur',
    productId: 'p8',
    productName: 'Pure Cotton Handkerchiefs 5-Pack',
    requestedSize: 'Standard',
    requestedColor: 'White',
    requestedAgeGroup: 'All Age Groups',
    dateRequested: '2026-06-10',
    status: 'Delivered',
    notes: 'Required standard white 5-pack for daily farm work.'
  }
];
