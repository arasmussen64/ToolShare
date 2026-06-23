"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  AppData,
  Booking,
  BookingStatus,
  Review,
  Tool,
  User,
} from "./types";
import { getSeedData, DEMO_USER_ID } from "./seed";
import { bookingDays, conflictingBookings } from "./helpers";

const STORAGE_KEY = "toolshare_state_v4";
const SESSION_KEY = "toolshare_user_v4";

// Older schema versions we proactively clean up to reclaim quota.
const STALE_KEYS = [
  "toolshare_state_v1",
  "toolshare_state_v2",
  "toolshare_state_v3",
  "toolshare_user_v1",
  "toolshare_user_v2",
  "toolshare_user_v3",
];

interface NewToolInput {
  title: string;
  category: Tool["category"];
  description: string;
  pricePerDay: number;
  deposit: number;
  location: string;
  condition: Tool["condition"];
  image: string;
}

interface NewBookingInput {
  toolId: string;
  startDate: string;
  endDate: string;
}

interface StoreContextValue extends AppData {
  hydrated: boolean;
  currentUser: User | null;
  login: (userId: string) => void;
  logout: () => void;
  createAccount: (name: string, email: string, location: string) => User;
  addTool: (input: NewToolInput) => Tool | null;
  requestBooking: (input: NewBookingInput) => Booking | null;
  setBookingStatus: (bookingId: string, status: BookingStatus) => void;
  addReview: (toolId: string, rating: number, comment: string) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const AVATAR_COLORS = [
  "from-emerald-400 to-teal-600",
  "from-rose-400 to-pink-600",
  "from-amber-400 to-orange-600",
  "from-sky-400 to-indigo-600",
  "from-violet-400 to-fuchsia-600",
  "from-lime-400 to-green-600",
];

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Seed gives a deterministic first render that matches the server.
  const [data, setData] = useState<AppData>(() => getSeedData());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const didHydrate = useRef(false);

  // Load persisted state from localStorage after mount. Hydrating React state
  // from an external store post-mount is the intended use of an effect — the
  // first render must match the server (which has no localStorage), so this
  // cannot move into a useState initializer.
  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      STALE_KEYS.forEach((k) => localStorage.removeItem(k));
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppData;
        if (parsed && Array.isArray(parsed.tools)) {
          setData(parsed);
        }
      }
      const session = localStorage.getItem(SESSION_KEY);
      if (session) setCurrentUserId(session);
    } catch {
      // Ignore corrupt storage and fall back to the seed.
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Persist whenever data changes (after hydration so we don't clobber storage).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      // Most likely QuotaExceededError from large uploaded images.
      console.warn("ToolShare: could not persist state to localStorage.", err);
    }
  }, [data, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (currentUserId) localStorage.setItem(SESSION_KEY, currentUserId);
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, [currentUserId, hydrated]);

  const currentUser = useMemo(
    () => data.users.find((u) => u.id === currentUserId) ?? null,
    [data.users, currentUserId]
  );

  const login = useCallback((userId: string) => setCurrentUserId(userId), []);
  const logout = useCallback(() => setCurrentUserId(null), []);

  const createAccount = useCallback(
    (name: string, email: string, location: string) => {
      const user: User = {
        id: uid("u"),
        name: name.trim() || "New User",
        email: email.trim(),
        location: location.trim() || "Unknown",
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        bio: "Just joined ToolShare.",
        joinedYear: new Date().getFullYear(),
      };
      setData((d) => ({ ...d, users: [...d.users, user] }));
      setCurrentUserId(user.id);
      return user;
    },
    []
  );

  const addTool = useCallback(
    (input: NewToolInput): Tool | null => {
      if (!currentUserId) return null;
      const tool: Tool = {
        id: uid("t"),
        ownerId: currentUserId,
        title: input.title,
        category: input.category,
        description: input.description,
        pricePerDay: input.pricePerDay,
        deposit: input.deposit,
        location: input.location,
        condition: input.condition,
        image: input.image,
        createdAt: new Date().toISOString(),
      };
      setData((d) => ({ ...d, tools: [tool, ...d.tools] }));
      return tool;
    },
    [currentUserId]
  );

  const requestBooking = useCallback(
    (input: NewBookingInput): Booking | null => {
      if (!currentUserId) return null;
      const tool = data.tools.find((t) => t.id === input.toolId);
      if (!tool) return null;
      // Owners cannot rent their own tool.
      if (tool.ownerId === currentUserId) return null;
      const days = bookingDays(input.startDate, input.endDate);
      if (days <= 0) return null;
      // Enforce availability in the mutation layer, not just the UI.
      if (
        conflictingBookings(data.bookings, tool.id, input.startDate, input.endDate)
          .length > 0
      ) {
        return null;
      }
      const booking: Booking = {
        id: uid("b"),
        toolId: tool.id,
        renterId: currentUserId,
        ownerId: tool.ownerId,
        startDate: input.startDate,
        endDate: input.endDate,
        days,
        totalPrice: days * tool.pricePerDay,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      setData((d) => ({ ...d, bookings: [booking, ...d.bookings] }));
      return booking;
    },
    [currentUserId, data.tools, data.bookings]
  );

  const setBookingStatus = useCallback(
    (bookingId: string, status: BookingStatus) => {
      setData((d) => ({
        ...d,
        bookings: d.bookings.map((b) =>
          b.id === bookingId ? { ...b, status } : b
        ),
      }));
    },
    []
  );

  const addReview = useCallback(
    (toolId: string, rating: number, comment: string) => {
      if (!currentUser) return;
      const review: Review = {
        id: uid("r"),
        toolId,
        authorId: currentUser.id,
        authorName: currentUser.name,
        rating,
        comment: comment.trim(),
        date: new Date().toISOString().slice(0, 10),
      };
      setData((d) => ({ ...d, reviews: [review, ...d.reviews] }));
    },
    [currentUser]
  );

  const resetDemo = useCallback(() => {
    const seed = getSeedData();
    setData(seed);
    setCurrentUserId(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value: StoreContextValue = {
    ...data,
    hydrated,
    currentUser,
    login,
    logout,
    createAccount,
    addTool,
    requestBooking,
    setBookingStatus,
    addReview,
    resetDemo,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export { DEMO_USER_ID };
