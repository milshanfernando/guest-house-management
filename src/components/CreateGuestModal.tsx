/* eslint-disable @typescript-eslint/no-explicit-any */
import { X, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useState } from "react";

interface Guest {
  id: number;
  name: string;
  nic: string;
  passport: string;
  country: string;
  contactNo: string;
  email: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (guest: Guest) => void;
}

export const CreateGuestModal = ({ open, onClose, onSuccess }: Props) => {
  const [guest, setGuest] = useState({
    name: "",
    nic: "",
    passport: "",
    country: "",
    contactNo: "",
    email: "",
  });

  const createGuestMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/guests", {
        ...guest,
        image: "image@gmail.com",
      });
      return res.data.data;
    },
    onSuccess: (data: Guest) => {
      onSuccess(data);
      onClose();
      setGuest({
        name: "",
        nic: "",
        passport: "",
        country: "",
        contactNo: "",
        email: "",
      });
    },
    onError: () => {
      toast.error("Failed to create guest");
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add New Guest</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.keys(guest).map((key) => (
            <input
              key={key}
              placeholder={key}
              value={(guest as any)[key]}
              onChange={(e) => setGuest({ ...guest, [key]: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>

          <button
            disabled={createGuestMutation.isPending || !guest.name}
            onClick={() => createGuestMutation.mutate()}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-60"
          >
            {createGuestMutation.isPending && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Save Guest
          </button>
        </div>
      </div>
    </div>
  );
};
