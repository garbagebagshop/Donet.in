import { db } from "./db";
import { 
  users, drivers, bookings, chats,
  type User, type InsertUser, 
  type Driver, type InsertDriver, 
  type Booking, type InsertBooking, type UpdateBookingRequest,
  type Chat, type InsertChat,
  type DriverWithUser
} from "../shared/schema";
import { eq, and, desc } from "drizzle-orm";

import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Driver operations
  createDriver(driver: InsertDriver): Promise<Driver>;
  getDriver(id: number): Promise<Driver | undefined>;
  getDriverByUserId(userId: number): Promise<Driver | undefined>;
  updateDriver(id: number, updates: Partial<InsertDriver>): Promise<Driver>;
  listDrivers(filters?: { vehicleType?: string; citySector?: string }): Promise<DriverWithUser[]>;
  getPendingDrivers(): Promise<DriverWithUser[]>;

  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByCustomer(customerId: number): Promise<(Booking & { customer: User; driver: DriverWithUser })[]>;
  getBookingsByDriver(driverId: number): Promise<(Booking & { customer: User; driver: DriverWithUser })[]>;
  updateBooking(id: number, status: string): Promise<Booking>;
  
  // Chat operations
  createChat(chat: InsertChat): Promise<Chat>;
  getChatsByBooking(bookingId: number): Promise<(Chat & { sender: User })[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const [driver] = await db.insert(drivers).values(insertDriver).returning();
    return driver;
  }

  async getDriver(id: number): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
    return driver;
  }

  async getDriverByUserId(userId: number): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.userId, userId));
    return driver;
  }

  async updateDriver(id: number, updates: Partial<InsertDriver>): Promise<Driver> {
    const [driver] = await db.update(drivers)
      .set(updates)
      .where(eq(drivers.id, id))
      .returning();
    return driver;
  }

  async listDrivers(filters?: { vehicleType?: string; citySector?: string }): Promise<DriverWithUser[]> {
    let query = db.select({
      id: drivers.id,
      userId: drivers.userId,
      licenseUrl: drivers.licenseUrl,
      aadhaarUrl: drivers.aadhaarUrl,
      vehicleType: drivers.vehicleType,
      isFleet: drivers.isFleet,
      hourlyRate: drivers.hourlyRate,
      perKmRate: drivers.perKmRate,
      isOnline: drivers.isOnline,
      subscriptionStatus: drivers.subscriptionStatus,
      subscriptionExpiry: drivers.subscriptionExpiry,
      isVerified: drivers.isVerified,
      currentLat: drivers.currentLat,
      currentLng: drivers.currentLng,
      citySector: drivers.citySector,
      user: users
    })
    .from(drivers)
    .innerJoin(users, eq(drivers.userId, users.id))
    .where(and(eq(drivers.isVerified, true), eq(drivers.isOnline, true)));

    if (filters?.vehicleType) {
      query = query.where(eq(drivers.vehicleType, filters.vehicleType as any)); // Type assertion for enum
    }
    
    // City sector filtering would be more complex with exact string match, simplified here
    if (filters?.citySector) {
        query = query.where(eq(drivers.citySector, filters.citySector));
    }

    const results = await query;
    return results.map(r => ({ ...r, user: r.user }));
  }

  async getPendingDrivers(): Promise<DriverWithUser[]> {
    const results = await db.select({
      id: drivers.id,
      userId: drivers.userId,
      licenseUrl: drivers.licenseUrl,
      aadhaarUrl: drivers.aadhaarUrl,
      vehicleType: drivers.vehicleType,
      isFleet: drivers.isFleet,
      hourlyRate: drivers.hourlyRate,
      perKmRate: drivers.perKmRate,
      isOnline: drivers.isOnline,
      subscriptionStatus: drivers.subscriptionStatus,
      subscriptionExpiry: drivers.subscriptionExpiry,
      isVerified: drivers.isVerified,
      currentLat: drivers.currentLat,
      currentLng: drivers.currentLng,
      citySector: drivers.citySector,
      user: users
    })
    .from(drivers)
    .innerJoin(users, eq(drivers.userId, users.id))
    .where(eq(drivers.isVerified, false));

    return results.map(r => ({ ...r, user: r.user }));
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }

  async getBookingsByCustomer(customerId: number): Promise<(Booking & { customer: User; driver: DriverWithUser })[]> {
    // This is a complex join, simplifying for now or doing multiple queries
    // Drizzle relations are easier to use with query API
    const results = await db.query.bookings.findMany({
      where: eq(bookings.customerId, customerId),
      with: {
        customer: true,
        driver: {
          with: {
            user: true
          }
        }
      },
      orderBy: desc(bookings.createdAt)
    });
    return results as any; 
  }

  async getBookingsByDriver(driverId: number): Promise<(Booking & { customer: User; driver: DriverWithUser })[]> {
    const results = await db.query.bookings.findMany({
      where: eq(bookings.driverId, driverId),
      with: {
        customer: true,
        driver: {
          with: {
            user: true
          }
        }
      },
      orderBy: desc(bookings.createdAt)
    });
    return results as any;
  }

  async updateBooking(id: number, status: string): Promise<Booking> {
    const [booking] = await db.update(bookings)
      .set({ status: status as any })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    const [chat] = await db.insert(chats).values(insertChat).returning();
    return chat;
  }

  async getChatsByBooking(bookingId: number): Promise<(Chat & { sender: User })[]> {
    const results = await db.select()
      .from(chats)
      .where(eq(chats.bookingId, bookingId))
      .leftJoin(users, eq(chats.senderId, users.id))
      .orderBy(chats.timestamp);
    return results.map(row => ({
      ...row.chats,
      sender: row.users!
    })) as any;
  }
}

export const storage = new DatabaseStorage();
