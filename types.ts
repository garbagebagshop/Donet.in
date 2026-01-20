
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER'
}

export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE'
}

export enum VehicleType {
  SEDAN = 'Sedan',
  SUV = 'SUV',
  LUXURY = 'Luxury',
  HATCHBACK = 'Hatchback',
  AUTOMATIC = 'Automatic',
  MANUAL = 'Manual'
}

export enum BookingStatus {
  REQUESTED = 'REQUESTED',
  ACCEPTED = 'ACCEPTED',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum VehicleProvision {
  DRIVER_OWNED = 'DRIVER_OWNED',
  CUSTOMER_OWNED = 'CUSTOMER_OWNED'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Driver {
  id: string;
  name: string;
  photo: string;
  rating: number;
  experience: number; // years
  age?: number;
  preferredArea?: string;
  specialties: VehicleType[];
  location: Coordinates;
  status: DriverStatus;
  distance?: number;
  jobsCompleted: number;
  subscriptionActive: boolean;
  freeJobsLeft: number;
  additionalCharges: number;
  hourlyRate?: number;
  vehicleProvision?: VehicleProvision;
}

export interface Booking {
  id: string;
  customerId: string;
  driverId: string;
  driverName: string;
  driverPhoto: string;
  status: BookingStatus;
  timestamp: number;
  pickupLocation: string;
  destinationLocation?: string;
}
