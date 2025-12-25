// src/types/types.ts

// --------------------
// Property
// --------------------
export interface Property {
  id: number;
  name: string;
}

// --------------------
// Room
// --------------------
export type RoomType = "AC" | "Non-AC" | string;
export type RoomSize = "single" | "double" | "suite" | string;

export interface Room {
  id: number;
  name: string;
  type: RoomType;
  size: RoomSize;
  propertyId: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
  property: Property;
  roomStatus: string;
}

// --------------------
// Guest
// --------------------
export interface Guest {
  id: number;
  name: string;
  email: string;
  contactNo: string;
}

// --------------------
// User (Created / Updated By)
// --------------------
export interface User {
  id: number;
  name: string;
}

// --------------------
// Converted Date
// --------------------
export interface ConvertedDate {
  localTime: string;
  utcTime: string;
  timezone: string;
}

// --------------------
// Reservation
// --------------------
export type ReservationType = "DIRECT" | "ONLINE" | string;
export type PaymentStatus = "PAID" | "PENDING" | "CANCELLED" | string;

export interface Reservation {
  id: number;
  roomId: number;
  date: string;
  checkInDateTime: string;
  checkOutDateTime: string;
  status: string;

  type: ReservationType;
  paymetStatus: PaymentStatus;

  incomeId: number | null;
  guestId: number;

  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
  reservationStatus: string;
  room: Room;
  guest: Guest;

  createdByUser: User;
  updatedByUser: User;

  createdAtConverted: ConvertedDate;
  updatedAtConverted: ConvertedDate;
}
