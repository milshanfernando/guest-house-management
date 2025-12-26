/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import {
  RefreshCw,
  User,
  Bed,
  Phone,
  Calendar,
  Users,
  Hotel,
} from "lucide-react";

import { useProperties } from "../hooks/useProperties";
import { useRooms } from "../hooks/useRooms";
import { useInHouseReservations } from "../hooks/useInHouseReservations";
import { useUpdateRoomStatus } from "../hooks/useUpdateRoomStatus";

import type { Property } from "../types/types";
import type { Reservation } from "../types/reservation";

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

const Dashboard = () => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<number>();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [updatingRoomNo, setUpdatingRoomNo] = useState<number | undefined>();

  /** Queries */
  const { data: properties = [], isLoading: propertiesLoading } =
    useProperties();

  const { data: rooms = [], isLoading: roomsLoading } =
    useRooms(selectedPropertyId);

  const { data: inHouseReservations = [], isLoading: reservationsLoading } =
    useInHouseReservations(selectedPropertyId, selectedDate);

  const loading = propertiesLoading || roomsLoading || reservationsLoading;

  /** Auto select first property */
  useEffect(() => {
    if (!selectedPropertyId && properties.length > 0) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties, selectedPropertyId]);

  /** Derived Data */
  const occupiedRoomIds = new Set(inHouseReservations.map((r) => r.roomId));
  const availableRooms = rooms.filter((room) => !occupiedRoomIds.has(room.id));

  /** Stats */
  const stats = [
    { label: "Total Rooms", value: rooms.length, color: "text-gray-800" },
    {
      label: "In-House",
      value: inHouseReservations.length,
      color: "text-green-700",
    },
    {
      label: "Available",
      value: availableRooms.length,
      color: "text-blue-700",
    },
  ];

  const ROOM_STATUS_STYLES: Record<
    string,
    { bg: string; text: string; dot: string }
  > = {
    AVAILABLE: {
      bg: "bg-green-50",
      text: "text-green-700",
      dot: "bg-green-500",
    },
    CLEAN: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    NEED_CLEANING: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-500",
    },
    DIRTY: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  };

  const { mutate: updateRoomStatus, isPending: updatingRoom } =
    useUpdateRoomStatus();

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
          {/* Property */}
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Property
            </label>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option disabled>Select Property</option>
              {properties.map((p: Property) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Refresh */}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* STATS */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg bg-gray-50 p-3 text-center"
            >
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-600">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* IN-HOUSE ROOMS */}
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Hotel className="w-5 h-5 text-green-600" />
          In-House Guests
        </h2>

        {loading ? (
          <div className="text-center py-10 bg-white rounded-xl border">
            <RefreshCw className="w-10 h-10 animate-spin mx-auto text-blue-600 mb-2" />
            Loading in-house rooms...
          </div>
        ) : inHouseReservations.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border text-gray-500">
            No in-house guests
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {inHouseReservations.map((res: Reservation) => (
              <div
                key={res.id}
                className="bg-white rounded-xl border shadow-sm hover:shadow-md transition p-4"
              >
                {/* Header */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{res.room.name}</h3>
                  <div className="flex gap-2 justify-end">
                    {(res.room.roomStatus == "CLEAN" ||
                      res.room.roomStatus == "AVAILABLE") && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        Clean
                      </span>
                    )}
                    {res.room.roomStatus == "DIRTY" && (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                        Dirty
                      </span>
                    )}
                    {res.room.roomStatus == "NEED_CLEANING" && (
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                        Need Cleaning
                      </span>
                    )}
                    {res.reservationStatus == "AVAILABLE" && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        Available
                      </span>
                    )}
                    {res.reservationStatus == "CHECKED_IN" && (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                        Occupied
                      </span>
                    )}
                    {res.reservationStatus == "BOOKED" && (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                        Reserved
                      </span>
                    )}
                  </div>
                </div>

                {/* Room Info */}
                <div className="mt-2 flex gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    {res.room.type}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {res.room.size}
                  </div>
                </div>

                {/* Guest */}
                <div className="mt-4 pt-3 border-t space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    <User className="w-4 h-4" />
                    {res.guest.name}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    {res.guest.contactNo}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {formatDate(res.checkInDateTime)} →{" "}
                    {formatDate(res.checkOutDateTime)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AVAILABLE ROOMS */}
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Bed className="w-5 h-5 text-blue-600" />
          Available Rooms
        </h2>

        {availableRooms.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border text-gray-500">
            No available rooms
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableRooms.map((room) => {
              const statusStyle =
                ROOM_STATUS_STYLES[room.roomStatus] ||
                ROOM_STATUS_STYLES.AVAILABLE;

              const handleUpdateStatus = () => {
                setUpdatingRoomNo(room.id);
                updateRoomStatus({
                  roomId: room.id,
                  body: {
                    name: room.name,
                    type: room.type,
                    size: room.size,
                    propertyId: room.propertyId,
                    roomStatus: "AVAILABLE", // mark as available
                  },
                });
              };

              return (
                <div
                  key={room.id}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Room Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {room.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {room.type} · {room.size}
                      </p>
                    </div>

                    {/* Status Dot */}
                    <span
                      className={`w-3 h-3 rounded-full ${statusStyle.dot}`}
                      title={room.roomStatus}
                    />
                  </div>

                  {/* Status Badge */}
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    {room.roomStatus.replace("_", " ")}
                  </div>

                  {/* Update Status Button */}
                  {room.roomStatus === "DIRTY" && (
                    <button
                      onClick={handleUpdateStatus}
                      disabled={updatingRoom}
                      className="mt-3 w-full py-1 text-sm bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50"
                    >
                      {updatingRoom && updatingRoomNo === room.id
                        ? "Updating..."
                        : "Mark as Available"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
