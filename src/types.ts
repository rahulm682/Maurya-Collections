export type Gender = 'Boys' | 'Girls' | 'Unisex';
export type AgeGroup = 'Baby (0-2)' | 'Toddler (2-5)' | 'Kids (5-12)' | 'Teens (12-18)';

export interface Product {
  id: string;
  name: string;
  gender: Gender;
  ageGroup: AgeGroup;
  category: string;
  priceMin: number;      // Price range minimum
  priceMax: number;      // Price range maximum
  likes: number;         // Customer interest indicator
  sizes: string[];       // Available sizes (e.g., '6-12M', '2T', '10Y')
  colors: string[];      // Available colors (e.g., 'Pink', 'Yellow', 'Blue')
  images: string[];      // Multiple product photograph URLs
  imageColor: string;    // CSS background class for the visual fallback
  status?: 'listed' | 'unlisted'; // 'listed' means publicly visible, 'unlisted' means seasonal/hidden
}

export interface CustomerRequest {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  village: string;       // Text input for village name
  productId: string;
  productName: string;
  requestedSize: string; // Restricted to specified product sizes
  requestedColor: string;// Restricted to specified product colors
  requestedAgeGroup: AgeGroup; // Restricted to specified product age group
  dateRequested: string;
  status: 'Pending' | 'Allocated' | 'Delivered' | 'Cancelled';
  notes?: string;
}

export interface VillageRoute {
  id: string;
  name: string;
  visitDay: string;
  distance: string; // e.g., '12 km'
}

