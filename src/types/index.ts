import type { StoredOrder, StoredResolution } from "@/lib/store";

/** Shape of the AI generation response (resolution plan or greeting card). */
export interface GeneratedResult {
  title?: string;
  category?: string;
  motivationalQuote?: string;
  milestones?: string[];
  actionTip?: string;
  quote?: string;
  wishes?: string[];
  signature?: string;
}

/** RSVP ticket shown on the events page after a successful booking. */
export interface ConfirmedTicket {
  code: string;
  name: string;
  email: string;
  passType: string;
  guestsCount: number;
  downgraded?: boolean;
}

/** Common fields shared by MongoDB users and local-store users. */
export interface UserLike {
  _id: { toString(): string } | string;
  userId?: string;
  name: string;
  email: string;
  password?: string;
  plan?: string;
  avatar?: string;
  themePreference?: string;
  bio?: string;
  customGreeting?: string;
  confettiSoundsEnabled?: boolean;
  createdAt?: Date | string;
}

/** Session payload embedded in the auth cookie / JWT. */
export interface SessionUser {
  userId: string;
  name: string;
  email: string;
  plan: string;
  avatar: string;
}

/** Item accepted by the order creation endpoint. */
export interface OrderItemInput {
  id: number;
  name: string;
  price: number;
  qty: number;
  img?: string;
  discount?: string;
}

export type { StoredOrder, StoredResolution };

/** Item in the gift portfolio grid. */
export interface PortfolioItem {
  id: number;
  name: string;
  category: string;
  img: string;
  price: number;
  discount: string;
}

/** Resolution as returned by the public feed. */
export interface PublicResolution {
  _id: string;
  goal: string;
  category?: string;
  motivationalQuote?: string;
  authorName?: string;
  createdAt?: string;
}

/** Guest shown in the "recently joined" list on /events. */
export interface Attendee {
  _id?: string;
  guestName: string;
  passType?: string;
  celebrationWish?: string;
  createdAt?: string;
}
