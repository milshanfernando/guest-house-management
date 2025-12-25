// Rooms.tsx
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { Bed, Home, RefreshCw, Plus } from "lucide-react";
import { useProperties } from "../hooks/useProperties";
import { useRooms } from "../hooks/useRooms";

/* ===================== CONSTANTS ===================== */

const ROOM_TYPES = ["AC", "Non-AC"];
const ROOM_SIZES = ["single", "double", "triple"];

const ROOM_STATUSES = [
  "occupied",
  "available",
  "dirty",
  "clean",
  "need_cleaning",
];

/* ===================== COMPONENT ===================== */

const Rooms = () => {
  const queryClient = useQueryClient();

  const [selectedProperty, setSelectedProperty] = useState<number>(1);

  const [newRoom, setNewRoom] = useState({
    name: "",
    type: ROOM_TYPES[0],
    size: ROOM_SIZES[0],
    status: "available",
  });

  const [successMessage, setSuccessMessage] = useState("");

  /* ===================== DATA ===================== */

  const { data: properties = [], isLoading: propertiesLoading } =
    useProperties();

  const { data: rooms = [], isLoading: roomsLoading } =
    useRooms(selectedProperty);

  /* ===================== MUTATION ===================== */

  const createRoomMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProperty) {
        throw new Error("Select a property first");
      }

      const res = await api.post("/rooms", {
        name: newRoom.name,
        type: newRoom.type,
        size: newRoom.size,
        status: newRoom.status, // 👈 enum value
        propertyId: selectedProperty,
      });

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["rooms", selectedProperty],
      });

      setNewRoom({
        name: "",
        type: ROOM_TYPES[0],
        size: ROOM_SIZES[0],
        status: "available",
      });

      setSuccessMessage("Room created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    },
  });

  /* ===================== UI ===================== */

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ===== Header ===== */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-full">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Rooms Management
              </h1>
              <p className="text-gray-600 mt-1">
                Create and view rooms per property
              </p>
            </div>
          </div>
        </div>

        {/* ===== Property Select ===== */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <select
            value={selectedProperty ?? ""}
            onChange={(e) => setSelectedProperty(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Select Property</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>

          <button
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["rooms", selectedProperty],
              })
            }
            disabled={!selectedProperty || propertiesLoading}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 ${roomsLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* ===== Success Message ===== */}
        {successMessage && (
          <div className="p-3 bg-green-100 text-green-800 rounded">
            {successMessage}
          </div>
        )}

        {/* ===== Add New Room ===== */}
        {selectedProperty && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add New Room
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Room Name"
                value={newRoom.name}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, name: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />

              <select
                value={newRoom.type}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, type: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {ROOM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                value={newRoom.size}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, size: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {ROOM_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>

              <select
                value={newRoom.status}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, status: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {ROOM_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => createRoomMutation.mutate()}
              disabled={createRoomMutation.isPending || !newRoom.name}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {createRoomMutation.isPending ? "Creating..." : "Add Room"}
            </button>
          </div>
        )}

        {/* ===== Rooms List ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {roomsLoading ? (
            <div className="text-center py-6 col-span-full">
              Loading rooms...
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-6 col-span-full">No rooms found</div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white p-4 rounded-lg shadow-md border border-gray-200 space-y-2 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900">{room.name}</h3>
                </div>
                <p className="text-gray-600 text-sm">Type: {room.type}</p>
                <p className="text-gray-600 text-sm">Size: {room.size}</p>
                <p className="text-gray-600 text-sm">
                  Status: <span className="font-medium">{room.roomStatus}</span>
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Rooms;
