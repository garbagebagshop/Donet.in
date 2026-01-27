-- Database indexes for performance optimization
-- Run this after initial schema migration

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Drivers table indexes
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_is_online ON drivers(is_online);
CREATE INDEX IF NOT EXISTS idx_drivers_is_verified ON drivers(is_verified);
CREATE INDEX IF NOT EXISTS idx_drivers_subscription_status ON drivers(subscription_status);
CREATE INDEX IF NOT EXISTS idx_drivers_city_sector ON drivers(city_sector);
CREATE INDEX IF NOT EXISTS idx_drivers_vehicle_type ON drivers(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_drivers_current_location ON drivers(current_lat, current_lng) WHERE current_lat IS NOT NULL AND current_lng IS NOT NULL;

-- Bookings table indexes
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time) WHERE start_time IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_location ON bookings(pickup_lat, pickup_lng) WHERE pickup_lat IS NOT NULL AND pickup_lng IS NOT NULL;

-- Chats table indexes
CREATE INDEX IF NOT EXISTS idx_chats_booking_id ON chats(booking_id);
CREATE INDEX IF NOT EXISTS idx_chats_sender_id ON chats(sender_id);
CREATE INDEX IF NOT EXISTS idx_chats_timestamp ON chats(timestamp DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_drivers_online_verified ON drivers(is_online, is_verified) WHERE is_online = true;
CREATE INDEX IF NOT EXISTS idx_bookings_status_created ON bookings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drivers_city_online ON drivers(city_sector, is_online) WHERE is_online = true;