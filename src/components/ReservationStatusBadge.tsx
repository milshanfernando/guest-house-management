export function ReservationStatusBadge({
  reservationStatus,
}: {
  reservationStatus: string;
}) {
  const map: Record<string, string> = {
    BOOKED: "bg-blue-100 text-blue-700",
    CHECKED_IN: "bg-green-100 text-green-700",
    CHECKED_OUT: "bg-gray-200 text-gray-700",
  };

  return (
    <span
      className={`text-xs px-3 py-1 rounded-full font-medium ${
        map[reservationStatus] ?? "bg-gray-100"
      }`}
    >
      {reservationStatus.replace("_", " ")}
    </span>
  );
}
