export type CategoryId =
  | "automotive"
  | "landscaping"
  | "power"
  | "hand"
  | "construction"
  | "heavy"
  | "painting"
  | "cleaning"
  | "plumbing"
  | "electrical"
  | "outdoor";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string; // tailwind gradient seed
  location: string;
  bio: string;
  joinedYear: number;
}

export interface Review {
  id: string;
  toolId: string;
  authorId: string;
  authorName: string;
  rating: number; // 1-5
  comment: string;
  date: string; // ISO date
}

export interface Tool {
  id: string;
  ownerId: string;
  title: string;
  category: CategoryId;
  description: string;
  pricePerDay: number;
  deposit: number;
  location: string;
  condition: "New" | "Like New" | "Good" | "Fair";
  /** Either an emoji used for the placeholder tile, or a data URL from an uploaded photo. */
  image: string;
  createdAt: string; // ISO
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "declined"
  | "cancelled"
  | "completed";

export interface Booking {
  id: string;
  toolId: string;
  renterId: string;
  ownerId: string;
  startDate: string; // ISO date (yyyy-mm-dd)
  endDate: string; // ISO date (yyyy-mm-dd)
  days: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string; // ISO
}

export interface AppData {
  users: User[];
  tools: Tool[];
  bookings: Booking[];
  reviews: Review[];
}
