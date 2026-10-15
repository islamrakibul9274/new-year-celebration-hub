import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "db.json");

/** Documents as persisted in the JSON fallback store. */
export interface StoredUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  plan?: string;
  themePreference?: string;
  confettiSoundsEnabled?: boolean;
  customGreeting?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoredRSVP {
  _id: string;
  userId?: string | null;
  guestName: string;
  guestEmail: string;
  guestsCount: number;
  passType: string;
  venue?: string;
  eventDate?: string;
  celebrationWish?: string;
  ticketCode: string;
  status: string;
  createdAt?: string;
}

export interface StoredResolution {
  _id: string;
  userId?: string | null;
  userEmail?: string;
  authorName?: string;
  goal: string;
  category?: string;
  milestones?: string[];
  motivationalQuote?: string;
  aiPrompt?: string;
  createdAt?: string;
}

export interface StoredOrderItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  img?: string;
  discount?: string;
}

export interface StoredOrder {
  _id: string;
  orderNumber: string;
  userId?: string | null;
  items: StoredOrderItem[];
  subtotal: number;
  discountAmount?: number;
  total: number;
  couponCode?: string;
  status?: string;
  createdAt?: string;
}

interface DBStore {
  users: StoredUser[];
  rsvps: StoredRSVP[];
  resolutions: StoredResolution[];
  newsletters: string[];
  orders: StoredOrder[];
}

const EMPTY: DBStore = { users: [], rsvps: [], resolutions: [], newsletters: [], orders: [] };

function loadData(): DBStore {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(EMPTY, null, 2));
      return structuredClone(EMPTY);
    }
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as Partial<DBStore>;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      rsvps: Array.isArray(parsed.rsvps) ? parsed.rsvps : [],
      resolutions: Array.isArray(parsed.resolutions) ? parsed.resolutions : [],
      newsletters: Array.isArray(parsed.newsletters) ? parsed.newsletters : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    };
  } catch {
    return structuredClone(EMPTY);
  }
}

function saveData(data: DBStore) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to save local db", err);
  }
}

export const localDB = {
  findUserByEmail: (email: string): StoredUser | undefined =>
    loadData().users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  findUserById: (id: string): StoredUser | undefined =>
    loadData().users.find((u) => u._id === id),
  createUser: (user: Omit<StoredUser, "_id">): StoredUser => {
    const data = loadData();
    const newUser: StoredUser = {
      ...user,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.users.push(newUser);
    saveData(data);
    return newUser;
  },
  updateUser: (id: string, updates: Partial<StoredUser>): StoredUser | null => {
    const data = loadData();
    const idx = data.users.findIndex((u) => u._id === id);
    if (idx === -1) return null;
    data.users[idx] = {
      ...data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveData(data);
    return data.users[idx];
  },
  createRSVP: (rsvp: Omit<StoredRSVP, "_id">): StoredRSVP => {
    const data = loadData();
    const newRsvp: StoredRSVP = {
      ...rsvp,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    data.rsvps.push(newRsvp);
    saveData(data);
    return newRsvp;
  },
  getRSVPs: (): StoredRSVP[] => loadData().rsvps,
  createResolution: (res: Omit<StoredResolution, "_id">): StoredResolution => {
    const data = loadData();
    const newRes: StoredResolution = {
      ...res,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    data.resolutions.push(newRes);
    saveData(data);
    return newRes;
  },
  getResolutions: (): StoredResolution[] => loadData().resolutions,
  createNewsletter: (email: string): void => {
    const data = loadData();
    const clean = email.toLowerCase();
    if (!data.newsletters.includes(clean)) {
      data.newsletters.push(clean);
      saveData(data);
    }
  },
  createOrder: (order: Omit<StoredOrder, "_id">): StoredOrder => {
    const data = loadData();
    const newOrder: StoredOrder = {
      ...order,
      _id: Date.now().toString(),
      createdAt: order.createdAt || new Date().toISOString(),
    };
    data.orders.push(newOrder);
    saveData(data);
    return newOrder;
  },
  getOrders: (userId: string): StoredOrder[] =>
    loadData().orders.filter((o) => o.userId === userId),
};
