import type { Room } from "../types/room";
import { formatDate } from "../utility/date";

export const RoomCard = ({ room }: { room: Room }) => {
  const occupied = room.status === "occupied";

  return (
    <div
      className={`rounded-lg border p-4 ${
        occupied ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"
      }`}
    >
      <h3 className="text-lg font-bold">{room.name}</h3>
      <p className="text-sm text-gray-600">
        {room.type} • {room.size}
      </p>

      {occupied && room.reservation ? (
        <div className="mt-3 text-sm">
          <div className="font-semibold">{room.reservation.guest.name}</div>
          <div>{room.reservation.guest.contactNo}</div>
          <div className="text-xs text-gray-500">
            {formatDate(room.reservation.checkInDateTime)} →{" "}
            {formatDate(room.reservation.checkOutDateTime)}
          </div>
        </div>
      ) : (
        <div className="mt-3 text-green-700 font-medium">Available</div>
      )}
    </div>
  );
};
