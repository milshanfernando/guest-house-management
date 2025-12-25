import type { Reservation } from "./reservation";

export interface Room {
  id: number;
  name: string;
  type: string;
  size: string;
  propertyId: number;
  reservation?: Reservation | null;
  status?: "occupied" | "available";
}
