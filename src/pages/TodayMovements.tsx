/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { CheckCircle, LogOut, RefreshCw, Building2, Brush } from "lucide-react";

import { useReservationsCheckIn } from "../hooks/useReservationsCheckIn";
import { useReservationsCheckOut } from "../hooks/useReservationsCheckOut";
import { useUpdateReservation } from "../hooks/useUpdateReservation";
import { useUpdateRoomStatus } from "../hooks/useUpdateRoomStatus";
import { ReservationStatusBadge } from "../components/ReservationStatusBadge";
import { useProperties } from "../hooks/useProperties";
import type { Property } from "../types/types";
import { formatDate } from "../utility/date";

export default function TodayMovements() {
  const [tab, setTab] = useState<"IN" | "OUT">("IN");
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    null
  );

  const today = new Date().toLocaleDateString("en-CA");
  const { data: properties = [] } = useProperties();

  const checkInQuery = useReservationsCheckIn(selectedPropertyId ?? 0, today);
  const checkOutQuery = useReservationsCheckOut(selectedPropertyId ?? 0, today);

  const { mutate: updateReservation, isPending } = useUpdateReservation();
  const { mutate: updateRoomStatus, isPending: roomUpdating } =
    useUpdateRoomStatus();

  const data = tab === "IN" ? checkInQuery.data : checkOutQuery.data;
  const isLoading =
    tab === "IN" ? checkInQuery.isLoading : checkOutQuery.isLoading;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header + Property Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          Today Guest Movements
        </h1>

        <div className="w-full lg:w-72">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property
          </label>
          <div className="relative">
            <Building2
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              value={selectedPropertyId ?? ""}
              onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white text-sm"
            >
              <option value="" disabled>
                Select Property
              </option>
              {properties.map((p: Property) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs + Refresh */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setTab("IN")}
          className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${
            tab === "IN"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Today Check-Ins
        </button>

        <button
          onClick={() => setTab("OUT")}
          className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${
            tab === "OUT"
              ? "bg-gray-800 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Today Check-Outs
        </button>

        {selectedPropertyId && (
          <button
            onClick={() =>
              tab === "IN" ? checkInQuery.refetch() : checkOutQuery.refetch()
            }
            className="ml-auto flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {!selectedPropertyId ? (
          <div className="p-12 text-center text-gray-400 bg-white rounded-lg shadow-sm border border-gray-200">
            Please select a property
          </div>
        ) : isLoading ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200">
            Loading...
          </div>
        ) : data?.length === 0 ? (
          <div className="p-12 text-center text-gray-400 bg-white rounded-lg shadow-sm border border-gray-200">
            No reservations found
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((res: any) => (
              <div
                key={res.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-md transition-shadow"
              >
                {/* LEFT */}
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-800 text-lg">
                    {res.guest?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    📞 {res.guest?.contactNo ?? "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Room {res.room?.name} • {res.room?.size}
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(res.checkInDateTime)} →{" "}
                    {formatDate(res.checkOutDateTime)}
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <ReservationStatusBadge
                    reservationStatus={res.reservationStatus}
                  />

                  {tab === "IN" && res.reservationStatus === "BOOKED" && (
                    <button
                      disabled={isPending}
                      onClick={() =>
                        updateReservation({ id: res.id, status: "CHECKED_IN" })
                      }
                      className="flex items-center gap-1 px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle size={16} /> Check In
                    </button>
                  )}

                  {tab === "OUT" && res.reservationStatus === "CHECKED_IN" && (
                    <button
                      disabled={isPending}
                      onClick={() =>
                        updateReservation({ id: res.id, status: "CHECKED_OUT" })
                      }
                      className="flex items-center gap-1 px-4 py-2 text-sm rounded-lg bg-gray-800 text-white hover:bg-black disabled:opacity-50 transition-colors"
                    >
                      <LogOut size={16} /> Check Out
                    </button>
                  )}

                  {tab === "OUT" &&
                    res.reservationStatus === "CHECKED_OUT" &&
                    res.room?.id &&
                    res.room?.roomStatus !== "DIRTY" && (
                      <button
                        disabled={roomUpdating}
                        onClick={() => {
                          if (
                            confirm("Mark this room as DIRTY for housekeeping?")
                          ) {
                            updateRoomStatus({
                              roomId: res.room.id,
                              body: {
                                name: res.room.name,
                                type: res.room.type,
                                roomStatus: "DIRTY",
                                size: res.room.size,
                                propertyId: res.room.propertyId,
                              },
                            });
                          }
                        }}
                        className="flex items-center gap-1 px-4 py-2 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 transition-colors"
                      >
                        <Brush size={16} /> Mark Dirty
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
