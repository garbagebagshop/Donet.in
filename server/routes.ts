import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Set up authentication first
  setupAuth(app);

  // Seed Admin User if not exists
  const existingAdmin = await storage.getUserByUsername("8886575507");
  if (!existingAdmin) {
    const hashed = await hashPassword("Harsh@123");
    await storage.createUser({
      name: "Super Admin",
      username: "8886575507",
      password: hashed,
      role: "admin",
      profilePhoto: "https://ui-avatars.com/api/?name=Admin&background=random"
    });
    console.log("Admin user seeded");
  }

  // Seed some drivers
  const existingDrivers = await storage.listDrivers();
  if (existingDrivers.length === 0) {
      // Create Driver 1
      const hashed1 = await hashPassword("driver123");
      const user1 = await storage.createUser({
          name: "Ramesh Kumar",
          username: "9876543210",
          password: hashed1,
          role: "driver",
          profilePhoto: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop"
      });
      await storage.createDriver({
          userId: user1.id,
          vehicleType: "suv",
          hourlyRate: 150,
          perKmRate: 15,
          isOnline: true,
          isVerified: true,
          citySector: "Indiranagar",
          licenseUrl: "https://example.com/license.jpg",
          subscriptionStatus: "active"
      });

      // Create Driver 2
      const hashed2 = await hashPassword("driver456");
      const user2 = await storage.createUser({
          name: "Suresh Singh",
          username: "9876543211",
          password: hashed2,
          role: "driver",
          profilePhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop"
      });
      await storage.createDriver({
          userId: user2.id,
          vehicleType: "sedan",
          hourlyRate: 120,
          perKmRate: 12,
          isOnline: true,
          isVerified: true,
          citySector: "Koramangala",
          licenseUrl: "https://example.com/license2.jpg",
          subscriptionStatus: "active"
      });
      console.log("Drivers seeded");
  }

  // === DRIVER ROUTES ===
  app.get(api.drivers.list.path, async (req, res) => {
    const vehicleType = req.query.vehicleType as string | undefined;
    const citySector = req.query.citySector as string | undefined;
    const drivers = await storage.listDrivers({ vehicleType, citySector });
    res.json(drivers);
  });

  app.get(api.drivers.get.path, async (req, res) => {
    const driverId = parseInt(req.params.id);
    const driver = await storage.getDriver(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    const user = await storage.getUser(driver.userId);
    res.json({ ...driver, user });
  });

  app.patch(api.drivers.update.path, async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    // Ensure user owns this driver profile or is admin
    // For simplicity, assuming req.user.id is linked to driver logic check
    const driverId = parseInt(req.params.id);
    const driver = await storage.getDriver(driverId);
    
    if (!driver || (req.user.role !== 'admin' && driver.userId !== req.user.id)) {
      return res.status(403).send("Forbidden");
    }

    const updatedDriver = await storage.updateDriver(driverId, req.body);
    res.json(updatedDriver);
  });

  // === BOOKING ROUTES ===
  app.post(api.bookings.create.path, async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    try {
      const input = api.bookings.create.input.parse(req.body);
      // Ensure customerId matches logged in user
      if (input.customerId !== req.user.id) {
         return res.status(403).send("Forbidden: Can only book for yourself");
      }
      const booking = await storage.createBooking(input);
      res.status(201).json(booking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json(err.errors);
      }
      throw err;
    }
  });

  app.get(api.bookings.list.path, async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    
    if (req.user.role === 'customer') {
      const bookings = await storage.getBookingsByCustomer(req.user.id);
      return res.json(bookings);
    } else if (req.user.role === 'driver') {
      // Need to find driver ID for this user
      const driver = await storage.getDriverByUserId(req.user.id);
      if (!driver) return res.json([]);
      const bookings = await storage.getBookingsByDriver(driver.id);
      return res.json(bookings);
    }
    res.json([]);
  });

  app.patch(api.bookings.update.path, async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const id = parseInt(req.params.id);
    // Add logic to check if user belongs to this booking
    const updatedBooking = await storage.updateBooking(id, req.body.status);
    res.json(updatedBooking);
  });

  // === ADMIN ROUTES ===
  app.get(api.admin.getPendingDrivers.path, async (req, res) => {
    if (!req.user || req.user.role !== 'admin') return res.status(401).send("Unauthorized");
    const drivers = await storage.getPendingDrivers();
    res.json(drivers);
  });

  app.post(api.admin.verifyDriver.path, async (req, res) => {
    if (!req.user || req.user.role !== 'admin') return res.status(401).send("Unauthorized");
    const id = parseInt(req.params.id);
    const updatedDriver = await storage.updateDriver(id, { isVerified: req.body.isVerified });
    res.json(updatedDriver);
  });

  return httpServer;
}
