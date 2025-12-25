// src/types/types.ts

// Property type
export interface Property {
  id: number;
  name: string;
  address?: string;
}

// Room type
export type RoomType = "AC" | "Non-AC" | string;
export type RoomSize = "single" | "double" | "suite" | string;

export interface Room {
  id: number;
  name: string; // e.g., "Room 101"
  type: RoomType; // e.g., "AC"
  size: RoomSize; // e.g., "single"
  propertyId: number;
  roomStatus: string;
}

// Reservation type
export interface Reservation {
  id: number;
  roomId: number;
  propertyId: number;
  guestName: string;
  mobile?: string;
  checkin: string; // ISO date string
  checkout: string; // ISO date string
  status: "booked" | "checked-in" | "checked-out" | "cancelled" | string;
  bookingPlatform?: string;
}
