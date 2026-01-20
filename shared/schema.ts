import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // Mobile number
  password: text("password").notNull(),
  role: text("role", { enum: ["customer", "driver", "admin"] }).notNull().default("customer"),
  name: text("name").notNull(),
  profilePhoto: text("profile_photo"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  licenseUrl: text("license_url"),
  aadhaarUrl: text("aadhaar_url"),
  vehicleType: text("vehicle_type", { enum: ["suv", "sedan", "auto", "manual", "automatic"] }),
  isFleet: boolean("is_fleet").default(false), // "With Car" vs "Only Driver"
  hourlyRate: integer("hourly_rate"),
  perKmRate: integer("per_km_rate"),
  isOnline: boolean("is_online").default(false),
  subscriptionStatus: text("subscription_status", { enum: ["active", "inactive"] }).default("inactive"),
  subscriptionExpiry: timestamp("subscription_expiry"),
  isVerified: boolean("is_verified").default(false), // Admin approval
  currentLat: numeric("current_lat"),
  currentLng: numeric("current_lng"),
  citySector: text("city_sector"),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => users.id),
  driverId: integer("driver_id").notNull().references(() => users.id), // Link to user or driver table? Let's link to user for simplicity in auth context, but better to driver table. Actually linking to user ID who is a driver is easier for auth checks. But let's link to driver table ID to ensure referential integrity with driver specific data.
  // Wait, driverId should refer to the drivers table or users table? Usually foreign keys point to the primary entity. Let's point to users table where role=driver for easier "sender_id" logic in chat.
  // Actually, to access driver specific fields easily, `drivers` table is better. But `users` is the auth entity.
  // Let's stick to `driverId` referencing `drivers.id` and `customerId` referencing `users.id`.
  status: text("status", { enum: ["pending", "accepted", "rejected", "completed", "cancelled"] }).default("pending"),
  pickupLocation: text("pickup_location").notNull(),
  dropLocation: text("drop_location"),
  pickupLat: numeric("pickup_lat"),
  pickupLng: numeric("pickup_lng"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  totalAmount: integer("total_amount"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ one, many }) => ({
  driverProfile: one(drivers, {
    fields: [users.id],
    references: [drivers.userId],
  }),
  customerBookings: many(bookings, { relationName: "customerBookings" }),
  sentMessages: many(chats),
}));

export const driversRelations = relations(drivers, ({ one, many }) => ({
  user: one(users, {
    fields: [drivers.userId],
    references: [users.id],
  }),
  bookings: many(bookings, { relationName: "driverBookings" }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  customer: one(users, {
    fields: [bookings.customerId],
    references: [users.id],
    relationName: "customerBookings",
  }),
  driver: one(drivers, {
    fields: [bookings.driverId],
    references: [drivers.id],
    relationName: "driverBookings",
  }),
  messages: many(chats),
}));

export const chatsRelations = relations(chats, ({ one }) => ({
  booking: one(bookings, {
    fields: [chats.bookingId],
    references: [bookings.id],
  }),
  sender: one(users, {
    fields: [chats.senderId],
    references: [users.id],
  }),
}));

// === SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertDriverSchema = createInsertSchema(drivers).omit({ id: true, userId: true, isVerified: true, subscriptionStatus: true, subscriptionExpiry: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true, status: true, totalAmount: true });
export const insertChatSchema = createInsertSchema(chats).omit({ id: true, timestamp: true });

// === TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Chat = typeof chats.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;

export type DriverWithUser = Driver & { user: User };
export type BookingWithDetails = Booking & { customer: User; driver: DriverWithUser };

export type CreateBookingRequest = InsertBooking;
export type UpdateBookingRequest = Partial<InsertBooking> & { status?: string };
