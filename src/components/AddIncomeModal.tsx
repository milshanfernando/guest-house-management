import { useState } from "react";
import { X } from "lucide-react";
import { useCreateIncome } from "../hooks/useCreateIncome";
import type { Property } from "../types/types";
import { PLATFORMS, type Platform } from "../constants/platforms";

interface Props {
  open: boolean;
  onClose: () => void;
  properties: Property[];
}

export function AddIncomeModal({ open, onClose, properties }: Props) {
  const { mutate, isPending: isLoading } = useCreateIncome();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState("");
  const [platform, setPlatform] = useState<Platform | "">("");
  const [note, setNote] = useState("");
  const [propertyId, setPropertyId] = useState<number | "">("");

  if (!open) return null;

  const submit = () => {
    if (!propertyId || !amount) return;

    mutate(
      {
        date,
        amount: Number(amount),
        platform: platform,
        note,
        propertyId: Number(propertyId),
      },
      {
        onSuccess: () => {
          onClose();
          setAmount("");
          setNote("");
          setPlatform("");
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Add Income</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="space-y-3">
          {/* Property */}
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 w-full"
          >
            <option value="">Select Property</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Date */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          />

          {/* Amount */}
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          />

          {/* Platform */}
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="border rounded-lg px-3 py-2 w-full"
          >
            <option value="">Select Platform</option>
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Note */}
          <textarea
            placeholder="Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
