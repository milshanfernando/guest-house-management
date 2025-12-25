/* eslint-disable @typescript-eslint/no-explicit-any */
// Reservations.tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "../api/axios";
import { Home, Calendar, UserPlus, RefreshCw } from "lucide-react";
import { useProperties } from "../hooks/useProperties";
import { useRooms } from "../hooks/useRooms";
import { useReservations } from "../hooks/useReservations";
import { useGuests } from "../hooks/useGuests";
import { ReservationPaymentModal } from "../components/ReservationPaymentModal";

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
  const [selectedProperty, setSelectedProperty] = useState<number>(1);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const [guestSearch, setGuestSearch] = useState("");
  const [showNewGuestForm, setShowNewGuestForm] = useState(false);

  const [paymentReservationId, setPaymentReservationId] = useState<
    number | null
  >(null);

  const [reservationStatus, setReservationStatus] = useState<string>("BOOKED");

  const [newGuest, setNewGuest] = useState({
    name: "",
    nic: "",
    passport: "",
    country: "",
    contactNo: "",
    email: "",
  });

  const [reservationDate, setReservationDate] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* -------------------- DATA -------------------- */

  const { data: properties = [] } = useProperties();
  const { data: rooms = [] } = useRooms(selectedProperty);
  const { data: reservations = [] } = useReservations(
    selectedProperty,
    reservationDate
  );

  const { data: guests = [] } = useGuests(guestSearch);

  // const { data: guests = [] } = useQuery({
  //   queryKey: ["guests", guestSearch],
  //   queryFn: async () => {
  //     if (!guestSearch) return [];
  //     const res = await api.get<Guest[]>(`/guests?search=${guestSearch}`);
  //     return res.data.data;
  //   },
  //   enabled: !!guestSearch,
  // });

  /* -------------------- MUTATIONS -------------------- */

  const createGuestMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/guests", {
        ...newGuest,
        image: "image@gmail.com",
      });
      return res.data;
    },
    onSuccess: (data: Guest) => {
      setSelectedGuest(data); // ✅ auto select
      setShowNewGuestForm(false);
      setGuestSearch("");
      setNewGuest({
        name: "",
        nic: "",
        passport: "",
        country: "",
        contactNo: "",
        email: "",
      });
    },
  });

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
        reservationStatus: reservationStatus,
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

  /* -------------------- UI -------------------- */

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-full">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Reservations</h1>
            <p className="text-gray-600">Create and manage reservations</p>
          </div>
        </div>

        {/* Property & Date */}
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(Number(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
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
            className="px-4 py-2 border rounded-lg"
          />

          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {successMessage && (
          <div className="p-3 bg-green-100 text-green-800 rounded">
            {successMessage}
          </div>
        )}

        {/* Add Reservation */}
        <div className="bg-white p-6 rounded-lg shadow border space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Add Reservation
          </h2>

          {/* Guest Search + Button */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              placeholder="Search guest (Name / NIC / Passport)"
              value={guestSearch}
              onChange={(e) => {
                setGuestSearch(e.target.value);
                setSelectedGuest(null);
                setShowNewGuestForm(false);
              }}
              className="px-4 py-2 border rounded-lg"
            />

            <button
              onClick={() => {
                setShowNewGuestForm(true);
                setSelectedGuest(null);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              + Add New Guest
            </button>
          </div>

          {/* Guest Results */}
          {guests.length > 0 && !selectedGuest && (
            <div className="bg-gray-100 rounded p-2 max-h-40 overflow-y-auto">
              {guests.map((g) => (
                <div
                  key={g.id}
                  onClick={() => {
                    setSelectedGuest(g);
                    setGuestSearch("");
                    setShowNewGuestForm(false);
                  }}
                  className="p-2 cursor-pointer hover:bg-blue-100 rounded"
                >
                  {g.name} – {g.nic || g.passport}
                </div>
              ))}
            </div>
          )}

          {/* New Guest Form */}
          {showNewGuestForm && !selectedGuest && (
            <div className="border rounded p-4 space-y-2 bg-gray-50">
              <h3 className="font-semibold flex items-center gap-2">
                <UserPlus className="w-5 h-5" /> New Guest
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.keys(newGuest).map((key) => (
                  <input
                    key={key}
                    placeholder={key}
                    value={(newGuest as any)[key]}
                    onChange={(e) =>
                      setNewGuest({ ...newGuest, [key]: e.target.value })
                    }
                    className="px-3 py-2 border rounded-lg"
                  />
                ))}
              </div>

              <button
                onClick={() => createGuestMutation.mutate()}
                disabled={createGuestMutation.isPending || !newGuest.name}
                className="px-6 py-2 bg-green-600 text-white rounded-lg"
              >
                Save & Continue
              </button>
            </div>
          )}

          {/* Room & Dates */}
          {/* {selectedGuest && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <select
                value={selectedRoom ?? ""}
                onChange={(e) => setSelectedRoom(Number(e.target.value))}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">Select Room</option>
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
                className="px-4 py-2 border rounded-lg"
              />

              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />
            </div>
          )} */}
          {selectedGuest && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Room is OPTIONAL */}
              <select
                value={selectedRoom ?? ""}
                onChange={(e) =>
                  setSelectedRoom(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="px-4 py-2 border rounded-lg"
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
                className="px-4 py-2 border rounded-lg"
              />

              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />

              {/* ✅ STATUS SELECT */}
              <select
                value={reservationStatus}
                onChange={(e) =>
                  setReservationStatus(
                    e.target.value as "BOOKED" | "CHECKED_IN"
                  )
                }
                className="px-4 py-2 border rounded-lg"
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
              className="px-6 py-2 bg-green-600 text-white rounded-lg"
            >
              Create Reservation
            </button>
          )}
        </div>

        {/* Reservation List */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {reservations.map((r) => {
            const isDirect = r.type === "DIRECT";
            const isPending = r.paymetStatus === "PENDING";

            return (
              <div
                key={r.id}
                className="bg-white p-4 rounded-lg shadow border space-y-2"
              >
                <h3 className="font-semibold">{r.guest.name}</h3>
                <p className="text-sm">Room: {r.room.name}</p>
                <p className="text-sm">
                  {new Date(r.checkInDateTime).toLocaleString()}
                </p>

                {isPending && (
                  <button
                    onClick={() => setPaymentReservationId(r.id)}
                    className={`w-full py-2 rounded text-white ${
                      isDirect ? "bg-green-600" : "bg-gray-400"
                    }`}
                  >
                    Make Payment
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {reservations.map((r) => (
            <div key={r.id} className="bg-white p-4 rounded-lg shadow border">
              <h3 className="font-semibold">{r.guest.name}</h3>
              <p className="text-sm">Room: {r.room.name}</p>
              <p className="text-sm">
                {new Date(r.checkInDateTime).toLocaleString()}
              </p>
            </div>
          ))}
        </div> */}
      </div>

      {paymentReservationId && (
        <ReservationPaymentModal
          open={!!paymentReservationId}
          reservationId={paymentReservationId}
          propertyId={selectedProperty}
          onClose={() => setPaymentReservationId(null)}
        />
      )}
    </div>
  );
};

export default Reservations;
