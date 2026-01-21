
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN'
}

export enum ApprovalStatus {
  UNREGISTERED = 'UNREGISTERED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum DriverType {
  ONLY_DRIVER = 'Only Driver',
  WITH_CAR = 'With Car'
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

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'driver';
  text: string;
  timestamp: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  password?: string;
  photo: string;
  rating: number;
  experience: number;
  specialties: VehicleType[];
  location: Coordinates;
  status: DriverStatus;
  approvalStatus: ApprovalStatus;
  driverType: DriverType;
  jobsCompleted: number;
  jobsLeft: number;
  hourlyRate: number;
  ratePerKm?: number;
  documents?: {
    license: string;
    aadhaar: string;
  };
}

export interface Booking {
  id: string;
  customerId: string;
  driverId: string;
  driverName: string;
  driverPhoto: string;
  driverPhone: string;
  status: BookingStatus;
  timestamp: number;
  pickupLocation: string;
  messages?: ChatMessage[];
}
