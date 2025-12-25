export const PLATFORMS = [
  { label: "Booking.com", value: "BOOKING" },
  { label: "Agoda", value: "AGODA" },
  { label: "Airbnb", value: "AIRBNB" },
  { label: "Expedia", value: "EXPEDIA" },
  { label: "Direct", value: "DIRECT" },
] as const;

export type Platform = (typeof PLATFORMS)[number]["value"];
