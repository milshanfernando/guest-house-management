/* eslint-disable @typescript-eslint/no-explicit-any */
// Reservations.tsx
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { Home, Calendar, RefreshCw } from "lucide-react";
import { useProperties } from "../hooks/useProperties";
import { useRooms } from "../hooks/useRooms";
import { useGuests } from "../hooks/useGuests";
import { ReservationPaymentModal } from "../components/ReservationPaymentModal";
import { useReservationsByDate } from "../hooks/useReservationsByDate";
import { CreateGuestModal } from "../components/CreateGuestModal";
import toast from "react-hot-toast";
// import { useDeleteReservation } from "../hooks/useDeleteReservation";
// import { useReservations } from "../hooks/useReservations";

interface Guest {
  id: number;
  name: string;
  nic: string;
  passport: string;
  country: string;
  contactNo: string;
  email: string;
}

const Reservations = () => {
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [guestSearch, setGuestSearch] = useState("");
  const [paymentReservationId, setPaymentReservationId] = useState<
    number | null
  >(null);
  const [reservationStatus, setReservationStatus] = useState<string>("BOOKED");
  const [reservationDate, setReservationDate] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openGuestModal, setOpenGuestModal] = useState(false);

  const { data: properties = [] } = useProperties();
  const { data: rooms = [] } = useRooms(selectedProperty ?? undefined);
  const { data: reservations = [] } = useReservationsByDate(
    selectedProperty ?? undefined,
    reservationDate
  );
  const { data: guests = [] } = useGuests(guestSearch);

  const createReservationMutation = useMutation({
    mutationFn: async () => {
      if (!selectedGuest || !selectedProperty)
        throw new Error("Select room and guest first");

      const res = await api.post("/reservations", {
        roomId: selectedRoom,
        date: new Date().toISOString(),
        checkInDateTime: new Date(checkIn).toISOString(),
        checkOutDateTime: new Date(checkOut).toISOString(),
        guestId: selectedGuest.id,
        reservationStatus,
        propertyId: selectedProperty,
      });

      return res.data;
    },
    onSuccess: () => {
      setSuccessMessage("Reservation created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setSelectedRoom(null);
      setSelectedGuest(null);
      setCheckIn("");
      setCheckOut("");
    },
  });

  const [loading, setLoading] = useState(false);
  const handleRefresh = async () => {
    // Clear all states

    setLoading(true);
    setSelectedProperty(null);
    setSelectedRoom(null);
    setSelectedGuest(null);
    setGuestSearch("");
    setPaymentReservationId(null);
    setReservationStatus("BOOKED"); // or "" if you prefer empty
    setReservationDate("");
    setCheckIn("");
    setCheckOut("");
    setSuccessMessage("");

    // Refetch all queries
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["reservations"] }),
      queryClient.invalidateQueries({ queryKey: ["rooms"] }),
      queryClient.invalidateQueries({ queryKey: ["guests"] }),
      queryClient.invalidateQueries({ queryKey: ["properties"] }),
    ]);

    toast.success("All states cleared and data refreshed!");
    setLoading(false);
  };

  // const { mutate: deleteReservation, isPending: isDeletingReservation } =
  //   useDeleteReservation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-600 rounded-2xl shadow-lg">
            <Home className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Reservations</h1>
            <p className="text-gray-500">Create & manage hotel reservations</p>
          </div>
        </div>

        {/* Property & Date */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4">
          <select
            value={selectedProperty ?? ""}
            onChange={(e) => setSelectedProperty(Number(e.target.value))}
            className="input"
          >
            <option value="" disabled>
              Select Property
            </option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={reservationDate}
            onChange={(e) => setReservationDate(e.target.value)}
            className="input"
          />

          <button onClick={handleRefresh} className="btn-secondary">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />{" "}
            Refresh
          </button>
        </div>

        {successMessage && (
          <div className="rounded-xl bg-green-50 text-green-700 px-4 py-3 shadow-sm">
            {successMessage}
          </div>
        )}

        {/* Add Reservation */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
            <Calendar className="w-5 h-5 text-blue-600" /> Add Reservation
          </h2>

          {/* Guest Search */}
          <div className="grid sm:grid-cols-3 gap-4">
            <input
              placeholder="Search guest (Name / NIC / Passport)"
              value={guestSearch}
              onChange={(e) => {
                setGuestSearch(e.target.value);
                setSelectedGuest(null);
              }}
              className="input sm:col-span-2"
            />
            <button
              onClick={() => setOpenGuestModal(true)}
              className="btn-primary"
            >
              + Add New Guest
            </button>
          </div>

          {/* Guest Results */}
          {guests.length > 0 && !selectedGuest && (
            <div className="bg-gray-50 rounded-xl divide-y max-h-44 overflow-y-auto">
              {guests.map((g) => (
                <div
                  key={g.id}
                  onClick={() => {
                    setSelectedGuest(g);
                    setGuestSearch("");
                  }}
                  className="px-4 py-3 cursor-pointer hover:bg-blue-50 transition"
                >
                  <p className="font-medium">{g.name}</p>
                  <p className="text-sm text-gray-500">{g.nic || g.passport}</p>
                </div>
              ))}
            </div>
          )}

          {/* Selected Guest */}
          {selectedGuest && (
            <div className="bg-blue-50 rounded-xl p-4 grid sm:grid-cols-4 gap-4 text-sm">
              {[
                ["Name", selectedGuest.name],
                [
                  "NIC / Passport",
                  selectedGuest.nic || selectedGuest.passport || "-",
                ],
                ["Contact", selectedGuest.contactNo || "-"],
                ["Country", selectedGuest.country || "-"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-gray-500">{label}</p>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Reservation Inputs */}
          {selectedGuest && (
            <div className="grid sm:grid-cols-4 gap-4">
              <select
                value={selectedRoom ?? ""}
                onChange={(e) =>
                  setSelectedRoom(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="input"
              >
                <option value="">No Room (Optional)</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="input"
              />
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="input"
              />

              <select
                value={reservationStatus}
                onChange={(e) => setReservationStatus(e.target.value)}
                className="input"
              >
                <option value="BOOKED">BOOKED</option>
                <option value="CHECKED_IN">CHECKED IN</option>
                <option value="CHECKED_OUT">CHECKED OUT</option>
              </select>
            </div>
          )}

          {selectedGuest && selectedProperty && (
            <button
              onClick={() => createReservationMutation.mutate()}
              className="btn-success"
            >
              Create Reservation
            </button>
          )}
        </div>

        {/* Reservation List */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {reservations.map((r) => {
            const isPending = r.paymetStatus === "PENDING";
            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl p-4 shadow-sm space-y-2"
              >
                <h3 className="font-semibold text-gray-800">{r.guest.name}</h3>
                <p className="text-sm text-gray-500">Room: {r.room.name}</p>
                <p className="text-xs text-gray-400">
                  {new Date(r.checkInDateTime).toLocaleString()}
                </p>

                {isPending && (
                  <button
                    onClick={() => setPaymentReservationId(r.id)}
                    className="w-full mt-2 py-2 rounded-xl bg-green-600 text-white"
                  >
                    Make Payment
                  </button>
                )}
                {/* <button
                  onClick={() => deleteReservation(r.id)}
                  disabled={isDeletingReservation}
                  className="w-full mt-2 py-2 rounded-xl bg-red-600 text-white"
                >
                  {isDeletingReservation ? "Deleting..." : "Delete Reservation"}
                </button> */}
              </div>
            );
          })}
        </div>
      </div>

      {paymentReservationId && selectedProperty && (
        <ReservationPaymentModal
          open={!!paymentReservationId}
          reservationId={paymentReservationId}
          propertyId={selectedProperty}
          onClose={() => setPaymentReservationId(null)}
        />
      )}

      <CreateGuestModal
        open={openGuestModal}
        onClose={() => setOpenGuestModal(false)}
        onSuccess={(guest) => {
          toast.success("Guest created successfully");
          setSelectedGuest(guest);
          setGuestSearch("");
        }}
      />
    </div>
  );
};

export default Reservations;
